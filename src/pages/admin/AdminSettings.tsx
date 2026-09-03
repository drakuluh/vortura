import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface Settings {
  id: string;
  workspace_name: string;
  support_email: string | null;
  slack_webhook: string | null;
  slack_channel_default: string | null;
  slack_channel_clients: string | null;
  slack_channel_messages: string | null;
  slack_channel_change_requests: string | null;
  slack_channel_invoices: string | null;
  slack_channel_payments: string | null;
}

export default function AdminSettings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data } = await supabase.from("workspace_settings").select("*").maybeSingle();
      return data as Settings | null;
    },
  });

  const [form, setForm] = useState<Partial<Settings>>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error("No settings row");
      const { error } = await supabase.from("workspace_settings").update({
        workspace_name: form.workspace_name ?? data.workspace_name,
        support_email: form.support_email ?? null,
        slack_webhook: form.slack_webhook ?? null,
        slack_channel_default: form.slack_channel_default ?? null,
        slack_channel_clients: form.slack_channel_clients ?? null,
        slack_channel_messages: form.slack_channel_messages ?? null,
        slack_channel_change_requests: form.slack_channel_change_requests ?? null,
        slack_channel_invoices: form.slack_channel_invoices ?? null,
        slack_channel_payments: form.slack_channel_payments ?? null,
      }).eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Settings saved."); qc.invalidateQueries({ queryKey: ["admin", "settings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <AdminPage eyebrow="Settings" title="Workspace Settings"><p className="text-sm text-muted-foreground">Loading…</p></AdminPage>;

  return (
    <AdminPage eyebrow="Settings" title="Workspace Settings" description="Branding, notifications, and integrations.">
      <div className="space-y-5 max-w-3xl">
        <Section title="Workspace" desc="How your workspace appears.">
          <Field label="Workspace name" value={form.workspace_name ?? ""} onChange={(v) => setForm((f) => ({ ...f, workspace_name: v }))} />
          <Field label="Support email" value={form.support_email ?? ""} onChange={(v) => setForm((f) => ({ ...f, support_email: v }))} />
        </Section>
        <Section title="Notifications" desc="Where new events get sent.">
          <Field label="Slack webhook" placeholder="https://hooks.slack.com/…" value={form.slack_webhook ?? ""} onChange={(v) => setForm((f) => ({ ...f, slack_webhook: v }))} />
        </Section>
        <Section title="Slack Channel Routing" desc="Send each event type to a specific channel. Leave blank to use the default. Channel overrides only work with the Slack connector or a webhook that allows channel selection.">
          <Field label="Default channel" placeholder="#notifications" value={form.slack_channel_default ?? ""} onChange={(v) => setForm((f) => ({ ...f, slack_channel_default: v }))} />
          <Field label="New Clients" placeholder="#sales" value={form.slack_channel_clients ?? ""} onChange={(v) => setForm((f) => ({ ...f, slack_channel_clients: v }))} />
          <Field label="Client Messages & Threads" placeholder="#client-chat" value={form.slack_channel_messages ?? ""} onChange={(v) => setForm((f) => ({ ...f, slack_channel_messages: v }))} />
          <Field label="Change Requests" placeholder="#engineering" value={form.slack_channel_change_requests ?? ""} onChange={(v) => setForm((f) => ({ ...f, slack_channel_change_requests: v }))} />
          <Field label="Invoices (Paid & Overdue)" placeholder="#billing" value={form.slack_channel_invoices ?? ""} onChange={(v) => setForm((f) => ({ ...f, slack_channel_invoices: v }))} />
          <Field label="Payments & Subscriptions" placeholder="#revenue" value={form.slack_channel_payments ?? ""} onChange={(v) => setForm((f) => ({ ...f, slack_channel_payments: v }))} />
        </Section>
        <Button variant="hero" onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save settings"}</Button>
      </div>
    </AdminPage>
  );
}

const Section = ({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) => (
  <section className="glass rounded-2xl p-5">
    <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-1">// {title}</p>
    <p className="text-xs text-muted-foreground mb-4">{desc}</p>
    <div className="space-y-3">{children}</div>
  </section>
);

const Field = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div>
    <Label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{label}</Label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1.5" />
  </div>
);

