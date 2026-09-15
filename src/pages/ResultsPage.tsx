import { motion } from "framer-motion";
import { ArrowRight, ArrowUp, ArrowDown, Quote, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { Seo } from "@/components/Seo";
import { Counter } from "@/components/effects/Counter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHeaderAnim, useRevealAnim, useScaleRevealAnim } from "@/hooks/use-anim";
import { TESTIMONIALS } from "@/data/testimonials";
import { TestimonialCard, type TestimonialCardProps } from "@/components/ui/testimonial-card";

const COMMUNITY_TESTIMONIALS: TestimonialCardProps[] = [
  {
    author: {
      name: "Emma Thompson",
      handle: "@emmasalon",
      avatar: "https://cdn.21st.dev/assets/mirror/72/72795790e133d8399b0ae08aa7f605ddb153b6c0e17caa9e4d3f779e366ae02a.jpg",
    },
    text: "We used to miss at least 10 calls a day during appointments. Now every single one gets answered and booked automatically. Revenue is up and I didn't hire anyone.",
  },
  {
    author: {
      name: "David Park",
      handle: "@parkplumbing",
      avatar: "https://cdn.21st.dev/assets/mirror/d8/d8e0b55ba06cb79571a9d9eec1fe7c784fe0a180438410700bbc6f24a7ff8c76.jpg",
    },
    text: "The NFC review cards were a game-changer. We went from 12 Google reviews to over 80 in two months. Now we're the top-rated plumber in our area.",
  },
  {
    author: {
      name: "Sofia Rodriguez",
      handle: "@sofiabistro",
      avatar: "https://cdn.21st.dev/assets/mirror/b5/b5e0a51f3f066510ff95875091d4de806e305cccf601826efce880394443ab2c.jpg",
    },
    text: "Our old website was embarrassing. Vortura rebuilt it in 10 days and now we actually show up when people search for restaurants near us. Reservations doubled.",
  },
  {
    author: {
      name: "James Chen",
      handle: "@chenlawfirm",
      avatar: "https://cdn.21st.dev/assets/mirror/eb/eb49a4a0da452f9c08b9679fe43f787ecfa4689b3867eac2c8a9b0b6dfba8a02.jpg",
    },
    text: "The AI receptionist handles intake calls better than most humans. It qualifies leads, books consultations, and sends us a full transcript. Worth every penny.",
  },
  {
    author: {
      name: "Aisha Patel",
      handle: "@aishadental",
      avatar: "https://cdn.21st.dev/assets/mirror/5c/5ca27ce1db472d777a41190619d8f20e6593cad453a3c8e621caf6f9530a350c.jpg",
    },
    text: "Patients actually leave reviews now. We put the NFC stand at checkout and our Google rating went from 3.8 to 4.6 in six weeks. No more begging for feedback.",
  },
  {
    author: {
      name: "Michael Kim",
      handle: "@kimelectric",
      avatar: "https://cdn.21st.dev/assets/mirror/34/3428c156f286d10f75dd0a97067134316d7d2339377b72694d000d2766dd42a7.jpg",
    },
    text: "I was losing weekend calls to competitors. Now the AI picks up instantly, gives quotes, and books the job. I wake up Monday with a full schedule.",
  },
];

type Metric = {
  value: number;
  suffix: string;
  label: string;
  direction: "up" | "down";
  prefix?: string;
};

type CaseStudy = {
  title: string;
  industry: string;
  description: string;
  metrics: Metric[];
};

const CASE_STUDIES: CaseStudy[] = [
  {
    title: "AI Voice Receptionist for Local Trades",
    industry: "HVAC & Plumbing",
    description:
      "An AI receptionist answers every call 24/7, takes down job details, qualifies leads, and books estimates directly into the CRM.",
    metrics: [
      { value: 100, suffix: "%", label: "Call answer rate", direction: "up" },
      { value: 0, suffix: "", label: "Missed after-hours inquiries", direction: "down" },
      { value: 30, suffix: "s", label: "Avg booking time", prefix: "<", direction: "down" },
    ],
  },
  {
    title: "Modern Website & Mobile Speed Overhaul",
    industry: "Restaurant & Bar",
    description:
      "We replaced a slow old site with a fast, mobile-first one that has digital menus, reservations, and local SEO.",
    metrics: [
      { value: 0.8, suffix: "s", label: "Page load time", prefix: "<", direction: "down" },
      { value: 100, suffix: "", label: "Lighthouse mobile score", direction: "up" },
    ],
  },
  {
    title: "Instant Lead Qualification Pipeline",
    industry: "Real Estate Brokerage",
    description:
      "Web inquiries are read and checked automatically, the lead gets an instant text, and the inquiry goes to the right agent straight away.",
    metrics: [
      { value: 60, suffix: "s", label: "Lead response time", prefix: "<", direction: "down" },
      { value: 100, suffix: "%", label: "Automated lead routing", direction: "up" },
    ],
  },
  {
    title: "Order Tracking & Support Automation",
    industry: "DTC E-Commerce",
    description:
      "Automated support answers order tracking and return questions instantly, so the team can spend its time on harder cases.",
    metrics: [
      { value: 60, suffix: "%+", label: "Reduction in manual tickets", direction: "down" },
      { value: 1, suffix: "s", label: "Instant status retrieval", prefix: "<", direction: "down" },
    ],
  },
  {
    title: "Client Onboarding Portal",
    industry: "Professional Services",
    description:
      "One onboarding portal collects documents, generates agreements, and assigns tasks to the team, cutting days of back-and-forth down to minutes.",
    metrics: [
      { value: 90, suffix: "%", label: "Faster onboarding", direction: "up" },
      { value: 100, suffix: "%", label: "Automated doc collection", direction: "up" },
    ],
  },
];

const ResultsPage = () => {
  const isMobile = useIsMobile();
  const headerAnim = useHeaderAnim();
  const reveal = useRevealAnim();
  const scaleReveal = useScaleRevealAnim();

  return (
    <PageLayout>
      <Seo
        title="Results"
        description="Results from local businesses we work with, and how Vortura helped them get more calls, reviews, and revenue."
      />
      <div className="relative overflow-hidden">
        <PageHeroBg />

        {/* ═══ HERO ═══════════════════════════════════════ */}
        <section className="relative z-10 pt-24 md:pt-24 lg:pt-32 pb-10 md:pb-14">
          <div className="container max-w-5xl">
            <motion.div className="text-center mb-10 md:mb-12" {...headerAnim}>
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5">
                Results that speak{" "}
                <span className="text-gradient">for themselves.</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                We measure every project by the results it brings in: more calls, more reviews, and more revenue.
              </p>
            </motion.div>

            {/* ═══ TRUSTED BY ═════════════════════════════════
                Directly under the claim, inside the same column: a logo row
                answers "are these people real?" before the case studies.
                Contained rather than the home page's full-bleed band, which
                split this short hero from the content like a page break. */}
            <TrustedBy variant="contained" />
          </div>
        </section>

        <section className="relative z-10 pt-4 md:pt-6 pb-10 md:pb-14">
          <div className="container max-w-5xl">
            {/* ═══ FEATURED CASE STUDY ════════════════════════ */}
            {CASE_STUDIES.slice(0, 1).map((study) => (
              <motion.div
                key={study.title}
                className="glass-strong border-gradient rounded-2xl p-6 sm:p-8 md:p-10 mb-5"
                {...reveal(0, isMobile)}
              >
                <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-3">
                  {study.industry}
                </p>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-depth leading-snug mb-3">
                  {study.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                  {study.description}
                </p>
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  {study.metrics.map((m, j) => (
                    <div key={j} className="glass rounded-xl p-4 md:p-5 text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1.5">
                        {m.direction === "up" ? (
                          <ArrowUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-emerald-400" />
                        )}
                        <span className="text-2xl md:text-3xl font-bold text-gradient">
                          {m.prefix ?? ""}
                          <Counter to={m.value} suffix={m.suffix} decimals={m.value % 1 !== 0 ? 1 : 0} />
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* ═══ CASE STUDY GRID ══════════════════════════════ */}
            <div className="grid md:grid-cols-2 gap-5">
              {CASE_STUDIES.slice(1).map((study, i) => (
                <motion.div
                  key={study.title}
                  className="glass-strong border-gradient rounded-2xl p-5 sm:p-6 flex flex-col"
                  {...reveal(i + 1, isMobile)}
                >
                  <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-2">
                    {study.industry}
                  </p>
                  <h2 className="text-base md:text-lg font-bold tracking-tight text-depth leading-snug mb-2">
                    {study.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                    {study.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {study.metrics.map((m, j) => (
                      <div key={j} className="flex items-center gap-2 glass rounded-lg px-3 py-2">
                        {m.direction === "up" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className="text-base md:text-lg font-bold text-gradient whitespace-nowrap">
                          {m.prefix ?? ""}
                          <Counter to={m.value} suffix={m.suffix} decimals={m.value % 1 !== 0 ? 1 : 0} />
                        </span>
                        <span className="text-[11px] text-muted-foreground">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══════════════════════════════ */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div className="text-center mb-8 md:mb-12" {...headerAnim}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5">
                What clients{" "}
                are saying
              </h2>
            </motion.div>

            {/* Short social-handle quotes first — fast to scan, and a
                breather after the dense case studies. */}
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6"
              {...headerAnim}
            >
              {COMMUNITY_TESTIMONIALS.map((testimonial, i) => (
                <TestimonialCard
                  key={i}
                  {...testimonial}
                  className="max-w-none"
                />
              ))}
            </motion.div>

            {/* Detailed quotes last: company, role, location and service tag
                make these the most persuasive proof, so they sit nearest the ask. */}
            <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  className="glass-strong border-gradient rounded-2xl p-5 md:p-6 flex flex-col"
                  {...scaleReveal(i, 0.1)}
                >
                  {t.logo && (
                    <div className="mb-4 flex items-center justify-center py-3 -mx-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <img
                        src={t.logo}
                        alt={t.company}
                        className="h-8 md:h-10 w-auto max-w-[80%] object-contain opacity-60"
                      />
                    </div>
                  )}
                  <Quote className="w-6 h-6 text-primary/40 mb-3 shrink-0" />
                  <p className="text-sm text-foreground/80 leading-relaxed mb-4 flex-1">
                    "{t.quote}"
                  </p>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-foreground/70 mb-0.5">
                    {t.role}, {t.company}
                  </p>
                  <p className="text-[11px] text-muted-foreground mb-2">{t.location}</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-primary/10 border border-primary/25 text-primary self-start">
                    {t.service}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ BOTTOM CTA ═════════════════════════════════ */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div
              className="glass-strong border-gradient rounded-3xl p-8 md:p-12 lg:p-16 text-center max-w-3xl mx-auto"
              {...headerAnim}
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-4 leading-tight">
                Ready to see results{" "}
                like these?
              </h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                Book a free discovery call and we'll show you where automation could grow your business.
              </p>
              <Link
                to="/contact"
                className="btn-hero-glass inline-flex items-center gap-2 px-10 py-4 rounded-xl text-lg font-semibold"
              >
                Book a call <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default ResultsPage;
