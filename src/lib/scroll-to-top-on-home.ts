import type { MouseEvent } from "react";

/**
 * For logo links to "/": when the visitor is already on the home page, a
 * navigation would do nothing, so scroll back to the top instead.
 */
export const scrollToTopIfHome = (pathname: string) => (e: MouseEvent) => {
  if (pathname !== "/") return;
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
};
