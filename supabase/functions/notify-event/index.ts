// Authenticated event notifier. Any logged-in user can call this to fire a
// team notification (Slack + email + activity log) for a known event kind.
// Server enforces that the description is built from server-known data only —
// callers pass IDs and the server fetches/formats the message.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/stripe.ts";
import { notifyTeam } from "../_shared/notify.ts";
import { adminUrl } from "../_shared/site.ts";
import {
  changeRequestTemplate,
  changeRequestCommentTemplate,
  newClientTemplate,
  newMessageTemplate,
  newThreadTemplate,
} from "../_shared/slack-templates.ts";

type Kind =
  | "new_change_request"
  | "new_change_request_comment"
  | "new_client"
  | "new_message_from_client"
  | "new_thread_from_client";

interface Body {
  kind: Kind;
  entity_id: string;
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

  // Auth: must be a logged-in user
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

  if (!body?.kind || typeof body.entity_id !== "string") {
    return json({ error: "Missing kind/entity_id" }, 400);
  }

  const db = admin();

  try {
    if (body.kind === "new_change_request") {
      const { data: cr } = await db
        .from("change_requests")
        .select("title, priority, description, client_id, clients(name)")
        .eq("id", body.entity_id)
        .maybeSingle();
      if (!cr) return json({ error: "Change request not found" }, 404);
      const clientName = (cr as any).clients?.name ?? "Unknown client";
      const tpl = changeRequestTemplate({
        title: cr.title,
        priority: cr.priority,
        client_name: clientName,
        client_id: (cr as any).client_id ?? null,
        description: (cr as any).description,
        view_url: adminUrl("/admin/change-requests", { id: body.entity_id }),
      });
      await notifyTeam({
        subject: tpl.subject,
        body: `Client: ${clientName}\nPriority: ${cr.priority}\nTitle: ${cr.title}`,
        blocks: tpl.blocks,
        category: "change_requests",
      });
    } else if (body.kind === "new_client") {
      const { data: c } = await db
        .from("clients")
        .select("name, plan, contact_name, email")
        .eq("id", body.entity_id)
        .maybeSingle();
      if (!c) return json({ error: "Client not found" }, 404);
      const tpl = newClientTemplate({
        name: c.name,
        client_id: body.entity_id,
        plan: c.plan,
        contact_name: c.contact_name,
        email: c.email,
        view_url: adminUrl("/admin/clients", { id: body.entity_id }),
      });
      await notifyTeam({
        subject: tpl.subject,
        body: `Plan: ${c.plan ?? "—"}\nContact: ${c.contact_name ?? "—"}${c.email ? ` <${c.email}>` : ""}`,
        blocks: tpl.blocks,
        category: "clients",
      });
    } else if (body.kind === "new_message_from_client") {
      const { data: m } = await db
        .from("messages")
        .select("body, sender_side, thread_id, message_threads(subject, client_id, clients(name))")
        .eq("id", body.entity_id)
        .maybeSingle();
      if (!m) return json({ error: "Message not found" }, 404);
      if (m.sender_side !== "client") return json({ skipped: "not from client" });
      const thread = (m as any).message_threads;
      const clientName = thread?.clients?.name ?? "Unknown client";
      const snippet = (m.body ?? "").slice(0, 240);
      const tpl = newMessageTemplate({
        client_name: clientName,
        client_id: thread?.client_id ?? null,
        thread_subject: thread?.subject ?? "—",
        body: m.body ?? "",
        view_url: adminUrl("/admin/messages", { thread: (m as any).thread_id }),
      });
      await notifyTeam({
        subject: tpl.subject,
        body: `Thread: ${thread?.subject ?? "—"}\n\n${snippet}`,
        blocks: tpl.blocks,
        category: "messages",
      });
    } else if (body.kind === "new_thread_from_client") {
      const { data: t } = await db
        .from("message_threads")
        .select("subject, client_id, clients(name)")
        .eq("id", body.entity_id)
        .maybeSingle();
      if (!t) return json({ error: "Thread not found" }, 404);
      const clientName = (t as any).clients?.name ?? "Unknown client";
      const tpl = newThreadTemplate({
        client_name: clientName,
        client_id: (t as any).client_id ?? null,
        subject: t.subject,
        view_url: adminUrl("/admin/messages", { thread: body.entity_id }),
      });
      await notifyTeam({
        subject: tpl.subject,
        body: `Subject: ${t.subject}`,
        blocks: tpl.blocks,
        category: "messages",
      });
    } else if (body.kind === "new_change_request_comment") {
      const { data: c } = await db
        .from("change_request_comments")
        .select("body, author_side, change_request_id, change_requests(title, status, client_id, clients(name))")
        .eq("id", body.entity_id)
        .maybeSingle();
      if (!c) return json({ error: "Comment not found" }, 404);
      if ((c as any).author_side !== "client") return json({ skipped: "not from client" });
      const cr = (c as any).change_requests;
      // Only notify when the change request is still open (not done/cancelled).
      const status = cr?.status as string | undefined;
      if (status && ["done", "cancelled", "canceled", "closed"].includes(status)) {
        return json({ skipped: "change request closed" });
      }
      const clientName = cr?.clients?.name ?? "Unknown client";
      const tpl = changeRequestCommentTemplate({
        client_name: clientName,
        client_id: cr?.client_id ?? null,
        request_title: cr?.title ?? "—",
        body: (c as any).body ?? "",
        view_url: adminUrl("/admin/change-requests", { id: (c as any).change_request_id }),
      });
      await notifyTeam({
        subject: tpl.subject,
        body: `Change request: ${cr?.title ?? "—"}\n\n${((c as any).body ?? "").slice(0, 240)}`,
        blocks: tpl.blocks,
        category: "change_requests",
      });
    } else {
      return json({ error: "Unknown kind" }, 400);
    }
    return json({ ok: true });
  } catch (e) {
    console.error("notify-event error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});