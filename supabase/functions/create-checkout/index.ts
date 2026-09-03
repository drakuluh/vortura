import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, createStripeClient, priceIdToTier, type StripeEnv } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface CheckoutBody {
  priceId: string;
  setupPriceId?: string; // for bundles: charge setup as add-on line item
  quantity?: number;
  customerEmail?: string;
  userId?: string;
  returnUrl: string;
  environment: StripeEnv;
  managedPayments?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const body: CheckoutBody = await req.json();
    const { priceId, setupPriceId, quantity, customerEmail, userId, returnUrl, environment } = body;

    if (!/^[a-zA-Z0-9_-]+$/.test(priceId)) throw new Error("Invalid priceId");
    if (setupPriceId && !/^[a-zA-Z0-9_-]+$/.test(setupPriceId)) throw new Error("Invalid setupPriceId");
    if (!returnUrl) throw new Error("returnUrl required");
    if (environment !== "sandbox" && environment !== "live") throw new Error("Invalid environment");

    const stripe = createStripeClient(environment);

    // Resolve main price
    const mainPrices = await stripe.prices.list({ lookup_keys: [priceId] });
    if (!mainPrices.data.length) throw new Error("Price not found");
    const mainPrice = mainPrices.data[0];
    const isRecurring = mainPrice.type === "recurring";

    const lineItems: any[] = [
      { price: mainPrice.id, quantity: quantity || 1 },
    ];

    // Add setup fee as a second line item. In subscription mode Stripe allows
    // mixing one-time prices with the recurring price; the one-time amount is
    // billed on the first invoice alongside the subscription.
    if (setupPriceId) {
      const setupPrices = await stripe.prices.list({ lookup_keys: [setupPriceId] });
      if (!setupPrices.data.length) throw new Error("Setup price not found");
      lineItems.push({ price: setupPrices.data[0].id, quantity: 1 });
    }

    const tier = priceIdToTier(priceId);
    const metadata: Record<string, string> = {
      lovable_price_id: priceId,
      ...(setupPriceId && { lovable_setup_price_id: setupPriceId }),
      ...(tier && { tier }),
      ...(userId && { userId }),
    };

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded",
      return_url: returnUrl,
      ...(customerEmail && { customer_email: customerEmail }),
      metadata,
      ...(isRecurring && {
        subscription_data: {
          metadata,
        },
      }),
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});