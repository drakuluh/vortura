import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, Download, Send, Ban, ExternalLink, AlertTriangle, Search, FileText, Mail } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminPage } from "@/components/admin/AdminPage";
import { supabase } from "@/integrations/supabase/client";
import { formatCents, formatDate } from "@/lib/admin/format";
import { logActivity } from "@/lib/admin/activity";
import { cn } from "@/lib/utils";

type InvStatus = "paid" | "due" | "overdue" | "draft" | "sent" | "void" | "refunded" | "partially_refunded";

interface InvoiceRow {
  id: string;
  client_id: string;
  number: string;
  amount_cents: number;
  issued_at: string;
  due_at: string | null;
  status: InvStatus;
  stripe_invoice_id?: string | null;
  hosted_url?: string | null;
  pdf_url?: string | null;
  description?: string | null;
  line_items?: Array<{ description: string; quantity: number; unit_amount_cents: number }> | null;
  clients?: { name: string; email?: string | null } | null;
  package_id?: string | null;
  invoice_type?: string | null;
  stripe_subscription_id?: string | null;
  package?: { id: string; name: string; nickname: string | null; custom_id: string | null } | null;
}

const statusMeta: Record<InvStatus, { label: string; className: string; dot: string }> = {
  paid: { label: "Paid", className: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10", dot: "bg-emerald-400" },
  due: { label: "Due", className: "text-primary border-primary/30 bg-primary/10", dot: "bg-primary" },
  sent: { label: "Awaiting", className: "text-primary border-primary/30 bg-primary/10", dot: "bg-primary" },
  overdue: { label: "Overdue", className: "text-destructive border-destructive/40 bg-destructive/10", dot: "bg-destructive" },
  draft: { label: "Draft", className: "text-muted-foreground border-white/10 bg-white/[0.04]", dot: "bg-muted-foreground" },
  void: { label: "Void", className: "text-muted-foreground border-white/10 bg-white/[0.04]", dot: "bg-muted-foreground" },
  refunded: { label: "Refunded", className: "text-amber-300 border-amber-400/30 bg-amber-400/10", dot: "bg-amber-400" },
  partially_refunded: { label: "Partially Refunded", className: "text-amber-200/90 border-amber-400/20 bg-amber-400/[0.06]", dot: "bg-amber-300" },
};

const getRecurringCents = (inv: InvoiceRow): number => {
  const items = Array.isArray(inv?.line_items) ? inv.line_items : [];
  const r = items.find((li: any) =>
    typeof li?.description === "string" && /\(every 4 weeks\)$|\(monthly\)$/i.test(li.description)
  );
  if (r) return (r.quantity ?? 1) * (r.unit_amount_cents ?? 0);
  return inv?.stripe_subscription_id ? (inv.amount_cents ?? 0) : 0;
};
const getOneTimeCents = (inv: InvoiceRow): number => {
  if (inv?.invoice_type === "recurring") return 0;
  const items = Array.isArray(inv?.line_items) ? inv.line_items : [];
  const oneTime = items
    .filter((li: any) => !(typeof li?.description === "string" && /\(every 4 weeks\)$|\(monthly\)$/i.test(li.description)))
    .reduce((s: number, li: any) => s + (li.quantity ?? 1) * (li.unit_amount_cents ?? 0), 0);
  return oneTime || (inv.amount_cents ?? 0);
};
// True total = stored amount_cents (write path now sums one-time + first
// recurring period, so this is the source of truth).
const getTotalCents = (inv: InvoiceRow): number => inv.amount_cents ?? 0;
const getInvoiceTitle = (inv: InvoiceRow): string => {
  const pkg = inv?.package;
  if (pkg) return pkg.nickname || pkg.name || inv.number;
  return inv?.description || inv?.number;
};
const fmtOrDash = (cents: number) => (cents > 0 ? formatCents(cents) : "/");

const tone = (s: InvStatus) =>
  s === "paid"
    ? "success"
    : s === "overdue"
    ? "danger"
    : s === "due" || s === "sent"
    ? "warn"
    : "muted";

const NewInvoiceDialog = ({ onClose, editing }: { onClose: () => void; editing?: InvoiceRow | null }) => {
  const qc = useQueryClient();
  const { data: clients } = useQuery({
    queryKey: ["clients-options"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("id, name, email").order("name");
      return data ?? [];
    },
  });

  const [clientId, setClientId] = useState(editing?.client_id ?? "");
  const [packageId, setPackageId] = useState<string>((editing as any)?.package_id ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [dueAt, setDueAt] = useState(() => {
    if (editing?.due_at) return editing.due_at;
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });

  // Derive initial values from the draft being edited (if any).
  const items = editing?.line_items ?? [];
  const initialOneTime = items.find((it) => !/\(every 4 weeks\)$|\(monthly\)$/i.test(it.description));
  const initialRecurring = items.find((it) => /\(every 4 weeks\)$|\(monthly\)$/i.test(it.description));
  const [pkgPrice, setPkgPrice] = useState<number | "">(
    initialOneTime ? initialOneTime.unit_amount_cents / 100 : ""
  );
  const [mrrPrice, setMrrPrice] = useState<number | "">(
    initialRecurring ? initialRecurring.unit_amount_cents / 100 : ""
  );

  const oneTime = pkgPrice === "" ? 0 : Number(pkgPrice);
  const recurring = mrrPrice === "" ? 0 : Number(mrrPrice);
  const selectedClient = (clients ?? []).find((c) => c.id === clientId);
  const noEmail = !!selectedClient && !selectedClient.email;

  // Custom packages for the selected client.
  const { data: customPackages, isLoading: pkgsLoading } = useQuery({
    queryKey: ["admin", "custom-packages", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("id, name, custom_id, created_at")
        .eq("client_id", clientId)
        .eq("is_custom", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const selectedPackage = (customPackages ?? []).find((p) => p.id === packageId);
  const lineItemLabel = selectedPackage
    ? `${selectedPackage.custom_id ?? "CUS-?"} · ${selectedPackage.name}`
    : "";

  const create = useMutation({
    mutationFn: async (sendNow: boolean) => {
      if (!clientId) throw new Error("Pick a client");
      if (!packageId) throw new Error("Pick a custom package");
      if (oneTime <= 0 && recurring <= 0) {
        throw new Error("Enter a one-time price, a recurring amount, or both");
      }
      const cleaned: { description: string; quantity: number; unit_amount_cents: number }[] = [];
      if (oneTime > 0) {
        cleaned.push({ description: lineItemLabel, quantity: 1, unit_amount_cents: Math.round(oneTime * 100) });
      }
      if (recurring > 0) {
        cleaned.push({
          description: `${lineItemLabel} (every 4 weeks)`,
          quantity: 1,
          unit_amount_cents: Math.round(recurring * 100),
        });
      }

      const env = (import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined)?.startsWith("pk_test_")
        ? "sandbox"
        : "live";

      // If editing a draft, void/delete the old one first so we don't leave orphans.
      if (editing) {
        if (editing.stripe_invoice_id) {
          await supabase.functions.invoke("invoice-action", {
            body: { invoice_id: editing.id, action: "void" },
          });
        }
        await supabase.from("invoices").delete().eq("id", editing.id);
      }

      const { data, error } = await supabase.functions.invoke("create-stripe-invoice", {
        body: {
          client_id: clientId,
          package_id: packageId,
          line_items: cleaned,
          description: description.trim() || undefined,
          due_date: dueAt || undefined,
          send_now: sendNow,
          environment: env,
          recurring_amount_cents: recurring > 0 ? Math.round(recurring * 100) : undefined,
          one_time_amount_cents: oneTime > 0 ? Math.round(oneTime * 100) : undefined,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return { sendNow, hosted_url: data?.hosted_url as string | undefined };
    },
    onSuccess: (res) => {
      toast.success(
        res.sendNow
          ? "Invoice sent to customer."
          : editing
          ? "Draft invoice updated."
          : "Draft invoice created."
      );
      qc.invalidateQueries({ queryKey: ["admin", "invoices"] });
      qc.invalidateQueries({ queryKey: ["admin", "overview"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent hideClose className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-white/15 bg-card text-foreground">
      <DialogHeader>
        <DialogTitle>{editing ? `Edit Draft ${editing.number}` : "New Invoice"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Client</Label>
          <Select
            value={clientId}
            onValueChange={(v) => {
              setClientId(v);
              setPackageId("");
            }}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Pick a client" />
            </SelectTrigger>
            <SelectContent>
              {(clients ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} {c.email ? "" : "(no email)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {noEmail && (
            <p className="text-xs text-destructive mt-1.5">
              This client has no email — add one in Clients before invoicing.
            </p>
          )}
        </div>

        <div>
          <Label>Custom Package <span className="text-destructive">*</span></Label>
          <Select value={packageId} onValueChange={setPackageId} disabled={!clientId || pkgsLoading}>
            <SelectTrigger className="mt-1.5">
              <SelectValue
                placeholder={
                  !clientId
                    ? "Pick a client first"
                    : pkgsLoading
                    ? "Loading packages…"
                    : (customPackages ?? []).length === 0
                    ? "No custom packages — create one in Packages first"
                    : "Pick a custom package"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {(customPackages ?? []).map((p) => (
                <SelectItem
                  key={p.id}
                  value={p.id}
                  className="focus:bg-muted focus:text-foreground data-[state=checked]:bg-muted"
                >
                  <span className="font-mono text-[11px] mr-2 text-muted-foreground">{p.custom_id ?? "CUS-?"}</span>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {clientId && !pkgsLoading && (customPackages ?? []).length === 0 && (
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Go to <span className="font-medium text-foreground">Packages → New Package</span> and toggle "Custom package" on.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Price (one-time payment)</Label>
            <Input
              className="mt-1.5"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={pkgPrice}
              onChange={(e) => setPkgPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>Recurring amount (every 4 weeks)</Label>
            <Input
              className="mt-1.5"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={mrrPrice}
              onChange={(e) => setMrrPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground -mt-2">
          Enter a one-time price, a recurring amount, or both. At least one is required. Recurring amount is charged every 4 weeks (~13 cycles/year), starting today.
        </p>

        <div className="flex justify-end text-sm">
          <span className="text-muted-foreground mr-3">Today</span>
          <span className="font-semibold">${oneTime.toFixed(2)}</span>
          {recurring > 0 && (
            <span className="text-muted-foreground ml-4">
              then <span className="text-foreground font-semibold">${recurring.toFixed(2)}</span> every 4 weeks
            </span>
          )}
        </div>

        <div>
          <Label>Due Date</Label>
          <Input
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="mt-1.5 w-full"
          />
          <p className="text-[11px] text-muted-foreground mt-1.5">Applies to the one-time invoice only.</p>
        </div>

        <div>
          <Label>Memo (optional, shown on invoice)</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5"
            rows={2}
            placeholder="e.g. Custom integration work for May 2026"
          />
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="ghost" onClick={onClose} className="hover:bg-white/10 hover:text-white">Cancel</Button>
        <Button
          variant="glass"
          onClick={() => create.mutate(false)}
          disabled={create.isPending || noEmail}
        >
          {create.isPending ? "Saving…" : "Save Draft"}
        </Button>
        <Button
          variant="hero"
          onClick={() => create.mutate(true)}
          disabled={create.isPending || noEmail}
          className="hover:bg-blue-500 hover:bg-none before:hidden"
        >
          <Send className="w-3.5 h-3.5" />
          {create.isPending ? "Sending…" : "Create & Send"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default function AdminInvoices() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editingDraft, setEditingDraft] = useState<InvoiceRow | null>(null);
  const [previewInv, setPreviewInv] = useState<InvoiceRow | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "due" | "overdue" | "draft" | "void" | "refunded" | "partially_refunded">("all");
  const [timeframe, setTimeframe] = useState<"all" | "7d" | "30d" | "90d" | "365d">("all");
  const [confirmAction, setConfirmAction] = useState<
    | { kind: "send" | "void" | "delete"; invoice: InvoiceRow }
    | null
  >(null);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["admin", "invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, clients(name, email)")
        .order("issued_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      const list = (data ?? []) as unknown as InvoiceRow[];
      const pkgIds = Array.from(new Set(list.map((i) => i.package_id).filter(Boolean) as string[]));
      let pkgMap = new Map<string, { id: string; name: string; nickname: string | null; custom_id: string | null }>();
      if (pkgIds.length > 0) {
        const { data: pkgs } = await supabase
          .from("packages")
          .select("id, name, nickname, custom_id")
          .in("id", pkgIds);
        pkgMap = new Map((pkgs ?? []).map((p: any) => [p.id, p]));
      }
      return list.map((i) => ({ ...i, package: i.package_id ? pkgMap.get(i.package_id) ?? null : null }));
    },
  });

  // Deep link: /admin/invoices?id=<uuid> highlights & scrolls to the row.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id || !invoices?.some((i) => i.id === id)) return;
    setHighlightId(id);
    requestAnimationFrame(() => {
      document.getElementById(`invoice-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    const url = new URL(window.location.href);
    url.searchParams.delete("id");
    window.history.replaceState({}, "", url.toString());
    const t = setTimeout(() => setHighlightId(null), 4000);
    return () => clearTimeout(t);
  }, [invoices]);

  const inTimeframe = (iso: string | null | undefined): boolean => {
    if (timeframe === "all") return true;
    if (!iso) return false;
    const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : timeframe === "90d" ? 90 : 365;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return new Date(iso).getTime() >= cutoff;
  };

  const timeScopedInvoices = useMemo(
    () => (invoices ?? []).filter((i) => inTimeframe(i.issued_at)),
    [invoices, timeframe]
  );

  const stats = useMemo(() => {
    const list = timeScopedInvoices;
    return {
      paid: list.filter((i) => i.status === "paid").reduce((s, i) => s + getTotalCents(i), 0),
      due: list
        .filter((i) => i.status === "due" || i.status === "sent")
        .reduce((s, i) => s + getTotalCents(i), 0),
      overdue: list.filter((i) => i.status === "overdue").reduce((s, i) => s + getTotalCents(i), 0),
      refunded: list
        .filter((i) => i.status === "refunded" || i.status === "partially_refunded")
        .reduce((s, i) => s + getTotalCents(i), 0),
    };
  }, [timeScopedInvoices]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = timeScopedInvoices;
    if (statusFilter !== "all") {
      list = list.filter((i) =>
        statusFilter === "due"
          ? i.status === "due" || i.status === "sent"
          : i.status === statusFilter
      );
    }
    if (q) {
      list = list.filter((i) =>
        `${i.number} ${i.clients?.name ?? ""} ${i.status}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [timeScopedInvoices, search, statusFilter]);

  const markPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").update({ status: "paid" }).eq("id", id);
      if (error) throw error;
      await logActivity({ entity_type: "invoice", entity_id: id, action: "mark_paid", summary: "Invoice marked paid" });
    },
    onSuccess: () => { toast.success("Marked paid."); qc.invalidateQueries({ queryKey: ["admin", "invoices"] }); qc.invalidateQueries({ queryKey: ["admin", "overview"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const stripeAction = useMutation({
    mutationFn: async (vars: { id: string; action: "send" | "void" }) => {
      const { data, error } = await supabase.functions.invoke("invoice-action", {
        body: { invoice_id: vars.id, action: vars.action },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: (_d, vars) => {
      toast.success(vars.action === "send" ? "Invoice sent." : "Invoice voided.");
      qc.invalidateQueries({ queryKey: ["admin", "invoices"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
      await logActivity({ entity_type: "invoice", entity_id: id, action: "delete", summary: "Deleted invoice" });
    },
    onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["admin", "invoices"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const sendReminder = useMutation({
    mutationFn: async (inv: InvoiceRow) => {
      const clientEmail = inv.clients?.email;
      if (!clientEmail) throw new Error("This client has no email address.");
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "invoice-reminder",
          recipientEmail: clientEmail,
          idempotencyKey: `reminder-${inv.id}-${Date.now()}`,
          templateData: {
            clientName: inv.clients?.name ?? "",
            invoiceNumber: inv.number,
            invoiceTitle: getInvoiceTitle(inv),
            amount: formatCents(getTotalCents(inv)),
            dueDate: inv.due_at ? formatDate(inv.due_at) : undefined,
            hostedUrl: inv.hosted_url ?? undefined,
          },
        },
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => toast.success("Reminder sent."),
    onError: (e: Error) => toast.error(e.message),
  });

  const exportCsv = () => {
    const rows = [["Number", "Client", "Amount", "Issued", "Due", "Status"], ...(invoices ?? []).map((i) => [
      i.number, i.clients?.name ?? "", (getTotalCents(i) / 100).toFixed(2), i.issued_at, i.due_at ?? "", i.status,
    ])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `invoices-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminPage
      eyebrow="Invoices"
      title="Billing"
      description="Track invoices, payments, and overdue accounts."
      actions={
        <>
          <Button variant="glass" size="sm" onClick={exportCsv}><Download className="w-3.5 h-3.5" />CSV</Button>
          <Button
            variant="glass"
            size="sm"
            onClick={async () => {
              const t = toast.loading("Scanning for overdue invoices…");
              const { data, error } = await supabase.functions.invoke("check-overdue-invoices", { body: {} });
              toast.dismiss(t);
              if (error) { toast.error(error.message); return; }
              const flipped = (data as { flipped?: number })?.flipped ?? 0;
              toast.success(flipped > 0 ? `Marked ${flipped} invoice${flipped === 1 ? "" : "s"} overdue.` : "No new overdue invoices.");
              qc.invalidateQueries({ queryKey: ["admin", "invoices"] });
              qc.invalidateQueries({ queryKey: ["admin", "nav-counts"] });
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />Scan Overdue
          </Button>
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild><Button variant="hero" size="sm"><Plus className="w-3.5 h-3.5" />New Invoice</Button></DialogTrigger>
            {creating && <NewInvoiceDialog onClose={() => setCreating(false)} />}
          </Dialog>
          <Dialog open={!!editingDraft} onOpenChange={(o) => !o && setEditingDraft(null)}>
            {editingDraft && (
              <NewInvoiceDialog
                editing={editingDraft}
                onClose={() => setEditingDraft(null)}
              />
            )}
          </Dialog>
        </>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <div className="glass rounded-2xl p-4"><p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">Paid</p><p className="text-xl font-bold">{formatCents(stats.paid)}</p></div>
        <div className="glass rounded-2xl p-4"><p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">Due</p><p className="text-xl font-bold text-amber-300">{formatCents(stats.due)}</p></div>
        <div className="glass rounded-2xl p-4"><p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">Overdue</p><p className="text-xl font-bold text-red-400">{formatCents(stats.overdue)}</p></div>
        <div className="glass rounded-2xl p-4"><p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">Refunded</p><p className="text-xl font-bold text-red-400">{formatCents(stats.refunded)}</p></div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice #, client, or status…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="md:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="due">Due</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="void">Voided</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeframe} onValueChange={(v) => setTimeframe(v as typeof timeframe)}>
          <SelectTrigger className="md:w-44">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="365d">Last 365 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(() => {
        // Evenly distributed columns matching the dashboard Invoices page,
        // plus a fixed admin actions column so header/row column starts stay aligned.
        const gridCols = "lg:grid-cols-[repeat(6,minmax(0,1fr))_10.5rem]";
        return (
          <div className="glass rounded-2xl overflow-hidden">
            <div className={cn("hidden lg:grid gap-4 px-5 py-3 border-b border-white/[0.06] font-mono text-[11px] uppercase tracking-widest text-muted-foreground text-left", gridCols)}>
              <span className="text-left">Package</span>
              <span className="text-left">Issued</span>
              <span className="text-left">Due</span>
              <span className="text-left">One-time</span>
              <span className="text-left">Recurring</span>
              <span className="text-left">Status</span>
              <span className="w-px" />
            </div>
            {isLoading ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</p>
            ) : (invoices ?? []).length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">No invoices yet.</p>
            ) : filtered.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">No invoices match "{search}".</p>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {filtered.map((i) => {
                  const s = statusMeta[i.status];
                  const oneTimeCents = getOneTimeCents(i);
                  const recurringCents = getRecurringCents(i);
                  const title = getInvoiceTitle(i);
                  return (
                    <li key={i.id} id={`invoice-${i.id}`} className={cn("odd:bg-white/[0.02]", highlightId === i.id ? "bg-primary/10 ring-1 ring-primary/40" : "")}>
                      <button
                        type="button"
                        onClick={() => setPreviewInv(i)}
                        className={cn(
                          "w-full text-left grid grid-cols-1 gap-2 lg:gap-4 px-4 lg:px-5 py-3.5 items-center transition-colors cursor-pointer hover:bg-white/[0.04]",
                          gridCols
                        )}
                      >
                        {/* Package + client */}
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground shrink-0">
                            <FileText className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium truncate">{title}</p>
                            <p className="font-mono text-[11px] text-muted-foreground truncate">{i.clients?.name ?? "—"}</p>
                          </div>
                        </div>

                        {/* Issued */}
                        <p className="text-[12px] text-muted-foreground truncate lg:block">
                          <span className="lg:hidden font-mono text-[11px] uppercase tracking-widest mr-2">Issued</span>
                          {formatDate(i.issued_at) || "—"}
                        </p>

                        {/* Due */}
                        <p className="text-[12px] text-muted-foreground truncate lg:block">
                          <span className="lg:hidden font-mono text-[11px] uppercase tracking-widest mr-2">Due</span>
                          {i.due_at ? formatDate(i.due_at) : "/"}
                        </p>

                        {/* One-time */}
                        <p className={cn("text-[13px] tabular-nums tracking-tight", oneTimeCents > 0 ? "font-semibold" : "text-muted-foreground")}>
                          <span className="lg:hidden font-mono text-[11px] uppercase tracking-widest text-muted-foreground mr-2">One-time</span>
                          {fmtOrDash(oneTimeCents)}
                        </p>

                        {/* Recurring */}
                        <p className={cn("text-[13px] tabular-nums tracking-tight", recurringCents > 0 ? "font-semibold" : "text-muted-foreground")}>
                          <span className="lg:hidden font-mono text-[11px] uppercase tracking-widest text-muted-foreground mr-2">Recurring</span>
                          {recurringCents > 0 ? (
                            <>
                              {formatCents(recurringCents)}
                              <span className="text-[11px] font-normal text-muted-foreground"> /4wks</span>
                            </>
                          ) : (
                            "/"
                          )}
                        </p>

                        {/* Status */}
                        <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md border font-mono text-[11px] uppercase tracking-widest w-fit whitespace-nowrap", s?.className)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", s?.dot)} />
                          {s?.label ?? i.status}
                        </span>

                        {/* Actions column — reminder + admin icons */}
                        <div className="flex items-center gap-2 justify-self-start lg:justify-self-end whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {(i.status === "sent" || i.status === "due" || i.status === "overdue") && i.clients?.email && (
                            <Button
                              variant="hero"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); sendReminder.mutate(i); }}
                              title="Send payment reminder"
                              disabled={sendReminder.isPending}
                              className="h-8 px-2.5 text-[11px] gap-1.5"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Remind
                            </Button>
                          )}
                          <div className="flex items-center gap-0.5">
                            {i.hosted_url && (
                              <Button variant="ghost" size="sm" asChild title="Open hosted invoice" className="h-8 w-8 p-0">
                                <a href={i.hosted_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </Button>
                            )}
                            {i.status === "draft" && i.stripe_invoice_id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setConfirmAction({ kind: "send", invoice: i }); }}
                                title="Finalize & send"
                                className="h-8 w-8 p-0"
                              >
                                <Send className="w-3.5 h-3.5 text-primary" />
                              </Button>
                            )}
                            {i.status === "draft" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setEditingDraft(i); }}
                                title="Edit draft"
                                className="h-8 px-2 text-[11px]"
                              >
                                Edit
                              </Button>
                            )}
                            {(i.status === "sent" || i.status === "due" || i.status === "overdue") && i.stripe_invoice_id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setConfirmAction({ kind: "void", invoice: i }); }}
                                title="Void invoice"
                                className="h-8 w-8 p-0"
                              >
                                <Ban className="w-3.5 h-3.5 text-amber-400" />
                              </Button>
                            )}
                            {i.status !== "paid" && i.status !== "void" && !i.stripe_invoice_id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); markPaid.mutate(i.id); }}
                                title="Mark paid"
                                className="h-8 w-8 p-0"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-500/10 group"
                              onClick={(e) => { e.stopPropagation(); setConfirmAction({ kind: "delete", invoice: i }); }}
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })()}

      {/* Invoice preview dialog (matches dashboard Invoices) */}
      <Dialog open={!!previewInv} onOpenChange={(o) => !o && setPreviewInv(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-white/15 bg-card text-foreground">
          {previewInv && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  {getInvoiceTitle(previewInv)}
                </DialogTitle>
                <DialogDescription className="font-mono text-[11px]">
                  {previewInv.number}
                  {previewInv.clients?.name ? ` · ${previewInv.clients.name}` : ""}
                  {previewInv.package?.custom_id ? ` · ${previewInv.package.custom_id}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass rounded-xl p-3">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Issued</p>
                    <p className="text-sm font-medium mt-1">{formatDate(previewInv.issued_at) || "—"}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Due</p>
                    <p className="text-sm font-medium mt-1">{previewInv.due_at ? formatDate(previewInv.due_at) : "/"}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">One-time payment</p>
                    <p className="text-base font-semibold mt-1 tabular-nums">{fmtOrDash(getOneTimeCents(previewInv))}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Recurring payment</p>
                    <p className="text-base font-semibold mt-1 tabular-nums">
                      {getRecurringCents(previewInv) > 0
                        ? <>{formatCents(getRecurringCents(previewInv))}<span className="text-[11px] font-normal text-muted-foreground"> /4wks</span></>
                        : "/"}
                    </p>
                  </div>
                </div>

                {Array.isArray(previewInv.line_items) && previewInv.line_items.length > 0 && (
                  <div className="glass rounded-xl overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/[0.06] font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      Line items
                    </div>
                    <ul className="divide-y divide-white/[0.05]">
                      {previewInv.line_items.map((li: any, idx: number) => (
                        <li key={idx} className="flex items-center justify-between gap-3 px-4 py-2.5 odd:bg-white/[0.02]">
                          <div className="min-w-0">
                            <p className="text-[13px] truncate">{li.description}</p>
                            <p className="text-[11px] text-muted-foreground">Qty {li.quantity ?? 1}</p>
                          </div>
                          <p className="text-[13px] font-semibold tabular-nums">
                            {formatCents((li.quantity ?? 1) * (li.unit_amount_cents ?? 0))}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewInv.description && (
                  <div className="glass rounded-xl p-3">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{previewInv.description}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                {previewInv.pdf_url && (
                  <Button asChild variant="ghost" size="sm">
                    <a href={previewInv.pdf_url} target="_blank" rel="noreferrer">
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </a>
                  </Button>
                )}
                {previewInv.hosted_url && (
                  <Button asChild variant="hero" size="sm">
                    <a href={previewInv.hosted_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open invoice
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmAction} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <AlertDialogContent className="border-2 border-white/15 bg-card text-foreground rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.kind === "send" && `Finalize & send ${confirmAction.invoice.number}?`}
              {confirmAction?.kind === "void" && `Void ${confirmAction.invoice.number}?`}
              {confirmAction?.kind === "delete" && `Delete ${confirmAction?.invoice.number}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.kind === "send" &&
                "This will finalize the invoice in Stripe and email the customer a hosted payment link. You can't undo this — but you can still void it afterwards."}
              {confirmAction?.kind === "void" &&
                "The customer will no longer be able to pay this invoice. This cannot be reversed."}
              {confirmAction?.kind === "delete" &&
                "This permanently removes the invoice from your records. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="glass-strong text-foreground border-0 hover:bg-white/[0.08] mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                confirmAction?.kind === "send"
                  ? "btn-hero-glass"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
              onClick={() => {
                if (!confirmAction) return;
                const { kind, invoice } = confirmAction;
                if (kind === "send") stripeAction.mutate({ id: invoice.id, action: "send" });
                if (kind === "void") stripeAction.mutate({ id: invoice.id, action: "void" });
                if (kind === "delete") remove.mutate(invoice.id);
                setConfirmAction(null);
              }}
            >
              {confirmAction?.kind === "send" && "Finalize & Send"}
              {confirmAction?.kind === "void" && "Void invoice"}
              {confirmAction?.kind === "delete" && "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  );
}
