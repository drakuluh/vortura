// Admin action on a custom Stripe invoice: send (finalize+email) or void.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

interface Body {
  invoice_id: string; // local row id
  action: "send" | "void";
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
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

    const body = (await req.json()) as Body;
    if (!body.invoice_id || !["send", "void"].includes(body.action)) {
      return json({ error: "invoice_id and action required" }, 400);
    }

    const { data: row, error: rowErr } = await sb
      .from("invoices")
      .select("id, number, status, stripe_invoice_id, environment, client_id")
      .eq("id", body.invoice_id)
      .maybeSingle();
    if (rowErr || !row) return json({ error: "Invoice not found" }, 404);
    if (!row.stripe_invoice_id) {
      return json({ error: "Invoice is not linked to Stripe" }, 400);
    }

    const env: StripeEnv = (row.environment as StripeEnv) ?? "sandbox";
    const stripe = createStripeClient(env);

    let updated: { status: string; hosted_url?: string | null; pdf_url?: string | null } = {
      status: row.status as string,
    };

    if (body.action === "send") {
      if (row.status !== "draft") return json({ error: "Only draft invoices can be sent" }, 400);
      const finalized = await stripe.invoices.finalizeInvoice(row.stripe_invoice_id, {
        auto_advance: true,
      });
      await stripe.invoices.sendInvoice(finalized.id);
      updated = {
        status: "sent",
        hosted_url: finalized.hosted_invoice_url ?? null,
        pdf_url: finalized.invoice_pdf ?? null,
      };
    } else {
      // void
      await stripe.invoices.voidInvoice(row.stripe_invoice_id);
      updated = { status: "void" };
    }

    await sb.from("invoices").update(updated).eq("id", row.id);
    await sb.from("activity_log").insert({
      actor_user_id: userId,
      entity_type: "invoice",
      entity_id: row.id,
      action: body.action === "send" ? "invoice_sent" : "invoice_voided",
      summary: `${body.action === "send" ? "Sent" : "Voided"} ${row.number}`,
    });

    return json({ ok: true, ...updated });
  } catch (e) {
    console.error("invoice-action error:", e);
    return json({ error: (e as Error).message }, 400);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}