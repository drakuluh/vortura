/**
 * Fixed gradient overlay sitting between the page content and the floating navbar.
 * Solid background color near the top fades to transparent below the navbar so any
 * content scrolling under the header disappears smoothly into the background.
 */
export const TopFade = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-x-0 top-0 z-40 h-16"
    style={{
      background:
        "linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--background)) 55%, hsl(var(--background) / 0.85) 75%, hsl(var(--background) / 0) 100%)",
    }}
  />
);