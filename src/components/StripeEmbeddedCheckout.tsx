import { useCallback } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  priceId: string;
  setupPriceId?: string;
  customerEmail?: string;
  userId?: string;
  returnUrl: string;
  // For upgrade flow: call this function instead of create-checkout
  fnName?: "create-checkout" | "upgrade-subscription";
  extraBody?: Record<string, unknown>;
}

export function StripeEmbeddedCheckout({
  priceId,
  setupPriceId,
  customerEmail,
  userId,
  returnUrl,
  fnName = "create-checkout",
  extraBody,
}: Props) {
  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke(fnName, {
      body: {
        priceId,
        setupPriceId,
        customerEmail,
        userId,
        returnUrl,
        environment: getStripeEnvironment(),
        ...extraBody,
      },
    });
    if (error || !data?.clientSecret) {
      throw new Error(error?.message || data?.error || "Failed to create checkout session");
    }
    return data.clientSecret as string;
  }, [priceId, setupPriceId, customerEmail, userId, returnUrl, fnName, extraBody]);

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}