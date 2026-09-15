/**
 * First focusable element on every marketing page. Keyboard and screen-reader
 * users can jump past the navbar straight to the page content. Invisible
 * until focused.
 */
export const SkipLink = () => (
  <a
    href="#main"
    onClick={(e) => {
      // Move focus explicitly (a plain hash jump scrolls but, in some
      // browsers, leaves focus on the link) and keep the URL clean.
      e.preventDefault();
      const main = document.getElementById("main");
      main?.focus({ preventScroll: true });
      main?.scrollIntoView();
    }}
    className="print:hidden sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:px-4 focus:py-3 focus:glass-solid focus:border focus:border-primary/40 focus:text-sm focus:font-semibold focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
  >
    Skip to content
  </a>
);
