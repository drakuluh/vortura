import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  FileText,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  Sparkles,
  Workflow,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatCents } from "@/lib/admin/format";
import { formatRelative } from "@/lib/admin/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { changeStatusLabel, changeStatusTone, priorityTone } from "@/lib/changeRequests";
import { Skeleton } from "@/components/ui/skeleton";
import { usePackageUnreadCounts } from "@/hooks/usePackageUpdates";

/* Types out a string once and stops; cursor blinks while/after typing. */
const TypewriterOnce = ({ text, speed = 90 }: { text: string; speed?: number }) => {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return (
    <span className="inline-flex items-baseline leading-[1.15] pb-[0.1em] min-h-[1.15em]">
      <span className="text-gradient">{shown}{"\u200B"}</span>
      <span className="ml-1 inline-block w-[3px] h-[0.9em] bg-primary animate-blink shadow-glow-blue" />
    </span>
  );
};

/* Section header used to clearly separate each zone of the dashboard. */
const SectionHeader = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-row items-center md:items-end justify-between gap-3 mb-4 md:mb-5">
    <div className="min-w-0">
      <h2 className="text-lg md:text-xl font-semibold tracking-tight leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-[12px] text-muted-foreground mt-1 max-w-md">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

const quickActions = [
  { icon: MessageSquare, label: "Messages", to: "/dashboard/messages", accent: "primary" as const },
  { icon: Plus, label: "Request Changes", to: "/dashboard/request-change", accent: "secondary" as const },
  { icon: Calendar, label: "Book a Call", to: "/contact", accent: "primary" as const },
  { icon: FileText, label: "View Invoices", to: "/dashboard/invoices", accent: "secondary" as const },
];

const packageStatusMeta: Record<string, { label: string; dot: string; text: string }> = {
  active: { label: "Active", dot: "bg-emerald-400", text: "text-emerald-300" },
  in_progress: { label: "In progress", dot: "bg-primary", text: "text-primary" },
  review: { label: "Awaiting review", dot: "bg-secondary", text: "text-secondary" },
  completed: { label: "Completed", dot: "bg-emerald-400", text: "text-emerald-300" },
  paused: { label: "Paused", dot: "bg-yellow-400", text: "text-yellow-300" },
};

const PackageNameEditor = ({
  packageId,
  defaultName,
  nickname,
  onSaved,
}: {
  packageId: string;
  defaultName: string;
  nickname: string | null;
  onSaved: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(nickname ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(nickname ?? "");
  }, [nickname]);

  const displayed = nickname && nickname.trim().length > 0 ? nickname : defaultName;

  const save = async () => {
    const trimmed = value.trim();
    setSaving(true);
    const { error } = await supabase
      .from("packages")
      .update({ nickname: trimmed.length > 0 ? trimmed : null })
      .eq("id", packageId);
    setSaving(false);
    if (error) {
      toast.error("Could not save nickname");
      return;
    }
    setEditing(false);
    onSaved();
  };

  const cancel = () => {
    setValue(nickname ?? "");
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          placeholder={defaultName}
          className="bg-white/[0.06] border border-white/10 rounded-md px-2 py-1 text-base md:text-lg font-semibold tracking-tight outline-none focus:border-primary/40 min-w-0 flex-1"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="p-1 rounded-md text-emerald-300 hover:bg-white/[0.06] transition-colors"
          aria-label="Save nickname"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={saving}
          className="p-1 rounded-md text-muted-foreground hover:bg-white/[0.06] transition-colors"
          aria-label="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 group/name">
      <h3 className="text-base md:text-lg font-semibold tracking-tight truncate">
        {displayed}
      </h3>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Rename package"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
};

const Dashboard = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { data: client } = useCurrentClient();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState<string>("");
  const [profileLoading, setProfileLoading] = useState(true);
  const firstPackageRef = useRef<HTMLDivElement>(null);
  const [packageCardHeight, setPackageCardHeight] = useState<number | null>(null);

  const { data: packages, isPending: packagesPending } = useQuery({
    queryKey: ["client-packages", client?.id],
    enabled: !!client?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("packages")
        .select("*")
        .eq("client_id", client!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const packageIds = (packages ?? []).map((p) => p.id);
  const { data: unreadByPackage = {} } = usePackageUnreadCounts(packageIds);

  const { data: openChangeRequestCount = 0 } = useQuery({
    queryKey: ["client-open-change-requests-count", client?.id],
    enabled: !!client?.id,
    queryFn: async () => {
      const { count } = await supabase
        .from("change_requests")
        .select("id", { count: "exact", head: true })
        .eq("client_id", client!.id)
        .is("client_approved_at", null);
      return count ?? 0;
    },
  });

  const { data: unreadStrategistMessages = 0 } = useQuery({
    queryKey: ["client-unread-strategist-messages", client?.id],
    enabled: !!client?.id,
    queryFn: async () => {
      const { data: threads } = await supabase
        .from("message_threads")
        .select("id")
        .eq("client_id", client!.id);
      const ids = (threads ?? []).map((t) => t.id);
      if (ids.length === 0) return 0;
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("thread_id", ids)
        .eq("sender_side", "admin")
        .is("read_at", null);
      return count ?? 0;
    },
  });

  const { data: newInvoicesCount = 0 } = useQuery({
    queryKey: ["client-new-invoices-count", client?.id],
    enabled: !!client?.id,
    queryFn: async () => {
      const { count } = await supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("client_id", client!.id)
        .in("status", ["sent", "due", "overdue"]);
      return count ?? 0;
    },
  });

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

  useLayoutEffect(() => {
    const el = firstPackageRef.current;
    if (!el) return;
    const update = () => setPackageCardHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [packages]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, first_name, business_name, account_type")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        // non-fatal — fall back to metadata
      }
      const isBusiness =
        data?.account_type === "business" &&
        !!data?.business_name?.trim();

      if (isBusiness) {
        setDisplayName(data!.business_name!.trim());
      } else {
        const fallback =
          (user.user_metadata?.display_name as string | undefined) ??
          (user.user_metadata?.full_name as string | undefined) ??
          user.email?.split("@")[0] ??
          "there";
        const first =
          data?.first_name?.trim() ||
          (data?.display_name?.trim() || fallback).split(/\s+/)[0];
        setDisplayName(first || "there");
      }
      setProfileLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out.");
    navigate("/", { replace: true });
  };

  const headerAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };

  const fadeUp = (i: number) =>
    isMobile
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.6, ease: "easeOut" as const, delay: 0.05 * i },
        };

  if (loading || !user) {
    return (
      <PageLayout>
        <div className="relative min-h-[60vh] flex items-center justify-center">
          <PageHeroBg />
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Loading workspace...
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="relative pt-12 md:pt-14 lg:pt-24 pb-16 md:pb-20 lg:pb-28 overflow-hidden">
        <PageHeroBg />
        <div className="container relative z-10">
          {/* Header */}
          <motion.div
            className="mt-12 md:mt-10 lg:mt-8 mb-8 md:mb-10 lg:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
            {...headerAnim}
          >
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5">
                {profileLoading ? (
                  <span className="flex flex-col gap-2">
                    <Skeleton className="h-7 md:h-9 lg:h-11 xl:h-12 w-48 md:w-56 rounded-md" />
                    <Skeleton className="h-7 md:h-9 lg:h-11 xl:h-12 w-64 md:w-80 rounded-md" />
                  </span>
                ) : (
                  <>
                    Welcome back,
                    <br />
                    <TypewriterOnce text={displayName} />
                  </>
                )}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                to="/dashboard/profile"
                className="group relative glass rounded-xl px-3 py-2 overflow-hidden inline-flex items-center gap-2 text-sm font-medium text-foreground/90 hover:text-foreground transition-colors duration-500 hover:border-primary/40"
              >
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%)]"
                  aria-hidden="true"
                />
                <User className="relative w-3.5 h-3.5 text-primary" />
                <span className="relative">Profile</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="group relative glass rounded-xl px-3 py-2 overflow-hidden inline-flex items-center gap-2 text-sm font-medium text-foreground/90 hover:text-foreground transition-colors duration-500 hover:border-secondary/40"
              >
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,hsl(var(--secondary)/0.18),transparent_70%)]"
                  aria-hidden="true"
                />
                <LogOut className="relative w-3.5 h-3.5 text-secondary" />
                <span className="relative">Sign out</span>
              </button>
            </div>
          </motion.div>

          {/* Onboarding card */}
          {!client && <motion.div
            className="relative mb-10 md:mb-12"
            {...(isMobile
              ? { initial: false as const, animate: { y: 0 } }
              : {
                  initial: { y: 24 },
                  whileInView: { y: 0 },
                  viewport: { once: true, margin: "-60px" },
                  transition: { duration: 0.6, ease: "easeOut" as const },
                })}
          >
            <div className="absolute -inset-px rounded-3xl bg-gradient-primary opacity-20 blur-md pointer-events-none" />
            <div className="relative glass-strong rounded-3xl p-6 md:p-8 border-2 border-white/15">
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-1.5">
                    // Get started
                  </p>
                  <h2 className="text-lg md:text-xl font-semibold tracking-tight mb-1">
                    Your workspace is ready.
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    Once your first automation package is provisioned, live metrics, packages,
                    and activity will appear here. In the meantime, request a change or message
                    your strategist to kick things off.
                  </p>
                </div>
                <Button asChild variant="hero" size="lg" className="shrink-0">
                  <Link to="/contact">
                    Book kickoff call
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>}

          {/* Two-column: Packages (left, 2/3) + side rail (right, 1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Packages */}
            <motion.section
              className="lg:col-span-2 relative lg:pr-8 lg:border-r lg:border-white/[0.06]"
              {...fadeUp(0)}
            >
              <SectionHeader title="Packages" />
              {packagesPending ? (
                <div className="space-y-3 md:space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 md:p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-8" />
                        </div>
                        <Skeleton className="h-1 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (packages?.length ?? 0) > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {packages!.map((p, i) => {
                    const status = packageStatusMeta[p.status] ?? {
                      label: String(p.status),
                      dot: "bg-primary",
                      text: "text-primary",
                    };
                    return (
                      <motion.div
                        key={p.id}
                        ref={i === 0 ? firstPackageRef : undefined}
                        className="relative glass rounded-2xl p-4 md:p-5 group overflow-hidden transition-colors duration-500 hover:border-primary/40"
                        {...fadeUp(i + 1)}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.14),transparent_70%)]" />
                        <Link
                          to={`/dashboard/packages/${p.id}`}
                          aria-label={`Open ${p.name}`}
                          className="absolute inset-0 z-10"
                        />
                        <div className="relative pointer-events-none">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                            <div className="min-w-0 relative z-20 pointer-events-auto">
                              <PackageNameEditor
                                packageId={p.id}
                                defaultName={p.name}
                                nickname={(p as { nickname?: string | null }).nickname ?? null}
                                onSaved={() =>
                                  queryClient.invalidateQueries({ queryKey: ["client-packages", client?.id] })
                                }
                              />
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                                <span className={`font-mono text-[11px] uppercase tracking-widest ${status.text}`}>
                                  {status.label}
                                </span>
                              </div>
                              {(unreadByPackage[p.id] ?? 0) > 0 && (
                                <span
                                  aria-label={`${unreadByPackage[p.id]} new update${unreadByPackage[p.id] === 1 ? "" : "s"}`}
                                  className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-semibold leading-none flex items-center justify-center ring-2 ring-white"
                                >
                                  {unreadByPackage[p.id] > 99 ? "99+" : unreadByPackage[p.id]}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Progress */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                                Progress
                              </span>
                              <span className="font-mono text-[11px] text-foreground/80">{p.progress}%</span>
                            </div>
                            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-primary"
                                style={{ width: `${p.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="glass rounded-2xl border border-dashed border-white/15 p-10 md:p-14 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4">
                    <Workflow className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold tracking-tight mb-1.5">
                    No packages yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
                    Once your first package is live, you'll see progress, milestones, and metrics
                    here in real time.
                  </p>
                </div>
              )}
            </motion.section>

            {/* Side rail */}
            <div className="space-y-8 md:space-y-10">
              {/* Quick actions */}
              <motion.section {...fadeUp(1)}>
                <SectionHeader title="Actions" />
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {quickActions.map((a) => {
                    const Icon = a.icon;
                    const isPrimary = a.accent === "primary";
                    const badgeCount =
                      a.to === "/dashboard/request-change"
                        ? openChangeRequestCount
                        : a.to === "/dashboard/messages"
                        ? unreadStrategistMessages
                        : a.to === "/dashboard/invoices"
                        ? newInvoicesCount
                        : 0;
                    const showBadge = badgeCount > 0;
                    const badgeLabel =
                      a.to === "/dashboard/request-change"
                        ? `${badgeCount} open change request${badgeCount === 1 ? "" : "s"}`
                        : a.to === "/dashboard/messages"
                        ? `${badgeCount} new message${badgeCount === 1 ? "" : "s"} from strategist`
                        : `${badgeCount} new invoice${badgeCount === 1 ? "" : "s"}`;
                    return (
                      <Link
                        key={a.label}
                        to={a.to}
                        style={packageCardHeight ? { height: packageCardHeight } : undefined}
                        className={`group relative glass rounded-2xl p-4 md:p-5 overflow-hidden flex flex-col items-start justify-between gap-4 transition-colors duration-500 ${
                          isPrimary ? "hover:border-primary/40" : "hover:border-secondary/40"
                        }`}
                      >
                        {showBadge && (
                          <span
                            aria-label={badgeLabel}
                            className="absolute right-4 md:right-5 top-4 md:top-5 mt-[8px] z-10 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-semibold leading-none flex items-center justify-center ring-2 ring-white"
                          >
                            {badgeCount > 99 ? "99+" : badgeCount}
                          </span>
                        )}
                        <span
                          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                            isPrimary
                              ? "bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%)]"
                              : "bg-[radial-gradient(circle_at_50%_0%,hsl(var(--secondary)/0.18),transparent_70%)]"
                          }`}
                          aria-hidden="true"
                        />
                        <span
                          className={`relative w-9 h-9 shrink-0 rounded-lg flex items-center justify-center border ${
                            isPrimary
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-secondary/10 border-secondary/30 text-secondary"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="relative text-sm md:text-base font-medium leading-tight text-foreground/90 group-hover:text-foreground">
                          {a.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </motion.section>

            </div>
          </div>

        </div>
      </section>
    </PageLayout>
  );
};

export default Dashboard;