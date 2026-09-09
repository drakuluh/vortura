import { Link } from "react-router-dom";
import { ArrowRight, UtensilsCrossed, Wrench, Building2 } from "lucide-react";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { services } from "@/data/services";
import { INDUSTRIES } from "@/data/industries";
import { motion } from "framer-motion";
import { useHeaderAnim } from "@/hooks/use-anim";
import { useIsMobile } from "@/hooks/use-mobile";
import { ServiceCard } from "@/components/landing/ServiceCard";
import { SparklesText } from "@/components/ui/sparkles-text";
import { Seo } from "@/components/Seo";

const servicesJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: services
    .filter((s) => !s.comingSoon && !s.hidden)
    .map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.title,
        description: s.desc,
        provider: { "@type": "Organization", name: "Vortura Agency" },
      },
    })),
};

const Services = () => {
  const headerAnim = useHeaderAnim();
  const isMobile = useIsMobile();
  return (
    <PageLayout>
      <Seo
        title="AI Automation & Website Services"
        description="Website builds, AI voice agents, missed-call text-back, review automation, CRM setup, and lead routing — every automation custom-built for local service businesses."
        jsonLd={servicesJsonLd}
      />
      <div className="relative overflow-hidden">
        <PageHeroBg />
        <section className="relative z-10 pt-12 md:pt-14 lg:pt-24 pb-12 md:pb-16 lg:pb-24">
          <div className="container">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12 lg:mb-16 mt-12 md:mt-10 lg:mt-8" {...headerAnim}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-depth mb-3">
              Built for <SparklesText text="scale." className="text-gradient" />
            </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:whitespace-nowrap">
              Websites, automations, and AI — custom-built to grow your local business.
            </p>
          </motion.div>

            {/* ── Industries we serve ──────────────────────── */}
            <motion.div
              className="max-w-3xl lg:max-w-4xl mx-auto mb-10 md:mb-14 lg:mb-16"
              {...(isMobile
                ? { initial: false as const, animate: { opacity: 1, y: 0 } }
                : {
                    initial: { opacity: 0, y: 20 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, margin: "-80px" as const },
                    transition: { duration: 0.7, ease: "easeOut" as const },
                  })}
            >
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary text-center mb-5">
                Industries we serve
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {INDUSTRIES.map((ind) => {
                  const icons: Record<string, typeof UtensilsCrossed> = {
                    restaurants: UtensilsCrossed,
                    trades: Wrench,
                    "real-estate": Building2,
                  };
                  const Icon = icons[ind.slug] ?? ArrowRight;
                  return (
                    <Link
                      key={ind.slug}
                      to={`/industries/${ind.slug}`}
                      className="glass-strong border-gradient rounded-2xl p-5 md:p-6 group hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="btn-hero-glass pointer-events-none w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base font-bold tracking-tight text-depth mb-1.5">
                        {ind.name}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                        {ind.subtext}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-primary group-hover:text-foreground transition-colors">
                        Explore <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            <p className="font-mono text-[11px] uppercase tracking-widest text-primary text-center mb-6 md:mb-8 max-w-3xl lg:max-w-6xl mx-auto">
              Our services
            </p>
            <div className="max-w-3xl lg:max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch auto-rows-[1fr]">
            {services.filter((s) => !s.comingSoon && !s.hidden).map((s, i) => (
              <ServiceCard key={s.slug} service={s} index={i} isMobile={isMobile} />
            ))}
          </div>

          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Services;