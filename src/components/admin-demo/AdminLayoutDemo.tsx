import { Suspense, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ChevronLeft, ExternalLink, LogOut, Menu, Search, Sparkles, X } from "lucide-react";
import { RouteFallback } from "@/components/RouteFallback";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { adminNav } from "@/data/admin";

const STORAGE_KEY = "admin-sidebar-collapsed";

export const AdminLayoutDemo = () => {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col sticky top-0 h-screen border-r border-white/[0.06] bg-background/80 backdrop-blur-xl transform-gpu [will-change:transform] transition-[width] duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <SidebarInner collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </aside>

      {/* Mobile sidebar */}
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
              <SidebarInner collapsed={false} onClose={() => setMobileOpen(false)} mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Demo banner */}
        <div className="bg-secondary/10 border-b border-secondary/20 px-4 md:px-6 py-2 flex items-center justify-between gap-3 text-xs">
          <p className="text-secondary-glow font-mono uppercase tracking-widest text-[10px] truncate">
            // Demo control room — sample data, no real backend
          </p>
          <Link
            to="/admin"
            className="text-secondary hover:text-secondary-glow inline-flex items-center gap-1.5 font-medium shrink-0"
          >
            <span className="hidden sm:inline">Open real admin</span>
            <span className="sm:hidden">Real admin</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        {/* Top bar */}
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

            <div className="hidden md:flex items-center gap-2 max-w-md flex-1">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search clients, packages, invoices…"
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-white/[0.03] border border-white/[0.06] text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 md:hidden" />

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="glass" size="sm" asChild>
                <Link to="/admin">
                  <span className="hidden sm:inline">Real admin</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button variant="glass" size="sm" asChild>
                <Link to="/">
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exit admin</span>
                </Link>
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
    </div>
  );
};

interface SidebarInnerProps {
  collapsed: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  mobile?: boolean;
}

const SidebarInner = ({ collapsed, onToggle, onClose, mobile }: SidebarInnerProps) => {
  return (
    <>
      <div className="h-14 px-3 border-b border-white/[0.06] flex items-center justify-between gap-2">
        <Link to="/admin-demo" className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-md bg-gradient-primary flex items-center justify-center shrink-0 shadow-glow-blue">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate flex items-center gap-1.5">
                Admin
                <span className="px-1.5 h-4 rounded bg-secondary/20 text-secondary-glow font-mono text-[8px] uppercase tracking-widest flex items-center">
                  Demo
                </span>
              </p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground leading-tight">
                Control room
              </p>
            </div>
          )}
        </Link>
        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {adminNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to.replace(/^\/admin/, "/admin-demo")}
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
            {!collapsed && item.badge ? (
              <span className="px-1.5 h-5 rounded-md font-mono text-[10px] flex items-center bg-white/[0.06] text-muted-foreground">
                {item.badge}
              </span>
            ) : null}
            {collapsed && item.badge ? (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-secondary shadow-glow-purple" />
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/[0.06]">
        {!collapsed ? (
          <div className="rounded-md bg-white/[0.03] border border-white/[0.06] p-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
              Signed in
            </p>
            <p className="text-sm font-medium truncate">you@yourcompany.com</p>
            <p className="font-mono text-[10px] text-primary mt-1">Owner</p>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-md bg-gradient-purple flex items-center justify-center mx-auto text-xs font-semibold">
            Y
          </div>
        )}
      </div>
    </>
  );
};
