// Public contact form endpoint. No login required (verify_jwt = false).
// Validates, rate-limits, stores the submission, and alerts the team.
import { corsHeaders } from "../_shared/stripe.ts";
import { notifyTeam } from "../_shared/notify.ts";
import { adminUrl } from "../_shared/site.ts";
import { cleanText, clientIpHash, isEmail, json, serviceClient } from "../_shared/request.ts";

// Per sender, per hour. Generous for real people, tight for scripts.
const MAX_PER_IP_PER_HOUR = 5;
const MAX_PER_EMAIL_PER_HOUR = 3;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  // Honeypot: a field real visitors never see. Bots that fill it get a normal
  // success response and nothing is stored.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true });
  }

  const name = cleanText(body.name, 120, 1);
  const company = cleanText(body.company, 120);
  const message = cleanText(body.message, 2000, 10);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const pagePath = cleanText(body.page, 200) || null;

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Name is required (up to 120 characters).";
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (company === null) errors.company = "Company name is too long.";
  if (!message) errors.message = "Message must be 10 to 2000 characters.";
  if (Object.keys(errors).length) return json({ error: "invalid", fields: errors }, 422);

  const db = serviceClient();
  const ipHash = await clientIpHash(req);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const [byIp, byEmail] = await Promise.all([
    ipHash
      ? db.from("contact_submissions").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", hourAgo)
      : Promise.resolve({ count: 0 }),
    db.from("contact_submissions").select("id", { count: "exact", head: true }).eq("email", email).gte("created_at", hourAgo),
  ]);
  if ((byIp.count ?? 0) >= MAX_PER_IP_PER_HOUR || (byEmail.count ?? 0) >= MAX_PER_EMAIL_PER_HOUR) {
    return json({ error: "rate_limited" }, 429);
  }

  const { data: row, error } = await db
    .from("contact_submissions")
    .insert({ name, email, company: company || null, message, page_path: pagePath, ip_hash: ipHash })
    .select("id")
    .single();
  if (error || !row) {
    console.error("submit-contact insert failed:", error);
    return json({ error: "server_error" }, 500);
  }

  // Don't make the visitor wait on Slack/email; the row is already saved.
  const notify = notifyTeam({
    subject: `New inquiry from ${name}`,
    body: [
      company ? `Company: ${company}` : null,
      `Email: ${email}`,
      pagePath ? `Sent from: ${pagePath}` : null,
      "",
      message!,
    ].filter((l) => l !== null).join("\n"),
    category: "inquiries",
    url: adminUrl("/admin/inquiries", { id: row.id }),
  }).catch((e) => console.error("submit-contact notify failed:", e));
  // Finish follow-ups after responding where the runtime allows it;
  // otherwise wait so they aren't cut off when the function exits.
  // deno-lint-ignore no-explicit-any
  const runtime = (globalThis as any).EdgeRuntime;
  if (runtime?.waitUntil) runtime.waitUntil(notify);
  else await notify;

  return json({ ok: true });
});
