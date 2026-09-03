import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { Seo } from "@/components/Seo";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { supabase } from "@/integrations/supabase/client";

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(72, { message: "Password must be under 72 characters" });

const ResetPassword = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);

  // Supabase parses the recovery hash automatically and emits PASSWORD_RECOVERY.
  // We listen for it (or an existing recovery session) so the user can set a new password.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      } else {
        // Give Supabase a moment to process the URL hash on first mount
        const t = setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (s) setReady(true);
            else setInvalid(true);
          });
        }, 600);
        return () => clearTimeout(t);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const headerAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -30, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };
  const cardAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, scaleY: 1 } }
    : {
        initial: { opacity: 0, y: 60, scaleY: 0.7 },
        whileInView: { opacity: 1, y: 0, scaleY: 1 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 },
        style: { transformOrigin: "bottom" },
      };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsed = passwordSchema.safeParse(password);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      if (password !== confirm) throw new Error("Passwords don't match");

      const { error } = await supabase.auth.updateUser({ password: parsed.data });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-1.5 text-base md:text-sm bg-white/[0.02] border-white/10 focus-visible:border-primary/40 focus-visible:ring-primary/20 h-11 md:h-9 transition-colors";
  const labelClass = "text-[11px] font-mono uppercase tracking-widest text-muted-foreground";

  return (
    <PageLayout>
      <Seo title="Reset Password" description="Choose a new password for your Vortura Agency account." noindex />
      <div className="relative overflow-hidden">
        <PageHeroBg />
        <div className="relative z-10 pt-14 md:pt-10 lg:pt-12">
          <section className="relative py-10 md:py-14 lg:py-20">
            <div className="container relative z-10">
              <div className="max-w-md md:max-w-lg mx-auto">
                <motion.div className="text-center mb-5 md:mb-7 lg:mb-9" {...headerAnim}>
                  <h1 className="text-xl md:text-2xl lg:text-4xl font-bold tracking-tight text-depth mb-2.5">
                    Set a new <span className="text-gradient">password.</span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Choose something strong — at least 8 characters.
                  </p>
                </motion.div>

                <motion.div className="relative" {...cardAnim}>
                  <motion.div
                    className="absolute -inset-px rounded-3xl bg-gradient-primary blur-md pointer-events-none"
                    initial={isMobile ? { opacity: 0.3 } : { opacity: 0 }}
                    {...(isMobile
                      ? {}
                      : {
                          whileInView: { opacity: 0.3 },
                          viewport: { once: true, margin: "-80px" },
                          transition: { duration: 0.8, ease: "easeOut" as const, delay: 0.5 },
                        })}
                  />
                  <div className="relative glass-strong rounded-3xl p-5 md:p-6 lg:p-8 border-2 border-white/15">
                    {invalid ? (
                      <div className="text-center space-y-4 py-4">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center">
                          <KeyRound className="w-6 h-6 text-destructive" />
                        </div>
                        <h2 className="text-lg font-semibold">Reset link invalid or expired</h2>
                        <p className="text-sm text-muted-foreground">
                          Request a new reset link to continue.
                        </p>
                        <Button asChild variant="hero" size="lg" className="w-full">
                          <Link to="/forgot-password">
                            Request a new link
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </div>
                    ) : !ready ? (
                      <div className="flex items-center justify-center py-10 text-muted-foreground gap-2 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying reset link...
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        <div>
                          <Label htmlFor="new-password" className={labelClass}>
                            New password
                          </Label>
                          <Input
                            id="new-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            className={inputClass}
                            minLength={8}
                            required
                          />
                          <p className="mt-1.5 text-[11px] text-muted-foreground/70 font-mono">
                            At least 8 characters. Checked against known breached passwords.
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="confirm-password" className={labelClass}>
                            Confirm password
                          </Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            autoComplete="new-password"
                            className={inputClass}
                            minLength={8}
                            required
                          />
                        </div>

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
                              Updating...
                            </>
                          ) : (
                            <>
                              Update password
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResetPassword;