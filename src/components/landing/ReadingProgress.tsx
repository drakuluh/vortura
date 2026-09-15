import { useEffect, useRef, type RefObject } from "react";

/**
 * A thin gradient bar across the top of the viewport that fills as the reader
 * moves through `target` (the article body, not the whole page, so it hits
 * 100% at the end of the text rather than at the footer). Decorative, so it's
 * hidden from assistive tech.
 */
export const ReadingProgress = ({ target }: { target: RefObject<HTMLElement> }) => {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = target.current;
      if (!el || !bar.current) return;
      const rect = el.getBoundingClientRect();
      // 0 when the article top reaches the viewport top; 1 when its bottom
      // reaches the viewport bottom.
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : rect.top <= 0 ? 1 : 0;
      bar.current.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return (
    <div aria-hidden="true" className="print:hidden fixed inset-x-0 top-0 z-[60] h-[3px] pointer-events-none">
      <div
        ref={bar}
        className="h-full origin-left bg-gradient-to-r from-primary to-secondary shadow-glow-blue"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
};
