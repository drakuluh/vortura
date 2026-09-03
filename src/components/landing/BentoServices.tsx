import { services } from "@/data/services";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";
import { SparklesText } from "@/components/ui/sparkles-text";
import { cn } from "@/lib/utils";
import "./bento-cards.css";

export const BentoServices = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const headerAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" as const },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };

  const activeServices = services.filter((s) => !s.comingSoon && !s.hidden);

  return (
    <section id="services" className="relative py-12 md:py-14 lg:py-24">
      <div className="container relative z-10 flex flex-col items-center">
        <div className="w-full max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto flex flex-col items-center">
          <motion.div className="max-w-lg mx-auto text-center mb-1 md:mb-8 lg:mb-12" {...headerAnim}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5">
              Built for <SparklesText text="scale." className="text-gradient" />
            </h2>
            <p className="text-sm text-muted-foreground">
              Each automation is custom-built for your stack and goals.
            </p>
          </motion.div>

          <CoverflowCarousel
            label="Services"
            slides={activeServices.map((s) => ({ src: "", alt: s.title, title: s.title }))}
            cardWidth={isMobile ? "clamp(232px, 64vw, 266px)" : "clamp(320px, 30vw, 380px)"}
            visibleNeighbors={1}
            edgeFade
            autoplay
            autoplayInterval={5000}
            showNavigation
            showPagination
            cardClassName="border border-white/10"
            onCardClick={(index) => navigate(`/services/${activeServices[index].slug}`)}
            renderCard={(_slide, index, isActive) => {
              const s = activeServices[index];
              const Icon = s.icon;
              // Per-service accent (blue for `primary`, purple for `secondary`)
              // gives the deck rhythm and ties each card to its service.
              const accent = s.accent === "secondary" ? "var(--secondary)" : "var(--primary)";
              return (
                <div
                  className="group/card relative flex h-full w-full cursor-pointer flex-col overflow-hidden bg-card p-5 md:p-7"
                  style={{ ["--accent" as string]: accent }}
                >
                  {/* Accent top-glow + active ring (figure/ground for the focused card) */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,hsl(var(--accent)/0.22),transparent)]"
                  />
                  <div
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset transition-all duration-500",
                      isActive
                        ? "ring-[hsl(var(--accent)/0.5)] shadow-[0_0_34px_hsl(var(--accent)/0.16)_inset]"
                        : "ring-transparent",
                    )}
                  />
                  {isActive && <span className="cf-sheen" aria-hidden="true" />}

                  {/* Icon + price */}
                  <div className="relative flex items-start justify-between gap-2">
                    <div
                      className={cn(
                        "grid h-11 w-11 place-items-center rounded-xl border border-[hsl(var(--accent)/0.32)] bg-[hsl(var(--accent)/0.14)] transition-transform duration-500 md:h-12 md:w-12",
                        isActive && "-translate-y-0.5",
                      )}
                    >
                      <Icon className="h-5 w-5 text-[hsl(var(--accent))] md:h-6 md:w-6" />
                    </div>
                    {s.priceFrom && (
                      <span className="shrink-0 whitespace-nowrap rounded-full border border-[hsl(var(--accent)/0.28)] bg-[hsl(var(--accent)/0.12)] px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide text-[hsl(var(--accent))] md:text-xs">
                        {s.priceFrom}
                      </span>
                    )}
                  </div>

                  {/* Tag + title + description */}
                  <div className="relative mt-3.5 md:mt-5">
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:mb-1.5 md:text-[11px]">
                      {s.tag}
                    </p>
                    <h3 className="text-base font-bold leading-snug tracking-tight text-depth md:text-xl">
                      {s.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground md:mt-2.5 md:line-clamp-3 md:text-sm">
                      {s.desc}
                    </p>
                  </div>

                  {/* Footer: timeline (desktop only) + learn-more button */}
                  <div className="relative mt-auto pt-4 md:pt-5">
                    {!isMobile && (
                      <p className="mb-3.5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                        {s.timeline}
                      </p>
                    )}
                    <span
                      className={cn(
                        "flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all duration-500 md:py-3 md:text-base",
                        "bg-[hsl(var(--accent))] shadow-[0_6px_16px_hsl(var(--accent)/0.35)]",
                        isActive ? "brightness-110" : "opacity-95",
                      )}
                    >
                      Learn more
                      <ArrowRight
                        className={cn(
                          "h-4 w-4 transition-transform duration-500",
                          isActive && "translate-x-0.5",
                        )}
                      />
                    </span>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>
    </section>
  );
};
