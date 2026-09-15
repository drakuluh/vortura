/**
 * Parked: the "Services (Test)" nav dropdown.
 *
 * Nothing imports this yet — it was pulled out of Navbar so the marketing
 * pages could be hidden from the header without losing the styled markup.
 * The pages, data (src/data/marketing-services.ts) and routes (/marketing,
 * /marketing/:slug) are all still live and reachable by direct URL.
 *
 * To put it back in Navbar:
 *   desktop — render <ServicesTestDropdown linkClass={linkClass} /> after the
 *   navLinks.map(...) inside the `hidden md:flex` nav container.
 *   mobile  — render <ServicesTestMobileSection onNavigate={() => setOpen(false)} />
 *   after the navLinks.map(...) inside the mobile <nav>, before the Dashboard link.
 */
import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MARKETING_SERVICES } from "@/data/marketing-services";

export const ServicesTestDropdown = ({
  linkClass,
}: {
  linkClass: (active: boolean) => string;
}) => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const isMarketingActive = pathname.startsWith("/marketing");

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearTimeout(timeout.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        timeout.current = setTimeout(() => setOpen(false), 150);
      }}
    >
      <Link
        to="/marketing"
        onMouseEnter={() => void import("@/pages/MarketingServices.tsx")}
        className={cn(linkClass(isMarketingActive), "inline-flex items-center gap-1")}
      >
        Services (Test)
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 w-72 glass-solid rounded-xl p-2"
          >
            <div className="mb-1.5 px-2.5 pt-1.5 pb-1">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                Marketing Services
              </p>
            </div>
            {MARKETING_SERVICES.map((svc) => {
              const Icon = svc.icon;
              return (
                <Link
                  key={svc.slug}
                  to={`/marketing/${svc.slug}`}
                  className="flex items-start gap-3 px-2.5 py-2 rounded-lg hover:bg-white/[0.05] transition-colors group/item"
                >
                  <div className="mt-0.5 w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground group-hover/item:text-primary transition-colors">
                      {svc.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 leading-snug line-clamp-1">
                      {svc.shortDesc}
                    </p>
                  </div>
                </Link>
              );
            })}
            <div className="border-t border-white/5 mt-1.5 pt-1.5">
              <Link
                to="/marketing"
                className="flex items-center justify-center px-2.5 py-2 rounded-lg text-[11px] font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                View all services →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ServicesTestMobileSection = ({
  onNavigate,
}: {
  onNavigate: () => void;
}) => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const isMarketingActive = pathname.startsWith("/marketing");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative py-3.5 pl-4 pr-2 text-sm border-b border-white/5 transition-colors min-h-[44px] flex items-center justify-between w-full text-left",
          isMarketingActive
            ? "text-foreground bg-primary/5 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-secondary before:shadow-glow-blue before:rounded-full"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Services (Test)
        <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pl-6 py-1 border-b border-white/5">
              {MARKETING_SERVICES.map((svc) => {
                const Icon = svc.icon;
                return (
                  <Link
                    key={svc.slug}
                    to={`/marketing/${svc.slug}`}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 py-2.5 text-sm transition-colors",
                      pathname === `/marketing/${svc.slug}`
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {svc.title}
                  </Link>
                );
              })}
              <Link
                to="/marketing"
                onClick={onNavigate}
                className="flex items-center gap-2.5 py-2.5 text-sm text-primary font-semibold"
              >
                View all →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
