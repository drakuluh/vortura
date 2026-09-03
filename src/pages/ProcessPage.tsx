import { Link } from "react-router-dom";
import {
  Search,
  Wrench,
  Rocket,
  X,
  Check,
  ArrowRight,
  FileText,
  MessageSquare,
  BarChart3,
  Bot,
  Plug,
  TestTube,
  GraduationCap,
  HeadphonesIcon,
  TrendingUp,
  Gauge,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { SparklesText } from "@/components/ui/sparkles-text";
import { Counter } from "@/components/effects/Counter";
import { useIsMobile } from "@/hooks/use-mobile";
import { FloatCard } from "@/hooks/use-tilt";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ── Animation helpers ──────────────────────────────────── */

const useAnimProps = () => {
  const isMobile = useIsMobile();
  const header = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };
  const reveal = (i = 0) =>
    isMobile
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.6, ease: "easeOut" as const, delay: 0.08 * i },
        };
  return { header, reveal, isMobile };
};

/* ── Data ───────────────────────────────────────────────── */

const OLD_VS_NEW = {
  old: [
    "Missed calls go to voicemail — leads lost",
    "Manual follow-ups forgotten or delayed",
    "Hours wasted on repetitive admin tasks",
    "No data on what's working and what isn't",
    "Scaling means hiring more people",
  ],
  new: [
    "Every call answered 24/7 by your AI agent",
    "Instant, automated follow-ups every time",
    "Admin tasks handled while you sleep",
    "Real-time dashboards and performance data",
    "Scaling means turning a dial, not posting a job",
  ],
};

const STATS = [
  { value: 30, suffix: "", label: "Average days to ROI" },
  { value: 24, suffix: "/7", label: "Always-on monitoring" },
  { value: 7, suffix: "-day", label: "Blueprint delivery" },
  { value: 97, suffix: "%", label: "Client satisfaction" },
];

const PROCESS_FAQS = [
  {
    q: "What if I'm not technical?",
    a: "You don't need to be. We handle everything — from setup to training. If you can use a smartphone, you can use our systems. Every client gets a walkthrough and documentation written in plain English.",
  },
  {
    q: "How long until I see results?",
    a: "Most clients see measurable ROI within 30 days of launch. During the build phase, we prioritize the automations that will have the fastest impact on your bottom line.",
  },
  {
    q: "What happens after launch?",
    a: "We don't disappear. Your systems are monitored 24/7, and you get monthly performance reports. We proactively optimize based on real data and roll out improvements as AI technology evolves.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. We don't lock you into long-term contracts. We keep clients because we deliver results, not because of fine print. You own everything we build for you.",
  },
  {
    q: "Do you work with businesses outside the GTA?",
    a: "Absolutely. While many of our clients are in Mississauga, Brampton, and Toronto, everything we build works remotely. We serve businesses across Canada and the US.",
  },
];

/* ── Step visual components ─────────────────────────────── */

const DiscoveryVisual = () => (
  <div className="glass rounded-2xl p-5 space-y-3">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 rounded-full bg-red-400" />
      <div className="w-2 h-2 rounded-full bg-yellow-400" />
      <div className="w-2 h-2 rounded-full bg-green-400" />
      <span className="ml-2 font-mono text-[10px] text-muted-foreground tracking-wider">WORKFLOW AUDIT</span>
    </div>
    {[
      { label: "Missed calls / week", value: "23", delta: "-$9,200/mo", bad: true },
      { label: "Avg. response time", value: "4.2 hrs", delta: "Industry: 15 min", bad: true },
      { label: "Manual follow-ups", value: "67%", delta: "Can automate", bad: true },
    ].map((row) => (
      <div key={row.label} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
        <span className="text-xs text-foreground/70">{row.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-depth">{row.value}</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${row.bad ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-green-400"}`}>
            {row.delta}
          </span>
        </div>
      </div>
    ))}
    <div className="mt-3 pt-3 border-t border-white/[0.06]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Automation opportunity</span>
        <span className="text-sm font-bold text-gradient">$142,000/yr</span>
      </div>
    </div>
  </div>
);

const BuildVisual = () => (
  <div className="glass rounded-2xl p-5">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 rounded-full bg-red-400" />
      <div className="w-2 h-2 rounded-full bg-yellow-400" />
      <div className="w-2 h-2 rounded-full bg-green-400" />
      <span className="ml-2 font-mono text-[10px] text-muted-foreground tracking-wider">INTEGRATION STATUS</span>
    </div>
    <div className="space-y-2.5">
      {[
        { name: "AI Call Agent", status: "Live", icon: Bot },
        { name: "CRM Integration", status: "Live", icon: Plug },
        { name: "Auto Follow-ups", status: "Live", icon: MessageSquare },
        { name: "Analytics Dashboard", status: "Testing", icon: BarChart3 },
        { name: "Review Requests", status: "Queued", icon: TestTube },
      ].map((item) => {
        const Icon = item.icon;
        const colors = {
          Live: "bg-green-500/15 text-green-400 border-green-500/25",
          Testing: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
          Queued: "bg-white/[0.06] text-muted-foreground border-white/[0.08]",
        };
        return (
          <div key={item.name} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <Icon className="w-4 h-4 text-primary/60 shrink-0" />
            <span className="text-xs text-foreground/70 flex-1">{item.name}</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${colors[item.status as keyof typeof colors]}`}>
              {item.status}
            </span>
          </div>
        );
      })}
    </div>
    <div className="mt-4 pt-3 border-t border-white/[0.06]">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary to-secondary" />
        </div>
        <span className="text-[11px] font-mono text-primary">72%</span>
      </div>
    </div>
  </div>
);

const LaunchVisual = () => (
  <div className="glass rounded-2xl p-5">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 rounded-full bg-red-400" />
      <div className="w-2 h-2 rounded-full bg-yellow-400" />
      <div className="w-2 h-2 rounded-full bg-green-400" />
      <span className="ml-2 font-mono text-[10px] text-muted-foreground tracking-wider">PERFORMANCE — MONTH 1</span>
    </div>
    <div className="grid grid-cols-2 gap-2.5 mb-4">
      {[
        { label: "Calls answered", value: "347", change: "+100%" },
        { label: "Leads captured", value: "89", change: "+215%" },
        { label: "Response time", value: "8 sec", change: "-97%" },
        { label: "Revenue recovered", value: "$12.4k", change: "+∞" },
      ].map((m) => (
        <div key={m.label} className="py-3 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
          <p className="text-lg font-bold text-depth">{m.value}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
          <span className="text-[10px] font-mono text-green-400">{m.change}</span>
        </div>
      ))}
    </div>
    <div className="flex items-center gap-2 py-2.5 px-3 rounded-lg bg-green-500/[0.08] border border-green-500/20">
      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      <span className="text-xs text-green-400">All systems operational — monitored 24/7</span>
    </div>
  </div>
);

/* ── Component ──────────────────────────────────────────── */

const ProcessPage = () => {
  const { header, reveal, isMobile } = useAnimProps();

  return (
    <PageLayout>
      <Seo
        title="Our Process"
        description="From discovery call to launch in 30 days. See exactly how Vortura builds, integrates, and scales AI automations for your business."
      />
      <div className="relative overflow-hidden">
        <PageHeroBg />

        {/* ── Hero ──────────────────────────────────────── */}
        <section className="relative z-10 pt-16 md:pt-20 lg:pt-28 pb-12 md:pb-16 lg:pb-20">
          <div className="container">
            <motion.div className="max-w-3xl mx-auto text-center" {...header}>
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-depth mb-2.5 whitespace-nowrap">
                From first call to{" "}
                <SparklesText text="full automation." className="text-gradient" />
              </h1>
              <p className="text-sm text-muted-foreground lg:whitespace-nowrap">
                A proven process built around speed, transparency, and measurable results. Most clients see ROI within 30 days.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Old Way vs Vortura Way ────────────────────── */}
        <section className="relative z-10 pb-16 md:pb-20 lg:pb-28">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <motion.div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-0 items-end mb-6 md:mb-8" {...header}>
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-depth text-center">
                  The old way
                </h2>
                <span className="hidden md:block text-lg md:text-xl font-semibold text-muted-foreground px-4 pb-1">
                  Vs.
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-depth text-center">
                  <SparklesText text="The Vortura way" className="text-gradient" />
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                {/* Old way */}
                <motion.div
                  className="glass rounded-2xl p-6 md:p-8 border border-white/[0.06]"
                  {...reveal(0)}
                >
                  <ul className="space-y-4">
                    {OLD_VS_NEW.old.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 w-5 h-5 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                          <X className="w-3 h-3 text-red-400" />
                        </span>
                        <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Vortura way */}
                <motion.div
                  className="glass-strong rounded-2xl p-6 md:p-8 border-gradient"
                  {...reveal(1)}
                >
                  <ul className="space-y-4">
                    {OLD_VS_NEW.new.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 w-5 h-5 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </span>
                        <span className="text-sm text-foreground/85 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Step 1: Discovery & Audit ─────────────────── */}
      <section className="relative py-10 md:py-12 lg:py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <motion.div className="mb-8 md:mb-12" {...header}>
              <div className="flex items-center gap-3 mb-4">
                <div className="btn-hero-glass pointer-events-none w-12 h-12 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-mono text-[11px] text-primary tracking-widest">STEP 01 — WEEK 1</span>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-depth">
                    Discovery &{" "}
                    <SparklesText text="audit." className="text-gradient" />
                  </h2>
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <motion.div {...reveal(0)}>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                  Every engagement starts with a free 30-minute discovery call. We learn your business, your pain points, and your goals. Then we go deep — auditing your workflows, mapping every process that touches your revenue, and quantifying exactly where time and money are being lost.
                </p>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
                  By day 7, you receive a custom automation blueprint — a detailed roadmap of what to build, in what order, and why. No jargon, no fluff. Just a clear plan with deliverables, milestones, and pricing.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: MessageSquare, text: "Free 30-minute consultation" },
                    { icon: BarChart3, text: "Full workflow audit & gap analysis" },
                    { icon: FileText, text: "Custom automation blueprint" },
                    { icon: Gauge, text: "ROI projections for every automation" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.text} className="flex items-start gap-3">
                        <span className="mt-0.5 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </span>
                        <span className="text-sm text-foreground/80 leading-relaxed">{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div {...reveal(1)}>
                <FloatCard duration={7}>
                  <DiscoveryVisual />
                </FloatCard>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 2: Build & Integrate ─────────────────── */}
      <section className="relative py-10 md:py-12 lg:py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <motion.div className="mb-8 md:mb-12 lg:text-right" {...header}>
              <div className="flex items-center gap-3 mb-4 lg:flex-row-reverse">
                <div className="btn-hero-glass pointer-events-none w-12 h-12 rounded-xl flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-mono text-[11px] text-primary tracking-widest">STEP 02 — WEEKS 2–3</span>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-depth">
                    Build &{" "}
                    <SparklesText text="integrate." className="text-gradient" />
                  </h2>
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <motion.div {...reveal(1)}>
                <FloatCard duration={8}>
                  <BuildVisual />
                </FloatCard>
              </motion.div>

              <motion.div {...reveal(0)}>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                  This is where the blueprint comes to life. Our team builds your custom AI agents and wires them directly into your existing tools — your CRM, phone system, calendar, and anything else in your stack. Zero disruption to your current operations.
                </p>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
                  Every integration is rigorously tested before anything goes live. You get a private dashboard where you can track build progress in real time, and we check in with you regularly so there are never any surprises.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Bot, text: "Custom AI agents built to spec" },
                    { icon: Plug, text: "Direct CRM, phone & calendar integrations" },
                    { icon: TestTube, text: "Rigorous QA testing before launch" },
                    { icon: BarChart3, text: "Real-time build progress dashboard" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.text} className="flex items-start gap-3">
                        <span className="mt-0.5 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </span>
                        <span className="text-sm text-foreground/80 leading-relaxed">{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 3: Launch & Scale ─────────────────────── */}
      <section className="relative py-10 md:py-12 lg:py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <motion.div className="mb-8 md:mb-12" {...header}>
              <div className="flex items-center gap-3 mb-4">
                <div className="btn-hero-glass pointer-events-none w-12 h-12 rounded-xl flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-mono text-[11px] text-primary tracking-widest">STEP 03 — WEEK 4 & BEYOND</span>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-depth">
                    Launch &{" "}
                    <SparklesText text="scale." className="text-gradient" />
                  </h2>
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <motion.div {...reveal(0)}>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                  We flip the switch together. Your team gets hands-on training, full documentation, and video walkthroughs so everyone knows exactly how the new systems work. Launch day is guided — we monitor everything in real time to catch and resolve any issues instantly.
                </p>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
                  But we don't disappear after launch. Your systems are monitored 24/7, and you get monthly performance reports with actionable insights. We proactively optimize based on real data, roll out improvements as AI technology evolves, and you get priority support whenever you need it.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: GraduationCap, text: "Hands-on training & documentation" },
                    { icon: HeadphonesIcon, text: "Priority support & 24/7 monitoring" },
                    { icon: TrendingUp, text: "Monthly performance reports" },
                    { icon: Gauge, text: "Proactive optimization & updates" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.text} className="flex items-start gap-3">
                        <span className="mt-0.5 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </span>
                        <span className="text-sm text-foreground/80 leading-relaxed">{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div {...reveal(1)}>
                <FloatCard duration={9}>
                  <LaunchVisual />
                </FloatCard>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── By the Numbers ────────────────────────────── */}
      <section className="relative py-10 md:py-14 lg:py-20">
        <div className="container">
          <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-depth mb-2.5">
              By the{" "}
              <SparklesText text="numbers." className="text-gradient" />
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="glass-strong rounded-2xl p-5 md:p-6 text-center flex flex-col items-center justify-between aspect-square"
                {...reveal(i)}
              >
                <div />
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ───────────────────────────────── */}
      <section className="relative py-10 md:py-14 lg:py-20">
        <div className="container">
          <FloatCard duration={8} className="max-w-3xl mx-auto">
            <motion.div
              className="glass-strong border-gradient rounded-2xl p-8 md:p-10 lg:p-12 text-center"
              {...reveal(0)}
            >
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-base md:text-lg lg:text-xl text-foreground/90 leading-relaxed mb-6 italic">
              "Vortura took us from missing half our calls to never missing one. The whole process was seamless — we were up and running in under three weeks."
            </blockquote>
            <div>
              <p className="text-sm font-semibold text-depth">Local Business Owner</p>
              <p className="text-xs text-muted-foreground">Mississauga, ON</p>
            </div>
            </motion.div>
          </FloatCard>
        </div>
      </section>

      {/* ── Process FAQ ───────────────────────────────── */}
      <section className="relative py-12 md:py-16 lg:py-24">
        <div className="container">
          <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-depth mb-2.5">
              Common{" "}
              <SparklesText text="questions." className="text-gradient" />
            </h2>
            <p className="text-sm text-muted-foreground">
              Everything you need to know before getting started.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {PROCESS_FAQS.map((item, i) => (
                <AccordionItem
                  key={item.q}
                  value={`item-${i}`}
                  className="glass rounded-2xl border border-white/10 px-5 md:px-6 overflow-hidden"
                >
                  <AccordionTrigger className="py-4 md:py-5 text-left text-[15px] md:text-base font-semibold tracking-tight hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm md:text-[15px] leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="relative py-12 md:py-16 lg:py-24">
        <div className="container">
          <motion.div
            className="glass-strong border-gradient rounded-3xl p-8 md:p-12 lg:p-16 max-w-3xl mx-auto text-center"
            {...reveal(0)}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-depth mb-3">
              Ready to{" "}
              <SparklesText text="automate?" className="text-gradient" />
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-md mx-auto">
              Book a free discovery call. We'll map your workflows, identify the biggest opportunities, and show you exactly what's possible.
            </p>
            <Link
              to="/contact"
              className="btn-hero-glass inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base md:text-lg font-semibold"
            >
              Book a call <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default ProcessPage;
