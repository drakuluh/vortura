import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Phone, Users, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Counter } from "@/components/effects/Counter";
import { SparklesText } from "@/components/ui/sparkles-text";

// Industry-typical close rate on returned missed calls for service businesses.
// Tweak this single number to adjust the calculator's revenue assumption.
const RECOVERED_CALL_CLOSE_RATE = 0.30;

export const RoiCalculator = ({ headerAnim: headerAnimOverride }: { headerAnim?: any } = {}) => {
  const [missed, setMissed] = useState([20]);
  const [value, setValue] = useState([400]);
  const isMobile = useIsMobile();
  const defaultHeaderAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };
  const headerAnim = headerAnimOverride ?? defaultHeaderAnim;
  const cardAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, scale: 1, rotateY: 0 } }
    : {
        initial: { opacity: 0, scale: 0.85, rotateY: 12 },
        whileInView: { opacity: 1, scale: 1, rotateY: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const, delay: 0.15 },
      };
  const weeklyMissed = missed[0];
  const customerValue = value[0];
  const monthlyRecovered = Math.round(weeklyMissed * 4.33 * RECOVERED_CALL_CLOSE_RATE);
  const yearlyRecovered = Math.round(weeklyMissed * 52 * RECOVERED_CALL_CLOSE_RATE);
  const yearlyRevenue = yearlyRecovered * customerValue;

  return (
    <section id="roi" className="relative py-8 md:py-10 lg:py-14">
      <div className="container relative z-10">
        <motion.div className="max-w-2xl mx-auto text-center mb-5 md:mb-6 lg:mb-7" {...headerAnim}>
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2">
            Missed calls, <SparklesText text="recovered." className="text-gradient" />
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground sm:whitespace-nowrap">
            Most local businesses miss 1 in 4 calls. Drag to see what recovering them is worth.
          </p>
        </motion.div>

        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto" style={{ perspective: 1400 }}>
          <motion.div
            className="glass-strong rounded-3xl p-4 md:p-5 lg:p-6 relative overflow-hidden"
            {...cardAnim}
          >
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-secondary/20 blur-[100px]" />

            <div className="relative">
              <SliderRow
                label="Missed calls per week"
                value={weeklyMissed}
                unit="calls"
                sliderValue={missed}
                onChange={setMissed}
                min={2}
                max={50}
                step={1}
                ticks={[2, 12, 25, 40, 50]}
                accent="primary"
              />

              <div className="h-3 md:h-4" />

              <SliderRow
                label="Average value per new customer"
                value={`$${customerValue}`}
                unit="/ customer"
                sliderValue={value}
                onChange={setValue}
                min={50}
                max={2000}
                step={25}
                ticks={[50, 500, 1000, 1500, 2000]}
                tickFormatter={(t) => `$${t}`}
                accent="secondary"
              />

              <div className="mt-4 md:mt-5 lg:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-2.5">
                <Stat icon={Phone} label="Customers recovered / month" accent="primary">
                  <Counter to={monthlyRecovered} duration={900} />
                </Stat>
                <Stat icon={Users} label="Customers recovered / year" accent="secondary">
                  <Counter to={yearlyRecovered} duration={1100} />
                </Stat>
                <Stat
                  icon={DollarSign}
                  label="Extra revenue / year"
                  accent="primary"
                  highlight
                  className="sm:col-span-2 lg:col-span-1"
                >
                  <Counter to={yearlyRevenue} duration={1300} prefix="$" />
                </Stat>
              </div>

              <p className="mt-3 md:mt-4 text-[11px] font-mono uppercase tracking-widest text-muted-foreground/80 text-center">
                Based on a 30% close rate on returned missed calls — typical for service businesses.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

type SliderRowProps = {
  label: string;
  value: string | number;
  unit: string;
  sliderValue: number[];
  onChange: (v: number[]) => void;
  min: number;
  max: number;
  step: number;
  ticks: number[];
  tickFormatter?: (t: number) => string;
  accent: "primary" | "secondary";
};

const SliderRow = ({
  label,
  value,
  unit,
  sliderValue,
  onChange,
  min,
  max,
  step,
  ticks,
  tickFormatter = (t) => `${t}`,
  accent,
}: SliderRowProps) => {
  const accentRing = accent === "primary" ? "ring-primary/40 shadow-glow-blue" : "ring-secondary/40 shadow-glow-purple";
  const accentText = accent === "primary" ? "text-primary" : "text-secondary";
  const current = sliderValue[0];
  const valueText = `${tickFormatter(current)} ${unit}`.trim();

  return (
    <div>
      <div className="flex flex-row items-end justify-between gap-3 mb-2">
        <label className="text-[11px] md:text-xs font-mono uppercase tracking-widest text-muted-foreground max-w-[55%] leading-snug">
          {label}
        </label>
        {/* High-contrast value badge */}
        <div
          className={`inline-flex items-baseline gap-1.5 whitespace-nowrap px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl bg-background/60 border border-white/15 ring-1 ${accentRing} backdrop-blur-sm`}
        >
          <span className="text-lg md:text-2xl lg:text-3xl font-bold text-gradient tabular-nums leading-none whitespace-nowrap">
            {value}
          </span>
          <span className="text-[10px] md:text-xs text-muted-foreground font-mono uppercase tracking-wider">{unit}</span>
        </div>
      </div>

      <Slider
        value={sliderValue}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        aria-valuetext={valueText}
        className="my-2 md:my-3"
      />

      {/* Tick markers timeline */}
      {/* Tick markers timeline — inset by half the thumb width so they line up with the thumb's center,
          which travels from (thumbW/2) to (trackW - thumbW/2), not 0% to 100% of the track. */}
      <div
        className="relative mt-1.5 h-7 [--thumb:1.5rem] md:[--thumb:1.25rem]"
        style={{ marginLeft: "calc(var(--thumb) / 2)", marginRight: "calc(var(--thumb) / 2)" }}
        aria-hidden="true"
      >
        {ticks.map((t) => {
          const pct = ((t - min) / (max - min)) * 100;
          const isPassed = current >= t;
          return (
            <div
              key={t}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
            >
              <span
                className={`block w-px h-2 transition-colors duration-300 ${
                  isPassed
                    ? accent === "primary"
                      ? "bg-primary"
                      : "bg-secondary"
                    : "bg-muted-foreground/30"
                }`}
              />
              <span
                className={`mt-1 text-[11px] font-mono tabular-nums transition-colors duration-300 ${
                  isPassed ? "text-foreground/80" : "text-muted-foreground/65"
                }`}
              >
                {tickFormatter(t)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Stat = ({
  icon: Icon,
  label,
  children,
  accent,
  highlight,
  gradient,
  className = "",
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
  accent: "primary" | "secondary";
  highlight?: boolean;
  gradient?: boolean;
  className?: string;
}) => (
  <div
    className={`${
      highlight
        ? "btn-hero-glass"
        : gradient
          ? "bg-background/60 border border-white/15 ring-1 ring-primary/40 shadow-glow-blue backdrop-blur-sm"
          : "glass"
    } rounded-xl p-2.5 md:p-3 transition-all flex flex-col ${className}`}
  >
    <div className="flex items-start gap-1.5 mb-0.5 min-h-[2rem]">
      <Icon
        className={`w-3.5 h-3.5 ${
          highlight
            ? "text-white"
            : accent === "primary"
              ? "text-primary"
              : "text-secondary"
        }`}
      />
      <span
        className={`text-[11px] font-mono uppercase tracking-wider ${
          highlight ? "text-white/80" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
    <div
      className={`text-base md:text-lg font-bold tabular-nums mt-auto ${
        highlight ? "text-white" : gradient ? "text-gradient" : ""
      }`}
    >
      {children}
    </div>
  </div>
);
