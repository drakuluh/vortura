import { Hero } from "@/components/landing/Hero";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { BentoServices } from "@/components/landing/BentoServices";

import { Process } from "@/components/landing/Process";
import { Faq } from "@/components/landing/Faq";
import { FAQS } from "@/data/faqs";
import { ContactForm } from "@/components/landing/ContactForm";
import { Seo } from "@/components/Seo";

/**
 * Home page structured data: the FAQ block, so the questions are eligible for
 * rich results. The business itself is described once in index.html.
 */
const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

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
      {/* <Partners /> removed from the home page: a second logo marquee three
          sections after TrustedBy read as the same device twice. The component
          is intact and still available for another page. */}
      <Faq />
      <ContactForm />
    </>
  );
};

export default Index;
