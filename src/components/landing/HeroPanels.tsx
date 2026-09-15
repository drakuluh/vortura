import type { ReactNode } from "react";
import { Bot, Plug, MessageSquare, BarChart3, TestTube } from "lucide-react";
import { FloatCard } from "@/hooks/use-tilt";
import { useInViewPause } from "@/hooks/useInViewPause";

/**
 * Blur that ramps across the panel instead of sitting flat over it.
 *
 * CSS `filter: blur()` is uniform, so this stacks a blurred copy on a sharp one
 * and masks the blurred layer with a gradient. `sharpEdge` names the side that
 * stays crisp — the outer edge of the hero — so focus falls off toward the
 * middle, where the headline sits and the panels should recede.
 */
const GradientBlur = ({
  children,
  sharpEdge,
  amount = "4px",
}: {
  children: ReactNode;
  sharpEdge: "left" | "right";
  amount?: string;
}) => {
  const ramp = `linear-gradient(to ${sharpEdge === "left" ? "right" : "left"}, transparent 18%, black 92%)`;
  return (
    <div className="relative">
      {children}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          filter: `blur(${amount})`,
          maskImage: ramp,
          WebkitMaskImage: ramp,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Decorative system panels that sit behind the hero copy, angled inward like
 * open windows on a desk.
 *
 * They are readable enough to register as "this is a real operations system"
 * at a glance, but deliberately dimmed and blurred — the hero's job is to land
 * the headline, so the panels must never compete with it for legibility.
 */

const AuditPanel = () => (
  <div className="glass rounded-2xl p-5 w-[340px] space-y-3">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
      <span className="ml-1.5 font-mono text-[9px] text-muted-foreground tracking-wider">
        WORKFLOW AUDIT
      </span>
    </div>
    {[
      { label: "Missed calls / week", value: "23", delta: "-$9,200/mo" },
      { label: "Avg. response time", value: "4.2 hrs", delta: "Ind: 15 min" },
      { label: "Manual follow-ups", value: "67%", delta: "Can automate" },
    ].map((row) => (
      <div
        key={row.label}
        className="flex items-center justify-between py-2 px-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
      >
        <span className="text-[11px] text-foreground/70">{row.label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-depth">{row.value}</span>
          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-red-500/15 text-red-400">
            {row.delta}
          </span>
        </div>
      </div>
    ))}
    <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
      <span className="text-[11px] text-muted-foreground">Opportunity</span>
      <span className="text-xs font-bold text-gradient">$142,000/yr</span>
    </div>
  </div>
);

const IntegrationPanel = () => (
  <div className="glass rounded-2xl p-5 w-[340px]">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
      <span className="ml-1.5 font-mono text-[9px] text-muted-foreground tracking-wider">
        INTEGRATION STATUS
      </span>
    </div>
    <div className="space-y-2">
      {[
        { name: "AI Call Agent", status: "Live", icon: Bot },
        { name: "CRM Integration", status: "Live", icon: Plug },
        { name: "Auto Follow-ups", status: "Live", icon: MessageSquare },
        { name: "Analytics", status: "Testing", icon: BarChart3 },
        { name: "Review Requests", status: "Queued", icon: TestTube },
      ].map((item) => {
        const Icon = item.icon;
        const tone =
          item.status === "Live"
            ? "bg-green-500/15 text-green-400 border-green-500/25"
            : item.status === "Testing"
              ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/25"
              : "bg-white/[0.06] text-muted-foreground border-white/[0.08]";
        return (
          <div
            key={item.name}
            className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
          >
            <Icon className="w-3.5 h-3.5 text-primary/60 shrink-0" />
            <span className="text-[11px] text-foreground/70 flex-1">{item.name}</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${tone}`}>
              {item.status}
            </span>
          </div>
        );
      })}
    </div>
    <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary to-secondary" />
      </div>
      <span className="text-[10px] font-mono text-primary">72%</span>
    </div>
  </div>
);

const PerformancePanel = () => (
  <div className="glass rounded-2xl p-5 w-[320px]">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
      <span className="ml-1.5 font-mono text-[9px] text-muted-foreground tracking-wider">
        PERFORMANCE
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: "Calls answered", value: "347", change: "+100%" },
        { label: "Leads captured", value: "89", change: "+215%" },
        { label: "Response time", value: "8 sec", change: "-97%" },
        { label: "Revenue back", value: "$12.4k", change: "+∞" },
      ].map((m) => (
        <div
          key={m.label}
          className="py-2 px-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center"
        >
          <p className="text-sm font-bold text-depth">{m.value}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">{m.label}</p>
          <span className="text-[9px] font-mono text-green-400">{m.change}</span>
        </div>
      ))}
    </div>
  </div>
);

export const HeroPanels = () => {
  const ref = useInViewPause<HTMLDivElement>();
  return (
  <div
    ref={ref}
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 -z-10 hidden lg:block overflow-hidden"
    style={{ perspective: "1600px" }}
  >
    {/* Angled inward from both edges. rotateY turns each panel's inner edge
        toward the viewer; the slight rotateZ and translate keep them from
        reading as a symmetrical pair. */}
    <div
      className="absolute left-[4%] xl:left-[6%] top-1/2 opacity-[0.6]"
      style={{ transformOrigin: "left center", transform: "translateY(-58%) rotateY(24deg) rotateZ(-5deg) scale(1.4)" }}
    >
      <FloatCard duration={7}>
        <GradientBlur sharpEdge="left">
          <AuditPanel />
        </GradientBlur>
      </FloatCard>
    </div>

    <div
      className="absolute right-[4%] xl:right-[6%] top-1/2 opacity-[0.6]"
      style={{ transformOrigin: "right center", transform: "translateY(-54%) rotateY(-24deg) rotateZ(5deg) scale(1.4)" }}
    >
      <FloatCard duration={8.5}>
        <GradientBlur sharpEdge="right">
          <IntegrationPanel />
        </GradientBlur>
      </FloatCard>
    </div>

    <div
      className="absolute left-1/2 bottom-[4%] opacity-[0.4] blur-[1.5px]"
      style={{ transform: "translateX(-50%) rotateX(22deg) scale(1.25)" }}
    >
      <FloatCard duration={6}>
        <PerformancePanel />
      </FloatCard>
    </div>
  </div>
  );
};
