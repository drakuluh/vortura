import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDown, ArrowUp, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { Seo } from "@/components/Seo";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "AI Automation", "Web Design", "Workflow Automation", "E-Commerce"] as const;
type Category = (typeof CATEGORIES)[number];

type CaseStudy = {
  title: string;
  industry: string;
  challenge: string;
  solution: string;
  techStack: string[];
  metrics: { value: string; label: string; direction: "up" | "down" }[];
  category: Category;
  featured?: boolean;
};

const CASE_STUDIES: CaseStudy[] = [
  {
    title: "Automated Voice Receptionist for Local Trades",
    industry: "Residential HVAC & Plumbing Contractor",
    challenge:
      "High volume of missed incoming calls during active job site hours, leading to lost estimate opportunities and delayed customer response times.",
    solution:
      "Implemented an AI-powered voice receptionist configured to answer 24/7, capture caller job details, qualify service requests, and auto-book estimates directly into the CRM calendar.",
    techStack: ["Retell AI", "Custom Webhooks", "Google Calendar API", "CRM"],
    metrics: [
      { value: "100%", label: "Call answer rate", direction: "up" },
      { value: "0", label: "Missed after-hours inquiries", direction: "down" },
      { value: "<30s", label: "Automated booking flow", direction: "down" },
    ],
    category: "AI Automation",
    featured: true,
  },
  {
    title: "Modern Web Redesign & Mobile Speed Optimization",
    industry: "Independent Local Restaurant & Bar",
    challenge:
      "Outdated, slow-loading legacy website with non-responsive PDF menus, causing poor mobile user experience and high bounce rates on local search.",
    solution:
      "Built a modern, lightweight, mobile-first web application featuring instantly readable digital menus, streamlined table reservation links, and optimized local SEO structured data.",
    techStack: ["React", "TypeScript", "Tailwind CSS", "Vercel"],
    metrics: [
      { value: "<0.8s", label: "Page load time", direction: "down" },
      { value: "100", label: "Lighthouse mobile score", direction: "up" },
    ],
    category: "Web Design",
  },
  {
    title: "Inbound Lead Qualification & CRM Sync Pipeline",
    industry: "Boutique Real Estate Brokerage",
    challenge:
      "Inbound web inquiries from property landing pages sitting unaddressed in email inboxes for hours, lowering overall lead conversion rates.",
    solution:
      "Designed an instant lead-capture workflow that parses web form inquiries, validates phone and email data, sends an instant SMS response, and assigns the lead to an available agent in real time.",
    techStack: ["Custom Webhooks", "Automation Workflows", "Twilio API", "CRM Integration"],
    metrics: [
      { value: "<60s", label: "Lead response time", direction: "down" },
      { value: "100%", label: "Automated lead routing", direction: "up" },
    ],
    category: "Workflow Automation",
  },
  {
    title: "E-Commerce Order Tracking & Support Automation",
    industry: "Specialized Niche DTC Store",
    challenge:
      "Support inbox overwhelmed with repetitive \"Where is my order?\" tickets, delaying responses to complex customer inquiries.",
    solution:
      "Deployed an automated support interface connected directly to order fulfillment databases to provide instant order tracking updates and handle routine return policy inquiries.",
    techStack: ["REST APIs", "Custom JavaScript Interface", "E-Commerce Platform API"],
    metrics: [
      { value: "60%+", label: "Reduction in manual tickets", direction: "down" },
      { value: "<1s", label: "Instant status retrieval", direction: "down" },
    ],
    category: "E-Commerce",
  },
  {
    title: "Automated Client Onboarding & Intake Workflow",
    industry: "Professional Services & Consulting Firm",
    challenge:
      "Manual back-and-forth emails required to collect onboarding documents, client intake forms, and initial project deposits.",
    solution:
      "Built a unified, step-by-step client onboarding portal that automatically collects required documentation, generates dynamic agreements, and triggers initial team tasks upon kickoff.",
    techStack: ["Custom Web Portal", "Stripe API", "Document Generation Workflows"],
    metrics: [
      { value: "Days → Min", label: "Onboarding time", direction: "down" },
      { value: "100%", label: "Automated doc & deposit collection", direction: "up" },
    ],
    category: "Workflow Automation",
  },
];

const ResultsPage = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const isMobile = useIsMobile();

  const headerAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" as const },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };

  const reveal = (i: number) =>
    isMobile
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" as const },
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay: 0.06 * i },
        };

  const featured = CASE_STUDIES.find((c) => c.featured);
  const grid = CASE_STUDIES.filter(
    (c) => !c.featured && (activeCategory === "All" || c.category === activeCategory)
  );

  const MetricBadge = ({ m }: { m: CaseStudy["metrics"][number] }) => (
    <div className="glass rounded-xl border border-white/10 px-4 py-3 min-w-[120px]">
      <div className="flex items-center gap-1.5 mb-0.5">
        {m.direction === "up" ? (
          <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
        )}
        <span className="text-lg font-bold text-gradient">{m.value}</span>
      </div>
      <p className="text-[11px] text-muted-foreground">{m.label}</p>
    </div>
  );

  return (
    <PageLayout>
      <Seo
        title="Results"
        description="Real results from real businesses. See how Vortura Agency drives revenue, reviews, and growth for local businesses."
      />
      <div className="relative overflow-hidden">
        <PageHeroBg />

        <section className="relative z-10 pt-24 md:pt-24 lg:pt-32 pb-12 md:pb-16">
          <div className="container max-w-5xl">
            {/* Hero */}
            <motion.div className="text-center mb-8 md:mb-10" {...headerAnim}>
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5">
                Results that speak{" "}
                <span className="text-gradient">for themselves.</span>
              </h1>
              <p className="text-sm text-muted-foreground lg:whitespace-nowrap">
                Every engagement is measured by what moves the needle — more calls, more reviews, more revenue.
              </p>
            </motion.div>

            {/* Featured case study */}
            {featured && (
              <motion.div className="mb-14 md:mb-20" {...reveal(0)}>
                <div className="relative">
                  <div
                    aria-hidden
                    className="absolute -inset-px rounded-3xl bg-gradient-primary blur-md opacity-30 pointer-events-none"
                  />
                  <div className="relative glass-strong border-gradient rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 overflow-hidden">
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-[11px] font-mono uppercase tracking-widest text-primary">
                          <TrendingUp className="w-3 h-3" />
                          Featured
                        </span>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
                          {featured.category}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60 mb-2">
                        {featured.industry}
                      </p>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-depth leading-snug mb-4 max-w-3xl">
                        {featured.title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3 max-w-2xl">
                        <span className="text-foreground/70 font-medium">Challenge:</span>{" "}
                        {featured.challenge}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                        <span className="text-foreground/70 font-medium">Solution:</span>{" "}
                        {featured.solution}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {featured.techStack.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-muted-foreground/70"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-4 mb-8">
                        {featured.metrics.map((m, i) => (
                          <MetricBadge key={i} m={m} />
                        ))}
                      </div>
                      <Link
                        to="/contact"
                        className="btn-hero-glass inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
                      >
                        Get started <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <TrustedBy />

          <div className="container max-w-5xl">
            {/* Category filter tabs */}
            <motion.div className="flex flex-wrap justify-center gap-2 mb-10" {...reveal(1)}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border",
                    activeCategory === cat
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20 hover:bg-white/[0.08]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* Case study grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {grid.map((study, i) => (
                <motion.div key={`${study.title}-${i}`} {...reveal(i + 2)}>
                  <div className="h-full glass rounded-2xl border border-white/10 p-5 sm:p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                        {study.industry}
                      </p>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-primary/70 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5">
                        {study.category}
                      </span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-foreground/90 leading-snug mb-3">
                      {study.title}
                    </h3>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed mb-2">
                      <span className="text-foreground/60 font-medium">Challenge:</span>{" "}
                      {study.challenge}
                    </p>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed mb-4 flex-1">
                      <span className="text-foreground/60 font-medium">Solution:</span>{" "}
                      {study.solution}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {study.techStack.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[9px] font-mono text-muted-foreground/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.06]">
                      {study.metrics.map((m, j) => (
                        <div key={j} className="flex items-center gap-1.5">
                          {m.direction === "up" ? (
                            <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          <span className="text-sm font-bold text-gradient">{m.value}</span>
                          <span className="text-[10px] text-muted-foreground">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {grid.length === 0 && (
              <motion.p className="text-center text-muted-foreground/50 py-12 text-sm" {...reveal(2)}>
                No case studies in this category yet — check back soon.
              </motion.p>
            )}

            {/* Bottom CTA */}
            <motion.div className="text-center mt-16 md:mt-20" {...reveal(grid.length + 3)}>
              <p className="text-muted-foreground mb-4 text-sm">
                Want results like these for your business?
              </p>
              <Link
                to="/contact"
                className="btn-hero-glass inline-flex items-center gap-2 px-7 py-3 rounded-xl text-base font-semibold"
              >
                Book a call <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default ResultsPage;
