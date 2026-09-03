/**
 * Reusable hero-style background: grid pattern + blue/purple glows.
 * Mirrors the look of the home Hero section.
 */
/**
 * Reusable hero-style background: grid pattern + blue/purple glows.
 * Self-contained: clips horizontally and uses GPU-only transforms so the
 * glows never affect layout or trigger reflow during scroll/reveal animations.
 */
export const PageHeroBg = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 isolate overflow-hidden contain-paint [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]"
  >
    {/* Fixed-size hero region (matches the home Hero's ~100svh layout) so the
        glow positions are identical across every page regardless of page length. */}
    <div className="absolute inset-x-0 top-0 h-[100svh] min-h-[100svh]">
      <div className="absolute inset-0 grid-bg" />
      <div
        className="absolute top-1/3 left-1/2 sm:left-1/4 w-[min(80vw,500px)] aspect-square rounded-full bg-primary/20 blur-[80px] sm:blur-[120px]"
        style={{ willChange: "transform", transform: "translate3d(-50%, -50%, 0)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/2 sm:right-1/4 w-[min(80vw,500px)] aspect-square rounded-full bg-secondary/20 blur-[80px] sm:blur-[120px]"
        style={{ willChange: "transform", transform: "translate3d(50%, 0, 0)" }}
      />
    </div>
  </div>
);