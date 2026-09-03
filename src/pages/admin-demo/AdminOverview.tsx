import { Link } from "react-router-dom";
import { ArrowUpRight, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AdminPage } from "@/components/admin/AdminPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  adminActivity,
  adminClients,
  adminInvoices,
  adminKpis,
  adminChangeRequests,
} from "@/data/admin";

const statusTone = (s: string) =>
  s === "paid" ? "success" : s === "overdue" ? "danger" : s === "draft" ? "muted" : "primary";

export default function AdminOverview() {
  return (
    <AdminPage
      eyebrow="Overview"
      title={<>Control Room</>}
      description="Everything across your clients at a glance."
      actions={
        <>
          <Button variant="glass" size="sm" asChild>
            <Link to="/admin/clients">View clients</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/admin/clients">
              <Plus className="w-3.5 h-3.5" />
              New client
            </Link>
          </Button>
        </>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {adminKpis.map((k, i) => (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="glass rounded-2xl p-4 md:p-5"
          >
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
              {k.label}
            </p>
            <div className="flex items-end justify-between gap-2">
              <p className="text-2xl md:text-3xl font-bold tracking-tight">{k.value}</p>
              <div
                className={`flex items-center gap-1 font-mono text-[11px] ${
                  k.trend === "up" ? "text-emerald-400" : "text-secondary"
                }`}
              >
                {k.trend === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {k.delta}
              </div>
            </div>
            <Sparkline data={k.spark} accent={k.accent} />
          </motion.div>
        ))}
      </div>

      {/* Two-column: invoices + change requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-8">
        <section className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-1">
                // Recent invoices
              </p>
              <h2 className="text-base font-semibold">Cash in flight</h2>
            </div>
            <Link
              to="/admin/invoices"
              className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              All invoices <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {adminInvoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{inv.client}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{inv.number}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm tabular-nums">${inv.amount.toLocaleString()}</p>
                  <StatusBadge tone={statusTone(inv.status) as never} className="mt-1">
                    {inv.status}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-1">
                // Open change requests
              </p>
              <h2 className="text-base font-semibold">Needs attention</h2>
            </div>
            <Link
              to="/admin/change-requests"
              className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <ul className="space-y-3">
            {adminChangeRequests
              .filter((t) => t.status !== "shipped")
              .slice(0, 4)
              .map((t) => (
                <li key={t.id} className="flex items-start gap-3">
                  <span
                    className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                      t.priority === "high"
                        ? "bg-secondary shadow-glow-purple"
                        : "bg-primary shadow-glow-blue"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug truncate">{t.title}</p>
                    <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                      {t.client} · {t.owner} · {t.submitted}
                    </p>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      </div>

      {/* Clients summary + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        <section className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-1">
                // Top clients
              </p>
              <h2 className="text-base font-semibold">By MRR</h2>
            </div>
            <Link
              to="/admin/clients"
              className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              All clients <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {[...adminClients]
              .sort((a, b) => b.mrr - a.mrr)
              .slice(0, 5)
              .map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-white/[0.03] transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-xs font-semibold shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground truncate">
                        {c.plan} · {c.packages} packages
                      </p>
                    </div>
                  </div>
                  <p className="text-sm tabular-nums shrink-0">${c.mrr.toLocaleString()}/mo</p>
                </div>
              ))}
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-1">
            // Activity
          </p>
          <h2 className="text-base font-semibold mb-4">Latest events</h2>
          <ul className="space-y-3.5">
            {adminActivity.map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                    a.accent === "primary"
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-secondary/10 border-secondary/30 text-secondary"
                  }`}
                >
                  <a.icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm leading-snug">{a.text}</p>
                  <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminPage>
  );
}

const Sparkline = ({ data, accent }: { data: number[]; accent: "primary" | "secondary" }) => {
  const w = 100;
  const h = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" ");
  const stroke = accent === "primary" ? "hsl(var(--primary))" : "hsl(var(--secondary))";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full mt-3 h-7" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
