/**
 * Ambient blue/purple glow blobs scattered down a page.
 *
 * Performance: each blob is a large blurred div that consumes GPU memory.
 * On mobile, only blobs marked `mobile: true` render (4 total instead of 21),
 * and the blur radius is reduced from 110px to 50px to cut GPU compositing cost.
 */

type Blob = {
  color: "primary" | "secondary";
  top: string;
  side: "left" | "right" | "center";
  size: "sm" | "md" | "lg";
  opacity?: number;
  mobile?: boolean;
};

const BLOBS: Blob[] = [
  { color: "primary",   top: "110vh", side: "left",   size: "md", opacity: 0.30, mobile: true },
  { color: "secondary", top: "130vh", side: "center", size: "lg", opacity: 0.33 },
  { color: "secondary", top: "150vh", side: "right",  size: "lg", opacity: 0.28 },

  { color: "secondary", top: "220vh", side: "left",   size: "md", opacity: 0.30 },
  { color: "primary",   top: "240vh", side: "center", size: "lg", opacity: 0.35, mobile: true },
  { color: "primary",   top: "260vh", side: "right",  size: "md", opacity: 0.28 },

  { color: "primary",   top: "320vh", side: "right",  size: "lg", opacity: 0.30, mobile: true },
  { color: "secondary", top: "345vh", side: "center", size: "lg", opacity: 0.33 },
  { color: "secondary", top: "370vh", side: "left",   size: "md", opacity: 0.28 },

  { color: "secondary", top: "440vh", side: "right",  size: "md", opacity: 0.30 },
  { color: "primary",   top: "460vh", side: "center", size: "lg", opacity: 0.33, mobile: true },
  { color: "primary",   top: "480vh", side: "left",   size: "lg", opacity: 0.25 },

  { color: "secondary", top: "550vh", side: "right",  size: "lg", opacity: 0.30 },
  { color: "primary",   top: "580vh", side: "left",   size: "md", opacity: 0.33 },
  { color: "primary",   top: "610vh", side: "center", size: "lg", opacity: 0.28 },

  { color: "secondary", top: "680vh", side: "left",   size: "lg", opacity: 0.30 },
  { color: "primary",   top: "710vh", side: "right",  size: "md", opacity: 0.33 },
  { color: "secondary", top: "740vh", side: "center", size: "lg", opacity: 0.28 },

  { color: "primary",   top: "810vh", side: "right",  size: "md", opacity: 0.30 },
  { color: "secondary", top: "840vh", side: "left",   size: "lg", opacity: 0.33 },
  { color: "primary",   top: "870vh", side: "center", size: "lg", opacity: 0.25 },
];

const sizeClass: Record<Blob["size"], string> = {
  sm: "w-[min(70vw,320px)]",
  md: "w-[min(80vw,460px)]",
  lg: "w-[min(90vw,600px)]",
};

const sideStyle = (side: Blob["side"]): React.CSSProperties => {
  if (side === "left") return { left: "-8%", transform: "translate3d(0,-50%,0)" };
  if (side === "right") return { right: "-8%", transform: "translate3d(0,-50%,0)" };
  return { left: "50%", transform: "translate3d(-50%,-50%,0)" };
};

export const PageGlows = () => (
  <div
    aria-hidden="true"
    className="print:hidden pointer-events-none absolute inset-0 overflow-hidden -z-10"
  >
    {BLOBS.map((b, i) => {
      const colorClass =
        b.color === "primary" ? "bg-primary" : "bg-secondary";
      return (
        <div
          key={i}
          className={`absolute ${sizeClass[b.size]} aspect-square rounded-full ${colorClass} blur-[50px] md:blur-[110px] ${b.mobile ? "" : "hidden md:block"}`}
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
