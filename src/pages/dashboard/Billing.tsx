import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Loader2, TrendingUp, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DashboardSubPage } from "@/components/dashboard/DashboardSubPage";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { getStripeEnvironment } from "@/lib/stripe";
import { formatCents } from "@/lib/admin/format";

const TIER_LABELS: Record<string, string> = {
  get_online: "Get Online",
  get_more_calls: "Get More Calls",
  get_more_customers: "Get More Customers",
};

export default function Billing() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { subscription, isActive, tier, loading } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (!authLoading && !user) {
    navigate("/login", { replace: true });
    return null;
  }

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          environment: getStripeEnvironment(),
          returnUrl: `${window.location.origin}/dashboard/billing`,
        },
      });
      if (error || !data?.url) throw new Error(error?.message || data?.error || "Could not open billing portal");
      window.open(data.url, "_blank");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPortalLoading(false);
    }
  };

  const canUpgrade = tier === "get_more_calls";

  return (
    <DashboardSubPage eyebrow="Billing" title="Subscription & billing" description="Manage your plan, payment methods, and invoices.">
      {loading ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
        </div>
      ) : !subscription ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">You don't have an active subscription yet.</p>
          <Button variant="hero" onClick={() => navigate("/contact")}>Book a call</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="glass rounded-2xl p-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Current plan</p>
            <h3 className="text-2xl font-bold mb-1">{TIER_LABELS[tier ?? ""] ?? subscription.price_id}</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Status: <span className={isActive ? "text-primary" : "text-destructive"}>{subscription.status}</span>
              {subscription.current_period_end && (
                <> · Renews {new Date(subscription.current_period_end).toLocaleDateString()}</>
              )}
              {subscription.cancel_at_period_end && <> · Cancels at period end</>}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="glass" size="sm" onClick={openPortal} disabled={portalLoading}>
                {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                Manage payment & cancel
                <ExternalLink className="w-3 h-3" />
              </Button>
              {canUpgrade && (
                <Button variant="hero" size="sm" onClick={() => setUpgradeOpen(true)}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  Upgrade to Get More Customers
                </Button>
              )}
            </div>
          </div>

          {canUpgrade && (
            <div className="glass rounded-2xl p-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Upgrade preview</p>
              <p className="text-sm text-muted-foreground">
                Upgrading to <strong className="text-foreground">Get More Customers</strong> charges a one-time{" "}
                <strong className="text-foreground">{formatCents(130000)}</strong> setup difference today, then switches your
                monthly plan to <strong className="text-foreground">$399/mo</strong> (auto-prorated against your current $149/mo).
              </p>
            </div>
          )}
        </div>
      )}

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upgrade to Get More Customers</DialogTitle>
          </DialogHeader>
          {upgradeOpen && (
            <StripeEmbeddedCheckout
              priceId="tier_upgrade_difference_1300"
              userId={user?.id}
              customerEmail={user?.email}
              fnName="upgrade-subscription"
              extraBody={{ action: "start_upgrade", targetTier: "get_more_customers" }}
              returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}&upgrade=1`}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardSubPage>
  );
}