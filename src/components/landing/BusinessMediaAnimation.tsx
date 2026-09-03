import { cn } from "@/lib/utils";
import { MacbookPro } from "@/components/ui/macbook-pro";
import { useInViewPause } from "@/hooks/useInViewPause";
import "./business-media-animation.css";

const SWATCHES = ["#1AB3FF", "#C44DFF", "#FF2D78", "#FFB057"];

export const BusinessMediaAnimation = ({ className }: { className?: string }) => {
  const ref = useInViewPause<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn("bm-anim", className)}
      role="img"
      aria-label="A design being built — shapes and colors are selected, then exported as a print-ready PDF."
    >
      <div className="bm-device">
        <MacbookPro className="bm-mac text-[#0b1220]" />

        <div className="bm-screen" aria-hidden="true">
          {/* Left toolbar */}
          <div className="bm-toolbar">
            <span className="bm-tool bm-tool-rect">
              <svg viewBox="0 0 16 16" width="100%" height="100%"><rect x="2" y="2" width="12" height="12" rx="1.5" fill="currentColor" /></svg>
            </span>
            <span className="bm-tool bm-tool-circle">
              <svg viewBox="0 0 16 16" width="100%" height="100%"><circle cx="8" cy="8" r="6" fill="currentColor" /></svg>
            </span>
            <span className="bm-tool bm-tool-tri">
              <svg viewBox="0 0 16 16" width="100%" height="100%"><polygon points="8,2 14,14 2,14" fill="currentColor" /></svg>
            </span>
            <div className="bm-palette">
              {SWATCHES.map((c, i) => (
                <span
                  key={c}
                  className="bm-swatch"
                  style={{ ["--c" as string]: c, ["--i" as string]: i }}
                />
              ))}
            </div>
          </div>

          {/* Canvas / artboard */}
          <div className="bm-canvas">
            <span className="bm-shape bm-shape-rect" />
            <span className="bm-shape bm-shape-circle" />
            <span className="bm-shape bm-shape-tri">
              <svg viewBox="0 0 60 52" width="100%" height="100%"><polygon points="30,0 60,52 0,52" fill="currentColor" /></svg>
            </span>
            <span className="bm-textbar bm-textbar-1" />
            <span className="bm-textbar bm-textbar-2" />
          </div>

          {/* Checkmark button */}
          <div className="bm-confirm">
            <span className="bm-confirm-btn">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none">
                <path d="M5 12l4 4 10-10" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="bm-confirm-ripple" />
          </div>

          {/* Cursor */}
          <span className="bm-cursor">
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none">
              <path
                d="M5 3l14 8-6 1.5L10 19 5 3z"
                fill="#fff"
                stroke="#0f172a"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          {/* Export result */}
          <div className="bm-result">
            <span className="bm-result-pill">
              <span className="bm-result-check">
                <svg viewBox="0 0 24 24" width="8" height="8" fill="none">
                  <path d="M5 12l4 4 10-10" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Print-ready · PDF
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessMediaAnimation;
