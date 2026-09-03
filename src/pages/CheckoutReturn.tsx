import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";

export default function CheckoutReturn() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const isUpgrade = params.get("upgrade") === "1";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("No session information found.");
      return;
    }

    if (isUpgrade) {
      // Complete the subscription swap server-side
      (async () => {
        const { data, error } = await supabase.functions.invoke("upgrade-subscription", {
          body: { action: "complete_swap", sessionId, environment: getStripeEnvironment() },
        });
        if (error || data?.error) {
          setStatus("error");
          setMessage(error?.message || data?.error || "Upgrade failed");
          toast.error("Upgrade could not complete. Please contact support.");
        } else {
          setStatus("success");
          setMessage("Your plan has been upgraded to Get More Customers.");
          toast.success("Upgrade complete!");
        }
      })();
    } else {
      setStatus("success");
      setMessage("Thanks for your purchase. We'll be in touch shortly to kick off your project.");
    }
  }, [sessionId, isUpgrade]);

  return (
    <PageLayout>
      <section className="relative pt-40 pb-24 overflow-hidden">
        <PageHeroBg />
        <div className="container relative z-10 max-w-xl">
          <div className="glass rounded-2xl p-8 text-center">
            {status === "loading" && (
              <>
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                <h1 className="text-2xl font-bold mb-2">Finalizing your order…</h1>
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h1 className="text-2xl font-bold mb-2">Payment successful</h1>
                <p className="text-sm text-muted-foreground mb-6">{message}</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button asChild variant="hero">
                    <Link to="/dashboard">Go to dashboard <ArrowRight className="w-3.5 h-3.5" /></Link>
                  </Button>
                  <Button asChild variant="glass">
                    <Link to="/">Back home</Link>
                  </Button>
                </div>
              </>
            )}
            {status === "error" && (
              <>
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                <p className="text-sm text-muted-foreground mb-6">{message}</p>
                <Button asChild variant="glass">
                  <Link to="/contact">Contact support</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}