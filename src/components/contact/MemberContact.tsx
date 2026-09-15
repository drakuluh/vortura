import type { ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, MessageSquare, Plus, Wand2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ClientConversation } from "@/components/messaging/ClientConversation";
import { BookingPanel, UPCOMING_CALLS_QUERY_KEY } from "@/components/landing/BookingCalendar";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { useUnreadTeamReplies } from "@/hooks/useUnreadTeamReplies";
import { supabase } from "@/integrations/supabase/client";
import { formatBookingInstant } from "@/lib/booking-time";
import { formatRelative } from "@/lib/admin/format";
import { changeStatusLabel, changeStatusTone } from "@/lib/changeRequests";
import { cn } from "@/lib/utils";

/**
 * Contact page for signed-in users, in tabs:
 *   Messages (default): the conversation with the team.
 *   Calls: book a call, with upcoming calls beside the calendar.
 *   Changes: recent change requests. Only for accounts with a project,
 *            since change requests attach to a package.
 * The tab lives in the URL (?tab=calls) so links and emails can open one.
 * Loaded lazily by ContactPage so guests never download any of this.
 */
type TabValue = "messages" | "calls" | "changes";

const MemberContact = () => {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const { data: client } = useCurrentClient();

  const unread = useUnreadTeamReplies(true);
  const { data: upcoming = [] } = useUpcomingCalls(user?.id);
  const { data: changes } = useChangeRequests(client?.id);
  const hasProject = (changes?.packageCount ?? 0) > 0;

  const requested = params.get("tab");
  const tab: TabValue = requested === "calls" || (requested === "changes" && hasProject) ? requested : "messages";
  const setTab = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === "messages") next.delete("tab");
    else next.set("tab", value);
    setParams(next, { replace: true });
  };

  const openChanges = (changes?.requests ?? []).filter((r) => !r.client_approved_at).length;

  return (
    <Tabs value={tab} onValueChange={setTab} className="relative">
      <div className="flex justify-center mb-6">
        <TabsList className="grid w-full sm:w-auto auto-cols-fr grid-flow-col h-11 bg-white/[0.03] border border-white/10 p-1 rounded-xl text-muted-foreground">
          <Trigger value="messages" icon={<MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />} label="Messages" count={unread} countLabel="unread" highlight />
          <Trigger value="calls" icon={<CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />} label="Calls" count={upcoming.length} countLabel="upcoming" />
          {hasProject && (
            <Trigger value="changes" icon={<Wand2 className="w-3.5 h-3.5" aria-hidden="true" />} label="Changes" count={openChanges} countLabel="open" />
          )}
        </TabsList>
      </div>

      {/* Kept mounted so a half-written message survives switching tabs. */}
      <TabsContent value="messages" forceMount className="mt-0 focus-visible:ring-offset-0 data-[state=inactive]:hidden">
        <div className="max-w-3xl mx-auto">
          <ClientConversation className="h-[60vh] min-h-[420px] lg:h-[520px]" />
        </div>
      </TabsContent>

      <TabsContent value="calls" className="mt-0 focus-visible:ring-offset-0">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 lg:gap-8">
          <BookingPanel />
          <UpcomingCalls calls={upcoming} onMessage={() => setTab("messages")} />
        </div>
      </TabsContent>

      {hasProject && (
        <TabsContent value="changes" className="mt-0 focus-visible:ring-offset-0">
          <ChangeRequests requests={changes?.requests ?? []} />
        </TabsContent>
      )}
    </Tabs>
  );
};

/* ── Tab trigger ─────────────────────────────────────────────── */

const Trigger = ({
  value,
  icon,
  label,
  count,
  countLabel,
  highlight = false,
}: {
  value: TabValue;
  icon: ReactNode;
  label: string;
  count: number;
  countLabel: string;
  highlight?: boolean;
}) => (
  <TabsTrigger
    value={value}
    className="group gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-5 text-[13px] sm:text-sm font-medium data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow-blue data-[state=inactive]:hover:text-foreground transition-all"
  >
    {/* Icons drop out on phones, where three labels with counts fill the bar. */}
    <span className="hidden sm:inline-flex">{icon}</span>
    {label}
    {count > 0 && (
      <>
        {/* Phones: a dot. Wider screens: the number. */}
        <span
          aria-hidden="true"
          className={cn(
            "sm:hidden h-1.5 w-1.5 rounded-full",
            highlight ? "bg-primary group-data-[state=active]:bg-white" : "bg-foreground/50 group-data-[state=active]:bg-white/80",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "hidden sm:inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none",
            highlight
              ? "bg-primary text-primary-foreground group-data-[state=active]:bg-white/25 group-data-[state=active]:text-white"
              : "bg-white/10 text-foreground/80 group-data-[state=active]:bg-white/25 group-data-[state=active]:text-white",
          )}
        >
          {count > 9 ? "9+" : count}
        </span>
        <span className="sr-only">, {count} {countLabel}</span>
      </>
    )}
  </TabsTrigger>
);

/* ── Calls ───────────────────────────────────────────────────── */

type UpcomingCall = { id: string; scheduled_at: string; status: string };

const useUpcomingCalls = (userId: string | undefined) =>
  useQuery({
    queryKey: [UPCOMING_CALLS_QUERY_KEY, userId],
    enabled: !!userId,
    queryFn: async (): Promise<UpcomingCall[]> => {
      const { data } = await supabase
        .from("bookings")
        .select("id, scheduled_at, status")
        .eq("user_id", userId!)
        .in("status", ["pending", "confirmed"])
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at")
        .limit(5);
      return data ?? [];
    },
  });

const UpcomingCalls = ({ calls, onMessage }: { calls: UpcomingCall[]; onMessage: () => void }) => (
  <section aria-labelledby="upcoming-calls-heading" className="flex flex-col">
    <h2 id="upcoming-calls-heading" className="font-mono text-[11px] uppercase tracking-widest text-primary mb-4">
      // Your upcoming calls
    </h2>
    <div className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 flex flex-col">
      {calls.length === 0 ? (
        <p className="text-sm text-muted-foreground">No calls booked yet. Pick a time and it'll show up here.</p>
      ) : (
        <ul className="space-y-3">
          {calls.map((c) => {
            const { date, time } = formatBookingInstant(c.scheduled_at);
            return (
              <li key={c.id} className="flex flex-col gap-1.5 pb-3 border-b border-white/[0.06] last:border-0 last:pb-0">
                <span className="text-sm font-medium text-depth">{date}</span>
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[13px] text-muted-foreground">{time}</span>
                  <StatusBadge tone={c.status === "confirmed" ? "success" : "primary"}>
                    {c.status === "confirmed" ? "Confirmed" : "Awaiting confirmation"}
                  </StatusBadge>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-auto pt-4 text-[12px] text-muted-foreground">
        Need to move a call?{" "}
        <button type="button" onClick={onMessage} className="text-primary hover:underline underline-offset-4">
          Message the team
        </button>
        .
      </p>
    </div>
  </section>
);

/* ── Changes ─────────────────────────────────────────────────── */

type ChangeRow = {
  id: string;
  title: string;
  status: "new" | "in_review" | "shipped";
  submitted_at: string;
  client_approved_at: string | null;
};

const useChangeRequests = (clientId: string | undefined) =>
  useQuery({
    queryKey: ["contact-change-requests", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const [packages, requests] = await Promise.all([
        supabase.from("packages").select("id", { count: "exact", head: true }).eq("client_id", clientId!),
        supabase
          .from("change_requests")
          .select("id, title, status, submitted_at, client_approved_at")
          .eq("client_id", clientId!)
          .order("submitted_at", { ascending: false })
          .limit(5),
      ]);
      return { packageCount: packages.count ?? 0, requests: (requests.data ?? []) as ChangeRow[] };
    },
  });

const ChangeRequests = ({ requests }: { requests: ChangeRow[] }) => (
  <section aria-labelledby="change-requests-heading">
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
      <div>
        <h2 id="change-requests-heading" className="font-mono text-[11px] uppercase tracking-widest text-primary mb-1.5">
          // Changes to your project
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg">
          Website and automation edits go through change requests, so each one is tracked until it ships.
        </p>
      </div>
      <Link
        to="/dashboard/request-change"
        className="btn-hero-glass inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0"
      >
        <Plus className="w-4 h-4" aria-hidden="true" /> Request a change
      </Link>
    </div>

    {requests.length === 0 ? (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
        <p className="text-sm text-muted-foreground">No change requests yet.</p>
      </div>
    ) : (
      <ul className="rounded-xl border border-white/[0.08] bg-white/[0.02] divide-y divide-white/[0.06]">
        {requests.map((r) => {
          const awaitingApproval = r.status === "shipped" && !r.client_approved_at;
          return (
            <li key={r.id}>
              <Link
                to={`/dashboard/request-change/${r.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3.5 hover:bg-white/[0.03] transition-colors"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-depth truncate">{r.title}</span>
                  <span className="block text-[12px] text-muted-foreground">Submitted {formatRelative(r.submitted_at)}</span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {awaitingApproval ? (
                    <StatusBadge tone="secondary">Ready for your review</StatusBadge>
                  ) : r.client_approved_at ? (
                    <StatusBadge tone="muted">Approved</StatusBadge>
                  ) : (
                    <StatusBadge tone={changeStatusTone(r.status)}>{changeStatusLabel(r.status)}</StatusBadge>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    )}
    <div className="mt-3 text-right">
      <Link to="/dashboard/request-change" className="text-[12px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground">
        View all in dashboard →
      </Link>
    </div>
  </section>
);

export default MemberContact;
