import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Service } from "@/data/services";

type Props = {
  service: Service;
  index?: number;
  isMobile?: boolean;
  /** Externally controlled flip (used by carousel). When undefined, flips on hover/click locally. */
  flipped?: boolean;
  onToggleFlip?: () => void;
  /** Disable internal entrance animation (carousel positions cards itself). */
  animate?: boolean;
};

export const ServiceCard = ({
  service: s,
  index = 0,
  isMobile = false,
  flipped: flippedProp,
  onToggleFlip,
  animate = true,
}: Props) => {
  const Icon = s.icon;
  const comingSoon = !!s.comingSoon;
  const [flippedLocal, setFlippedLocal] = useState(false);
  const isControlled = flippedProp !== undefined;
  const flipped = isControlled ? !!flippedProp : flippedLocal;

  const cardAnim = !animate || comingSoon
    ? { initial: false as const, animate: { opacity: 1, y: 0 } }
    : {
        initial: isMobile ? (false as const) : { opacity: 0, y: 20 },
        ...(isMobile
          ? { animate: { opacity: 1, y: 0 } }
          : {
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: "-80px" as const },
            }),
        transition: { duration: 0.7, ease: "easeOut" as const, delay: index * 0.18 },
      };

  return (
    <motion.article
      id={s.slug}
      className={`group relative scroll-mt-28 h-[18rem] min-h-[18rem] [perspective:1400px] ${
        comingSoon ? "opacity-60 grayscale" : ""
      }`}
      {...cardAnim}
      onClick={() => {
        if (comingSoon) return;
        if (isControlled) onToggleFlip?.();
        else setFlippedLocal((f) => !f);
      }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
          isControlled ? "" : "group-hover:[transform:rotateY(180deg)] group-focus-within:[transform:rotateY(180deg)]"
        } ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
      >
        {/* Front */}
        <div className="absolute inset-0 glass rounded-2xl overflow-hidden [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
          <div className="relative p-5 md:p-6 flex flex-col h-full">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div className="btn-hero-glass pointer-events-none w-12 h-12 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              {s.priceFrom && !comingSoon && (
                <span className="shrink-0 font-mono text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full border border-primary/25 bg-primary/10 text-primary whitespace-nowrap">
                  {s.priceFrom}
                </span>
              )}
            </div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
              {s.tag}
            </p>
            <h2 className="text-xl md:text-2xl font-bold mb-3 tracking-tight text-depth leading-tight">
              {s.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            {comingSoon && (
              <span className="mt-4 self-start px-2 py-0.5 rounded-md font-mono text-[11px] uppercase tracking-widest text-muted-foreground bg-muted/20 border border-white/10">
                Coming soon
              </span>
            )}
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 glass rounded-2xl overflow-hidden [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="relative p-5 md:p-6 flex flex-col h-full">
            <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-2">
              What you get
            </p>
            <h3 className="text-base md:text-lg font-bold tracking-tight text-depth mb-3 leading-tight">
              {s.title}
            </h3>
            <ul className="space-y-1.5 mb-4">
              {s.outcomes.slice(0, 4).map((o) => (
                <li key={o} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                  <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {s.timeline}
              </span>
              <Link
                to={`/services/${s.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="btn-hero-glass inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs"
              >
                Get started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ServiceCard;
