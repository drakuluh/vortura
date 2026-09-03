import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Map RetellAI call type strings to our booking_type enum
function parseBookingType(raw: string | undefined): string {
  if (!raw) return "discovery";
  const lower = raw.toLowerCase().trim();
  if (lower.includes("strategy")) return "strategy";
  if (lower.includes("onboarding")) return "onboarding";
  if (lower.includes("support")) return "support";
  if (lower.includes("discovery")) return "discovery";
  return "other";
}

// Parse a date/time string from the caller into a real timestamp.
// RetellAI custom data may provide this as ISO 8601 or natural language
// that was already resolved by the agent into a structured format.
function parseScheduledAt(date: string | undefined, time: string | undefined): string | null {
  if (!date) return null;
  try {
    // If date is already ISO 8601
    if (date.includes("T")) return new Date(date).toISOString();
    // Combine date + time
    const combined = time ? `${date} ${time}` : date;
    const parsed = new Date(combined);
    if (isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // Verify the webhook secret if configured
  const webhookSecret = Deno.env.get("RETELL_WEBHOOK_SECRET");
  if (webhookSecret) {
    const authHeader = req.headers.get("authorization") || req.headers.get("x-retell-signature") || "";
    if (!authHeader.includes(webhookSecret)) {
      return json({ error: "Unauthorized" }, 401);
    }
  }

  try {
    const body = await req.json();

    // RetellAI sends different event types — we only care about call_ended
    // or call_analyzed (when post-call analysis is complete)
    const event = body.event || "call_ended";
    if (event !== "call_ended" && event !== "call_analyzed") {
      return json({ ok: true, skipped: true, reason: `event type: ${event}` });
    }

    const call = body.call || body;
    const callId = call.call_id || call.id;
    const metadata = call.metadata || {};
    const analysis = call.call_analysis || call.analysis || {};
    const customData = call.custom_analysis_data || call.retell_llm_dynamic_variables || {};

    // Extract caller info — RetellAI may put these in different places
    // depending on agent config. Check analysis, custom data, and metadata.
    const callerName =
      customData.caller_name ||
      analysis.caller_name ||
      metadata.caller_name ||
      call.from_number ||
      "Unknown Caller";

    const callerPhone =
      call.from_number ||
      customData.caller_phone ||
      metadata.caller_phone ||
      null;

    const callerEmail =
      customData.caller_email ||
      analysis.caller_email ||
      metadata.caller_email ||
      null;

    const bookingType = parseBookingType(
      customData.booking_type || analysis.booking_type || metadata.booking_type
    );

    const scheduledAt = parseScheduledAt(
      customData.booking_date || analysis.booking_date || metadata.booking_date,
      customData.booking_time || analysis.booking_time || metadata.booking_time
    );

    const notes =
      customData.notes ||
      analysis.call_summary ||
      analysis.summary ||
      null;

    const durationMinutes =
      customData.duration_minutes ||
      metadata.duration_minutes ||
      30;

    // Only create a booking if the caller actually requested one
    const bookingRequested =
      customData.booking_requested === true ||
      customData.booking_requested === "true" ||
      analysis.booking_requested === true ||
      metadata.booking_requested === true ||
      // If a scheduled_at was extracted, assume booking was requested
      scheduledAt !== null;

    if (!bookingRequested) {
      return json({
        ok: true,
        skipped: true,
        reason: "No booking requested during call",
        call_id: callId,
      });
    }

    // Check for duplicate by retell_call_id
    if (callId) {
      const { data: existing } = await supabase
        .from("bookings")
        .select("id")
        .eq("retell_call_id", callId)
        .maybeSingle();
      if (existing) {
        return json({ ok: true, skipped: true, reason: "Duplicate call_id", booking_id: existing.id });
      }
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        caller_name: callerName,
        caller_phone: callerPhone,
        caller_email: callerEmail,
        booking_type: bookingType,
        scheduled_at: scheduledAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: Number(durationMinutes) || 30,
        status: scheduledAt ? "pending" : "pending",
        notes,
        source: "retell_ai",
        retell_call_id: callId || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to insert booking:", error);
      return json({ error: "Failed to create booking", details: error.message }, 500);
    }

    // Log to activity_log
    await supabase.from("activity_log").insert({
      entity_type: "booking",
      entity_id: booking.id,
      action: "create",
      summary: `New booking from ${callerName} via RetellAI call`,
      metadata: { source: "retell_ai", call_id: callId, booking_type: bookingType },
    });

    console.log(`Booking created: ${booking.id} for ${callerName} (call: ${callId})`);
    return json({ ok: true, booking_id: booking.id });
  } catch (err) {
    console.error("Retell webhook error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
