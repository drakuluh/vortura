import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { Seo } from "@/components/Seo";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z
  .string()
  .trim()
  .email({ message: "Enter a valid email address" })
  .max(255);

const ForgotPassword = () => {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

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
      const parsed = emailSchema.safeParse(email);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);

      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Check your inbox for the reset link.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-1.5 text-base md:text-sm bg-white/[0.02] border-white/10 focus-visible:border-primary/40 focus-visible:ring-primary/20 h-11 md:h-9 transition-colors";
  const labelClass = "text-[11px] font-mono uppercase tracking-widest text-muted-foreground";

  return (
    <PageLayout>
      <Seo title="Forgot Password" description="Reset your Vortura Agency account password." noindex />
      <div className="relative overflow-hidden">
        <PageHeroBg />
        <div className="relative z-10 pt-14 md:pt-10 lg:pt-12">
          <section className="relative py-10 md:py-14 lg:py-20">
            <div className="container relative z-10">
              <div className="max-w-md md:max-w-lg mx-auto">
                <motion.div className="text-center mb-5 md:mb-7 lg:mb-9" {...headerAnim}>
                  <h1 className="text-xl md:text-2xl lg:text-4xl font-bold tracking-tight text-depth mb-2.5">
                    Reset your <span className="text-gradient">password.</span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we'll send you a secure link to set a new password.
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
                    {sent ? (
                      <div className="text-center space-y-4 py-4">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                          <MailCheck className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold">Check your inbox</h2>
                        <p className="text-sm text-muted-foreground">
                          If an account exists for <span className="text-foreground">{email}</span>,
                          a reset link is on its way. The link expires in 1 hour.
                        </p>
                        <Button asChild variant="glass" size="lg" className="w-full">
                          <Link to="/login">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to sign in
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                              Sending link...
                            </>
                          ) : (
                            <>
                              Send reset link
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </Button>

                        <Link
                          to="/login"
                          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          Back to sign in
                        </Link>
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

export default ForgotPassword;