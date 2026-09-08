import { Link } from "react-router-dom";
import { ArrowRight, Nfc, Star, UtensilsCrossed, Wrench, Building2 } from "lucide-react";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { services } from "@/data/services";
import { INDUSTRIES } from "@/data/industries";
import { motion } from "framer-motion";
import { useHeaderAnim } from "@/hooks/use-anim";
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
            <motion.div className="max-w-xl mx-auto text-center mb-7 md:mb-10 lg:mb-14 mt-12 md:mt-10 lg:mt-8" {...headerAnim}>
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5">
              Built for <SparklesText text="scale." className="text-gradient" />
            </h1>
              <p className="text-sm text-muted-foreground">
              Every automation we ship is custom-built for your stack and goals.
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
                      className="glass rounded-2xl p-5 md:p-6 group hover:bg-white/[0.04] transition-colors"
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

            <p className="font-mono text-[11px] uppercase tracking-widest text-primary text-center mb-5 max-w-3xl lg:max-w-6xl mx-auto">
              Our services
            </p>
            <div className="max-w-3xl lg:max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch auto-rows-[1fr]">
            {services.filter((s) => !s.comingSoon && !s.hidden).map((s, i) => (
              <ServiceCard key={s.slug} service={s} index={i} isMobile={isMobile} />
            ))}
          </div>

            {/* ── NFC Review Cards featured teaser ──────────── */}
            <motion.div
              className="max-w-3xl lg:max-w-4xl mx-auto mt-10 md:mt-14 lg:mt-16"
              {...(isMobile
                ? { initial: false as const, animate: { opacity: 1, y: 0 } }
                : {
                    initial: { opacity: 0, y: 20 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, margin: "-80px" as const },
                    transition: { duration: 0.7, ease: "easeOut" as const },
                  })}
            >
              <div className="glass-strong border-gradient rounded-2xl p-6 md:p-8 relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-primary opacity-[0.05]"
                />
                <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
                  <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-3 shrink-0">
                    <div className="btn-hero-glass pointer-events-none w-14 h-14 rounded-2xl flex items-center justify-center">
                      <Nfc className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex gap-0.5 md:ml-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-1.5">
                      Featured service
                    </p>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-depth mb-2 leading-tight">
                      NFC Google Review Cards
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 md:mb-0">
                      One tap turns happy customers into 5-star Google reviews. No app, no QR scanning, no friction — just a tap and they're writing a review.
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      From $49
                    </span>
                    <Link
                      to="/services/nfc-review-cards"
                      className="btn-hero-glass inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap"
                    >
                      See how it works <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Services;