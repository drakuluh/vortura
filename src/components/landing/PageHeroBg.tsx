/**
 * Ambient hero backdrop: grid pattern + blue/purple glows.
 *
 * Fixed to the viewport rather than the page, for two reasons:
 *  - the glows land in exactly the same place on every page, regardless of
 *    how tall that page is or where the user has scrolled to;
 *  - the grid stays put while content scrolls over it, so it reads as a
 *    stationary canvas instead of a texture sliding up the screen.
 *
 * Because it is viewport-sized it needs no inner height box — `inset-0` is
 * already exactly one viewport.
 */
export const PageHeroBg = () => (
  <div
    aria-hidden="true"
    className="print:hidden pointer-events-none fixed inset-0 -z-10 isolate overflow-hidden contain-paint [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]"
  >
    <div className="absolute inset-0 grid-bg" />
    <div
      className="absolute top-1/3 left-1/2 sm:left-1/4 w-[min(80vw,500px)] aspect-square rounded-full bg-primary/35 blur-[50px] sm:blur-[120px]"
      style={{ willChange: "transform", transform: "translate3d(-50%, -50%, 0)" }}
    />
    <div
      className="absolute bottom-1/4 right-1/2 sm:right-1/4 w-[min(80vw,500px)] aspect-square rounded-full bg-secondary/35 blur-[50px] sm:blur-[120px]"
      style={{ willChange: "transform", transform: "translate3d(50%, 0, 0)" }}
    />
  </div>
);
