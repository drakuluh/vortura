import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { SparklesText } from "@/components/ui/sparkles-text";
import { useIsMobile } from "@/hooks/use-mobile";
import { INDUSTRIES } from "@/data/industries";

const useAnimProps = () => {
  const isMobile = useIsMobile();
  const header = isMobile
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
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" as const },
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay: 0.05 * i },
        };
  return { header, reveal };
};

const IndustryPage = () => {
  const { slug } = useParams();
  const industry = INDUSTRIES.find((ind) => ind.slug === slug);
  const { header, reveal } = useAnimProps();

  if (!industry) return <Navigate to="/services" replace />;

  return (
    <PageLayout>
      <Seo
        title={`AI Automation for ${industry.name}`}
        description={industry.subtext}
      />
      <div className="relative overflow-hidden">
        <PageHeroBg />

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="relative z-10 pt-12 md:pt-14 lg:pt-24 pb-10 md:pb-14 lg:pb-20">
          <div className="container max-w-4xl">
            <div className="flex justify-center mb-8 mt-12 md:mt-10 lg:mt-8">
              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2 px-3 -ml-3 rounded-lg hover:bg-white/[0.05]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> All services
              </Link>
            </div>

            <motion.div className="max-w-3xl mx-auto text-center" {...header}>
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-4">
                AI Automation for {industry.name}
              </p>
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-4 leading-tight">
                {industry.headline}{" "}
                <SparklesText text={industry.accentWord} className="text-gradient" />
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-8">
                {industry.subtext}
              </p>
              <Link
                to="/contact"
                className="btn-hero-glass inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold"
              >
                Book a discovery call <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Pain Points ────────────────────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-4xl">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                Sound{" "}
                <SparklesText text="familiar?" className="text-gradient" />
              </h2>
              <p className="text-sm text-muted-foreground">
                These are the problems we solve for {industry.name.toLowerCase()} every day.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {industry.painPoints.map((point, i) => (
                <motion.div
                  key={i}
                  className="glass rounded-2xl p-5 flex items-start gap-4"
                  {...reveal(i)}
                >
                  <div className="btn-hero-glass pointer-events-none w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {point}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services for this industry ─────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-4xl">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                Built for{" "}
                <SparklesText text={`${industry.name.toLowerCase()}.`} className="text-gradient" />
              </h2>
              <p className="text-sm text-muted-foreground">
                The services that move the needle most for your industry.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4 lg:gap-5 max-w-3xl mx-auto">
              {industry.services.map((svc, i) => {
                const Icon = svc.icon;
                return (
                  <motion.div
                    key={svc.slug}
                    className="glass rounded-2xl p-5 md:p-6"
                    {...reveal(i)}
                  >
                    <div className="btn-hero-glass pointer-events-none w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold tracking-tight text-depth mb-2">
                      {svc.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {svc.desc}
                    </p>
                    <Link
                      to={`/services/${svc.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-primary hover:text-foreground transition-colors"
                    >
                      Learn more <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Industry stats ──────────────────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-4xl">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                The{" "}
                <SparklesText text="numbers." className="text-gradient" />
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {industry.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="glass rounded-2xl p-5 md:p-6 text-center"
                  {...reveal(i)}
                >
                  <p className="text-2xl md:text-3xl font-bold text-gradient mb-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground/60 mt-3">
              Based on general industry research for local businesses.
            </p>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-4xl">
            <motion.div className="max-w-2xl mx-auto text-center" {...header}>
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
                className="btn-hero-glass inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold"
              >
                Book a call <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default IndustryPage;
