import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const businessSchema = z.string().trim().min(1, "Business name is required").max(120);

const Onboarding = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") || "/dashboard";
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const [accountType, setAccountType] = useState<"individual" | "business">("individual");
  const [businessName, setBusinessName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not signed in
  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [user, authLoading, navigate]);

  // If onboarding is already complete, skip this page
  useEffect(() => {
    if (profile?.onboarding_completed) navigate(redirectTo, { replace: true });
  }, [profile, navigate, redirectTo]);

  // Pre-fill from existing profile / Google metadata
  useEffect(() => {
    if (!user) return;
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const fullName =
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      profile?.display_name ??
      "";
    const [metaFirst, ...metaRest] = fullName.trim().split(/\s+/);
    setFirstName(profile?.first_name ?? metaFirst ?? "");
    setLastName(profile?.last_name ?? metaRest.join(" ") ?? "");
    if (profile?.business_name) setBusinessName(profile.business_name);
    if (profile?.account_type) setAccountType(profile.account_type);
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      let businessParsed: string | null = null;
      if (accountType === "business") {
        const r = businessSchema.safeParse(businessName);
        if (!r.success) throw new Error(r.error.issues[0].message);
        businessParsed = r.data;
      }
      const first = firstName.trim() || null;
      const last = lastName.trim() || null;
      const display =
        accountType === "business" && businessParsed
          ? businessParsed
          : [first, last].filter(Boolean).join(" ").trim() || user.email || null;

      const { error } = await supabase
        .from("profiles")
        .update({
          account_type: accountType,
          business_name: businessParsed,
          first_name: first,
          last_name: last,
          display_name: display,
          onboarding_completed: true,
        })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("All set — welcome.");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-1.5 text-base md:text-sm bg-white/[0.02] border-white/10 focus-visible:border-primary/40 focus-visible:ring-primary/20 h-11 md:h-9 transition-colors";
  const labelClass = "text-[11px] font-mono uppercase tracking-widest text-muted-foreground";

  if (authLoading || profileLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="relative overflow-hidden">
        <PageHeroBg />
        <div className="relative z-10 pt-14 md:pt-10 lg:pt-12">
          <section className="relative py-10 md:py-14 lg:py-20">
            <div className="container relative z-10">
              <div className="max-w-md md:max-w-lg mx-auto">
                <motion.div
                  className="text-center mb-5 md:mb-7 lg:mb-9"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-xl md:text-2xl lg:text-4xl font-bold tracking-tight text-depth mb-2.5">
                    Tell us a little <span className="text-gradient">about you.</span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    This is how we'll address you on invoices and in our messages.
                  </p>
                </motion.div>

                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                >
                  <div className="absolute -inset-px rounded-3xl bg-gradient-primary opacity-30 blur-md pointer-events-none" />
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="relative glass-strong rounded-3xl p-5 md:p-6 lg:p-8 border-2 border-white/15 space-y-4"
                  >
                    <div>
                      <Label className={labelClass}>I am signing up as</Label>
                      <RadioGroup
                        value={accountType}
                        onValueChange={(v) => setAccountType(v as "individual" | "business")}
                        className="mt-1.5 grid grid-cols-2 gap-2"
                      >
                        <label
                          htmlFor="ob-individual"
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors text-sm",
                            accountType === "individual"
                              ? "border-primary/50 bg-primary/10"
                              : "border-white/10 bg-white/[0.02] hover:border-white/20",
                          )}
                        >
                          <RadioGroupItem value="individual" id="ob-individual" />
                          <span>An individual</span>
                        </label>
                        <label
                          htmlFor="ob-business"
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors text-sm",
                            accountType === "business"
                              ? "border-primary/50 bg-primary/10"
                              : "border-white/10 bg-white/[0.02] hover:border-white/20",
                          )}
                        >
                          <RadioGroupItem value="business" id="ob-business" />
                          <span>A business owner</span>
                        </label>
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="ob-first" className={labelClass}>First name</Label>
                        <Input
                          id="ob-first"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          autoComplete="given-name"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ob-last" className={labelClass}>Last name</Label>
                        <Input
                          id="ob-last"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          autoComplete="family-name"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {accountType === "business" && (
                      <div>
                        <Label htmlFor="ob-business-name" className={labelClass}>Business name</Label>
                        <Input
                          id="ob-business-name"
                          placeholder="Acme, Inc."
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          autoComplete="organization"
                          className={inputClass}
                          required
                        />
                        <p className="mt-1.5 text-[11px] text-muted-foreground/70 font-mono">
                          Used on invoices and in admin notifications.
                        </p>
                      </div>
                    )}

                    <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Onboarding;