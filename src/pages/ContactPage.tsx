import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight, Check, AlertCircle, Loader2, RefreshCw,
  Phone, Mail,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SparklesText } from "@/components/ui/sparkles-text";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { BookingPanel } from "@/components/landing/BookingCalendar";
import { Seo } from "@/components/Seo";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

/* ── Contact form schema ─────────────────────────────────────── */

const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email").max(255),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a bit more (min 10 characters)").max(1000),
});

type ContactValues = z.infer<typeof contactSchema>;
type FormStatus = "idle" | "submitting" | "success" | "error";

/* ── Page ────────────────────────────────────────────────────── */

const ContactPage = () => {
  const isMobile = useIsMobile();
  const headerAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
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

  return (
    <PageLayout>
      <Seo
        title="Contact"
        description="Tell us about your business and we'll respond within 24 hours with a custom automation plan. Let's build your edge."
      />
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <PageHeroBg />
        </div>
        <div className="relative z-10 pt-14 md:pt-10 lg:pt-12">
          <section id="contact" className="relative py-10 md:py-14 lg:py-20">
            <div className="container relative z-10">
              <div className="max-w-md md:max-w-xl lg:max-w-5xl mx-auto">
                <motion.div className="text-center mb-5 md:mb-7 lg:mb-9" {...headerAnim}>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5">
                    Let's build your <SparklesText text="edge." className="text-gradient py-1" />
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tell us about your business or book a call directly.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a href="tel:+11234561234" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 hover:bg-primary/15 transition-colors">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-medium text-primary">(123) 456-1234</span>
                    </a>
                    <a href="mailto:support@vortura.ai" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 hover:bg-primary/15 transition-colors">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-medium text-primary">support@vortura.ai</span>
                    </a>
                  </div>
                </motion.div>

                <motion.div className="relative" {...cardAnim}>
                  <div
                    className="absolute -inset-px rounded-3xl bg-gradient-primary blur-md pointer-events-none"
                    style={{ opacity: 0.3 }}
                  />
                  <div className="group relative glass-strong rounded-3xl p-5 md:p-6 lg:p-8 border-2 border-white/15 overflow-hidden transition-colors duration-500">
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--secondary)/0.14),transparent_70%)]" />
                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-0 lg:items-stretch">
                      {/* Left — Contact form */}
                      <div className="lg:pr-8 lg:border-r lg:border-white/[0.06] flex flex-col">
                        <ContactFormPanel />
                      </div>
                      {/* Right — Booking calendar */}
                      <div className="lg:pl-8 border-t border-white/[0.06] pt-6 lg:border-t-0 lg:pt-0 flex flex-col">
                        <BookingPanel />
                      </div>
                    </div>
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

export default ContactPage;

/* ── Left column: Contact form ───────────────────────────────── */

const ContactFormPanel = () => {
  const [status, setStatus] = useState<FormStatus>("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, touchedFields },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
  });

  const onSubmit = async (values: ContactValues) => {
    setStatus("submitting");
    try {
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (values.email.endsWith("@example.com")) reject(new Error("Email rejected"));
          else resolve();
        }, 900);
      });
      setStatus("success");
      toast.success("Request received. We'll be in touch within 24 hours.");
    } catch {
      setStatus("error");
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-9">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center shadow-glow-blue">
          <Check className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-1.5 text-depth">Request received.</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Check your inbox — we'll be in touch within 24 hours.
        </p>
        <Button variant="glass" size="sm" onClick={() => { reset(); setStatus("idle"); }}>
          <RefreshCw className="w-3.5 h-3.5" />
          Send another
        </Button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center py-9">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 border border-destructive/40 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1.5 text-depth">Something went wrong.</h3>
        <p className="text-sm text-muted-foreground mb-4">
          We couldn't submit your request. Please try again.
        </p>
        <Button variant="hero" size="sm" onClick={() => setStatus("idle")}>
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-4">
        // Send a message
      </p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 flex-1 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
          <Field label="First name" id="firstName" placeholder="Jane" autoComplete="given-name" required
            register={register("firstName")} error={errors.firstName?.message} touched={!!touchedFields.firstName} />
          <Field label="Last name" id="lastName" placeholder="Doe" autoComplete="family-name"
            register={register("lastName")} error={errors.lastName?.message} touched={!!touchedFields.lastName} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
          <Field label="Company" id="company" placeholder="Acme Inc" autoComplete="organization"
            register={register("company")} error={errors.company?.message} touched={!!touchedFields.company} />
          <Field label="Email" id="email" type="email" placeholder="jane@company.com" autoComplete="email" required
            register={register("email")} error={errors.email?.message} touched={!!touchedFields.email} />
        </div>
        <div>
          <Label htmlFor="message" className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            What do you want to automate?<span className="text-primary ml-0.5">*</span>
          </Label>
          <Textarea
            id="message" placeholder="Tell us about your workflows, biggest time sinks, or specific goals..."
            rows={4}
            aria-invalid={!!errors.message}
            className={cn(
              "mt-1.5 text-base md:text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 resize-none transition-all",
              errors.message && "ring-2 ring-destructive/40 focus-visible:ring-destructive/40"
            )}
            {...register("message")}
          />
          <FieldError id="message-error" message={errors.message?.message} />
        </div>
        <div className="pt-3 mt-auto">
          <Button type="submit" variant="hero" size="lg" className="w-full"
            disabled={status === "submitting" || (!isValid && Object.keys(touchedFields).length > 0)}>
            {status === "submitting" ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Booking...</>
            ) : (
              <>Book Call<ArrowRight className="w-3.5 h-3.5" /></>
            )}
          </Button>
        </div>
      </form>
    </>
  );
};

/* ── Shared field components ─────────────────────────────────── */

type FieldProps = {
  label: string; id: string; type?: string; placeholder: string; autoComplete?: string;
  register: ReturnType<ReturnType<typeof useForm<ContactValues>>["register"]>;
  error?: string; touched?: boolean; required?: boolean;
};

const Field = ({ label, id, type = "text", placeholder, autoComplete, register, error, touched, required }: FieldProps) => (
  <div>
    <Label htmlFor={id} className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{label}{required && <span className="text-primary ml-0.5">*</span>}</Label>
    <Input id={id} type={type} placeholder={placeholder} autoComplete={autoComplete}
      aria-invalid={!!error}
      className={cn(
        "mt-1.5 text-base md:text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 h-11 md:h-9 transition-all",
        error && "ring-2 ring-destructive/40 focus-visible:ring-destructive/40",
        !error && touched && "ring-1 ring-primary/30"
      )}
      {...register} />
    <FieldError id={`${id}-error`} message={error} />
  </div>
);

const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p id={id} className="mt-1 text-[11px] text-destructive flex items-center gap-1.5 font-mono">
      <AlertCircle className="w-3 h-3 shrink-0" />{message}
    </p>
  ) : null;
