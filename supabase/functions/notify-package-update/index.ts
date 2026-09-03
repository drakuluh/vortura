// Notifies the team (Slack + email) when an admin posts a package update,
// and emails the client owner so they know to check their dashboard.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/stripe.ts";
import { notifyTeam } from "../_shared/notify.ts";
import { siteUrl, adminUrl } from "../_shared/site.ts";
import { packageUpdateTemplate } from "../_shared/slack-templates.ts";

interface Body {
  kind: "new_package_update";
  entity_id: string; // package_updates.id
}

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
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
  const token = authHeader.replace("Bearer ", "");
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: claims, error: authErr } = await userClient.auth.getClaims(token);
  if (authErr || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);

  let body: Body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (body?.kind !== "new_package_update" || typeof body.entity_id !== "string") {
    return json({ error: "Missing kind/entity_id" }, 400);
  }

  const db = admin();

  try {
    const { data: upd, error: updErr } = await db
      .from("package_updates")
      .select("id, title, body, status_change, progress_change, package_id, packages(id, name, nickname, client_id, clients(name, user_id))")
      .eq("id", body.entity_id)
      .maybeSingle();
    if (updErr) throw updErr;
    if (!upd) return json({ error: "Update not found" }, 404);

    const pkg = (upd as any).packages;
    const client = pkg?.clients;
    const packageDisplay = (pkg?.nickname?.trim() || pkg?.name) ?? "—";
    const clientName = client?.name ?? "Unknown client";

    // Attachment count
    const { count: attCount } = await db
      .from("package_update_attachments")
      .select("id", { count: "exact", head: true })
      .eq("update_id", upd.id);

    // Team notification (Slack + email to support address)
    const tpl = packageUpdateTemplate({
      package_name: packageDisplay,
      client_name: clientName,
      client_id: pkg?.client_id ?? null,
      title: (upd as any).title,
      body: (upd as any).body,
      status_change: (upd as any).status_change,
      progress_change: (upd as any).progress_change,
      attachment_count: attCount ?? 0,
      view_url: adminUrl(`/admin/packages/${pkg?.id ?? ""}`),
    });
    await notifyTeam({
      subject: tpl.subject,
      body: `Package: ${packageDisplay}\nClient: ${clientName}\n\n${(upd as any).title}\n\n${((upd as any).body ?? "").slice(0, 240)}`,
      blocks: tpl.blocks,
    });

    // Email the client owner
    if (client?.user_id) {
      const { data: { user: ownerUser } } = await db.auth.admin.getUserById(client.user_id);
      const ownerEmail = ownerUser?.email;
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (ownerEmail && lovableKey) {
        const clientUrl = `${siteUrl()}/dashboard/packages/${pkg.id}`;
        const html = `
          <p>Hi,</p>
          <p>Your team posted an update on your package <strong>${packageDisplay}</strong>:</p>
          <h3 style="margin:16px 0 8px">${escapeHtml((upd as any).title)}</h3>
          ${(upd as any).body ? `<p>${escapeHtml((upd as any).body).replace(/\n/g, "<br>")}</p>` : ""}
          ${(upd as any).status_change ? `<p><em>Status changed to: ${escapeHtml((upd as any).status_change.replace("_", " "))}</em></p>` : ""}
          ${(upd as any).progress_change != null ? `<p><em>Progress: ${(upd as any).progress_change}%</em></p>` : ""}
          <p style="margin-top:24px"><a href="${clientUrl}" style="background:#3B82F6;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">View update</a></p>
        `;
        try {
          await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              to: ownerEmail,
              subject: `New update on ${packageDisplay}: ${(upd as any).title}`,
              html,
              purpose: "transactional",
            }),
          });
        } catch (e) {
          console.error("Client email failed (email infra may not be set up):", e);
        }
      }
    }

    return json({ ok: true });
  } catch (e) {
    console.error("notify-package-update error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}