import { useId } from "react";
import { useInViewPause } from "@/hooks/useInViewPause";

/**
 * Dashed path linking one process step to the next, with the dashes flowing in
 * the direction of travel.
 *
 * The step headers alternate sides from `lg` up (step 1 left, step 2 right,
 * step 3 left), so the curve mirrors to match — pass `flip` for the
 * right-to-left legs. Below `lg` the steps are a single stacked column, so the
 * run is a straight vertical instead of a curve that would point at nothing.
 *
 * `preserveAspectRatio="none"` lets the curve stretch to the container width;
 * `vector-effect: non-scaling-stroke` keeps the stroke weight and dash spacing
 * in screen space so they don't distort along with it.
 */
export const StepConnector = ({ flip = false }: { flip?: boolean }) => {
  const ref = useInViewPause<HTMLDivElement>();
  const base = `step-connector-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const curve = flip
    ? "M 900 0 C 900 55, 100 65, 100 120"
    : "M 100 0 C 100 55, 900 65, 900 120";

  const stroke = {
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };

  // Each SVG carries its own gradient: the wide one is display:none on small
  // screens, and a hidden subtree is not a reliable place to host a paint
  // server the visible SVG depends on.
  const Gradient = ({ id }: { id: string }) => (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.45" />
        <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.45" />
      </linearGradient>
    </defs>
  );

  return (
    <div ref={ref} aria-hidden="true" className="container pointer-events-none">
      <div className="max-w-6xl mx-auto">
        <svg
          className="hidden lg:block w-full h-24"
          viewBox="0 0 1000 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <Gradient id={`${base}-wide`} />
          <path
            d={curve}
            className="dash-flow"
            stroke={`url(#${base}-wide)`}
            {...stroke}
          />
        </svg>

        <svg
          className="lg:hidden w-full h-14"
          viewBox="0 0 1000 60"
          preserveAspectRatio="none"
          fill="none"
        >
          <Gradient id={`${base}-narrow`} />
          <path
            d="M 500 0 L 500 60"
            className="dash-flow"
            stroke={`url(#${base}-narrow)`}
            {...stroke}
          />
        </svg>
      </div>
    </div>
  );
};
