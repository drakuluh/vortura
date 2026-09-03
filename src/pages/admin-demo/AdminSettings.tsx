import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";

export default function AdminSettings() {
  return (
    <AdminPage
      eyebrow="Settings"
      title="Workspace Settings"
      description="Branding, notifications, and integrations for your admin workspace."
    >
      <div className="space-y-5 max-w-3xl">
        <Section title="Workspace" desc="How your workspace appears to clients and team.">
          <Field label="Workspace name" defaultValue="Your Company" />
          <Field label="Support email" defaultValue="support@yourcompany.com" />
        </Section>

        <Section title="Notifications" desc="Where new events get sent.">
          <Field label="Slack webhook" placeholder="https://hooks.slack.com/…" />
          <Toggle label="Email me when an invoice becomes overdue" defaultChecked />
          <Toggle label="Email me when a new change request is submitted" defaultChecked />
          <Toggle label="Daily digest" />
        </Section>

        <Section title="Danger Zone" desc="Irreversible actions." danger>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Delete workspace</p>
              <p className="text-xs text-muted-foreground">
                Removes all clients, packages, invoices, and team members.
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Delete
            </Button>
          </div>
        </Section>
      </div>
    </AdminPage>
  );
}

const Section = ({
  title,
  desc,
  children,
  danger,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  danger?: boolean;
}) => (
  <section
    className={`glass rounded-2xl p-5 ${danger ? "border-red-500/20" : ""}`}
  >
    <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-1">
      // {title}
    </p>
    <p className="text-xs text-muted-foreground mb-4">{desc}</p>
    <div className="space-y-3">{children}</div>
  </section>
);

const Field = ({
  label,
  defaultValue,
  placeholder,
}: {
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) => (
  <label className="block">
    <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
      {label}
    </span>
    <input
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="mt-1.5 w-full h-10 px-3 rounded-md bg-white/[0.03] border border-white/[0.06] text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
    />
  </label>
);

const Toggle = ({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked?: boolean;
}) => (
  <label className="flex items-center justify-between gap-3 cursor-pointer">
    <span className="text-sm">{label}</span>
    <input type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4 accent-primary" />
  </label>
);
