import { Hero } from "@/components/landing/Hero";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { BentoServices } from "@/components/landing/BentoServices";

import { Process } from "@/components/landing/Process";
import { Partners } from "@/components/landing/Partners";
import { Faq } from "@/components/landing/Faq";
import { FAQS } from "@/data/faqs";
import { ContactForm } from "@/components/landing/ContactForm";
import { Seo } from "@/components/Seo";

/**
 * Home page structured data: the agency itself, plus the FAQ block so the
 * questions are eligible for rich results in search.
 */
const homeJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Vortura Agency",
    url: "https://vortura.ai",
    description:
      "Vortura builds modern websites and automated systems for growing businesses across Mississauga, the GTA, and beyond.",
    areaServed: [
      { "@type": "City", name: "Mississauga" },
      { "@type": "City", name: "Brampton" },
      { "@type": "City", name: "Toronto" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mississauga",
      addressRegion: "ON",
      addressCountry: "CA",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

const Index = () => {
  return (
    <>
      <Seo jsonLd={homeJsonLd} />
      {/* Funnel order: what we do → how we work → what it's worth →
          objections handled → the ask. */}
      <Hero />
      <TrustedBy />
      <BentoServices />
      <Process />
      <Partners />
      <Faq />
      <ContactForm />
    </>
  );
};

export default Index;
