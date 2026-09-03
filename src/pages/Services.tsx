import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { services } from "@/data/services";
import { motion } from "framer-motion";
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
  const isMobile = useIsMobile();
  const headerAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };
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

            <div className="max-w-3xl lg:max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch auto-rows-[1fr]">
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