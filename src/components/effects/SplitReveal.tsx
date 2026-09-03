import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "div";
  delayBase?: number;
  stagger?: number;
  once?: boolean;
};

/**
 * Word-by-word slide-up reveal. Use as a drop-in for headlines.
 * Mobile renders the text statically to keep things snappy.
 */
export const SplitReveal = ({
  text,
  className = "",
  as = "span",
  delayBase = 0,
  stagger = 0.06,
  once = true,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-15%" });
  const isMobile = useIsMobile();
  const Tag = as as any;

  if (isMobile) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag ref={ref as any} className={className}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : { y: "110%" }}
            transition={{
              duration: 0.55,
              delay: delayBase + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
          {i < text.split(" ").length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
};