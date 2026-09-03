import { useEffect, useMemo, useRef, useState, MouseEvent } from "react";
import { motion, useInView } from "framer-motion";
import { Search, Sparkles, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/* ============================================================
 * 1. Scramble / decrypt text
 * ============================================================ */
const CHARS = "!<>-_\\/[]{}—=+*^?#________";
const ScrambleText = ({ text, trigger }: { text: string; trigger: number }) => {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    let frame = 0;
    const queue = text.split("").map((char, i) => ({
      from: CHARS[Math.floor(Math.random() * CHARS.length)],
      to: char,
      start: Math.floor(Math.random() * 20) + i,
      end: Math.floor(Math.random() * 30) + i + 20,
      char: "",
    }));
    let raf: number;
    const update = () => {
      let output = "";
      let complete = 0;
      for (const q of queue) {
        if (frame >= q.end) {
          complete++;
          output += q.to;
        } else if (frame >= q.start) {
          if (!q.char || Math.random() < 0.28) {
            q.char = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          output += q.char;
        } else {
          output += q.from;
        }
      }
      setDisplay(output);
      if (complete < queue.length) {
        frame++;
        raf = requestAnimationFrame(update);
      }
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [text, trigger]);
  return <span className="font-mono">{display}</span>;
};

/* ============================================================
 * 2. Magnetic button
 * ============================================================ */
const MagneticButton = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPos({ x: x * 0.35, y: y * 0.35 });
  };
  return (
    <button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-primary text-primary-foreground font-medium text-sm shadow-glow-blue transition-transform duration-200 ease-out"
    >
      <Sparkles className="w-4 h-4" />
      Hover me
    </button>
  );
};

/* ============================================================
 * 3. Split-text reveal on scroll
 * ============================================================ */
const SplitReveal = ({ text }: { text: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-20%" });
  return (
    <div ref={ref} className="text-2xl md:text-3xl font-bold tracking-tight">
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-2 align-bottom">
          <motion.span
            initial={{ y: "100%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
};

/* ============================================================
 * 4. Marquee strip
 * ============================================================ */
const MARQUEE_ITEMS = [
  "Plumbers",
  "Med Spas",
  "Roofers",
  "Dentists",
  "HVAC",
  "Electricians",
  "Salons",
  "Auto Shops",
  "Law Firms",
  "Clinics",
];
const Marquee = () => (
  <div className="relative overflow-hidden py-3 mask-fade-x">
    <div className="flex gap-10 animate-marquee whitespace-nowrap">
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
        <span
          key={i}
          className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70"
        >
          {item} <span className="text-primary/50">·</span>
        </span>
      ))}
    </div>
  </div>
);

/* ============================================================
 * 5. Animated counter
 * ============================================================ */
const Counter = ({ to, suffix = "", duration = 1600 }: { to: number; suffix?: string; duration?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: "-20%" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) {
      setVal(0);
      return;
    }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return (
    <span ref={ref} className="text-4xl md:text-5xl font-bold tracking-tight text-gradient">
      {val.toLocaleString()}
      {suffix}
    </span>
  );
};

/* ============================================================
 * 6. Cursor spotlight card
 * ============================================================ */
const SpotlightCard = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setPos({ x: -200, y: -200 })}
      className="relative overflow-hidden glass rounded-2xl p-6 group"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, hsl(var(--primary) / 0.15), transparent 60%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
};

/* ============================================================
 * 7. Story-link hover underline
 * ============================================================ */
const StoryLinks = () => (
  <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
    {["Services", "About", "Process", "Contact"].map((label) => (
      <a
        key={label}
        href="#"
        className="story-link text-foreground/80 hover:text-foreground"
      >
        {label}
      </a>
    ))}
  </div>
);

/* ============================================================
 * 8. Suggested-prompt chips (chat upgrade preview)
 * ============================================================ */
const PROMPTS = [
  "How much for AI calls?",
  "Show me ROI",
  "How fast can we launch?",
  "What's included?",
];
const PromptChips = () => {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => setPicked(p)}
            className="px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-white/[0.04] border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/[0.08] hover:border-primary/40 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground min-h-[1.25rem]">
        {picked ? <>Selected: <span className="text-foreground">{picked}</span></> : "Click a prompt to preview."}
      </p>
    </div>
  );
};

/* ============================================================
 * 9. Live ticker
 * ============================================================ */
const LiveTicker = () => {
  const [count, setCount] = useState(1247);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 3) + 1), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full glass">
      <span className="relative flex w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-60" />
        <span className="relative w-2 h-2 rounded-full bg-primary shadow-glow-blue" />
      </span>
      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="font-mono text-xs">
        <span className="text-foreground font-semibold tabular-nums">{count.toLocaleString()}</span>
        <span className="text-muted-foreground"> calls answered today</span>
      </span>
    </div>
  );
};

/* ============================================================
 * 10. Typewriter loop
 * ============================================================ */
const TYPEWRITER_LINES = [
  "AI answers your calls.",
  "Bookings while you sleep.",
  "Never miss a lead again.",
];
const TypewriterLoop = () => {
  const [lineIdx, setLineIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const line = TYPEWRITER_LINES[lineIdx];
    const speed = deleting ? 40 : 80;
    const timeout = setTimeout(() => {
      if (!deleting) {
        const next = line.slice(0, text.length + 1);
        setText(next);
        if (next === line) setTimeout(() => setDeleting(true), 1500);
      } else {
        const next = line.slice(0, text.length - 1);
        setText(next);
        if (next === "") {
          setDeleting(false);
          setLineIdx((i) => (i + 1) % TYPEWRITER_LINES.length);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [text, deleting, lineIdx]);

  return (
    <div className="font-mono text-sm text-foreground/90">
      <span>{text}</span>
      <span className="inline-block w-[2px] h-[1em] bg-primary animate-blink ml-0.5 align-middle shadow-glow-blue" />
    </div>
  );
};

/* ============================================================
 * 11. Wave reveal
 * ============================================================ */
const WAVE_TEXT = "Turn missed calls into revenue.";
const WaveReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-20%" });
  return (
    <div ref={ref} className="text-lg md:text-xl font-semibold tracking-tight">
      {WAVE_TEXT.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  );
};

/* ============================================================
 * 12. Shimmer text
 * ============================================================ */
const ShimmerText = ({ text }: { text: string }) => (
  <span className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
    {text}
  </span>
);

/* ============================================================
 * 13. Hover scramble
 * ============================================================ */
const HoverScramble = ({ text }: { text: string }) => {
  const [display, setDisplay] = useState(text);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!hovered) {
      setDisplay(text);
      return;
    }
    let frame = 0;
    const queue = text.split("").map((char, i) => ({
      from: CHARS[Math.floor(Math.random() * CHARS.length)],
      to: char,
      start: Math.floor(Math.random() * 10) + i,
      end: Math.floor(Math.random() * 20) + i + 10,
      char: "",
    }));
    let raf: number;
    const update = () => {
      let output = "";
      let complete = 0;
      for (const q of queue) {
        if (frame >= q.end) {
          complete++;
          output += q.to;
        } else if (frame >= q.start) {
          if (!q.char || Math.random() < 0.35) {
            q.char = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          output += q.char;
        } else {
          output += q.from;
        }
      }
      setDisplay(output);
      if (complete < queue.length) {
        frame++;
        raf = requestAnimationFrame(update);
      }
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [hovered, text]);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="font-mono text-lg cursor-default select-none"
    >
      {display}
    </span>
  );
};

/* ============================================================
 * Wrapper card
 * ============================================================ */
const DemoCard = ({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="glass rounded-2xl p-6 flex flex-col gap-4">
    <div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-1.5">
        // {number} — {title}
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
    <div className="flex-1 flex items-center justify-center min-h-[120px]">{children}</div>
  </div>
);

export const EffectsShowcase = () => {
  const [scrambleKey, setScrambleKey] = useState(0);
  const phrases = useMemo(
    () => ["AUTOMATE EVERYTHING", "MISS ZERO CALLS", "BOOK MORE JOBS", "GROW ON AUTOPILOT"],
    []
  );
  const [phraseIdx, setPhraseIdx] = useState(0);

  return (
    <div className="container relative z-10 max-w-5xl mt-16 md:mt-20">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-depth mb-2">
          Live previews of every effect
        </h2>
        <p className="text-xs text-muted-foreground">
          Hover, scroll, and click to see each one in action.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DemoCard
          number="01"
          title="Scramble / decrypt text"
          description="Letters cycle through random characters then resolve. Great for eyebrow tags."
        >
          <div className="flex flex-col items-center gap-3">
            <div className="text-lg text-foreground">
              <ScrambleText text={phrases[phraseIdx]} trigger={scrambleKey} />
            </div>
            <button
              onClick={() => {
                setPhraseIdx((i) => (i + 1) % phrases.length);
                setScrambleKey((k) => k + 1);
              }}
              className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              [ replay ]
            </button>
          </div>
        </DemoCard>

        <DemoCard
          number="02"
          title="Magnetic button"
          description="The button subtly tracks your cursor. Premium feel for primary CTAs."
        >
          <MagneticButton>Hover me</MagneticButton>
        </DemoCard>

        <DemoCard
          number="03"
          title="Split-text reveal"
          description="Words slide up word-by-word as the section enters the viewport. Scroll to retrigger."
        >
          <SplitReveal text="Built for local business." />
        </DemoCard>

        <DemoCard
          number="04"
          title="Marquee logo strip"
          description="Endlessly scrolling row of industries or client logos."
        >
          <div className="w-full">
            <Marquee />
          </div>
        </DemoCard>

        <DemoCard
          number="05"
          title="Animated counter"
          description="Numbers count up when scrolled into view. Perfect for ROI stats."
        >
          <div className="flex items-end gap-1">
            <Counter to={4488} suffix="" />
            <span className="text-xs font-mono text-muted-foreground mb-2">/mo lift</span>
          </div>
        </DemoCard>

        <DemoCard
          number="06"
          title="Cursor spotlight"
          description="A soft radial light follows the mouse inside the card."
        >
          <SpotlightCard>
            <p className="text-sm text-foreground/80 max-w-xs">
              Move your cursor across this card to see the spotlight follow.
            </p>
          </SpotlightCard>
        </DemoCard>

        <DemoCard
          number="07"
          title="Story-link underline"
          description="Animated underline sweeps in from left on hover. Subtle but tactile."
        >
          <StoryLinks />
        </DemoCard>

        <DemoCard
          number="08"
          title="Suggested prompt chips"
          description="Quick-fire buttons that pre-fill the chat for users who don't know what to ask."
        >
          <PromptChips />
        </DemoCard>

        <DemoCard
          number="09"
          title="Live ticker"
          description="A pulsing live counter — works great in the footer or hero."
        >
          <LiveTicker />
        </DemoCard>

        <DemoCard
          number="10"
          title="Command palette teaser"
          description="Press ⌘K (mock) to jump anywhere. Real implementation would open a search overlay."
        >
          <button className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg glass text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-3.5 h-3.5" />
            <span>Search VORTURA…</span>
            <kbd className="ml-3 px-1.5 py-0.5 rounded bg-white/10 text-[11px] font-mono">⌘K</kbd>
          </button>
        </DemoCard>

        <DemoCard
          number="11"
          title="Typewriter loop"
          description="Terminal-style typing that cycles through headlines. Click the card to restart."
        >
          <TypewriterLoop />
        </DemoCard>

        <DemoCard
          number="12"
          title="Wave reveal"
          description="Characters stagger in with a wave delay as the card scrolls into view."
        >
          <WaveReveal />
        </DemoCard>

        <DemoCard
          number="13"
          title="Shimmer text"
          description="An animated gradient continuously sweeps across the headline."
        >
          <ShimmerText text="Scale without effort." />
        </DemoCard>

        <DemoCard
          number="14"
          title="Hover scramble"
          description="Text scrambles on mouse hover, then resolves. Great for secret labels or Easter eggs."
        >
          <HoverScramble text="LOCAL GROWTH" />
        </DemoCard>
      </div>

      <div className="mt-10 text-center">
        <p className="text-xs text-muted-foreground mb-4">
          Want any of these built into the real site?
        </p>
        <Button variant="hero" asChild>
          <Link to="/contact">
            Let's talk <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};