// Self-serve upgrade from Get More Calls -> Get More Customers.
// 1. Charges $1,300 setup-fee difference via a one-time Checkout session.
// 2. After payment, the success page calls this endpoint with action=swap
//    to swap the subscription to the new monthly price (auto-prorated).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, environment, targetTier, returnUrl } = body;
    if (environment !== "sandbox" && environment !== "live") throw new Error("Invalid environment");

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const stripe = createStripeClient(environment as StripeEnv);

    // Get current active subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, stripe_customer_id, tier")
      .eq("user_id", user.id)
      .eq("environment", environment as StripeEnv)
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub) throw new Error("No active subscription found");

    // === Step 1: create checkout for the $1,300 setup difference ===
    if (action === "start_upgrade") {
      if (sub.tier !== "get_more_calls" || targetTier !== "get_more_customers") {
        throw new Error("Only Get More Calls -> Get More Customers upgrade is supported");
      }

      const diffPrices = await stripe.prices.list({ lookup_keys: ["tier_upgrade_difference_1300"] });
      if (!diffPrices.data.length) throw new Error("Upgrade price not found");

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: diffPrices.data[0].id, quantity: 1 }],
        mode: "payment",
        ui_mode: "embedded",
        return_url: returnUrl,
        customer: sub.stripe_customer_id,
        metadata: {
          userId: user.id,
          upgrade_action: "swap_after_payment",
          subscription_id: sub.stripe_subscription_id,
          target_tier: targetTier,
          lovable_price_id: "tier_upgrade_difference_1300",
          tier: "tier_upgrade_difference",
        },
      });

      return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === Step 2: swap the subscription to new monthly price ===
    if (action === "complete_swap") {
      const sessionId = body.sessionId;
      if (!sessionId) throw new Error("sessionId required");

      // Verify the upgrade-difference payment succeeded
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") throw new Error("Upgrade payment not completed");
      if (session.metadata?.userId !== user.id) throw new Error("Session does not belong to this user");

      // Resolve new monthly price
      const newPrices = await stripe.prices.list({ lookup_keys: ["get_more_customers_monthly_sub"] });
      if (!newPrices.data.length) throw new Error("New plan price not found");

      const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
      const itemId = stripeSub.items.data[0].id;

      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        items: [{ id: itemId, price: newPrices.data[0].id }],
        proration_behavior: "create_prorations",
        metadata: {
          ...stripeSub.metadata,
          userId: user.id,
          tier: "get_more_customers",
        },
      });

      return new Response(JSON.stringify({ ok: true, newTier: "get_more_customers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e) {
    console.error("upgrade-subscription error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});