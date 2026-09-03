/**
 * Ambient blue/purple glow blobs scattered down a page.
 *
 * Designed to mirror the blurred orb aesthetic from the home Hero section
 * but distributed vertically across the entire page so the same vibe
 * persists as the user scrolls.
 *
 * Rendering notes:
 *  - `pointer-events-none` so glows never intercept clicks.
 *  - `aria-hidden` because glows are purely decorative.
 *  - Each blob uses `translate3d` + `will-change: transform` so it stays on
 *    its own GPU layer and doesn't trigger layout/paint during scroll.
 *  - The container is `absolute inset-0` and meant to live inside a
 *    `relative` parent that wraps the whole page content. It sits behind
 *    everything via `-z-10`.
 *  - Blobs are positioned with `top: <vh>` values so they spread down the
 *    full document, not just the first viewport.
 */

type Blob = {
  /** Tailwind color: "primary" (blue) or "secondary" (purple). */
  color: "primary" | "secondary";
  /** Vertical anchor down the page, expressed in viewport heights. */
  top: string;
  /** Horizontal anchor — Tailwind position classes. */
  side: "left" | "right" | "center";
  /** Diameter token. */
  size: "sm" | "md" | "lg";
  /** Opacity multiplier (0–1). Defaults to 0.18. */
  opacity?: number;
  /** Shown on mobile too? If false, the blob is desktop-only (halves the
      count of expensive blurred layers on phones). */
  mobile?: boolean;
};

// Distributed blobs down the page. Tweak as needed.
// Sizes (Tailwind clamps via min(vw, px)):
//  sm ≈ 320px, md ≈ 460px, lg ≈ 600px
const BLOBS: Blob[] = [
  // Bento services area
  { color: "primary",   top: "110vh", side: "left",   size: "md", opacity: 0.18, mobile: true },
  { color: "secondary", top: "130vh", side: "center", size: "lg", opacity: 0.20 },
  { color: "secondary", top: "150vh", side: "right",  size: "lg", opacity: 0.16 },

  // ROI calculator area
  { color: "secondary", top: "220vh", side: "left",   size: "md", opacity: 0.18 },
  { color: "primary",   top: "240vh", side: "center", size: "lg", opacity: 0.22, mobile: true },
  { color: "primary",   top: "260vh", side: "right",  size: "md", opacity: 0.16 },

  // Process area
  { color: "primary",   top: "320vh", side: "right",  size: "lg", opacity: 0.18, mobile: true },
  { color: "secondary", top: "345vh", side: "center", size: "lg", opacity: 0.20 },
  { color: "secondary", top: "370vh", side: "left",   size: "md", opacity: 0.16 },

  // Contact form area
  { color: "secondary", top: "440vh", side: "right",  size: "md", opacity: 0.18 },
  { color: "primary",   top: "460vh", side: "center", size: "lg", opacity: 0.20, mobile: true },
  { color: "primary",   top: "480vh", side: "left",   size: "lg", opacity: 0.14 },
];

const sizeClass: Record<Blob["size"], string> = {
  sm: "w-[min(70vw,320px)]",
  md: "w-[min(80vw,460px)]",
  lg: "w-[min(90vw,600px)]",
};

const sideStyle = (side: Blob["side"]): React.CSSProperties => {
  // We use translate3d so the blob is GPU-composited and stays put cheaply
  // during scroll. The translate values center the blob on its anchor point.
  if (side === "left") return { left: "-8%", transform: "translate3d(0,-50%,0)" };
  if (side === "right") return { right: "-8%", transform: "translate3d(0,-50%,0)" };
  return { left: "50%", transform: "translate3d(-50%,-50%,0)" };
};

export const PageGlows = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 overflow-hidden -z-10"
  >
    {BLOBS.map((b, i) => {
      const colorClass =
        b.color === "primary" ? "bg-primary" : "bg-secondary";
      return (
        <div
          key={i}
          className={`absolute ${sizeClass[b.size]} aspect-square rounded-full ${colorClass} blur-[70px] md:blur-[110px] ${b.mobile ? "" : "hidden md:block"}`}
          style={{
            top: b.top,
            opacity: b.opacity ?? 0.18,
            ...sideStyle(b.side),
          }}
        />
      );
    })}
  </div>
);