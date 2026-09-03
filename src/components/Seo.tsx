import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_ORIGIN = "https://vortura.ai";
const SITE_NAME = "Vortura Agency";
const DEFAULT_TITLE =
  "Vortura Agency | AI Automation & Websites for Local Businesses";
const DEFAULT_DESCRIPTION =
  "Vortura Agency builds AI-powered websites and automation tools for local businesses. Recover missed calls, book more appointments, and grow — 24/7.";
const DEFAULT_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e002d447-2faa-44c6-ae3e-55217efe8dc4/id-preview-9c647130--8d528547-130d-431b-8bf5-62b16565f98b.lovable.app-1776830193613.png";

export type SeoProps = {
  /** Page title. Appended with " | Vortura Agency" unless `titleFull` is set. */
  title?: string;
  /** Use as the exact <title>, without the site-name suffix. */
  titleFull?: string;
  description?: string;
  /** Absolute or site-relative OG/Twitter image URL. */
  image?: string;
  /** Discourage indexing (auth-gated app pages). */
  noindex?: boolean;
  /** Optional JSON-LD structured data object for this page. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

/** Find-or-create a <meta> tag and set its content. */
function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Per-route document head manager. Sets <title>, description, Open Graph,
 * and Twitter Card tags on mount and whenever the props change, and can
 * inject a page-scoped JSON-LD block (removed on unmount). Canonical URLs
 * are handled globally by <Canonical>. Dependency-free to match the app's
 * existing hand-rolled head components.
 */
export const Seo = ({
  title,
  titleFull,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  noindex = false,
  jsonLd,
}: SeoProps) => {
  const { pathname } = useLocation();

  const resolvedTitle =
    titleFull ?? (title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE);
  const resolvedImage = image.startsWith("http")
    ? image
    : `${SITE_ORIGIN}${image}`;
  const url = `${SITE_ORIGIN}${pathname === "/" ? "/" : pathname.replace(/\/+$/, "")}`;

  useEffect(() => {
    document.title = resolvedTitle;

    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    setMeta("property", "og:title", resolvedTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", resolvedImage);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:type", "website");

    setMeta("name", "twitter:title", resolvedTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", resolvedImage);
    setMeta("name", "twitter:card", "summary_large_image");
  }, [resolvedTitle, description, resolvedImage, url, noindex]);

  useEffect(() => {
    if (!jsonLd) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-jsonld", "true");
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [jsonLd]);

  return null;
};

export default Seo;
