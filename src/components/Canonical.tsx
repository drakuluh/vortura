import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_ORIGIN = "https://vortura.ai";

/**
 * Keeps a single <link rel="canonical"> tag in <head> in sync with the
 * current route. Strips query strings and hashes; normalizes trailing slash.
 */
export const Canonical = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
    const href = `${SITE_ORIGIN}${path}`;

    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);
  }, [pathname]);

  return null;
};

export default Canonical;