import { useState } from "react";
import { Download, FileText, CreditCard, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DashboardSubPage } from "@/components/dashboard/DashboardSubPage";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { supabase } from "@/integrations/supabase/client";
import { formatCents } from "@/lib/admin/format";
import { Counter } from "@/components/effects/Counter";

type Status = "paid" | "due" | "overdue" | "draft" | "sent" | "void" | "refunded" | "partially_refunded";

const statusMeta: Record<Status, { label: string; className: string; dot: string }> = {
  paid: { label: "Paid", className: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10", dot: "bg-emerald-400" },
  due: { label: "Due", className: "text-primary border-primary/30 bg-primary/10", dot: "bg-primary" },
  sent: { label: "Awaiting", className: "text-primary border-primary/30 bg-primary/10", dot: "bg-primary" },
  overdue: { label: "Overdue", className: "text-destructive border-destructive/40 bg-destructive/10", dot: "bg-destructive" },
  draft: { label: "Draft", className: "text-muted-foreground border-white/10 bg-white/[0.04]", dot: "bg-muted-foreground" },
  void: { label: "Void", className: "text-muted-foreground border-white/10 bg-white/[0.04]", dot: "bg-muted-foreground" },
  refunded: { label: "Refunded", className: "text-amber-300 border-amber-400/30 bg-amber-400/10", dot: "bg-amber-400" },
  partially_refunded: { label: "Partially Refunded", className: "text-amber-200/90 border-amber-400/20 bg-amber-400/[0.06]", dot: "bg-amber-300" },
};

const Invoices = () => {
  const { data: client, loading: clientLoading } = useCurrentClient();
  const [previewInv, setPreviewInv] = useState<any | null>(null);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["client-invoices", client?.id],
    enabled: !!client?.id,
    queryFn: async () => {
      const { data: invs, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_id", client!.id)
        .order("issued_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      const list = invs ?? [];
      const pkgIds = Array.from(new Set(list.map((i: any) => i.package_id).filter(Boolean)));
      let pkgMap = new Map<string, any>();
      if (pkgIds.length > 0) {
        const { data: pkgs } = await supabase
          .from("packages")
          .select("id, name, nickname, custom_id")
          .in("id", pkgIds);
        pkgMap = new Map((pkgs ?? []).map((p: any) => [p.id, p]));
      }
      return list.map((i: any) => ({ ...i, package: i.package_id ? pkgMap.get(i.package_id) ?? null : null }));
    },
  });

  const list = invoices ?? [];
  const due = list.find((i) => i.status === "due" || i.status === "overdue");
  const activeStatuses = new Set(["due", "overdue", "sent"]);
  const activeInvoices = list.filter((i) => activeStatuses.has(i.status));
  const dueInvoices = list.filter((i) => i.status === "due" || i.status === "sent");
  const overdueInvoices = list.filter((i) => i.status === "overdue");

  const getRecurringCents = (inv: any): number => {
    const items = Array.isArray(inv?.line_items) ? inv.line_items : [];
    const r = items.find((li: any) =>
      typeof li?.description === "string" && /\(every 4 weeks\)$|\(monthly\)$/i.test(li.description)
    );
    if (r) return (r.quantity ?? 1) * (r.unit_amount_cents ?? 0);
    return inv?.stripe_subscription_id ? (inv.amount_cents ?? 0) : 0;
  };
  const getOneTimeCents = (inv: any): number => {
    if (inv?.invoice_type === "recurring") return 0;
    const items = Array.isArray(inv?.line_items) ? inv.line_items : [];
    const oneTime = items
      .filter((li: any) => !(typeof li?.description === "string" && /\(every 4 weeks\)$|\(monthly\)$/i.test(li.description)))
      .reduce((s: number, li: any) => s + (li.quantity ?? 1) * (li.unit_amount_cents ?? 0), 0);
    return oneTime || (inv.amount_cents ?? 0);
  };
  // amount_cents is the source of truth — it now reflects the combined
  // one-time + first-recurring-period total written by create-stripe-invoice.
  const totalPaid = list.filter((i) => i.status === "paid").reduce((s, i) => s + (i.amount_cents ?? 0), 0);
  const dueTotal = dueInvoices.reduce((s, i) => s + (i.amount_cents ?? 0), 0);
  const overdueTotal = overdueInvoices.reduce((s, i) => s + (i.amount_cents ?? 0), 0);
  const getInvoiceTitle = (inv: any): string => {
    const pkg = inv?.package;
    if (pkg) return pkg.nickname || pkg.name || inv.number;
    return inv?.description || inv?.number;
  };
  const fmtOrDash = (cents: number) => (cents > 0 ? formatCents(cents) : "/");

  // grid: title | issued | due | one-time | recurring | status | actions
  // Keep the actions track fixed so separate header/row grids share identical column starts.
  const gridCols =
    "lg:grid-cols-[repeat(6,minmax(0,1fr))_10.5rem]";

  return (
    <DashboardSubPage
      eyebrow="Invoices"
      title={<>Billing & <span className="text-gradient">Invoices</span></>}
      description="Download statements, track outstanding balances, and review your billing history."
      centered
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 max-w-6xl mx-auto">
        <div className="glass rounded-2xl p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Active Invoices</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums">
            <Counter to={activeInvoices.length} />
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">{activeInvoices.length === 0 ? "All caught up" : `${activeInvoices.length === 1 ? "Invoice" : "Invoices"} awaiting payment`}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Due</p>
          <p className={cn("text-2xl md:text-3xl font-bold tracking-tight tabular-nums", dueTotal > 0 && "text-yellow-400")}>
            <Counter to={dueTotal / 100} prefix="$" format={(n) => Math.round(n).toLocaleString()} />
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Across {dueInvoices.length} {dueInvoices.length === 1 ? "invoice" : "invoices"}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Overdue</p>
          <p className={cn("text-2xl md:text-3xl font-bold tracking-tight tabular-nums", overdueTotal > 0 && "text-destructive")}>
            <Counter to={overdueTotal / 100} prefix="$" format={(n) => Math.round(n).toLocaleString()} />
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">{overdueInvoices.length === 0 ? "Nothing past due" : `${overdueInvoices.length} past due`}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <section>
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h2 className="text-lg md:text-xl font-semibold tracking-tight">Invoices</h2>
            <p className="text-[11px] text-muted-foreground">One-time and recurring payments</p>
          </div>

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
            {clientLoading || isLoading ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</p>
            ) : list.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">No invoices yet.</p>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {list.map((inv: any) => {
                  const s = statusMeta[inv.status as Status];
                  const oneTimeCents = getOneTimeCents(inv);
                  const recurringCents = getRecurringCents(inv);
                  const title = getInvoiceTitle(inv);
                  return (
                    <li key={inv.id} className="odd:bg-white/[0.02]">
                      <button
                        type="button"
                        onClick={() => setPreviewInv(inv)}
                        className={cn(
                          "w-full text-left grid grid-cols-1 gap-2 lg:gap-4 px-4 lg:px-5 py-3.5 items-center transition-colors cursor-pointer hover:bg-white/[0.04]",
                          gridCols
                        )}
                      >
                        {/* Package + invoice number */}
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground shrink-0">
                            <FileText className="w-4 h-4" />
                          </span>
                         <div className="min-w-0">
                            <p className="text-[13px] font-medium truncate">{title}</p>
                          </div>
                        </div>

                        {/* Issued */}
                        <p className="text-[12px] text-muted-foreground truncate lg:block">
                          <span className="lg:hidden font-mono text-[11px] uppercase tracking-widest mr-2">Issued</span>
                          {inv.issued_at ?? "—"}
                        </p>

                        {/* Due */}
                        <p className="text-[12px] text-muted-foreground truncate lg:block">
                          <span className="lg:hidden font-mono text-[11px] uppercase tracking-widest mr-2">Due</span>
                          {inv.due_at ?? "/"}
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
                          {s?.label ?? inv.status}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 justify-self-start lg:justify-self-end" onClick={(e) => e.stopPropagation()}>
                          {(inv.status === "sent" || inv.status === "due" || inv.status === "overdue") && inv.hosted_url && (
                            <Button asChild variant="hero" size="sm" className="h-8 px-5">
                              <a href={inv.hosted_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                <CreditCard className="w-3.5 h-3.5" />
                                Pay
                              </a>
                            </Button>
                          )}
                          {inv.pdf_url && (
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="Download PDF">
                              <a href={inv.pdf_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Invoice preview dialog */}
      <Dialog open={!!previewInv} onOpenChange={(o) => !o && setPreviewInv(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col glass border-white/[0.08] text-foreground">
          {previewInv && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  {getInvoiceTitle(previewInv)}
                </DialogTitle>
                <DialogDescription className="font-mono text-[11px]">
                  {previewInv.number}
                  {previewInv.package?.custom_id ? ` · ${previewInv.package.custom_id}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass rounded-xl p-3">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Issued</p>
                    <p className="text-sm font-medium mt-1">{previewInv.issued_at ?? "—"}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Due</p>
                    <p className="text-sm font-medium mt-1">{previewInv.due_at ?? "/"}</p>
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
    </DashboardSubPage>
  );
};

export default Invoices;
