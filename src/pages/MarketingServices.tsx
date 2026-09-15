import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { useHeaderAnim, useRevealAnim } from "@/hooks/use-anim";
import { useIsMobile } from "@/hooks/use-mobile";
import { MARKETING_SERVICES } from "@/data/marketing-services";

const MarketingServices = () => {
  const header = useHeaderAnim();
  const reveal = useRevealAnim();
  const isMobile = useIsMobile();

  return (
    <PageLayout>
      <Seo
        title="Marketing Services"
        description="Full-service digital marketing — SEO, AEO, paid search, social ads, content marketing, and more."
        // Parked: not linked from the site yet, so keep it out of search.
        noindex
      />
      <div className="relative overflow-hidden">
        <PageHeroBg />

        {/* Hero */}
        <section className="relative z-10 pt-24 md:pt-24 lg:pt-32 pb-10 md:pb-14">
          <div className="container max-w-5xl">
            <motion.div className="text-center" {...header}>
              <h1 className="whitespace-nowrap text-[clamp(1rem,4.4vw,3rem)] font-bold tracking-tight text-depth leading-[1.08] mb-4">
                Marketing services built for{" "}
                <span className="text-gradient">growth.</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Holistic digital marketing strategies designed to meet your growth needs. Browse our full range of services below.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services grid */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {MARKETING_SERVICES.map((svc, i) => {
                const Icon = svc.icon;
                return (
                  <motion.div
                    key={svc.slug}
                    {...reveal(i, isMobile)}
                  >
                    <Link
                      to={`/marketing/${svc.slug}`}
                      className="block glass-strong border-gradient rounded-2xl p-5 md:p-6 h-full group hover:border-primary/20 transition-colors"
                    >
                      <div className="btn-hero-glass pointer-events-none w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-base md:text-lg font-bold tracking-tight text-depth mb-2 group-hover:text-primary transition-colors">
                        {svc.title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {svc.shortDesc}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                        Learn more <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div
              className="glass-strong border-gradient rounded-3xl p-8 md:p-12 lg:p-16 text-center max-w-3xl mx-auto"
              {...header}
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-4 leading-tight">
                Not sure where to{" "}
                start?
              </h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                Book a free discovery call and we'll identify the channels that will have the most impact for your business.
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

export default MarketingServices;
