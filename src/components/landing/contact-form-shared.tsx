import { useEffect, useState } from "react";
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
import { ApiError, callFunction } from "@/lib/public-api";
import { slotStart } from "@/lib/booking-time";
import { describeSelection, useBookingSelection } from "@/components/landing/booking-selection";

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

export const SuccessState = ({
  onReset,
  title = "Message received.",
  detail = "We'll reply to your email within 24 hours.",
  resetLabel = "Send another",
}: {
  onReset: () => void;
  title?: string;
  detail?: string;
  resetLabel?: string;
}) => (
  <div className="flex flex-1 flex-col items-center justify-center text-center py-9" role="status">
    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center shadow-glow-blue">
      <Check className="w-5 h-5 text-primary" />
    </div>
    <h3 className="text-lg font-semibold mb-1.5 text-depth">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{detail}</p>
    <Button variant="glass" size="sm" onClick={onReset}>
      <RefreshCw className="w-3.5 h-3.5" />
      {resetLabel}
    </Button>
  </div>
);

export const ErrorState = ({ onRetry, detail }: { onRetry: () => void; detail?: string }) => (
  <div className="flex flex-1 flex-col items-center justify-center text-center py-9" role="alert">
    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 border border-destructive/40 flex items-center justify-center">
      <AlertCircle className="w-5 h-5 text-destructive" />
    </div>
    <h3 className="text-lg font-semibold mb-1.5 text-depth">Something went wrong.</h3>
    <p className="text-sm text-muted-foreground mb-4">
      {detail ?? "We couldn't send your message. Please try again. Your details are still saved."}
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
  const [errorDetail, setErrorDetail] = useState<string>();
  // Honeypot value: hidden from people, filled in by bots.
  const [website, setWebsite] = useState("");
  // The time picked in the booking calendar beside this form. With a
  // calendar present, this form's button books the call.
  const booking = useBookingSelection();
  const [timeError, setTimeError] = useState<string>();
  const [bookedFor, setBookedFor] = useState<{ when: string; email: string }>();
  const pickedTime = booking?.selection;
  // A newly picked time answers the "pick a time" prompt.
  useEffect(() => {
    if (pickedTime) setTimeError(undefined);
  }, [pickedTime]);
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
    const name = `${values.firstName} ${values.lastName}`.trim();
    setErrorDetail(undefined);
    setTimeError(undefined);

    // Booking: details from this form, time from the calendar.
    if (booking) {
      const picked = booking.selection;
      if (!picked) {
        setTimeError("Pick a date and time for your call.");
        return;
      }
      setStatus("submitting");
      try {
        await callFunction("book-call", {
          scheduled_at: slotStart(picked.day, picked.slot).toISOString(),
          name,
          email: values.email,
          company: values.company ?? "",
          message: values.message,
          website,
        });
        setBookedFor({ when: describeSelection(picked), email: values.email });
        booking.select(null);
        booking.refreshAvailability();
        setStatus("success");
        toast.success("Call booked. We'll confirm the time by email.");
      } catch (err) {
        if (err instanceof ApiError && err.code === "slot_taken") {
          // Keep everything they typed; just ask for another time.
          setStatus("idle");
          booking.select(null);
          booking.refreshAvailability();
          setTimeError("That time was just booked by someone else. Pick another time.");
          return;
        }
        if (err instanceof ApiError && err.fields?.scheduled_at) {
          setStatus("idle");
          booking.select(null);
          setTimeError(err.fields.scheduled_at);
          return;
        }
        if (err instanceof ApiError && err.code === "rate_limited") {
          setErrorDetail("Too many bookings from this connection today. Email support@vortura.ai and we'll set it up.");
        }
        setStatus("error");
        toast.error("Your booking didn't go through. Please try again.");
      }
      return;
    }

    // No calendar beside the form: send it as a message.
    setStatus("submitting");
    try {
      await callFunction("submit-contact", {
        name,
        email: values.email,
        company: values.company ?? "",
        message: values.message,
        website,
        page: window.location.pathname,
      });
      setStatus("success");
      toast.success("Message received. We'll reply within 24 hours.");
    } catch (err) {
      if (err instanceof ApiError && err.code === "rate_limited") {
        setErrorDetail("You've sent several messages in the last hour. Try again later, or email support@vortura.ai.");
      }
      setStatus("error");
      toast.error("Your message didn't send. Please try again.");
    }
  };

  const p = idPrefix;


  if (status === "success") {
    const onReset = () => { reset(); setBookedFor(undefined); setStatus("idle"); };
    return bookedFor ? (
      <SuccessState
        onReset={onReset}
        title="You're booked."
        detail={`${bookedFor.when}. We'll confirm the time by email at ${bookedFor.email}.`}
        resetLabel="Book another call"
      />
    ) : (
      <SuccessState onReset={onReset} />
    );
  }

  if (status === "error") {
    return (
      <ErrorState
        detail={errorDetail ?? (booking ? "We couldn't book your call. Please try again. Your details are still saved." : undefined)}
        onRetry={() => setStatus("idle")}
      />
    );
  }

  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-4">
        Send a message
      </p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-4 flex-1 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
          <Field label="First name" id={`${p}firstName`} placeholder="Maria" autoComplete="given-name" required
            register={register("firstName")} error={errors.firstName?.message} touched={!!touchedFields.firstName} />
          <Field label="Last name" id={`${p}lastName`} placeholder="Santos" autoComplete="family-name"
            register={register("lastName")} error={errors.lastName?.message} touched={!!touchedFields.lastName} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
          <Field label="Company" id={`${p}company`} placeholder="Santos Plumbing" autoComplete="organization"
            register={register("company")} error={errors.company?.message} touched={!!touchedFields.company} />
          <Field label="Email" id={`${p}email`} type="email" placeholder="maria@santosplumbing.com" autoComplete="email" required
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
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />{booking ? "Booking…" : "Sending…"}</>
            ) : (
              <>{booking ? "Confirm Booking" : "Send message"}<ArrowRight className="w-3.5 h-3.5" /></>
            )}
          </Button>
          {timeError && <FieldError id={`${p}booking-time-error`} message={timeError} />}
        </div>
        {/* Honeypot, last so it doesn't shift the spacing of real fields. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />
      </form>
    </>
  );
};
