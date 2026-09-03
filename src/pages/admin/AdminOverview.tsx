import { useQuery } from "@tanstack/react-query";
import { Building2, Calendar, Clock, CreditCard, MessageSquare, Package, TrendingUp, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminPage } from "@/components/admin/AdminPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatCents, formatRelative } from "@/lib/admin/format";

const useOverview = () =>
  useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const [clients, activeMrr, overdue, threads, recentInvoices, activity] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("clients").select("mrr_cents").eq("status", "active"),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "overdue"),
        supabase.from("message_threads").select("id", { count: "exact", head: true }),
        supabase
          .from("invoices")
          .select("id, number, amount_cents, status, due_at, clients(name)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("activity_log")
          .select("id, action, summary, entity_type, entity_id, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);
      const mrr = (activeMrr.data ?? []).reduce((s, c) => s + (c.mrr_cents ?? 0), 0);
      return {
        clientCount: clients.count ?? 0,
        mrr,
        overdueInvoices: overdue.count ?? 0,
        threadCount: threads.count ?? 0,
        recentInvoices: recentInvoices.data ?? [],
        activity: activity.data ?? [],
      };
    },
  });

const useOverviewMetrics = () =>
  useQuery({
    queryKey: ["admin", "overview", "metrics"],
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

      const [openChanges, upcomingBookings, todayBookings, recentBookings, activePackages] = await Promise.all([
        supabase
          .from("change_requests")
          .select("id", { count: "exact", head: true })
          .neq("status", "shipped"),
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .gte("scheduled_at", now.toISOString())
          .neq("status", "cancelled"),
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .gte("scheduled_at", todayStart)
          .lt("scheduled_at", todayEnd)
          .neq("status", "cancelled"),
        supabase
          .from("bookings")
          .select("id, caller_name, caller_phone, booking_type, scheduled_at, status, duration_minutes")
          .gte("scheduled_at", now.toISOString())
          .neq("status", "cancelled")
          .order("scheduled_at", { ascending: true })
          .limit(5),
        supabase
          .from("packages")
          .select("id", { count: "exact", head: true })
          .in("status", ["active", "in_progress"]),
      ]);
      return {
        upcomingBookings: upcomingBookings?.count ?? 0,
        todayBookings: todayBookings?.count ?? 0,
        pendingChanges: openChanges.count ?? 0,
        recentBookings: recentBookings?.data ?? [],
        activePackages: activePackages.count ?? 0,
      };
    },
  });

const KpiCard = ({ icon: Icon, label, value, hint }: { icon: typeof Building2; label: string; value: string; hint?: string }) => (
  <div className="glass rounded-2xl p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <p className="text-2xl md:text-3xl font-bold tracking-tight">{value}</p>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

export default function AdminOverview() {
  const { data, isLoading } = useOverview();
  const { data: metrics, isLoading: metricsLoading } = useOverviewMetrics();

  return (
    <AdminPage eyebrow="Overview" title="Control Room" description="Live snapshot of clients, revenue, and open work.">
      {/* Top Row — Growth & Financials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <KpiCard icon={Building2} label="Clients" value={isLoading ? "…" : String(data?.clientCount ?? 0)} hint="Total" />
        <KpiCard icon={TrendingUp} label="Active MRR" value={isLoading ? "…" : formatCents(data?.mrr ?? 0)} hint="Sum of Active Clients" />
        <KpiCard icon={Calendar} label="Upcoming Bookings" value={metricsLoading ? "…" : String(metrics?.upcomingBookings ?? 0)} hint="Scheduled Calls" />
        <KpiCard icon={Clock} label="Today" value={metricsLoading ? "…" : String(metrics?.todayBookings ?? 0)} hint="Bookings Today" />
      </div>

      {/* Bottom Row — Fulfillment & Operations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <KpiCard icon={Wand2} label="Pending Changes" value={metricsLoading ? "…" : String(metrics?.pendingChanges ?? 0)} hint="Outstanding Requests" />
        <KpiCard icon={MessageSquare} label="Message Threads" value={isLoading ? "…" : String(data?.threadCount ?? 0)} hint="Open Conversations" />
        <KpiCard icon={CreditCard} label="Overdue" value={isLoading ? "…" : String(data?.overdueInvoices ?? 0)} hint="Invoices Past Due" />
        <KpiCard icon={Package} label="Active Packages" value={metricsLoading ? "…" : String(metrics?.activePackages ?? 0)} hint="In Progress Builds" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-primary">// Recent invoices</p>
            <Link to="/admin/invoices" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : data?.recentInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <ul className="-mx-2">
              {data?.recentInvoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between gap-3 px-2 py-2 rounded-md odd:bg-white/[0.02]">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{inv.number}</p>
                    <p className="font-mono text-[11px] text-muted-foreground truncate">{(inv.clients as { name: string } | null)?.name ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold">{formatCents(inv.amount_cents)}</span>
                    <StatusBadge tone={inv.status === "paid" ? "success" : inv.status === "overdue" ? "danger" : inv.status === "due" ? "warn" : "muted"}>
                      {inv.status}
                    </StatusBadge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-primary">// Upcoming bookings</p>
            <Link to="/admin/bookings" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
          </div>
          {metricsLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (metrics?.recentBookings ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
          ) : (
            <ul className="-mx-2">
              {(metrics?.recentBookings ?? []).map((b: any) => {
                const d = new Date(b.scheduled_at);
                const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
                const date = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                const typeLabels: Record<string, string> = {
                  discovery: "Discovery",
                  strategy: "Strategy",
                  onboarding: "Onboarding",
                  support: "Support",
                  other: "Call",
                };
                return (
                  <li key={b.id} className="flex items-center justify-between gap-3 px-2 py-2 rounded-md odd:bg-white/[0.02]">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium truncate">{b.caller_name || "Unknown"}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{typeLabels[b.booking_type] ?? "Call"}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[12px] font-medium">{time}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{date}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AdminPage>
  );
}
