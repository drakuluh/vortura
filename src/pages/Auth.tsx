import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Seo } from "@/components/Seo";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

const emailSchema = z.string().trim().email({ message: "Enter a valid email address" }).max(255);
const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(72, { message: "Password must be under 72 characters" });
const displayNameSchema = z
  .string()
  .trim()
  .min(1, { message: "Name is required" })
  .max(80, { message: "Name must be under 80 characters" });
const businessNameSchema = z
  .string()
  .trim()
  .min(1, { message: "Business name is required" })
  .max(120, { message: "Business name must be under 120 characters" });

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const isMobile = useIsMobile();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [accountType, setAccountType] = useState<"individual" | "business">("individual");
  const [businessName, setBusinessName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate(redirectTo, { replace: true });
  }, [user, authLoading, navigate, redirectTo]);

  const headerAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -30, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };
  const cardAnim = isMobile
    ? { initial: false as const, animate: { y: 0 } }
    : {
        initial: { y: 20 },
        whileInView: { y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.6, ease: "easeOut" as const, delay: 0.15 },
      };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const emailParsed = emailSchema.safeParse(email);
      if (!emailParsed.success) throw new Error(emailParsed.error.issues[0].message);
      const passwordParsed = passwordSchema.safeParse(password);
      if (!passwordParsed.success) throw new Error(passwordParsed.error.issues[0].message);

      if (tab === "signup") {
        const nameParsed = displayNameSchema.safeParse(displayName);
        if (!nameParsed.success) throw new Error(nameParsed.error.issues[0].message);
        const parts = nameParsed.data.split(/\s+/);
        const first = parts[0] ?? "";
        const last = parts.slice(1).join(" ");

        let businessParsed: string | null = null;
        if (accountType === "business") {
          const r = businessNameSchema.safeParse(businessName);
          if (!r.success) throw new Error(r.error.issues[0].message);
          businessParsed = r.data;
        }

        const { error } = await supabase.auth.signUp({
          email: emailParsed.data,
          password: passwordParsed.data,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectTo}`,
            data: {
              display_name: nameParsed.data,
              first_name: first,
              last_name: last,
              account_type: accountType,
              business_name: businessParsed,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created — welcome aboard.");
        navigate(redirectTo, { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailParsed.data,
          password: passwordParsed.data,
        });
        if (error) throw error;
        toast.success("Signed in.");
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      if (/invalid login credentials/i.test(msg)) {
        toast.error("Wrong email or password.");
      } else if (/already registered|already exists/i.test(msg)) {
        toast.error("An account with that email already exists. Try signing in.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-1.5 text-base md:text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 h-11 md:h-9 transition-all";
  const labelClass = "text-[11px] font-mono uppercase tracking-widest text-muted-foreground";

  return (
    <PageLayout>
      <Seo
        title="Log In"
        description="Sign in to your Vortura Agency workspace to access your projects, invoices, and live automation metrics."
        noindex
      />
      <div className="relative overflow-hidden">
        <PageHeroBg />
        <div className="relative z-10 pt-14 md:pt-10 lg:pt-12">
          <section className="relative py-10 md:py-14 lg:py-20">
            <div className="container relative z-10">
              <div className="max-w-md md:max-w-lg mx-auto">
                <motion.div className="text-center mb-5 md:mb-7 lg:mb-9" {...headerAnim}>
                  <h1 className="text-xl md:text-2xl lg:text-4xl font-bold tracking-tight text-depth mb-2.5">
                    Sign in to your <span className="text-gradient">workspace.</span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Access your projects, invoices, and live automation metrics.
                  </p>
                </motion.div>

                <motion.div className="relative" {...cardAnim}>
                  <div
                    className="absolute -inset-px rounded-3xl bg-gradient-primary blur-md pointer-events-none"
                    style={{ opacity: 0.3 }}
                  />
                  <div className="relative glass-strong rounded-3xl p-5 md:p-6 lg:p-8 border-2 border-white/15">
                    <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-5 h-11 bg-white/[0.03] border border-white/10 p-1 rounded-xl text-muted-foreground">
                        <TabsTrigger
                          value="signin"
                          className="rounded-lg text-sm font-medium data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow-blue data-[state=inactive]:hover:text-foreground transition-all"
                        >
                          Sign in
                        </TabsTrigger>
                        <TabsTrigger
                          value="signup"
                          className="rounded-lg text-sm font-medium data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow-blue data-[state=inactive]:hover:text-foreground transition-all"
                        >
                          Create account
                        </TabsTrigger>
                      </TabsList>

                      <Button
                        type="button"
                        variant="glass"
                        size="lg"
                        className="w-full mb-4"
                        onClick={handleGoogle}
                        disabled={submitting}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
                        </svg>
                        Continue with Google
                      </Button>

                      <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-background/40 px-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                            or with email
                          </span>
                        </div>
                      </div>

                      <form onSubmit={handleEmail} noValidate className="space-y-3">
                        <TabsContent value="signup" className="m-0 space-y-3">
                          <div>
                            <Label className={labelClass}>Account type</Label>
                            <RadioGroup
                              value={accountType}
                              onValueChange={(v) => setAccountType(v as "individual" | "business")}
                              className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2"
                            >
                              <label
                                htmlFor="acct-individual"
                                className={cn(
                                  "flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-colors",
                                  accountType === "individual"
                                    ? "glass !bg-white/[0.10] border-0 shadow-elev-2 text-foreground"
                                    : "border border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/[0.05]",
                                )}
                              >
                                <RadioGroupItem value="individual" id="acct-individual" />
                                <span className="text-[12px] font-medium leading-tight">Individual</span>
                              </label>
                              <label
                                htmlFor="acct-business"
                                className={cn(
                                  "flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-colors",
                                  accountType === "business"
                                    ? "glass !bg-white/[0.10] border-0 shadow-elev-2 text-foreground"
                                    : "border border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/[0.05]",
                                )}
                              >
                                <RadioGroupItem value="business" id="acct-business" />
                                <span className="text-[12px] font-medium leading-tight">I own a business</span>
                              </label>
                            </RadioGroup>
                          </div>

                          <div>
                            <Label htmlFor="display-name" className={labelClass}>
                              Full name
                            </Label>
                            <Input
                              id="display-name"
                              type="text"
                              placeholder="Jane Doe"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              autoComplete="name"
                              className={inputClass}
                              required={tab === "signup"}
                            />
                          </div>

                          {accountType === "business" && (
                            <div>
                              <Label htmlFor="business-name" className={labelClass}>
                                Business name
                              </Label>
                              <Input
                                id="business-name"
                                type="text"
                                placeholder="Acme, Inc."
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                autoComplete="organization"
                                className={inputClass}
                                required={tab === "signup" && accountType === "business"}
                              />
                              <p className="mt-1.5 text-[11px] text-muted-foreground/70 font-mono">
                                Used on invoices and in admin notifications.
                              </p>
                            </div>
                          )}
                        </TabsContent>

                        <div>
                          <Label htmlFor="email" className={labelClass}>
                            Work email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="jane@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            className={inputClass}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="password" className={labelClass}>
                            Password
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={tab === "signup" ? "new-password" : "current-password"}
                            className={inputClass}
                            minLength={8}
                            required
                          />
                          {tab === "signup" && (
                            <p className="mt-1.5 text-[11px] text-muted-foreground/70 font-mono">
                              At least 8 characters. Checked against known breached passwords.
                            </p>
                          )}
                          {tab === "signin" && (
                            <div className="mt-1.5 flex justify-end">
                              <Link
                                to="/forgot-password"
                                className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                              >
                                Forgot password?
                              </Link>
                            </div>
                          )}
                        </div>

                        <div className="pt-1">
                          <Button
                            type="submit"
                            variant="hero"
                            size="lg"
                            className="w-full"
                            disabled={submitting}
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                {tab === "signup" ? "Creating account..." : "Signing in..."}
                              </>
                            ) : (
                              <>
                                {tab === "signup" ? "Create account" : "Sign in"}
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </Button>
                        </div>

                        <p className="text-[11px] text-center text-muted-foreground/70 font-mono">
                          By continuing you agree to VORTURA's terms and privacy policy.
                        </p>
                      </form>
                    </Tabs>
                  </div>
                </motion.div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                  Don't have an account yet?{" "}
                  <Link to="/contact" className="text-primary hover:underline">
                    Book a discovery call
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Auth;
