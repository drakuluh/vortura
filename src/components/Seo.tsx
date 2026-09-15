import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_ORIGIN = "https://vortura.ai";
const SITE_NAME = "Vortura Agency";
const DEFAULT_TITLE =
  "Vortura Agency | AI Automation & Websites for Local Businesses";
const DEFAULT_DESCRIPTION =
  "Vortura Agency builds websites and AI automation tools for local businesses that answer missed calls and book appointments 24/7.";
const DEFAULT_IMAGE = "/og-image.png";

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
  /** "article" for blog posts; everything else is a "website". */
  type?: "website" | "article";
  /** ISO date, for articles. */
  publishedTime?: string;
  /** Optional JSON-LD structured data object for this page. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export type ResolvedSeo = {
  title: string;
  description: string;
  image: string;
  url: string;
  robots: string;
  type: "website" | "article";
  publishedTime?: string;
  jsonLd?: SeoProps["jsonLd"];
};

/** Turns page props into final tag values. Shared with the prerenderer. */
export function resolveSeo(props: SeoProps, pathname: string): ResolvedSeo {
  const { title, titleFull, description = DEFAULT_DESCRIPTION, image = DEFAULT_IMAGE, noindex = false } = props;
  return {
    title: titleFull ?? (title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE),
    description,
    image: image.startsWith("http") ? image : `${SITE_ORIGIN}${image}`,
    url: `${SITE_ORIGIN}${pathname === "/" ? "/" : pathname.replace(/\/+$/, "")}`,
    robots: noindex ? "noindex, nofollow" : "index, follow",
    type: props.type ?? "website",
    publishedTime: props.publishedTime,
    jsonLd: props.jsonLd,
  };
}

/**
 * During the build-time prerender, effects never run, so the page's <Seo>
 * records what it would have set here instead. The prerenderer resets this
 * before each route and reads it afterwards.
 */
export const ssrHead: { current: ResolvedSeo | null } = { current: null };

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
export const Seo = (props: SeoProps) => {
  const { pathname } = useLocation();
  const seo = resolveSeo(props, pathname);
  const { title: resolvedTitle, description, image: resolvedImage, url, robots, type, publishedTime } = seo;
  const { jsonLd } = props;

  if (import.meta.env.SSR) ssrHead.current = seo;

  useEffect(() => {
    document.title = resolvedTitle;

    setMeta("name", "description", description);
    setMeta("name", "robots", robots);

    setMeta("property", "og:title", resolvedTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", resolvedImage);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:type", type);
    // Only articles carry a publish date; clear it when leaving a post.
    const published = document.head.querySelector('meta[property="article:published_time"]');
    if (publishedTime) setMeta("property", "article:published_time", publishedTime);
    else published?.remove();

    setMeta("name", "twitter:title", resolvedTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", resolvedImage);
    setMeta("name", "twitter:card", "summary_large_image");
  }, [resolvedTitle, description, resolvedImage, url, robots, type, publishedTime]);

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
