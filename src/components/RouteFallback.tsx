/**
 * Lightweight fallback shown while a lazily-loaded route chunk is fetched.
 * Kept dependency-free and unobtrusive — a centered, dimmed pulse that
 * inherits the page background so route transitions don't flash.
 */
export const RouteFallback = () => (
  <div
    className="flex min-h-[50vh] w-full items-center justify-center"
    role="status"
    aria-live="polite"
  >
    <span
      className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
      aria-hidden="true"
    />
    <span className="sr-only">Loading…</span>
  </div>
);

export default RouteFallback;
