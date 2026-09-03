import { useEffect, useRef } from "react";

/**
 * Returns a ref that, when attached to an element, pauses all CSS animations
 * inside it while it is scrolled out of view (and resumes them when it comes
 * back). Looping animations that run off-screen burn GPU/CPU and battery for
 * no visible benefit — especially costly on mobile — so this keeps only the
 * on-screen animation alive.
 *
 * Pairs with the global `.anim-paused` rule in index.css.
 */
export function useInViewPause<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => {
        el.classList.toggle("anim-paused", !entry.isIntersecting);
      },
      { rootMargin: "150px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}
