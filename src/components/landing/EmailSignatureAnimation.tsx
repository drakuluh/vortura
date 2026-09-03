import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BadgeCheck, Globe } from "lucide-react";

const SIGS = [
  { name: "Chris Evans", title: "Financial Analyst", company: "Robinhood", colors: ["#071a0a", "#0d3a14", "#155222"] as const, initials: "CE" },
  { name: "Kayla Green", title: "Dir. Marketing", company: "Webflow", colors: ["#3a1a08", "#8a420f", "#c46218"] as const, initials: "KG" },
  { name: "Jessica Brooks", title: "Head of Partnerships", company: "Zapier", colors: ["#1a0800", "#541600", "#8B2800"] as const, initials: "JB" },
];

const MiniCard = ({ sig, active }: { sig: typeof SIGS[0]; active: boolean }) => (
  <div
    className={cn(
      "rounded-xl overflow-hidden border transition-all duration-500 h-[90px] w-[200px] shrink-0",
      active
        ? "border-primary/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105"
        : "border-white/10 opacity-50 scale-95"
    )}
  >
    <div className="flex h-full">
      <div className="w-6 bg-white/[0.03] border-r border-white/[0.06] flex flex-col items-center justify-center gap-1 shrink-0">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-white/[0.06] border border-white/10" />
        ))}
      </div>
      <div className="flex-1 px-2 py-1.5 flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-semibold text-foreground truncate">{sig.name}</span>
          <BadgeCheck className="w-2.5 h-2.5 text-primary shrink-0" />
        </div>
        <span className="text-[8px] text-muted-foreground/70 truncate">{sig.title}</span>
        <span className="text-[7px] text-muted-foreground/50">{sig.company}</span>
      </div>
      <div className="w-14 shrink-0" style={{ background: `linear-gradient(148deg, ${sig.colors[0]}, ${sig.colors[1]} 55%, ${sig.colors[2]})` }}>
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-white/40 text-[11px] font-bold tracking-[2px] font-serif">{sig.initials}</span>
        </div>
      </div>
    </div>
  </div>
);

export const EmailSignatureAnimation = ({ className }: { className?: string }) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p + 1) % SIGS.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)} role="img" aria-label="Email signature card carousel">
      <div className="relative w-full flex flex-col items-center gap-3">
        {SIGS.map((sig, i) => (
          <MiniCard key={i} sig={sig} active={i === active} />
        ))}
      </div>
      <div className="flex gap-1.5">
        {SIGS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === active ? "w-5 bg-primary" : "w-1.5 bg-white/20"
            )}
          />
        ))}
      </div>
    </div>
  );
};
