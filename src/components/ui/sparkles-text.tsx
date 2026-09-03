import { useMemo } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Sparkle {
  id: string;
  x: string;
  y: string;
  color: string;
  delay: number;
  scale: number;
  lifespan: number;
}

/** Brand blue → purple, matching the .text-gradient accent (hsl 200/280). */
export const BRAND_SPARKLE_COLORS = { first: "#1AB3FF", second: "#C44DFF" };

/**
 * Sparkle positions are generated ONCE and then twinkle forever via each
 * sparkle's own (compositor-only) opacity/scale/rotate loop. The previous
 * implementation re-rendered the whole field 10×/second on a setInterval to
 * "regenerate" sparkles — pure churn that ran even off-screen. Dropping it
 * removes a constant main-thread cost with no visible loss.
 */
function useSparkles(count: number, first: string, second: string) {
  return useMemo<Sparkle[]>(() => {
    const generate = (): Sparkle => {
      const x = `${Math.random() * 100}%`;
      const y = `${Math.random() * 100}%`;
      const color = Math.random() > 0.5 ? first : second;
      const delay = Math.random() * 2;
      const scale = Math.random() * 1 + 0.3;
      const id = `${x}-${y}-${Math.random()}`;
      return { id, x, y, color, delay, scale, lifespan: 0 };
    };
    return Array.from({ length: count }, generate);
  }, [count, first, second]);
}

/**
 * Animated sparkles overlaid on the nearest positioned ancestor. Drop inside any
 * `relative` element (e.g. a gradient word) to make it sparkle.
 */
export const SparkleField: React.FC<{
  count?: number;
  colors?: { first: string; second: string };
}> = ({ count = 8, colors = BRAND_SPARKLE_COLORS }) => {
  // Fewer sparkles on phones — each is an infinite framer-motion RAF loop.
  const isMobile = useIsMobile();
  const sparkles = useSparkles(isMobile ? Math.min(count, 5) : count, colors.first, colors.second);
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 block">
      {sparkles.map((sparkle) => (
        <Sparkle key={sparkle.id} {...sparkle} />
      ))}
    </span>
  );
};

/**
 * A word/phrase with sparkles overlaid. Pass `text-gradient` via className to
 * keep the brand gradient on the text itself.
 */
export const SparklesText: React.FC<{
  text: string;
  className?: string;
  sparklesCount?: number;
  colors?: { first: string; second: string };
}> = ({ text, className, sparklesCount = 8, colors = BRAND_SPARKLE_COLORS }) => (
  <span className={cn("relative inline-block", className)}>
    {text}
    <SparkleField count={sparklesCount} colors={colors} />
  </span>
);

const Sparkle: React.FC<Sparkle> = ({ id, x, y, color, delay, scale }) => (
  <motion.svg
    key={id}
    className="pointer-events-none absolute z-20"
    initial={{ opacity: 0, left: x, top: y }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, scale, 0],
      rotate: [75, 120, 150],
    }}
    transition={{ duration: 0.8, repeat: Infinity, delay }}
    width="14"
    height="14"
    viewBox="0 0 21 21"
  >
    <path
      d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z"
      fill={color}
    />
  </motion.svg>
);
