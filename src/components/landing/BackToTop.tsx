import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Appears once the visitor is two screens down. Hidden on short pages, where
 * the navbar is always within reach anyway.
 */
export const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > window.innerHeight * 2);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    // Keyboard users land back at the start of the page, not on a button
    // that just disappeared.
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "print:hidden fixed z-30 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] md:right-6 md:bottom-6",
        "flex h-11 w-11 items-center justify-center rounded-full glass-solid border border-white/15 text-foreground shadow-lg",
        "transition-[opacity,transform] duration-300 hover:border-primary/40 hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "motion-reduce:transition-none",
        visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3",
      )}
    >
      <ArrowUp className="h-4 w-4" aria-hidden="true" />
    </button>
  );
};
