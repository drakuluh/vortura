import { useState } from "react";
import { Instagram, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import vorturaLogo from "@/assets/vortura-logo.png";
import { CURRENCIES, CurrencyCode, useCurrency } from "@/contexts/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        className="text-muted-foreground/70 hover:text-foreground transition-colors flex items-center justify-center"
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
  const { currency, setCurrency } = useCurrency();
  return (
  <footer className="mt-12 md:mt-14 mb-3">
    <div className="container">
      <div className="glass rounded-2xl px-5 py-3.5 md:px-6 md:py-4">
        <div className="flex flex-col md:grid md:grid-cols-3 md:items-center gap-4">
          {/* Brand + social/contact icons */}
          <div className="flex items-center justify-center md:justify-start gap-4">
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
                  className="relative w-7 h-7 rounded-md"
                />
              </div>
              <span className="font-bold text-sm tracking-tight">
                VORTURA<span className="text-primary">.</span>ai
              </span>
            </Link>
            <span aria-hidden="true" className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-3">
              <IconWithTooltip
                href="https://instagram.com/vortura.ai"
                label="VORTURA.ai on Instagram"
                tooltip="@vortura.ai"
                icon={Instagram}
                external
              />
              <IconWithTooltip
                href="tel:+11234561234"
                label="Call us"
                tooltip="(123) 456-1234"
                icon={Phone}
              />
              <IconWithTooltip
                href="mailto:support@vortura.ai"
                label="Email us"
                tooltip="support@vortura.ai"
                icon={Mail}
              />
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center justify-center gap-3 md:gap-5 flex-wrap text-xs text-muted-foreground/70">
            <Link to="/about" className="hover:text-foreground transition-colors py-0.5">
              About
            </Link>
            <span aria-hidden="true" className="text-muted-foreground/30">·</span>
            <Link to="/privacy" className="hover:text-foreground transition-colors py-0.5">
              Privacy
            </Link>
            <span aria-hidden="true" className="text-muted-foreground/30">·</span>
            <Link to="/terms" className="hover:text-foreground transition-colors py-0.5">
              Terms
            </Link>
            <span aria-hidden="true" className="text-muted-foreground/30">·</span>
            <Link to="/refund" className="hover:text-foreground transition-colors py-0.5">
              Refund
            </Link>
          </nav>

          {/* Currency selector */}
          <div className="flex justify-center md:justify-end">
            <Select
              value={currency.code}
              onValueChange={(v) => setCurrency(v as CurrencyCode)}
            >
              <SelectTrigger
                aria-label="Select display currency"
                className="btn-hero-glass h-9 md:h-8 w-[88px] md:w-[120px] text-xs text-white hover:text-white"
              >
                <SelectValue>
                  <span>{currency.symbol} {currency.code}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border-white/10">
                {Object.values(CURRENCIES).map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-xs">
                    {c.symbol} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  </footer>
  );
};
