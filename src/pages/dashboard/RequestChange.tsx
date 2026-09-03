import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Loader2, AlertCircle, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DashboardSubPage } from "@/components/dashboard/DashboardSubPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { supabase } from "@/integrations/supabase/client";
import { formatRelative } from "@/lib/admin/format";
import { changeStatusLabel, changeStatusTone, priorityTone } from "@/lib/changeRequests";

const schema = z.object({
  pkg: z.string({ required_error: "Select a package" }).min(1, { message: "Select a package" }),
  priority: z.enum(["low", "med", "high"]),
  title: z.string().trim().min(4, { message: "Add a short title" }).max(120),
  details: z.string().trim().min(15, { message: "Tell us a bit more (min 15 characters)" }).max(2000),
});
type Values = z.infer<typeof schema>;

const RequestChange = () => {
  const { data: client } = useCurrentClient();
  const qc = useQueryClient();

  const { data: packages } = useQuery({
    queryKey: ["client-packages-options", client?.id],
    enabled: !!client?.id,
    queryFn: async () => (await supabase.from("packages").select("id, name, nickname").eq("client_id", client!.id)).data ?? [],
  });

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["client-change-requests", client?.id],
    enabled: !!client?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("change_requests")
        .select("id, title, status, priority, submitted_at, updated_at")
        .eq("client_id", client!.id)
        .is("client_approved_at", null)
        .order("submitted_at", { ascending: false });
      return data ?? [];
    },
  });

  const {
    register, handleSubmit, setValue, watch,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onSubmit", reValidateMode: "onSubmit", defaultValues: { priority: "med" } });

  const priority = watch("priority");
  const pkg = watch("pkg");

  const submit = useMutation({
    mutationFn: async (values: Values) => {
      if (!client?.id) throw new Error("No client account linked. Contact your strategist.");
      const { data, error } = await supabase.from("change_requests").insert({
        client_id: client.id,
        package_id: values.pkg || null,
        title: values.title,
        description: values.details,
        priority: values.priority,
      }).select("id").single();
      if (error) throw error;
      if (data?.id) {
        supabase.functions.invoke("notify-event", {
          body: { kind: "new_change_request", entity_id: data.id },
        }).catch(() => {});
      }
    },
    onSuccess: () => {
      toast.success("Change request submitted. Your strategist will respond shortly.");
      qc.invalidateQueries({ queryKey: ["client-change-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardSubPage
      eyebrow="Change requests"
      title={<>Your <span className="text-gradient">Change Requests</span></>}
      description="Submit a new request on the left and track every request you've made on the right."
      centered
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 lg:items-stretch">
        {/* Form */}
        <div className="relative">
          <div
            className="absolute -inset-px rounded-3xl bg-gradient-primary blur-md pointer-events-none"
            style={{ opacity: 0.3 }}
          />
          <div className="group relative glass-strong rounded-3xl p-5 md:p-6 lg:p-8 border-2 border-white/15 overflow-hidden transition-colors duration-500">
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--secondary)/0.14),transparent_70%)]" />
            <form onSubmit={handleSubmit((v) => submit.mutate(v))} noValidate className="relative space-y-4">
              <h3 className="text-base font-semibold tracking-tight text-center">New Request</h3>
            {(packages?.length ?? 0) > 0 && (
              <div>
                <Label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  Which package?{errors.pkg && <span className="text-destructive ml-1">*</span>}
                </Label>
                <RadioGroup
                  value={pkg ?? ""}
                  onValueChange={(v) => setValue("pkg", v, { shouldValidate: true })}
                  className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {packages!.map((p) => {
                    const active = pkg === p.id;
                    const id = `pkg-${p.id}`;
                    return (
                      <label
                        key={p.id}
                        htmlFor={id}
                        className={cn(
                          "flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-colors",
                          active
                            ? "glass !bg-white/[0.10] border-0 shadow-elev-2 text-foreground"
                            : "border border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/[0.05]",
                        )}
                      >
                        <RadioGroupItem value={p.id} id={id} />
                        <span className="text-[12px] font-medium leading-tight">
                          {(p as { nickname?: string | null }).nickname?.trim() || p.name}
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>
                <input type="hidden" {...register("pkg")} />
                {errors.pkg && <p className="mt-1.5 text-[11px] text-destructive flex items-center gap-1.5 font-mono"><AlertCircle className="w-3 h-3" />{errors.pkg.message}</p>}
              </div>
            )}

            <div>
              <Label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Priority</Label>
              <div className="mt-2 flex w-full rounded-xl border border-white/10 bg-white/[0.02] p-1">
                {(["low", "med", "high"] as const).map((p) => {
                  const active = priority === p;
                  const activeClass = p === "low" ? "bg-emerald-500/15 text-emerald-300" : p === "med" ? "bg-amber-500/15 text-amber-300" : "bg-red-500/15 text-red-300";
                  return (
                    <button type="button" key={p} onClick={() => setValue("priority", p, { shouldValidate: true })}
                      className={cn("flex-1 px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-widest transition-colors", active ? activeClass : "text-muted-foreground hover:text-foreground")}>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="title" className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                Short title{errors.title && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Input id="title" placeholder="e.g. Route enterprise leads to Sarah" className="mt-1.5 text-base md:text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 h-11 md:h-9 transition-all" {...register("title")} />
              {errors.title && <p className="mt-1 text-[11px] text-destructive flex items-center gap-1.5 font-mono"><AlertCircle className="w-3 h-3" />{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="details" className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                What needs to change?{errors.details && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Textarea id="details" rows={5} placeholder="Describe the current behavior, the desired behavior, and any context we should know."
                className="mt-1.5 text-base md:text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 resize-none transition-all" {...register("details")} />
              {errors.details && <p className="mt-1 text-[11px] text-destructive flex items-center gap-1.5 font-mono"><AlertCircle className="w-3 h-3" />{errors.details.message}</p>}
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submit.isPending}>
              {submit.isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Submitting...</> : <>Submit request<ArrowRight className="w-3.5 h-3.5" /></>}
            </Button>
            </form>
          </div>
        </div>

        {/* Existing requests */}
        <div className="relative h-full">
          <div className="absolute -inset-px rounded-3xl bg-white/5 opacity-30 blur-md pointer-events-none" />
          <div className="relative rounded-3xl p-5 md:p-6 lg:p-7 border-2 border-white/10 bg-muted/20 backdrop-blur-sm h-full flex flex-col min-h-[420px]">
            <h3 className="text-base font-semibold tracking-tight text-center mb-4">Your Open Requests</h3>
            {requestsLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading…</p>
              </div>
            ) : (requests ?? []).length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4">
                  <Wand2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold tracking-tight mb-1.5">No change requests yet</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Submit one on the left and your engineer will scope it within one business day.
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {(requests ?? []).map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/dashboard/request-change/${r.id}`}
                      className="group relative glass rounded-2xl p-4 flex items-center gap-4 overflow-hidden hover:border-primary/40 transition-colors duration-500"
                    >
                      {/* Hover radial wash */}
                      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.14),transparent_70%)]" />
                      <div className="relative flex-1 min-w-0">
                        <p className="text-sm font-medium truncate mb-1.5">{r.title}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge tone={changeStatusTone(r.status)}>{changeStatusLabel(r.status)}</StatusBadge>
                          <StatusBadge tone={priorityTone(r.priority)}>{r.priority}</StatusBadge>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            Submitted {formatRelative(r.submitted_at)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardSubPage>
  );
};

export default RequestChange;
