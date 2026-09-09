import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, X, Check } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { SparklesText } from "@/components/ui/sparkles-text";
import { Counter } from "@/components/effects/Counter";
import { useHeaderAnim, useRevealAnim } from "@/hooks/use-anim";
import { useIsMobile } from "@/hooks/use-mobile";
import { INDUSTRIES } from "@/data/industries";

const IndustryPage = () => {
  const { slug } = useParams();
  const industry = INDUSTRIES.find((ind) => ind.slug === slug);
  const header = useHeaderAnim();
  const reveal = useRevealAnim();
  const isMobile = useIsMobile();

  if (!industry) return <Navigate to="/services" replace />;

  const Icon = industry.icon;

  return (
    <PageLayout>
      <Seo
        title={`AI Automation for ${industry.name}`}
        description={industry.subtext}
      />
      <div className="relative overflow-hidden">
        <PageHeroBg />

        {/* ── Back link ────────────────────────────────────── */}
        <div className="relative z-10 pt-12 md:pt-14 lg:pt-24">
          <div className="container max-w-5xl">
            <div className="flex justify-center mt-12 md:mt-10 lg:mt-8">
              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2 px-3 -ml-3 rounded-lg hover:bg-white/[0.05]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> All services
              </Link>
            </div>
          </div>
        </div>

        {/* ═══ HERO ═══════════════════════════════════════ */}
        <section className="relative z-10 pt-6 md:pt-8 pb-10 md:pb-12 lg:pb-16">
          <div className="container max-w-5xl">
            <motion.div className="max-w-3xl mx-auto text-center" {...header}>
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="btn-hero-glass pointer-events-none w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-depth leading-[1.08] mb-4">
                {industry.headline}{" "}
                <SparklesText text={industry.accentWord} className="text-gradient" />
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {industry.subtext}
              </p>
              <Link
                to="/contact"
                className="btn-hero-glass inline-flex items-center gap-2 px-10 py-4 rounded-xl text-lg font-semibold"
              >
                Book a discovery call <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ═══ PROBLEM / APPROACH ═════════════════════════ */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20 border-t border-white/[0.04]">
          <div className="container max-w-5xl">
            <motion.div
              className="grid md:grid-cols-2 gap-4 md:gap-6 items-end mb-6 md:mb-8"
              {...(isMobile ? { initial: false, animate: { opacity: 1, y: 0 } } : {
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: "-80px" },
                transition: { duration: 0.7, ease: "easeOut" },
              })}
            >
              <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight leading-tight text-depth text-center">
                The <SparklesText text="problem." className="text-gradient-danger" colors={{ first: "#FF4444", second: "#FF8C00" }} sparklesCount={6} />
              </h2>
              <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight leading-tight text-depth text-center">
                Our <SparklesText text="approach." className="text-gradient-success" colors={{ first: "#2ECC71", second: "#27AE60" }} sparklesCount={6} />
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {/* Problem column */}
              <motion.div
                className="glass border-gradient-danger rounded-2xl p-5 md:p-6 space-y-3"
                {...(isMobile ? { initial: false, animate: { opacity: 1, y: 0 } } : {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: "-80px" },
                  transition: { duration: 0.7, ease: "easeOut" },
                })}
              >
                {industry.painPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <X className="w-3 h-3 text-red-400" />
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed">{point}</p>
                  </div>
                ))}
              </motion.div>

              {/* Approach column */}
              <motion.div
                className="glass-strong border-gradient-success rounded-2xl p-5 md:p-6 space-y-3"
                {...(isMobile ? { initial: false, animate: { opacity: 1, y: 0 } } : {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: "-80px" },
                  transition: { duration: 0.7, ease: "easeOut", delay: 0.1 },
                })}
              >
                {industry.solutions.map((solution, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed">{solution}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ SERVICES FOR THIS INDUSTRY ═════════════════ */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20 border-t border-white/[0.04]">
          <div className="container max-w-5xl">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                Built for{" "}
                <SparklesText text={`${industry.name.toLowerCase()}.`} className="text-gradient" />
              </h2>
              <p className="text-sm text-muted-foreground">
                The services that move the needle most for your industry.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4 lg:gap-5 max-w-4xl mx-auto">
              {industry.services.map((svc, i) => {
                const SvcIcon = svc.icon;
                return (
                  <motion.div
                    key={svc.slug}
                    className="glass-strong border-gradient rounded-2xl p-5 md:p-6 relative overflow-hidden"
                    {...(isMobile ? { initial: false, animate: { opacity: 1, y: 0 } } : {
                      initial: { opacity: 0, y: 20 },
                      whileInView: { opacity: 1, y: 0 },
                      viewport: { once: true, margin: "-80px" },
                      transition: { duration: 0.7, ease: "easeOut", delay: i * 0.1 },
                    })}
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.06]"
                      style={{
                        background: i % 2 === 0
                          ? "linear-gradient(135deg, hsl(var(--primary) / 0.5), transparent 60%)"
                          : "linear-gradient(135deg, hsl(var(--secondary) / 0.5), transparent 60%)",
                      }}
                    />
                    <div className="relative">
                      <div className="btn-hero-glass pointer-events-none w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                        <SvcIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base md:text-lg font-bold tracking-tight text-depth mb-2">
                        {svc.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {svc.desc}
                      </p>
                      <Link
                        to={`/services/${svc.slug}`}
                        className="btn-hero-glass inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
                      >
                        Learn more <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ STATS ═════════════════════════════════════ */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20 border-t border-white/[0.04]">
          <div className="container max-w-5xl">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                The{" "}
                <SparklesText text="numbers." className="text-gradient" />
              </h2>
              <p className="text-sm text-muted-foreground">
                Based on general industry research for local businesses.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-4 md:gap-6">
              {industry.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="glass-strong rounded-2xl p-5 md:p-6 text-center flex flex-col items-center justify-between aspect-square"
                  {...(isMobile ? { initial: false, animate: { opacity: 1, y: 0 } } : {
                    initial: { opacity: 0, y: 20 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, margin: "-80px" },
                    transition: { duration: 0.7, ease: "easeOut", delay: i * 0.1 },
                  })}
                >
                  <div />
                  <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient">
                    <Counter
                      to={stat.value}
                      suffix={stat.suffix}
                      decimals={stat.decimals ?? 0}
                    />
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═════════════════════════════════ */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20 border-t border-white/[0.04]">
          <div className="container max-w-5xl">
            <motion.div
              className="glass-strong border-gradient rounded-3xl p-8 md:p-12 lg:p-16 text-center max-w-3xl mx-auto"
              {...header}
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-4 leading-tight">
                {industry.ctaHeadline}{" "}
                <SparklesText text={industry.ctaAccent} className="text-gradient" />
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Book a free discovery call and we'll build a custom automation
                plan for your {industry.name.toLowerCase()} business.
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

export default IndustryPage;
