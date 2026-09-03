import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { SparklesText } from "@/components/ui/sparkles-text";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/data/faqs";

export const Faq = () => {
  const isMobile = useIsMobile();
  const headerAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" as const },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };

  return (
    <section id="faq" className="relative py-12 md:py-14 lg:py-24">
      <div className="container relative z-10">
        <motion.div
          className="max-w-2xl mx-auto text-center mb-7 md:mb-9 lg:mb-12"
          {...headerAnim}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5">
            Questions, <SparklesText text="answered." className="text-gradient" />
          </h2>
          <p className="text-sm md:text-[15px] text-muted-foreground">
            Everything owners usually ask before booking a call.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`item-${i}`}
                className="glass rounded-2xl border border-white/10 px-5 md:px-6 overflow-hidden"
              >
                <AccordionTrigger className="py-4 md:py-5 text-left text-[15px] md:text-base font-semibold tracking-tight hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm md:text-[15px] leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default Faq;
