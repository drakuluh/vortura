import { Suspense, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { RouteFallback } from "@/components/RouteFallback";
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AICommandPanel } from "@/components/admin/AICommandPanel";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STORAGE_KEY = "admin-sidebar-collapsed";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: "overdue_invoices" | "new_change_requests" | "unread_messages";
}

const NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/admin/clients", label: "Clients", icon: Building2 },
  { to: "/admin/packages", label: "Packages", icon: Package },
  { to: "/admin/invoices", label: "Invoices", icon: CreditCard, badgeKey: "overdue_invoices" },
  { to: "/admin/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare, badgeKey: "unread_messages" },
  { to: "/admin/change-requests", label: "Change requests", icon: Wand2, badgeKey: "new_change_requests" },
  { to: "/admin/admins", label: "Team", icon: ShieldCheck },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const useNavCounts = () =>
  useQuery({
    queryKey: ["admin", "nav-counts"],
    queryFn: async () => {
      const [invoices, changes, unreadMessages] = await Promise.all([
        supabase.from("invoices").select("id", { count: "exact", head: true }).in("status", ["sent", "due", "overdue"]),
        supabase.from("change_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("sender_side", "client")
          .is("read_at", null),
      ]);
      return {
        overdue_invoices: invoices.count ?? 0,
        new_change_requests: changes.count ?? 0,
        unread_messages: unreadMessages.count ?? 0,
      };
    },
    refetchInterval: 30000,
  });

export const AdminLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { roles } = useUserRole();
  const counts = useNavCounts();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out.");
    navigate("/", { replace: true });
  };

  const inner = (collapsedNow: boolean, mobile = false) => (
    <SidebarInner
      collapsed={collapsedNow}
      mobile={mobile}
      onToggle={() => setCollapsed((v) => !v)}
      onClose={() => setMobileOpen(false)}
      counts={counts.data}
      userEmail={user?.email ?? ""}
      role={roles[0] ?? "admin"}
      onSignOut={handleSignOut}
    />
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside
        className={cn(
          "hidden lg:flex flex-col sticky top-0 h-screen border-r border-white/[0.08] bg-[#1c1c26] shadow-[12px_0_40px_-8px_rgba(0,0,0,0.85)] transform-gpu [will-change:transform] transition-[width] duration-300",
          collapsed ? "w-14" : "w-64"
        )}
      >
        {inner(collapsed)}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/[0.06] bg-background lg:hidden flex flex-col"
            >
              {inner(false, true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-14 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl transform-gpu [will-change:transform]">
          <div className="h-full px-4 md:px-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <Button variant="glass" size="sm" asChild>
                <Link to="/admin-demo">
                  <span className="hidden sm:inline">View demo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button variant="glass" size="sm" asChild>
                <Link to="/">
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exit</span>
                </Link>
              </Button>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setAiOpen((v) => !v)}
                aria-label={aiOpen ? "Close AI assistant" : "Open AI assistant"}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{aiOpen ? "Close AI" : "AI Assistant"}</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <AICommandPanel open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
};

interface SidebarInnerProps {
  collapsed: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  mobile?: boolean;
  counts?: { overdue_invoices: number; new_change_requests: number; unread_messages: number };
  userEmail: string;
  role: string;
  onSignOut: () => void;
}

const SidebarInner = ({
  collapsed,
  onToggle,
  onClose,
  mobile,
  counts,
  userEmail,
  role,
  onSignOut,
}: SidebarInnerProps) => {
  return (
    <>
      <div className="h-14 px-3 border-b border-white/[0.06] flex items-center justify-between gap-3">
        {collapsed && !mobile ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="group relative w-8 h-8 rounded-md bg-gradient-primary flex items-center justify-center shrink-0 shadow-glow-blue mx-auto overflow-hidden"
          >
            <Sparkles className="w-4 h-4 text-white absolute transition-all duration-300 group-hover:opacity-0 group-hover:-translate-x-2" />
            <ChevronRight className="w-4 h-4 text-white absolute transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0" />
          </button>
        ) : (
          <Link to="/admin" className="flex items-center gap-2 min-w-0 mr-2">
            <div className="w-8 h-8 rounded-md bg-gradient-primary flex items-center justify-center shrink-0 shadow-glow-blue">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">Admin</p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground leading-tight">
                Control room
              </p>
            </div>
          </Link>
        )}
        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        ) : !collapsed ? (
          <button
            type="button"
            onClick={onToggle}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV.map((item) => {
          const badge = item.badgeKey ? counts?.[item.badgeKey] ?? 0 : 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-md px-2.5 h-9 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-foreground border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent"
                )
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && badge > 0 ? (
                <span className="px-1.5 h-5 rounded-md font-mono text-[10px] flex items-center bg-white/[0.06] text-muted-foreground">
                  {badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/[0.06] space-y-2">
        {!collapsed ? (
          <div className="rounded-md bg-white/[0.03] border border-white/[0.06] p-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
              Signed in
            </p>
            <p className="text-sm font-medium truncate">{userEmail}</p>
            <p className="font-mono text-[10px] text-primary mt-1 capitalize">{role}</p>
          </div>
        ) : (
        <div className="w-8 h-8 rounded-md bg-gradient-purple flex items-center justify-center mx-auto text-xs font-semibold uppercase">
            {userEmail.charAt(0) || "?"}
          </div>
        )}
        <button
          type="button"
          onClick={onSignOut}
          className={cn(
            "w-full flex items-center gap-2 rounded-md px-2.5 h-9 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </>
  );
};
