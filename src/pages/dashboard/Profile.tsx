import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { DashboardSubPage } from "@/components/dashboard/DashboardSubPage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  account_type: z.enum(["individual", "business"]),
  first_name: z.string().trim().max(60, "Max 60 characters").optional().or(z.literal("")),
  last_name: z.string().trim().max(60, "Max 60 characters").optional().or(z.literal("")),
  business_name: z.string().trim().max(120, "Max 120 characters").optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(20, "Max 20 characters")
    .refine(
      (v) => v === "" || /^\d{10}$/.test(v.replace(/\D/g, "")),
      "Enter a 10-digit phone number",
    )
    .optional()
    .or(z.literal("")),
}).refine(
  (v) => v.account_type !== "business" || (v.business_name && v.business_name.trim().length > 0),
  { path: ["business_name"], message: "Business name is required" },
);
type Values = z.infer<typeof schema>;

// Format raw digits as (xxx)-xxx-xxxx progressively
const formatPhone = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)})-${d.slice(3)}`;
  return `(${d.slice(0, 3)})-${d.slice(3, 6)}-${d.slice(6)}`;
};

const Profile = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, business_name, phone, display_name, account_type")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const {
    register, handleSubmit, reset, control,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { account_type: "individual", first_name: "", last_name: "", business_name: "", phone: "" },
  });
  const accountType = watch("account_type");

  // Pre-fill: profile values, then fall back to splitting Google's full_name
  useEffect(() => {
    if (!user) return;
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const fullName =
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      (profile?.display_name ?? "");
    const [metaFirst, ...metaRest] = (fullName ?? "").trim().split(/\s+/);

    reset({
      account_type: (profile?.account_type as "individual" | "business") ?? "individual",
      first_name: profile?.first_name ?? metaFirst ?? "",
      last_name: profile?.last_name ?? metaRest.join(" ") ?? "",
      business_name: profile?.business_name ?? "",
      phone: formatPhone(profile?.phone ?? ""),
    });
  }, [profile, user, reset]);

  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      if (!user) throw new Error("Not signed in");
      const first = values.first_name?.trim() || null;
      const last = values.last_name?.trim() || null;
      const isBiz = values.account_type === "business";
      const biz = isBiz ? (values.business_name?.trim() || null) : null;
      const display =
        (isBiz && biz) ||
        ([first, last].filter(Boolean).join(" ").trim() || user.email || null);

      const { error } = await supabase
        .from("profiles")
        .update({
          account_type: values.account_type,
          first_name: first,
          last_name: last,
          business_name: biz,
          phone: values.phone?.trim() || null,
          display_name: display,
        })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated.");
      qc.invalidateQueries({ queryKey: ["my-profile", user?.id] });
      navigate("/dashboard");
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Could not save profile";
      toast.error(message);
    },
  });

  const onSubmit = (values: Values) => mutation.mutate(values);

  return (
    <DashboardSubPage
      eyebrow="Account"
      title={<>Edit <span className="text-gradient">Profile</span></>}
      description="Update how we address you and how to reach your business."
      centered
    >
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div
            className="absolute -inset-px rounded-3xl bg-gradient-primary blur-md pointer-events-none"
            style={{ opacity: 0.3 }}
          />
          <div className="group relative glass-strong rounded-3xl p-5 md:p-6 lg:p-8 border-2 border-white/15 overflow-hidden transition-colors duration-500">
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--secondary)/0.14),transparent_70%)]" />
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="relative space-y-5"
            >
            <div>
              <Label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                Account type
              </Label>
              <Controller
                name="account_type"
                control={control}
                render={({ field }) => (
              <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2"
                  >
                    <label
                      htmlFor="pf-individual"
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-colors",
                        field.value === "individual"
                          ? "glass !bg-white/[0.10] border-0 shadow-elev-2 text-foreground"
                          : "border border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/[0.05]",
                      )}
                    >
                      <RadioGroupItem value="individual" id="pf-individual" />
                      <span className="text-[12px] font-medium leading-tight">Individual</span>
                    </label>
                    <label
                      htmlFor="pf-business"
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-colors",
                        field.value === "business"
                          ? "glass !bg-white/[0.10] border-0 shadow-elev-2 text-foreground"
                          : "border border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/[0.05]",
                      )}
                    >
                      <RadioGroupItem value="business" id="pf-business" />
                      <span className="text-[12px] font-medium leading-tight">I own a business</span>
                    </label>
                  </RadioGroup>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name" className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  First name
                </Label>
                <Input
                  id="first_name"
                  {...register("first_name")}
                  disabled={isLoading}
                  className="mt-1.5 text-base md:text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 h-11 md:h-9 transition-all"
                />
                {errors.first_name && (
                  <p className="mt-1 text-[11px] text-destructive flex items-center gap-1.5 font-mono">
                    <AlertCircle className="w-3 h-3" />
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name" className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  Last name
                </Label>
                <Input
                  id="last_name"
                  {...register("last_name")}
                  disabled={isLoading}
                  className="mt-1.5 text-base md:text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 h-11 md:h-9 transition-all"
                />
                {errors.last_name && (
                  <p className="mt-1 text-[11px] text-destructive flex items-center gap-1.5 font-mono">
                    <AlertCircle className="w-3 h-3" />
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {accountType === "business" && (
              <div>
                <Label htmlFor="business_name" className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  Business name
                </Label>
                <Input
                  id="business_name"
                  placeholder="Acme, Inc."
                  {...register("business_name")}
                  disabled={isLoading}
                  className="mt-1.5 text-base md:text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 h-11 md:h-9 transition-all"
                />
                {errors.business_name && (
                  <p className="mt-1 text-[11px] text-destructive flex items-center gap-1.5 font-mono">
                    <AlertCircle className="w-3 h-3" />
                    {errors.business_name.message}
                  </p>
                )}
                <p className="mt-1.5 text-[11px] text-muted-foreground/70 font-mono">
                  Used on invoices and in admin notifications.
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="phone" className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                Phone
              </Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="(xxx)-xxx-xxxx"
                    maxLength={14}
                    disabled={isLoading}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(formatPhone(e.target.value))}
                    onBlur={field.onBlur}
                    className="mt-1.5 text-base md:text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 h-11 md:h-9 transition-all"
                  />
                )}
              />
              {errors.phone && (
                <p className="mt-1 text-[11px] text-destructive flex items-center gap-1.5 font-mono">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="pt-5">
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !isDirty || isLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Save changes
                </>
              )}
            </Button>
            </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardSubPage>
  );
};

export default Profile;
