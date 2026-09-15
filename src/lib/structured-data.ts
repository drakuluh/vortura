/**
 * Helpers for page-level JSON-LD. The organization itself is described once,
 * in the @graph in index.html; pages point at it by @id instead of repeating
 * (and drifting from) its details.
 */
export const SITE_ORIGIN = "https://vortura.ai";

export const ORGANIZATION_REF = { "@id": `${SITE_ORIGIN}/#organization` } as const;

export type Crumb = { name: string; path: string };

/** BreadcrumbList for a page. Home is added automatically as the first item. */
export function breadcrumbJsonLd(trail: Crumb[]) {
  const items = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_ORIGIN}${c.path}`,
    })),
  };
}
