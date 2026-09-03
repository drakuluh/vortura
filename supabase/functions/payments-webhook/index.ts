import { createClient } from "npm:@supabase/supabase-js@2";
import { priceIdToTier, type StripeEnv, TIER_NAMES, verifyWebhook } from "../_shared/stripe.ts";
import { notifyTeam } from "../_shared/notify.ts";
import { adminUrl } from "../_shared/site.ts";
import {
  customInvoicePaidTemplate,
  newPurchaseTemplate,
  newSubscriptionTemplate,
  paymentFailedTemplate,
  subscriptionCanceledTemplate,
} from "../_shared/slack-templates.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function getPriceId(item: any): string {
  return item?.price?.metadata?.lovable_external_id || item?.price?.id;
}

const FALLBACK_ENGINEERS = [
  "Avery Patel",
  "Jordan Kim",
  "Riley Chen",
  "Morgan Diaz",
  "Casey Nguyen",
  "Taylor Brooks",
  "Sam Rivera",
  "Alex Okafor",
];

async function pickEngineerName(): Promise<string> {
  const { data } = await supabase
    .from("user_roles")
    .select("user_id, profiles:user_id(display_name, first_name, last_name)")
    .eq("role", "admin");
  const names: string[] = [];
  for (const row of (data ?? []) as any[]) {
    const p = row.profiles;
    if (!p) continue;
    const full = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
    const candidate = full || p.display_name;
    if (candidate && typeof candidate === "string") names.push(candidate);
  }
  const pool = names.length > 0 ? names.concat(FALLBACK_ENGINEERS) : FALLBACK_ENGINEERS;
  return pool[Math.floor(Math.random() * pool.length)];
}

async function findClientByUserId(userId: string): Promise<{ id: string; name: string; email: string | null } | null> {
  const { data } = await supabase
    .from("clients")
    .select("id, name, email")
    .eq("user_id", userId)
    .maybeSingle();
  return data as any;
}

// === customer.subscription.created ===
async function handleSubscriptionCreated(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("No userId in subscription.metadata");
    return;
  }

  const item = subscription.items?.data?.[0];
  const priceId = getPriceId(item);
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  const tier = priceIdToTier(priceId);

  const client = await findClientByUserId(userId);

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      client_id: client?.id ?? null,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: productId,
      price_id: priceId,
      tier,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );

  const planLabel = TIER_NAMES[tier ?? ""] ?? priceId ?? "—";
  const subTpl = newSubscriptionTemplate({
    plan: planLabel,
    customer: client?.name ?? userId,
    client_id: client?.id ?? null,
    email: client?.email,
    status: subscription.status,
    view_url: client?.id ? adminUrl("/admin/clients", { id: client.id }) : null,
  });
  await notifyTeam({
    subject: subTpl.subject,
    body: `Customer: ${client?.name ?? userId}\nEmail: ${client?.email ?? "—"}\nPlan: ${planLabel}\nStatus: ${subscription.status}`,
    blocks: subTpl.blocks,
    category: "payments",
  });
}

// === customer.subscription.updated ===
async function handleSubscriptionUpdated(subscription: any, env: StripeEnv) {
  const item = subscription.items?.data?.[0];
  const priceId = getPriceId(item);
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  const tier = priceIdToTier(priceId);

  await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      product_id: productId,
      price_id: priceId,
      tier,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
}

// === customer.subscription.deleted (cancel) ===
async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  await supabase
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);

  // Mark related package(s) inactive
  const userId = subscription.metadata?.userId;
  if (userId) {
    const client = await findClientByUserId(userId);
    if (client?.id) {
      const tier = priceIdToTier(getPriceId(subscription.items?.data?.[0]));
      await supabase
        .from("packages")
        .update({ status: "inactive" })
        .eq("client_id", client.id)
        .eq("tier", tier);

      const cancelTpl = subscriptionCanceledTemplate({
        plan: TIER_NAMES[tier ?? ""] ?? "Unknown plan",
        customer: client.name,
        client_id: client.id,
        email: client.email,
        view_url: adminUrl("/admin/clients", { id: client.id }),
      });
      await notifyTeam({
        subject: cancelTpl.subject,
        body: `Customer: ${client.name}\nEmail: ${client.email ?? "—"}\nPackage marked inactive.`,
        blocks: cancelTpl.blocks,
        category: "payments",
      });
    }
  }
}

// === invoice.paid (renewal) - generate invoice record ===
async function handleInvoicePaid(invoice: any, env: StripeEnv) {
  // ---- Case A: custom admin-created invoice (linked by stripe_invoice_id) ----
  const { data: customRow } = await supabase
    .from("invoices")
    .select("id, number, client_id, amount_cents")
    .eq("stripe_invoice_id", invoice.id)
    .eq("environment", env)
    .maybeSingle();

  if (customRow) {
    await supabase
      .from("invoices")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        hosted_url: invoice.hosted_invoice_url ?? null,
        pdf_url: invoice.invoice_pdf ?? null,
      })
      .eq("id", customRow.id);

    await supabase.from("activity_log").insert({
      entity_type: "invoice",
      entity_id: customRow.id,
      action: "invoice_paid",
      summary: `Custom invoice ${customRow.number} paid ($${(invoice.amount_paid / 100).toFixed(2)})`,
      metadata: { stripe_invoice_id: invoice.id },
    } as any);

    const { data: client } = await supabase
      .from("clients")
      .select("id, name, email")
      .eq("id", customRow.client_id)
      .maybeSingle();

    const paidTpl = customInvoicePaidTemplate({
      number: customRow.number,
      client_name: client?.name ?? "—",
      client_id: client?.id ?? customRow.client_id ?? null,
      client_email: client?.email,
      amount_cents: invoice.amount_paid,
      currency: invoice.currency,
      view_url: adminUrl("/admin/invoices", { id: customRow.id }),
    });
    await notifyTeam({
      subject: paidTpl.subject,
      body: `Customer: ${client?.name ?? "—"}\nEmail: ${client?.email ?? "—"}\nInvoice: ${customRow.number}\nAmount: $${(invoice.amount_paid / 100).toFixed(2)}`,
      blocks: paidTpl.blocks,
      category: "invoices",
    });
    return;
  }

  // ---- Case B: subscription invoices (first payment + renewals) ----
  const reason = invoice.billing_reason;
  const isFirstSubInvoice = reason === "subscription_create";
  const isRenewal = reason === "subscription_cycle";
  if (!isFirstSubInvoice && !isRenewal) return;

  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("client_id")
    .eq("stripe_subscription_id", subscriptionId)
    .eq("environment", env)
    .maybeSingle();

  if (!sub?.client_id) return;

  const issuedAt = new Date(invoice.created * 1000).toISOString().slice(0, 10);
  const paidAt = new Date().toISOString();
  const pdfUrl = invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null;

  // Helper: get next sequential invoice number
  async function nextInvoiceNumber(): Promise<string> {
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true });
    return `INV-${String((count ?? 0) + 1).padStart(5, "0")}`;
  }

  if (isRenewal) {
    // Pure recurring renewal — single invoice row tagged as MRR
    const number = await nextInvoiceNumber();
    const { data: ins } = await supabase.from("invoices").insert({
      client_id: sub.client_id,
      number,
      amount_cents: invoice.amount_paid,
      issued_at: issuedAt,
      status: "paid",
      invoice_type: "recurring",
      pdf_url: pdfUrl,
      paid_at: paidAt,
      environment: env,
    }).select("id").single();
    await supabase.from("activity_log").insert({
      entity_type: "invoice",
      entity_id: ins?.id,
      action: "invoice_paid",
      summary: `Invoice ${number} paid ($${(invoice.amount_paid / 100).toFixed(2)})`,
      metadata: { stripe_invoice_id: invoice.id, recurring: true },
    } as any);
    return;
  }

  // First subscription invoice — may bundle a one-time setup fee with the
  // first recurring period. Split each Stripe line item into its own row so
  // the client UI can list Price (one-time) and MRR (recurring) separately.
  const lines: any[] = invoice.lines?.data ?? [];
  let oneTimeCents = 0;
  let recurringCents = 0;
  for (const line of lines) {
    const isRecurringLine =
      line.price?.type === "recurring" || !!line.subscription_item || !!line.subscription;
    const amt = typeof line.amount === "number" ? line.amount : 0;
    if (isRecurringLine) recurringCents += amt;
    else oneTimeCents += amt;
  }

  if (oneTimeCents > 0) {
    const number = await nextInvoiceNumber();
    const { data: ins } = await supabase.from("invoices").insert({
      client_id: sub.client_id,
      number,
      amount_cents: oneTimeCents,
      issued_at: issuedAt,
      status: "paid",
      invoice_type: "one_time",
      pdf_url: pdfUrl,
      paid_at: paidAt,
      environment: env,
      description: "Package payment",
    }).select("id").single();
    await supabase.from("activity_log").insert({
      entity_type: "invoice",
      entity_id: ins?.id,
      action: "invoice_paid",
      summary: `Invoice ${number} paid ($${(oneTimeCents / 100).toFixed(2)})`,
      metadata: { stripe_invoice_id: invoice.id },
    } as any);
  }

  if (recurringCents > 0) {
    const number = await nextInvoiceNumber();
    const { data: ins } = await supabase.from("invoices").insert({
      client_id: sub.client_id,
      number,
      amount_cents: recurringCents,
      issued_at: issuedAt,
      status: "paid",
      invoice_type: "recurring",
      pdf_url: pdfUrl,
      paid_at: paidAt,
      environment: env,
      description: "Monthly subscription",
    }).select("id").single();
    await supabase.from("activity_log").insert({
      entity_type: "invoice",
      entity_id: ins?.id,
      action: "invoice_paid",
      summary: `Invoice ${number} paid ($${(recurringCents / 100).toFixed(2)})`,
      metadata: { stripe_invoice_id: invoice.id, recurring: true },
    } as any);
  }

  // Edge case: bundled invoice but couldn't classify any line item.
  if (oneTimeCents === 0 && recurringCents === 0 && invoice.amount_paid > 0) {
    const number = await nextInvoiceNumber();
    const { data: ins } = await supabase.from("invoices").insert({
      client_id: sub.client_id,
      number,
      amount_cents: invoice.amount_paid,
      issued_at: issuedAt,
      status: "paid",
      invoice_type: "one_time",
      pdf_url: pdfUrl,
      paid_at: paidAt,
      environment: env,
    }).select("id").single();
    await supabase.from("activity_log").insert({
      entity_type: "invoice",
      entity_id: ins?.id,
      action: "invoice_paid",
      summary: `Invoice ${number} paid ($${(invoice.amount_paid / 100).toFixed(2)})`,
      metadata: { stripe_invoice_id: invoice.id },
    } as any);
  }
}

// === invoice.payment_failed (3 actions: notify customer + team + record) ===
async function handlePaymentFailed(invoice: any, env: StripeEnv) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("client_id, user_id, tier")
    .eq("stripe_subscription_id", subscriptionId)
    .eq("environment", env)
    .maybeSingle();

  if (!sub?.client_id) return;

  // 1. Record in activity_log
  await supabase.from("activity_log").insert({
    actor_user_id: sub.user_id,
    entity_type: "subscription",
    entity_id: subscriptionId,
    action: "payment_failed",
    summary: `Payment failed for ${TIER_NAMES[sub.tier ?? ""] ?? "subscription"} ($${(invoice.amount_due / 100).toFixed(2)})`,
    metadata: { invoice_id: invoice.id, amount_due: invoice.amount_due, attempt: invoice.attempt_count },
  } as any);

  // 2. Insert a draft "failed" invoice record so team can see it in dashboard
  await supabase.from("invoices").insert({
    client_id: sub.client_id,
    number: `FAIL-${invoice.number ?? invoice.id.slice(-8)}`,
    amount_cents: invoice.amount_due,
    issued_at: new Date(invoice.created * 1000).toISOString().slice(0, 10),
    due_at: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString().slice(0, 10) : null,
    status: "overdue",
    pdf_url: invoice.hosted_invoice_url ?? null,
  });

  // 3. Notify team (Stripe also auto-emails customer via dunning)
  const { data: client } = await supabase
    .from("clients")
    .select("id, name, email")
    .eq("id", sub.client_id)
    .maybeSingle();

  const failTpl = paymentFailedTemplate({
    plan: TIER_NAMES[sub.tier ?? ""] ?? "—",
    customer: client?.name ?? "Customer",
    client_id: client?.id ?? sub.client_id ?? null,
    email: client?.email,
    amount_cents: invoice.amount_due,
    currency: invoice.currency,
    attempt: invoice.attempt_count,
    view_url: client?.id ? adminUrl("/admin/clients", { id: client.id }) : null,
  });
  await notifyTeam({
    subject: failTpl.subject,
    body: `Plan: ${TIER_NAMES[sub.tier ?? ""] ?? "—"}\nEmail: ${client?.email ?? "—"}\nAttempt: ${invoice.attempt_count}\nStripe is automatically retrying and emailing the customer.`,
    blocks: failTpl.blocks,
    category: "payments",
  });
}

// === checkout.session.completed (one-time purchases & purchase recording) ===
async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  // pass through (defined below)
  return _handleCheckoutCompleted(session, env);
}

// === invoice.voided / invoice.finalized for custom invoices ===
async function handleInvoiceVoided(invoice: any, env: StripeEnv) {
  await supabase
    .from("invoices")
    .update({ status: "void" })
    .eq("stripe_invoice_id", invoice.id)
    .eq("environment", env);
}

async function handleInvoiceFinalized(invoice: any, env: StripeEnv) {
  await supabase
    .from("invoices")
    .update({
      status: "sent",
      hosted_url: invoice.hosted_invoice_url ?? null,
      pdf_url: invoice.invoice_pdf ?? null,
    })
    .eq("stripe_invoice_id", invoice.id)
    .eq("environment", env)
    .eq("status", "draft");
}

// === charge.refunded — mark invoice refunded & log activity ===
async function handleChargeRefunded(charge: any, env: StripeEnv) {
  const stripeInvoiceId: string | null = charge.invoice ?? null;
  let invRow: { id: string; number: string; client_id: string; amount_cents: number } | null = null;

  if (stripeInvoiceId) {
    const { data } = await supabase
      .from("invoices")
      .select("id, number, client_id, amount_cents")
      .eq("stripe_invoice_id", stripeInvoiceId)
      .eq("environment", env)
      .maybeSingle();
    invRow = data as any;
  }

  // Fallback: lookup via payment_intent on a purchase row, then find a matching invoice by client + amount.
  if (!invRow && charge.payment_intent) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("client_id, amount_cents")
      .eq("stripe_payment_intent_id", charge.payment_intent)
      .eq("environment", env)
      .maybeSingle();
    if (purchase?.client_id) {
      const { data } = await supabase
        .from("invoices")
        .select("id, number, client_id, amount_cents")
        .eq("client_id", purchase.client_id)
        .eq("status", "paid")
        .order("paid_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      invRow = data as any;
    }
  }

  if (!invRow) {
    console.log("charge.refunded: no matching invoice", charge.id);
    return;
  }

  const refunded = charge.amount_refunded ?? 0;
  const total = charge.amount ?? invRow.amount_cents ?? 0;
  const isPartial = refunded > 0 && refunded < total;
  const newStatus = isPartial ? "partially_refunded" : "refunded";

  await supabase.from("invoices").update({ status: newStatus }).eq("id", invRow.id);
  await supabase.from("activity_log").insert({
    entity_type: "invoice",
    entity_id: invRow.id,
    action: isPartial ? "invoice_partially_refunded" : "invoice_refunded",
    summary: `Invoice ${invRow.number} ${isPartial ? "partially refunded" : "refunded"} ($${(refunded / 100).toFixed(2)})`,
    metadata: { stripe_charge_id: charge.id, amount_refunded: refunded, amount_total: total },
  } as any);
}

async function _handleCheckoutCompleted(session: any, env: StripeEnv) {
  const userId = session.metadata?.userId;
  const priceId = session.metadata?.lovable_price_id;
  const tier = session.metadata?.tier ?? (priceId ? priceIdToTier(priceId) : null);

  let clientId: string | null = null;
  let clientName: string | null = null;
  if (userId) {
    const c = await findClientByUserId(userId);
    clientId = c?.id ?? null;
    clientName = c?.name ?? null;
  }

  // Create a package row for this purchase so it appears on the client dashboard.
  let newPackageId: string | null = null;
  if (clientId) {
    const packageName = TIER_NAMES[tier ?? ""] ?? priceId ?? "New package";
    const engineer = await pickEngineerName();
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const { data: pkgRow } = await supabase
      .from("packages")
      .insert({
        client_id: clientId,
        name: packageName,
        tier: tier ?? null,
        status: "in_progress",
        progress: 0,
        accent: "primary",
        engineer,
        due_date: dueDate,
      })
      .select("id")
      .single();
    newPackageId = pkgRow?.id ?? null;
  }

  // Record purchase
  await supabase.from("purchases").upsert(
    {
      user_id: userId ?? null,
      client_id: clientId,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent ?? null,
      stripe_customer_id: session.customer ?? null,
      product_id: tier ?? "unknown",
      price_id: priceId ?? "unknown",
      amount_cents: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      status: session.payment_status === "paid" ? "paid" : "pending",
      purchase_kind: session.mode === "subscription" ? "subscription_initial" : "one_time",
      environment: env,
      metadata: session.metadata ?? {},
      package_id: newPackageId,
    } as any,
    { onConflict: "stripe_session_id" }
  );

  // For one-time only (no subscription): notify team
  if (session.mode === "payment") {
    const purchaseTpl = newPurchaseTemplate({
      product: TIER_NAMES[tier ?? ""] ?? priceId ?? "—",
      customer: clientName ?? userId ?? "Guest",
      client_id: clientId,
      email: session.customer_details?.email,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency,
      view_url: clientId ? adminUrl("/admin/clients", { id: clientId }) : null,
    });
    await notifyTeam({
      subject: purchaseTpl.subject,
      body: `Customer: ${clientName ?? userId ?? "Guest"}\nEmail: ${session.customer_details?.email ?? "—"}\nAmount: $${((session.amount_total ?? 0) / 100).toFixed(2)}`,
      blocks: purchaseTpl.blocks,
      category: "payments",
    });
  }
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  console.log(`[webhook ${env}] ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object, env);
      break;
    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object, env);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object, env);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object, env);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event.data.object, env);
      break;
    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object, env);
      break;
    case "invoice.voided":
      await handleInvoiceVoided(event.data.object, env);
      break;
    case "invoice.finalized":
      await handleInvoiceFinalized(event.data.object, env);
      break;
    case "charge.refunded":
      await handleChargeRefunded(event.data.object, env);
      break;
    default:
      console.log("Unhandled event:", event.type);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("Invalid env query parameter:", rawEnv);
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    await handleWebhook(req, rawEnv);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});