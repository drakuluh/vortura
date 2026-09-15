import { useState } from "react";
import { Instagram, Phone, Mail } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { CONTACT } from "@/data/contact";
import { scrollToTopIfHome } from "@/lib/scroll-to-top-on-home";
import vorturaLogo from "@/assets/vortura-logo.png";

const IconWithTooltip = ({ href, label, tooltip, icon: Icon, external }: {
  href: string;
  label: string;
  tooltip: string;
  icon: typeof Phone;
  external?: boolean;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <a
        href={href}
        aria-label={label}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
        className="text-muted-foreground/70 hover:text-foreground transition-colors flex items-center justify-center w-10 h-10 md:w-9 md:h-9 rounded-lg hover:bg-white/[0.05]"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        <Icon className="w-4 h-4" />
      </a>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-md bg-popover border border-white/10 text-xs text-foreground whitespace-nowrap shadow-lg pointer-events-none">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-white/10" />
        </div>
      )}
    </div>
  );
};

export const Footer = () => {
  const { pathname } = useLocation();
  return (
  <footer className="mt-12 md:mt-14 mb-3 print:hidden">
    <div className="container">
      {/* md:py-2 matches the Navbar's padding so the footer bar resolves to the
          same height as the header. Mobile keeps its own rhythm — the footer
          stacks there and can't collapse to a single row. */}
      <div className="glass rounded-2xl px-5 py-3.5 md:px-6 md:py-2">
        <div className="flex flex-col md:grid md:grid-cols-3 md:items-center gap-4">
          {/* Brand */}
          <div className="flex items-center justify-center md:justify-start">
            <Link to="/" onClick={scrollToTopIfHome(pathname)} className="flex items-center gap-1.5 group min-h-[44px] md:min-h-0">
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
                  className="relative w-7 h-7 rounded-md"
                />
              </div>
              <span className="font-bold text-sm tracking-tight">
                VORTURA<span className="text-primary">.</span>ai
              </span>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="flex items-center justify-center gap-0 md:gap-3 text-xs text-muted-foreground/70">
            <Link to="/about" className="hover:text-foreground transition-colors px-2 py-3 md:py-2 rounded-md hover:bg-white/[0.05]">
              About
            </Link>
            <span aria-hidden="true" className="text-muted-foreground/30 hidden md:inline">·</span>
            <Link to="/blog" className="hover:text-foreground transition-colors px-2 py-3 md:py-2 rounded-md hover:bg-white/[0.05]">
              Blog
            </Link>
            <span aria-hidden="true" className="text-muted-foreground/30 hidden md:inline">·</span>
            <Link to="/privacy" className="hover:text-foreground transition-colors px-2 py-3 md:py-2 rounded-md hover:bg-white/[0.05]">
              Privacy
            </Link>
            <span aria-hidden="true" className="text-muted-foreground/30 hidden md:inline">·</span>
            <Link to="/terms" className="hover:text-foreground transition-colors px-2 py-3 md:py-2 rounded-md hover:bg-white/[0.05]">
              Terms
            </Link>
            <span aria-hidden="true" className="text-muted-foreground/30 hidden md:inline">·</span>
            <Link to="/refund" className="hover:text-foreground transition-colors px-2 py-3 md:py-2 rounded-md hover:bg-white/[0.05]">
              Refund
            </Link>
          </nav>

          {/* Social/contact icons */}
          <div className="flex items-center justify-center md:justify-end gap-1">
            <IconWithTooltip
              href="https://instagram.com/vortura.ai"
              label="VORTURA.ai on Instagram"
              tooltip="@vortura.ai"
              icon={Instagram}
              external
            />
            {CONTACT.phone && (
              <IconWithTooltip
                href={CONTACT.phone.href}
                label="Call us"
                tooltip={CONTACT.phone.display}
                icon={Phone}
              />
            )}
            <IconWithTooltip
              href={`mailto:${CONTACT.email}`}
              label="Email us"
              tooltip={CONTACT.email}
              icon={Mail}
            />
          </div>
        </div>
      </div>
      {/* Computed so it never shows a stale year. */}
      <p className="mt-3 text-center text-[11px] text-muted-foreground/50">
        © {new Date().getFullYear()} Vortura Agency. All rights reserved.
      </p>
    </div>
  </footer>
  );
};
