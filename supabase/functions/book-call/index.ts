// Books a call from the website calendar (guests and signed-in users).
// Replaces the calendar's direct insert into bookings, which RLS rejects for
// everyone but admins. Checks the slot is valid and free, links the booking
// to the account when signed in, alerts the team, and emails the booker.
import { corsHeaders } from "../_shared/stripe.ts";
import { notifyTeam } from "../_shared/notify.ts";
import { adminUrl, siteUrl } from "../_shared/site.ts";
import {
  FIRST_SLOT_HOUR,
  LAST_SLOT_HOUR,
  cleanText,
  clientIpHash,
  formatTorontoTime,
  isEmail,
  json,
  optionalUser,
  serviceClient,
  torontoClock,
} from "../_shared/request.ts";

const DURATION_MIN = 30;
const MIN_LEAD_MS = 60 * 60 * 1000; // at least an hour's notice
const MAX_AHEAD_MS = 60 * 24 * 60 * 60 * 1000; // up to 60 days out
const MAX_PER_IP_PER_DAY = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  if (typeof body.website === "string" && body.website.trim() !== "") return json({ ok: true });

  // ── When ──────────────────────────────────────────────────────────────────
  const start = new Date(typeof body.scheduled_at === "string" ? body.scheduled_at : "");
  if (Number.isNaN(start.getTime())) return json({ error: "invalid", fields: { scheduled_at: "Pick a time." } }, 422);
  const now = Date.now();
  const { hour, minute } = torontoClock(start);
  const onGrid = (minute === 0 || minute === 30) && start.getUTCSeconds() === 0 && start.getUTCMilliseconds() === 0;
  const inHours = hour >= FIRST_SLOT_HOUR && hour <= LAST_SLOT_HOUR;
  if (!onGrid || !inHours || start.getTime() < now + MIN_LEAD_MS || start.getTime() > now + MAX_AHEAD_MS) {
    return json({ error: "invalid", fields: { scheduled_at: "That time isn't available to book." } }, 422);
  }

  // ── Who ───────────────────────────────────────────────────────────────────
  const db = serviceClient();
  const user = await optionalUser(req);
  let name: string | null;
  let email: string;

  if (user) {
    const { data: profile } = await db
      .from("profiles")
      .select("first_name, last_name, display_name")
      .eq("id", user.id)
      .maybeSingle();
    name =
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
      profile?.display_name ||
      user.email ||
      "Vortura user";
    email = (user.email ?? "").toLowerCase();
  } else {
    name = cleanText(body.name, 120, 1);
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const fields: Record<string, string> = {};
    if (!name) fields.name = "Name is required.";
    if (!isEmail(email)) fields.email = "Enter a valid email address.";
    if (Object.keys(fields).length) return json({ error: "invalid", fields }, 422);
  }
  // Signed-out bookings come from the contact form, which adds a company
  // and a message; both are kept with the booking.
  const company = cleanText(body.company, 120) || null;
  const message = cleanText(body.message, 1000) || cleanText(body.notes, 1000) || null;
  const notes = [company ? `Company: ${company}` : null, message].filter(Boolean).join("\n\n") || null;

  // ── Abuse and conflicts ───────────────────────────────────────────────────
  const ipHash = await clientIpHash(req);
  if (ipHash && !user) {
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await db
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", dayAgo);
    if ((count ?? 0) >= MAX_PER_IP_PER_DAY) return json({ error: "rate_limited" }, 429);
  }

  const end = new Date(start.getTime() + DURATION_MIN * 60 * 1000);
  // Anything active that starts before this one ends. Overlap is then
  // confirmed against each booking's own duration below.
  const { data: nearby, error: clashErr } = await db
    .from("bookings")
    .select("scheduled_at, duration_minutes")
    .in("status", ["pending", "confirmed"])
    .lt("scheduled_at", end.toISOString())
    .gte("scheduled_at", new Date(start.getTime() - 4 * 60 * 60 * 1000).toISOString());
  if (clashErr) {
    console.error("book-call clash check failed:", clashErr);
    return json({ error: "server_error" }, 500);
  }
  const taken = (nearby ?? []).some((b) => {
    const bStart = new Date(b.scheduled_at).getTime();
    return bStart + b.duration_minutes * 60 * 1000 > start.getTime();
  });
  if (taken) return json({ error: "slot_taken" }, 409);

  // ── Book ──────────────────────────────────────────────────────────────────
  const { data: booking, error } = await db
    .from("bookings")
    .insert({
      caller_name: name,
      caller_email: email || null,
      booking_type: "discovery",
      scheduled_at: start.toISOString(),
      duration_minutes: DURATION_MIN,
      status: "pending",
      source: "website",
      notes,
      user_id: user?.id ?? null,
      ip_hash: ipHash,
    })
    .select("id")
    .single();
  if (error || !booking) {
    console.error("book-call insert failed:", error);
    return json({ error: "server_error" }, 500);
  }

  const when = formatTorontoTime(start);
  const followUps = Promise.allSettled([
    notifyTeam({
      subject: `New call booked: ${name}`,
      body: [`When: ${when}`, `Email: ${email || "none"}`, user ? "Signed-in user" : "Guest", notes ? `\n${notes}` : null]
        .filter(Boolean)
        .join("\n"),
      category: "bookings",
      url: adminUrl("/admin/bookings", { id: booking.id }),
    }),
    email
      ? fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            templateName: "booking-received",
            recipientEmail: email,
            idempotencyKey: `booking-received-${booking.id}`,
            templateData: { name: name?.split(" ")[0], when, siteUrl: siteUrl() },
          }),
        })
      : Promise.resolve(),
  ]).then((results) => {
    for (const r of results) if (r.status === "rejected") console.error("book-call follow-up failed:", r.reason);
  });
  // Finish follow-ups after responding where the runtime allows it;
  // otherwise wait so they aren't cut off when the function exits.
  // deno-lint-ignore no-explicit-any
  const runtime = (globalThis as any).EdgeRuntime;
  if (runtime?.waitUntil) runtime.waitUntil(followUps);
  else await followUps;

  return json({ ok: true, id: booking.id, scheduled_at: start.toISOString() });
});
