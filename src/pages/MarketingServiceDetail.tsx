import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { Counter } from "@/components/effects/Counter";
import { useHeaderAnim, useRevealAnim, useScaleRevealAnim } from "@/hooks/use-anim";
import { useIsMobile } from "@/hooks/use-mobile";
import { MARKETING_SERVICES } from "@/data/marketing-services";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const MarketingServiceDetail = () => {
  const { slug } = useParams();
  const service = MARKETING_SERVICES.find((s) => s.slug === slug);
  const header = useHeaderAnim();
  const reveal = useRevealAnim();
  const scaleReveal = useScaleRevealAnim();
  const isMobile = useIsMobile();

  if (!service) return <Navigate to="/marketing" replace />;

  const Icon = service.icon;

  return (
    <PageLayout>
      {/* Parked with /marketing: noindex until it's linked from the site. */}
      <Seo title={service.title} description={service.heroSub} noindex />
      <div className="relative overflow-hidden">
        <PageHeroBg />

        {/* Back link */}
        <div className="relative z-10 pt-12 md:pt-14 lg:pt-24">
          <div className="container max-w-5xl">
            <div className="flex justify-center mt-12 md:mt-10 lg:mt-8">
              <Link
                to="/marketing"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-lg hover:bg-white/[0.05]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> All marketing services
              </Link>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="relative z-10 pt-6 md:pt-8 pb-10 md:pb-12 lg:pb-16">
          <div className="container max-w-5xl">
            <motion.div className="max-w-3xl mx-auto text-center" {...header}>
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="btn-hero-glass pointer-events-none w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-depth leading-[1.08] mb-4">
                {service.heroHeadline}{" "}
                <span className="text-gradient">{service.heroAccent}</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {service.heroSub}
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

        {/* Intro */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div className="space-y-5" {...reveal(0, isMobile)}>
              {service.intro.map((p, i) => (
                <p key={i} className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Content sections */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                How we{" "}
                do it
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
              {service.sections.map((section, i) => (
                <motion.div
                  key={section.heading}
                  className="glass-strong border-gradient rounded-2xl p-5 md:p-6"
                  {...reveal(i + 1, isMobile)}
                >
                  <h3 className="text-base md:text-lg font-bold tracking-tight text-depth mb-3">
                    {section.heading}
                  </h3>
                  <div className="space-y-3">
                    {section.body.map((p, j) => (
                      <p key={j} className="text-sm text-muted-foreground leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats — hidden until real figures exist; see marketing-services.ts */}
        {service.stats.length > 0 && (
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                The{" "}
                numbers
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              {service.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="glass-strong rounded-2xl p-5 md:p-6 text-center flex flex-col items-center justify-between aspect-auto md:aspect-square"
                  {...scaleReveal(i, 0.12)}
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
        )}

        {/* FAQ */}
        {service.faq.length > 0 && (
          <section className="relative z-10 py-10 md:py-12 lg:py-16">
            <div className="container max-w-5xl">
              <motion.div className="text-center mb-6 md:mb-8" {...reveal(0, isMobile)}>
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-depth mb-2.5">
                  Common questions
                </h2>
              </motion.div>
              <Accordion type="single" collapsible className="space-y-3.5">
                {service.faq.map((item, i) => (
                  <AccordionItem
                    key={item.q}
                    value={`item-${i}`}
                    className="glass rounded-2xl border border-white/10 px-5 md:px-6 overflow-hidden transition-colors hover:bg-white/[0.03]"
                  >
                    <AccordionTrigger className="py-5 md:py-6 text-left text-[15px] md:text-base font-semibold tracking-tight hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 text-sm md:text-[15px] leading-relaxed text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div
              className="glass-strong border-gradient rounded-3xl p-8 md:p-12 lg:p-16 text-center max-w-3xl mx-auto"
              {...header}
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-4 leading-tight">
                Ready to grow with{" "}
                {`${service.title.toLowerCase()}?`}
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Book a free discovery call and we'll build a custom {service.title.toLowerCase()} strategy for your business.
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

export default MarketingServiceDetail;
