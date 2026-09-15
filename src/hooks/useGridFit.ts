import { useEffect } from "react";

/** Design-intent cell size; the applied size is nudged off this to fit evenly. */
const BASE_CELL = 60;

/**
 * Publishes a `--grid-cell` size that divides the viewport into a whole number
 * of background-grid columns, so the right edge never ends on a clipped cell.
 *
 * Measures `documentElement.clientWidth` rather than `100vw` because the grid
 * layers are `fixed inset-0`, which excludes the scrollbar — `100vw` includes
 * it, which is exactly what would reintroduce the partial column.
 *
 * The resulting size is usually fractional (1280 / 21 = 60.95px). That's the
 * point: 21 cells then sum to exactly 1280 instead of 21.33 cells summing past
 * the edge.
 */
export function useGridFit() {
  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      const width = root.clientWidth;
      if (!width) return;
      const columns = Math.max(1, Math.round(width / BASE_CELL));
      root.style.setProperty("--grid-cell", `${width / columns}px`);
    };

    apply();

    // ResizeObserver catches everything a resize event does plus the cases it
    // misses — a scrollbar appearing when content grows, zoom, split-screen.
    const observer = new ResizeObserver(apply);
    observer.observe(root);
    window.addEventListener("orientationchange", apply);

    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", apply);
      root.style.removeProperty("--grid-cell");
    };
  }, []);
}
