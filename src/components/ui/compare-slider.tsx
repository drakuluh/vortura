import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CompareSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** Starting divider position, 0–100. */
  initial?: number;
  className?: string;
}

/**
 * Drag-to-reveal comparison of two images.
 *
 * Keyboard-operable on purpose: the handle is a real slider role with arrow-key
 * support, because a drag-only control is unusable for anyone not using a
 * mouse. Pointer Events cover mouse, touch and pen in one path.
 */
export const CompareSlider = ({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  beforeLabel = "Before",
  afterLabel = "After",
  initial = 50,
  className,
}: CompareSliderProps) => {
  const [pct, setPct] = useState(initial);
  const frameRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const labelId = useId();

  const setFromClientX = useCallback((clientX: number) => {
    const el = frameRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    if (!width) return;
    const next = ((clientX - left) / width) * 100;
    setPct(Math.min(100, Math.max(0, next)));
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      setFromClientX(e.clientX);
    };
    const stop = () => { draggingRef.current = false; };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [setFromClientX]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") { setPct((p) => Math.max(0, p - step)); e.preventDefault(); }
    if (e.key === "ArrowRight") { setPct((p) => Math.min(100, p + step)); e.preventDefault(); }
    if (e.key === "Home") { setPct(0); e.preventDefault(); }
    if (e.key === "End") { setPct(100); e.preventDefault(); }
  };

  return (
    <div
      ref={frameRef}
      className={cn(
        "relative select-none overflow-hidden rounded-2xl glass-strong border-gradient touch-pan-y",
        className
      )}
      onPointerDown={(e) => {
        draggingRef.current = true;
        setFromClientX(e.clientX);
      }}
    >
      {/* After sits underneath and is fully visible; before is clipped over it. */}
      <img src={afterSrc} alt={afterAlt} className="block w-full h-auto" draggable={false} />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        <img
          src={beforeSrc}
          alt={beforeAlt}
          className="block w-full h-auto"
          draggable={false}
        />
      </div>

      <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-black/50 border border-white/15 text-white/80 backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-primary/20 border border-primary/30 text-primary backdrop-blur-sm">
        {afterLabel}
      </span>

      <div
        className="absolute inset-y-0 w-px bg-white/70 pointer-events-none"
        style={{ left: `${pct}%` }}
      />

      <div
        role="slider"
        tabIndex={0}
        aria-label="Reveal before and after"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-valuetext={`${Math.round(pct)}% before`}
        onKeyDown={onKeyDown}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full glass-solid grid place-items-center cursor-ew-resize focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{ left: `${pct}%` }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white/80">
          <path d="M9 6 3 12l6 6M15 6l6 6-6 6" />
        </svg>
      </div>
      <span id={labelId} className="sr-only">
        {beforeLabel} versus {afterLabel} comparison
      </span>
    </div>
  );
};
