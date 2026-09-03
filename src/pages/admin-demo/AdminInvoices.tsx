import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPage } from "@/components/admin/AdminPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminInvoices, type InvoiceStatus } from "@/data/admin";

const statusTone = (s: InvoiceStatus) =>
  s === "paid" ? "success" : s === "due" ? "primary" : s === "overdue" ? "danger" : "muted";

export default function AdminInvoices() {
  const total = adminInvoices.reduce((sum, i) => sum + i.amount, 0);
  const paid = adminInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const overdue = adminInvoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  return (
    <AdminPage
      eyebrow="Invoices"
      title="Billing"
      description="Issued, paid, and outstanding invoices across all clients."
      actions={
        <>
          <Button variant="glass" size="sm">
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button variant="hero" size="sm">
            <Plus className="w-3.5 h-3.5" />
            New invoice
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
        <Stat label="Total this month" value={`$${total.toLocaleString()}`} accent="primary" />
        <Stat label="Collected" value={`$${paid.toLocaleString()}`} accent="primary" />
        <Stat label="Overdue" value={`$${overdue.toLocaleString()}`} accent="secondary" />
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="text-left font-normal px-4 py-3">Invoice</th>
                <th className="text-left font-normal px-4 py-3">Client</th>
                <th className="text-right font-normal px-4 py-3">Amount</th>
                <th className="text-left font-normal px-4 py-3">Issued</th>
                <th className="text-left font-normal px-4 py-3">Due</th>
                <th className="text-left font-normal px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {adminInvoices.map((i) => (
                <tr
                  key={i.id}
                  className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs">{i.number}</td>
                  <td className="px-4 py-3">{i.client}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    ${i.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{i.issued}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.due}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={statusTone(i.status)}>{i.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPage>
  );
}

const Stat = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "primary" | "secondary";
}) => (
  <div className="glass rounded-2xl p-4">
    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
      {label}
    </p>
    <p
      className={`text-2xl font-bold tracking-tight ${
        accent === "primary" ? "text-primary" : "text-secondary"
      }`}
    >
      {value}
    </p>
  </div>
);
