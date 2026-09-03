// Scans for invoices past due date that are still in 'due' or 'sent' status,
// flips them to 'overdue', and notifies the team once per invoice.
// Safe to call repeatedly (idempotent — won't re-notify already-overdue rows).
// Intended for manual trigger from the admin UI or a daily cron.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/stripe.ts";
import { notifyTeam } from "../_shared/notify.ts";
import { adminUrl } from "../_shared/site.ts";
import { overdueInvoiceTemplate } from "../_shared/slack-templates.ts";

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth optional: if a user JWT is present, require admin. If no JWT, allow
  // (so a cron scheduler with the anon key can invoke it).
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims } = await userClient.auth.getClaims(token);
    const userId = claims?.claims?.sub;
    if (userId) {
      const db = admin();
      const { data: roleRow } = await db
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleRow) return json({ error: "Forbidden" }, 403);
    }
  }

  const db = admin();
  const today = new Date().toISOString().slice(0, 10);

  const { data: invoices, error } = await db
    .from("invoices")
    .select("id, number, amount_cents, currency, due_at, hosted_url, client_id, clients(name)")
    .in("status", ["due", "sent"])
    .lt("due_at", today);
  if (error) return json({ error: error.message }, 500);

  let flipped = 0;
  for (const inv of invoices ?? []) {
    const { error: upErr } = await db
      .from("invoices")
      .update({ status: "overdue", updated_at: new Date().toISOString() })
      .eq("id", inv.id);
    if (upErr) {
      console.error("Failed to mark overdue:", inv.id, upErr.message);
      continue;
    }
    flipped++;
    {
      const clientName = (inv as any).clients?.name ?? "Unknown client";
      const amount = ((inv.amount_cents ?? 0) / 100).toFixed(2);
      const tpl = overdueInvoiceTemplate({
        number: inv.number,
        client_name: clientName,
        client_id: (inv as any).client_id ?? null,
        amount_cents: inv.amount_cents ?? 0,
        currency: inv.currency ?? "usd",
        due_at: inv.due_at,
        hosted_url: (inv as any).hosted_url,
        view_url: adminUrl("/admin/invoices", { id: inv.id }),
      });
      await notifyTeam({
        subject: tpl.subject,
        body: `Client: ${clientName}\nAmount: ${amount} ${(inv.currency ?? "usd").toUpperCase()}\nDue: ${inv.due_at}`,
        blocks: tpl.blocks,
        category: "invoices",
      });
    }
  }

  return json({ ok: true, scanned: invoices?.length ?? 0, flipped });
});