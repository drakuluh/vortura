import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Shared motion presets that skip animation on mobile (instant render)
 * and use whileInView scroll-triggered reveals on desktop.
 */

export const useHeaderAnim = () => {
  const isMobile = useIsMobile();
  return isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" as const },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };
};

export const useCardAnim = (yOffset = 20, delay = 0.15) => {
  const isMobile = useIsMobile();
  return isMobile
    ? { initial: false as const, animate: { y: 0 } }
    : {
        initial: { y: yOffset },
        whileInView: { y: 0 },
        viewport: { once: true, margin: "-80px" as const },
        transition: { duration: 0.6, ease: "easeOut" as const, delay },
      };
};

export const useRevealAnim = (yOffset = 16, delayStep = 0.05) => {
  const isMobile = useIsMobile();
  return (i = 0, _isMobileOverride?: boolean) =>
    isMobile
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: yOffset },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" as const },
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay: delayStep * i },
        };
};

export const useScaleRevealAnim = () => {
  const isMobile = useIsMobile();
  return (i = 0, delayStep = 0.08) =>
    isMobile
      ? { initial: false as const, animate: { opacity: 1, scale: 1 } }
      : {
          initial: { opacity: 0, scale: 0.95 },
          whileInView: { opacity: 1, scale: 1 },
          viewport: { once: true, margin: "-60px" as const },
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: delayStep * i },
        };
};

export const useAnimProps = () => {
  const isMobile = useIsMobile();
  const header = useHeaderAnim();
  const reveal = useRevealAnim(24, 0.08);
  return { header, reveal, isMobile };
};
