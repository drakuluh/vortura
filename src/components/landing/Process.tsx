import { Search, Wrench, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { SplitReveal } from "@/components/effects/SplitReveal";
import { SparklesText } from "@/components/ui/sparkles-text";

const steps = [
  {
    icon: Search,
    num: "01",
    title: "Discovery & Audit",
    desc: "We map your workflows, identify the highest-leverage automation opportunities, and ship a custom blueprint within 7 days.",
  },
  {
    icon: Wrench,
    num: "02",
    title: "Build & Integrate",
    desc: "Our team builds, tests, and integrates AI agents directly into your stack. Zero disruption to current operations.",
  },
  {
    icon: Rocket,
    num: "03",
    title: "Launch & Scale",
    desc: "Go live with full training and documentation. We monitor performance 24/7 and refine your automations as your business grows.",
  },
];

export const Process = ({ headerAnim: headerAnimOverride }: { headerAnim?: any } = {}) => {
  const isMobile = useIsMobile();
  const defaultAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };
  const animProps = headerAnimOverride ?? defaultAnim;
  return (
    <section id="process" className="relative py-12 md:py-14 lg:py-24">
      <div className="container relative z-10">
        <motion.div className="max-w-2xl mx-auto text-center mb-7 md:mb-9 lg:mb-14" {...animProps}>
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 whitespace-nowrap">
            From audit to <SparklesText text="automation." className="text-gradient" />
          </h2>
          <p className="text-sm text-muted-foreground">
            A proven 3-step process. Most clients see ROI within 30 days.
          </p>
        </motion.div>

        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto relative">
          <div className="absolute left-5 md:left-6 top-3 bottom-3 w-px">
            <div className="absolute inset-0 opacity-60" style={{ background: "linear-gradient(to bottom, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--primary)) 90%, transparent 100%)" }} />
            <div className="absolute inset-0 blur-md" style={{ background: "linear-gradient(to bottom, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--primary)) 90%, transparent 100%)" }} />
          </div>

          <div className="space-y-5 md:space-y-5 lg:space-y-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative flex gap-4 md:gap-6"
                >
                  <div className="relative flex-shrink-0">
                    <motion.div
                      className="btn-hero-glass pointer-events-none relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                      initial={isMobile ? false : { y: 80, opacity: 0, scale: 0.5 }}
                      {...(isMobile
                        ? { animate: { y: 0, opacity: 1, scale: 1 } }
                        : { whileInView: { y: 0, opacity: 1, scale: 1 }, viewport: { once: true, margin: "-100px" } })}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 14,
                        delay: i * 0.18,
                      }}
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </motion.div>
                  </div>

                  <motion.div
                    className="glass rounded-2xl p-4 md:p-5 flex-1"
                    initial={isMobile ? false : { opacity: 0, y: 20 }}
                    {...(isMobile
                      ? { animate: { opacity: 1, y: 0 } }
                      : {
                          whileInView: { opacity: 1, y: 0 },
                          viewport: { once: true, margin: "-80px" as const },
                        })}
                    transition={{ duration: 0.7, ease: "easeOut" as const, delay: i * 0.18 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[11px] text-primary tracking-widest">STEP {step.num}</span>
                      <div className="h-px flex-1 bg-white" />
                    </div>
                    <SplitReveal
                      as="h3"
                      text={step.title}
                      className="text-lg md:text-xl font-semibold mb-1.5 tracking-tight text-depth"
                    />
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
