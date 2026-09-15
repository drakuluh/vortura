// Small helpers shared by the public-facing contact functions
// (submit-contact, book-call).
import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "./stripe.ts";

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function serviceClient(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

/**
 * The signed-in user behind the request, or null for guests. supabase-js
 * sends the anon key as the bearer token when nobody is signed in, which
 * simply fails getUser and resolves to null.
 */
export async function optionalUser(req: Request): Promise<User | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  if (token === Deno.env.get("SUPABASE_ANON_KEY")) return null;
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data, error } = await client.auth.getUser(token);
  return error ? null : data.user;
}

/**
 * Keyed hash of the caller's IP for rate limiting. Keyed with a server secret
 * so the stored value can't be reversed into an address.
 */
export async function clientIpHash(req: Request): Promise<string | null> {
  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!ip) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmail = (s: unknown): s is string => typeof s === "string" && s.length <= 255 && EMAIL_RE.test(s);

/** Trimmed string within bounds, or null. */
export function cleanText(value: unknown, max: number, min = 0): string | null {
  if (typeof value !== "string") return min === 0 ? "" : null;
  const t = value.trim();
  if (t.length < min || t.length > max) return null;
  return t;
}

// ── Booking times (America/Toronto) ─────────────────────────────────────────
export const BOOKING_TZ = "America/Toronto";
export const FIRST_SLOT_HOUR = 9; // 9:00 AM
export const LAST_SLOT_HOUR = 20; // last start 8:30 PM

/** Hour and minute on the Toronto wall clock for an instant. */
export function torontoClock(at: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BOOKING_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { hour: get("hour"), minute: get("minute") };
}

export function formatTorontoTime(at: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BOOKING_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(at);
}
