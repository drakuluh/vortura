import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Menu, Settings, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import vorturaLogo from "@/assets/vortura-logo.png";

// Module-level flag so the entry animation only plays on the very first mount,
// not when the Navbar remounts due to route changes.
let hasAnimatedNavbar = false;

export const Navbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { isAdmin, isSupport } = useUserRole();
  const showAdminGear = !!user && (isAdmin || isSupport);
  const shouldAnimate = useRef(!hasAnimatedNavbar);
  useEffect(() => {
    hasAnimatedNavbar = true;
  }, []);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const linkClass = (active: boolean) =>
    cn(
      "relative px-2.5 py-1 rounded-md transition-colors hover:text-foreground",
      active
        ? "text-foreground bg-primary/10 border border-primary/30 shadow-glow-blue"
        : "text-muted-foreground border border-transparent"
    );

  const isActive = (path: string) => pathname === path;

  const navLinks: {
    to: string;
    label: string;
    prefetch: () => Promise<unknown>;
  }[] = [
    { to: "/services", label: "Services", prefetch: () => import("@/pages/Services.tsx") },
    { to: "/process", label: "Process", prefetch: () => import("@/pages/ProcessPage.tsx") },
    { to: "/results", label: "Results", prefetch: () => import("@/pages/ResultsPage.tsx") },
    { to: "/contact", label: "Contact", prefetch: () => import("@/pages/ContactPage.tsx") },
  ];

  const prefetchAuth = () => {
    void import("@/pages/Auth.tsx");
  };
  const prefetchDashboard = () => {
    void import("@/pages/Dashboard.tsx");
  };

  return (
    <motion.header
      initial={shouldAnimate.current ? { y: -20, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="container mt-3">
        <nav className="glass rounded-2xl px-4 py-2 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 group">
            <div className="relative isolate">
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-primary blur-md opacity-60 group-hover:opacity-100 transition-opacity -z-10"
              />
              <img
                src={vorturaLogo}
                alt="VORTURA logo"
                width={28}
                height={28}
                loading="eager"
                decoding="sync"
                fetchpriority="high"
                className="relative w-7 h-7 rounded-md transform-gpu [image-rendering:auto]"
                style={{ willChange: "transform", backfaceVisibility: "hidden" }}
              />
            </div>
            <span className="font-bold text-sm tracking-tight">VORTURA<span className="text-primary">.</span>ai</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onMouseEnter={() => void l.prefetch()}
                onFocus={() => void l.prefetch()}
                className={linkClass(isActive(l.to))}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            {showAdminGear && (
              <Link
                to="/admin"
                aria-label="Open control room"
                title="Control Room"
                className={cn(
                  "inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors",
                  isActive("/admin")
                    ? "border-secondary/50 bg-secondary/10 text-secondary"
                    : "border-white/10 bg-white/[0.03] text-foreground/80 hover:text-foreground hover:bg-white/[0.06]"
                )}
              >
                <Settings className="w-4 h-4" />
              </Link>
            )}
            <Button
              variant="hero"
              size="sm"
              asChild
              onMouseEnter={user ? prefetchDashboard : prefetchAuth}
              onFocus={user ? prefetchDashboard : prefetchAuth}
            >
              <Link to={user ? "/dashboard" : "/login"}>
                {user ? "Dashboard" : "Login / Register"}
              </Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-foreground hover:bg-white/[0.06] transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden fixed inset-0 z-40"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-0 left-0 right-0 pt-[68px]"
            >
              <div className="container">
                <div className="glass-strong rounded-2xl border border-white/10 p-5 flex flex-col gap-1">
                  {/* Header: logo + close */}
                  <div className="flex items-center justify-between mb-3">
                    <Link
                      to="/"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-1.5 group"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-primary blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
                        <img
                          src={vorturaLogo}
                          alt="VORTURA logo"
                          width={28}
                          height={28}
                          loading="eager"
                          decoding="sync"
                          className="relative w-7 h-7 rounded-md"
                        />
                      </div>
                      <span className="font-bold text-sm tracking-tight">
                        VORTURA<span className="text-primary">.</span>ai
                      </span>
                    </Link>
                    <button
                      type="button"
                      aria-label="Close menu"
                      onClick={() => setOpen(false)}
                      className="-mr-2 w-11 h-11 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="flex flex-col">
                    {navLinks.map((l) => {
                      const active = isActive(l.to);
                      return (
                        <Link
                          key={l.to}
                          to={l.to}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "relative py-3.5 pl-4 pr-2 text-sm border-b border-white/5 transition-colors min-h-[44px] flex items-center",
                            active
                              ? "text-foreground bg-primary/5 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-secondary before:shadow-glow-blue before:rounded-full"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {l.label}
                        </Link>
                      );
                    })}
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className={cn(
                        "relative py-3.5 pl-4 pr-2 text-sm border-b border-white/5 transition-colors inline-flex items-center gap-2 min-h-[44px]",
                        isActive("/dashboard")
                          ? "text-foreground bg-primary/5 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-secondary before:shadow-glow-blue before:rounded-full"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <User className="w-3.5 h-3.5" />
                      Dashboard
                    </Link>
                  </nav>

                  <Button variant="hero" size="lg" asChild className="mt-4 w-full">
                    <Link to="/contact" onClick={() => setOpen(false)}>
                      Book a Call
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
