import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Check, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const contactSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(60, { message: "First name must be under 60 characters" }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: "Last name is required" })
    .max(60, { message: "Last name must be under 60 characters" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Enter a valid email address" })
    .max(255, { message: "Email is too long" }),
  company: z
    .string()
    .trim()
    .max(120, { message: "Company name is too long" })
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, { message: "Tell us a bit more (min 10 characters)" })
    .max(1000, { message: "Message must be under 1000 characters" }),
});

export type ContactValues = z.infer<typeof contactSchema>;

type FormStatus = "idle" | "submitting" | "success" | "error";

export const SuccessState = ({ onReset }: { onReset: () => void }) => (
  <div className="text-center py-9">
    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center shadow-glow-blue">
      <Check className="w-5 h-5 text-primary" />
    </div>
    <h3 className="text-lg font-semibold mb-1.5 text-depth">Request received.</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Check your inbox — we'll be in touch within 24 hours.
    </p>
    <Button variant="glass" size="sm" onClick={onReset}>
      <RefreshCw className="w-3.5 h-3.5" />
      Send another
    </Button>
  </div>
);

export const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="text-center py-9">
    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 border border-destructive/40 flex items-center justify-center">
      <AlertCircle className="w-5 h-5 text-destructive" />
    </div>
    <h3 className="text-lg font-semibold mb-1.5 text-depth">Something went wrong.</h3>
    <p className="text-sm text-muted-foreground mb-4">
      We couldn't submit your request. Please try again — your details are still saved.
    </p>
    <Button variant="hero" size="sm" onClick={onRetry}>
      <RefreshCw className="w-3.5 h-3.5" />
      Try again
    </Button>
  </div>
);

type FieldProps = {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  register: ReturnType<ReturnType<typeof useForm<ContactValues>>["register"]>;
  error?: string;
  touched?: boolean;
};

export const Field = ({ label, id, type = "text", placeholder, autoComplete, required, register, error, touched }: FieldProps) => {
  const hasError = !!error;
  return (
    <div>
      <Label htmlFor={id} className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}{required && <span className="text-primary ml-0.5">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={cn(
          "mt-1.5 text-base md:text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 h-11 md:h-9 transition-all",
          hasError && "ring-2 ring-destructive/40 focus-visible:ring-destructive/40",
          !hasError && touched && "ring-1 ring-primary/30"
        )}
        {...register}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
};

export const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p id={id} className="mt-1 text-[11px] text-destructive flex items-center gap-1.5 font-mono">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </p>
  ) : null;

export const ContactFormPanel = ({ idPrefix = "" }: { idPrefix?: string }) => {
  const [status, setStatus] = useState<FormStatus>("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, touchedFields },
    watch,
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
  });

  const messageLength = (watch("message") ?? "").length;

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

  const p = idPrefix;

  if (status === "success") {
    return <SuccessState onReset={() => { reset(); setStatus("idle"); }} />;
  }

  if (status === "error") {
    return <ErrorState onRetry={() => setStatus("idle")} />;
  }

  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-4">
        Send a message
      </p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 flex-1 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
          <Field label="First name" id={`${p}firstName`} placeholder="Jane" autoComplete="given-name" required
            register={register("firstName")} error={errors.firstName?.message} touched={!!touchedFields.firstName} />
          <Field label="Last name" id={`${p}lastName`} placeholder="Doe" autoComplete="family-name"
            register={register("lastName")} error={errors.lastName?.message} touched={!!touchedFields.lastName} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
          <Field label="Company" id={`${p}company`} placeholder="Acme Inc" autoComplete="organization"
            register={register("company")} error={errors.company?.message} touched={!!touchedFields.company} />
          <Field label="Email" id={`${p}email`} type="email" placeholder="jane@company.com" autoComplete="email" required
            register={register("email")} error={errors.email?.message} touched={!!touchedFields.email} />
        </div>
        <div>
          <Label htmlFor={`${p}message`} className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            What do you want to automate?<span className="text-primary ml-0.5">*</span>
          </Label>
          <Textarea
            id={`${p}message`}
            placeholder="Tell us about your workflows, biggest time sinks, or specific goals..."
            rows={4}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? `${p}message-error` : undefined}
            className={cn(
              "mt-1.5 text-base md:text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 resize-none transition-all",
              errors.message && "ring-2 ring-destructive/40 focus-visible:ring-destructive/40"
            )}
            {...register("message")}
          />
          <div className="flex items-center justify-between mt-1">
            <FieldError id={`${p}message-error`} message={errors.message?.message} />
            {messageLength > 0 && (
              <p className={cn(
                "text-[11px] font-mono tabular-nums ml-auto",
                messageLength > 900 ? "text-destructive/70" : "text-muted-foreground/50"
              )}>
                {messageLength}/1000
              </p>
            )}
          </div>
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
