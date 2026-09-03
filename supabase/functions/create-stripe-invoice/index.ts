// Admin-only: create a Stripe invoice with custom line items.
// Optionally finalizes + sends it (emails customer with hosted pay link).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

interface LineItem {
  description: string;
  quantity: number;
  unit_amount_cents: number;
}

interface Body {
  client_id: string;
  line_items: LineItem[];
  description?: string;
  due_date?: string; // ISO date
  send_now: boolean;
  environment: StripeEnv;
  currency?: string;
  package_id?: string;
  // When set (>0), a Stripe subscription is also created billed every 4 weeks,
  // starting today, on top of the one-time invoice.
  recurring_amount_cents?: number;
  one_time_amount_cents?: number;
}

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // ---- Auth: must be admin ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const token = authHeader.slice(7);
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims, error: claimsErr } = await supa.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const sb = admin();
    const { data: roleRow } = await sb
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Admin access required" }, 403);

    // ---- Validate body ----
    const body = (await req.json()) as Body;
    if (!body.client_id) return json({ error: "client_id required" }, 400);
    if (!Array.isArray(body.line_items) || body.line_items.length === 0) {
      return json({ error: "At least one line item is required" }, 400);
    }
    const env: StripeEnv = body.environment === "live" ? "live" : "sandbox";
    const currency = (body.currency ?? "cad").toLowerCase();

    for (const li of body.line_items) {
      if (!li.description || !Number.isFinite(li.quantity) || !Number.isFinite(li.unit_amount_cents)) {
        return json({ error: "Invalid line item" }, 400);
      }
      if (li.quantity < 1 || li.unit_amount_cents < 0) {
        return json({ error: "Quantity must be >= 1 and amount >= 0" }, 400);
      }
    }

    // ---- Load client ----
    const { data: client, error: clientErr } = await sb
      .from("clients")
      .select("id, name, email, user_id")
      .eq("id", body.client_id)
      .maybeSingle();
    if (clientErr || !client) return json({ error: "Client not found" }, 404);
    if (!client.email) return json({ error: "Client has no email — add one before invoicing." }, 400);

    const stripe = createStripeClient(env);

    // ---- Find or create Stripe customer (reuse from existing subscription if any) ----
    let customerId: string | null = null;
    const { data: existingSub } = await sb
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("client_id", client.id)
      .eq("environment", env)
      .limit(1)
      .maybeSingle();
    if (existingSub?.stripe_customer_id) {
      customerId = existingSub.stripe_customer_id as string;
    } else {
      // Search by email first
      const found = await stripe.customers.list({ email: client.email, limit: 1 });
      if (found.data.length > 0) {
        customerId = found.data[0].id;
      } else {
        const created = await stripe.customers.create({
          email: client.email,
          name: client.name,
          metadata: { client_id: client.id, user_id: client.user_id ?? "" },
        });
        customerId = created.id;
      }
    }

    // ---- Enforce single currency per customer ----
    // Stripe blocks mixing currencies on a customer that already has a
    // subscription/invoice/quote. Detect the customer's existing currency
    // and switch to it (overriding the requested currency) to keep the
    // invoice consistent and avoid the "cannot combine currencies" error.
    let lockedCurrency: string | null = null;
    try {
      const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 1 });
      if (subs.data[0]?.currency) lockedCurrency = subs.data[0].currency.toLowerCase();
      if (!lockedCurrency) {
        const invs = await stripe.invoices.list({ customer: customerId, limit: 1 });
        if (invs.data[0]?.currency) lockedCurrency = invs.data[0].currency.toLowerCase();
      }
    } catch (_) { /* ignore */ }
    const effectiveCurrency = lockedCurrency ?? currency;

    // ---- Create draft invoice first, then add items, then optionally finalize ----
    const dueDays = body.due_date
      ? Math.max(1, Math.ceil((new Date(body.due_date).getTime() - Date.now()) / 86_400_000))
      : 30;

    // Split line items: one-time vs recurring (recurring tagged with "(every 4 weeks)" or "(monthly)").
    const recurringCents = Math.max(0, Math.floor(body.recurring_amount_cents ?? 0));
    const oneTimeItems = body.line_items.filter((li) => !/\(every 4 weeks\)$|\(monthly\)$/i.test(li.description));
    const hasOneTime = oneTimeItems.length > 0;
    const hasRecurring = recurringCents > 0;

    if (!hasOneTime && !hasRecurring) {
      return json({ error: "Nothing to invoice — provide a one-time price, a recurring amount, or both." }, 400);
    }

    let stripeInvoice: Awaited<ReturnType<typeof stripe.invoices.create>> | null = null;
    let finalInvoice: typeof stripeInvoice = null;
    let status = "draft";
    let subscriptionId: string | null = null;

    if (hasRecurring) {
      // Mixed (or recurring-only) flow:
      // Pre-create the one-time line items as pending invoice items on the
      // customer (no `invoice` set). When we create the subscription, Stripe
      // automatically pulls those pending items onto the subscription's first
      // invoice — producing ONE combined invoice the customer pays in full.
      for (const li of oneTimeItems) {
        const product = await stripe.products.create({
          name: (li.description || "Line item").slice(0, 250),
        });
        await stripe.invoiceItems.create({
          customer: customerId,
          quantity: li.quantity,
          description: li.description,
          currency: effectiveCurrency,
          price_data: {
            currency: effectiveCurrency,
            product: product.id,
            unit_amount_decimal: String(li.unit_amount_cents),
          },
        } as never);
      }

      const recurringItem = body.line_items.find((li) => /\(every 4 weeks\)$|\(monthly\)$/i.test(li.description));
      const recurringName = (recurringItem?.description ?? "Recurring (every 4 weeks)").slice(0, 250);
      const recurringProduct = await stripe.products.create({ name: recurringName });
      const recurringPrice = await stripe.prices.create({
        currency: effectiveCurrency,
        product: recurringProduct.id,
        unit_amount: recurringCents,
        recurring: { interval: "week", interval_count: 4 },
      });
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: recurringPrice.id }],
        collection_method: "send_invoice",
        days_until_due: dueDays,
        description: body.description ?? undefined,
        metadata: {
          client_id: client.id,
          package_id: body.package_id ?? "",
          lovable_origin: "custom_invoice_recurring",
        },
      } as never);
      subscriptionId = subscription.id;

      await sb.from("subscriptions").insert({
        user_id: client.user_id,
        client_id: client.id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        status: subscription.status,
        price_id: recurringPrice.id,
        product_id: recurringProduct.id,
        tier: "custom_4w",
        environment: env,
      });

      // Fetch the subscription's first (latest) invoice — it now contains
      // both the recurring charge AND the one-time pending items.
      const latestInvoiceId = (subscription as any).latest_invoice as string | null;
      if (latestInvoiceId) {
        finalInvoice = await stripe.invoices.retrieve(latestInvoiceId);
        if (body.send_now && finalInvoice.status === "draft") {
          finalInvoice = await stripe.invoices.finalizeInvoice(latestInvoiceId, { auto_advance: true });
          await stripe.invoices.sendInvoice(finalInvoice.id);
        }
        status = body.send_now ? "sent" : (finalInvoice.status === "draft" ? "draft" : "sent");
      }
    } else {
      // One-time only: create a standalone invoice with just the one-time items.
      stripeInvoice = await stripe.invoices.create({
        customer: customerId,
        collection_method: "send_invoice",
        days_until_due: dueDays,
        currency: effectiveCurrency,
        description: body.description ?? undefined,
        auto_advance: false,
        metadata: { client_id: client.id, lovable_origin: "custom_invoice" },
      });

      for (const li of oneTimeItems) {
        const product = await stripe.products.create({
          name: (li.description || "Line item").slice(0, 250),
        });
        await stripe.invoiceItems.create({
          customer: customerId,
          invoice: stripeInvoice.id,
          quantity: li.quantity,
          description: li.description,
          price_data: {
            currency: effectiveCurrency,
            product: product.id,
            unit_amount_decimal: String(li.unit_amount_cents),
          },
        } as never);
      }

      finalInvoice = stripeInvoice;
      if (body.send_now) {
        finalInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id, { auto_advance: true });
        await stripe.invoices.sendInvoice(finalInvoice.id);
        status = "sent";
      }
    }

    // Total in cents — includes BOTH one-time line items and the first
    // recurring period charge, since Stripe bills both on the initial
    // invoice for a mixed checkout.
    const oneTimeTotal = oneTimeItems.reduce(
      (s, li) => s + li.quantity * li.unit_amount_cents,
      0
    );
    const totalCents = oneTimeTotal + recurringCents;

    // Sequential local invoice number
    const { count } = await sb.from("invoices").select("*", { count: "exact", head: true });
    const localNumber =
      finalInvoice?.number ?? `INV-${String((count ?? 0) + 1).padStart(5, "0")}`;

    const { data: row, error: insErr } = await sb
      .from("invoices")
      .insert({
        client_id: client.id,
        package_id: body.package_id ?? null,
        number: localNumber,
        amount_cents: totalCents,
        currency: effectiveCurrency,
        description: body.description ?? null,
        line_items: body.line_items,
        issued_at: new Date().toISOString().slice(0, 10),
        due_at: body.due_date ?? null,
        status: status,
        stripe_invoice_id: finalInvoice?.id ?? null,
        stripe_customer_id: customerId,
        hosted_url: finalInvoice?.hosted_invoice_url ?? null,
        pdf_url: finalInvoice?.invoice_pdf ?? null,
        stripe_subscription_id: subscriptionId,
        environment: env,
        created_by: userId,
      })
      .select()
      .single();
    if (insErr) throw insErr;

    await sb.from("activity_log").insert({
      actor_user_id: userId,
      entity_type: "invoice",
      entity_id: row.id,
      action: body.send_now ? "invoice_sent" : "invoice_drafted",
      summary: `${body.send_now ? "Sent" : "Drafted"} ${localNumber} ($${(totalCents / 100).toFixed(2)}${
        recurringCents > 0 ? ` + $${(recurringCents / 100).toFixed(2)}/4wks` : ""
      }) to ${client.name}`,
      metadata: { stripe_invoice_id: finalInvoice?.id ?? null, stripe_subscription_id: subscriptionId },
    });

    return json({
      invoice: row,
      hosted_url: finalInvoice?.hosted_invoice_url ?? null,
      stripe_subscription_id: subscriptionId,
    });
  } catch (e) {
    console.error("create-stripe-invoice error:", e);
    return json({ error: (e as Error).message }, 400);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}