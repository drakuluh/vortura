/**
 * Vite plugin: after the normal browser build, render every public route to
 * static HTML and generate sitemap.xml and llms.txt from the same data.
 *
 * Why a plugin and not an npm script: the host may run `vite build` directly,
 * and this runs either way. It is fail-soft. If anything here throws, the
 * build still succeeds and ships the plain single-page app, just without the
 * static pages, and the error is printed.
 *
 * Output layout: /services -> dist/services/index.html, which static hosts
 * serve for the extensionless URL. Any route not written here still falls
 * back to dist/index.html as before.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build, type Plugin, type ResolvedConfig } from "vite";

const SITE = "https://vortura.ai";
const SSR_OUT = "node_modules/.prerender";

type ResolvedSeo = {
  title: string;
  description: string;
  image: string;
  url: string;
  robots: string;
  type: string;
  publishedTime?: string;
  jsonLd?: unknown;
};

type PrerenderModule = {
  render: (url: string) => Promise<{ html: string; head: ResolvedSeo | null }>;
  publicRoutes: () => string[];
  routeSource: (route: string) => string | null;
  shellRoutes: () => string[];
  BLOG_POSTS: { slug: string; title: string; excerpt: string; date: string; updated?: string; category: string }[];
  services: { slug: string; title: string; desc: string }[];
  INDUSTRIES: { slug: string; name: string; subtext: string }[];
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Swap the template's default head tags for this page's. */
function applyHead(template: string, head: ResolvedSeo): string {
  let out = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(head.title)}</title>`)
    .replace(/\s*<link rel="canonical"[^>]*>/, "")
    .replace(/\s*<meta\s+(?:name|property)="(?:description|robots|og:type|og:title|og:description|og:url|og:image|og:site_name|twitter:title|twitter:description|twitter:image)"[^>]*>/g, "");

  const tags = [
    `<link rel="canonical" href="${esc(head.url)}" />`,
    `<meta name="description" content="${esc(head.description)}" />`,
    `<meta name="robots" content="${head.robots}" />`,
    `<meta property="og:type" content="${head.type}" />`,
    `<meta property="og:title" content="${esc(head.title)}" />`,
    `<meta property="og:description" content="${esc(head.description)}" />`,
    `<meta property="og:url" content="${esc(head.url)}" />`,
    `<meta property="og:image" content="${esc(head.image)}" />`,
    `<meta property="og:site_name" content="Vortura Agency" />`,
    `<meta name="twitter:title" content="${esc(head.title)}" />`,
    `<meta name="twitter:description" content="${esc(head.description)}" />`,
    `<meta name="twitter:image" content="${esc(head.image)}" />`,
  ];
  if (head.publishedTime) tags.push(`<meta property="article:published_time" content="${head.publishedTime}" />`);
  if (head.jsonLd) {
    // "<" escaped so text inside the data can never close the script tag.
    const json = JSON.stringify(head.jsonLd).replace(/</g, "\\u003c");
    tags.push(`<script type="application/ld+json" data-seo-jsonld="true">${json}</script>`);
  }
  return out.replace("</head>", `    ${tags.join("\n    ")}\n  </head>`);
}

type Manifest = Record<string, { file: string; imports?: string[] }>;

/**
 * <link rel="modulepreload"> for a page's own chunk and the shared chunks it
 * imports. Without it the browser finds the page chunk only after the main
 * bundle has downloaded and run: one extra round trip on every first visit
 * to an interior page. Chunks index.html already preloads are skipped.
 */
function pagePreloads(manifest: Manifest, source: string | null, template: string): string[] {
  if (!source || !manifest[source]) return [];
  const files = new Set<string>();
  const walk = (key: string) => {
    const entry = manifest[key];
    if (!entry || files.has(entry.file)) return;
    files.add(entry.file);
    entry.imports?.forEach(walk);
  };
  walk(source);
  return [...files]
    .filter((f) => f.endsWith(".js") && !template.includes(`/${f}"`))
    .map((f) => `<link rel="modulepreload" crossorigin href="/${f}">`);
}

/**
 * Lucide icons are decorative and make up about a third of the static
 * markup. Crawlers skip them and visitors with JavaScript never see this
 * copy, so leave them out. Other SVGs (illustrations, charts) stay.
 */
function stripDecorativeSvgs(html: string): string {
  return html.replace(/<svg\b[^>]*class="lucide[^"]*"[^>]*>[\s\S]*?<\/svg>/g, "");
}

/** The plain app shell for a client-only route: no page markup, not indexed. */
function shellPage(template: string, title: string): string {
  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/\s*<link rel="canonical"[^>]*>/, "")
    .replace("</head>", `    <meta name="robots" content="noindex" />\n  </head>`);
}

/**
 * Framer Motion renders entrance animations at their starting frame
 * (opacity 0, blurred). Without JavaScript nothing would ever animate them
 * in, so drop those two properties from the static markup.
 */
function revealMotionStarts(html: string): string {
  return html.replace(/style="([^"]*)"/g, (_m, css: string) => {
    const cleaned = css
      .replace(/(?:^|;)\s*opacity:\s*0(?:\.0+)?\s*(?=;|$)/g, "")
      .replace(/(?:^|;)\s*filter:\s*blur\([^)]*\)\s*(?=;|$)/g, "")
      .replace(/^;+/, "");
    return cleaned ? `style="${cleaned}"` : "";
  });
}

function sitemapXml(mod: PrerenderModule, routes: string[]): string {
  const lastChange = (p: PrerenderModule["BLOG_POSTS"][number]) => p.updated ?? p.date;
  const postDates = new Map(mod.BLOG_POSTS.map((p) => [`/blog/${p.slug}`, lastChange(p)]));
  const newestPost = mod.BLOG_POSTS.map(lastChange).sort().at(-1);
  const priority = (r: string) =>
    r === "/" ? "1.0" : ["/services", "/contact"].includes(r) ? "0.9" : r.startsWith("/services/") ? "0.8" : ["/privacy", "/terms", "/refund"].includes(r) ? "0.3" : "0.7";

  const urls = routes.map((r) => {
    const lastmod = postDates.get(r) ?? (r === "/blog" ? newestPost : undefined);
    return [
      "  <url>",
      `    <loc>${SITE}${r === "/" ? "/" : r}</loc>`,
      lastmod ? `    <lastmod>${lastmod}</lastmod>` : "",
      `    <priority>${priority(r)}</priority>`,
      "  </url>",
    ].filter(Boolean).join("\n");
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

function llmsTxt(mod: PrerenderModule): string {
  const posts = [...mod.BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));
  return [
    "# Vortura Agency",
    "",
    "> Websites and AI automation for local service businesses in Mississauga, the Greater Toronto Area, and across Canada and the US.",
    "",
    "Vortura Agency builds fast websites for local businesses and pairs them with automation: 24/7 AI call answering, NFC Google review cards, QR code menus, email newsletters, and customer reactivation campaigns. Contact: support@vortura.ai.",
    "",
    "## Main pages",
    "",
    `- [Home](${SITE}/): What we do and who it's for.`,
    `- [Services](${SITE}/services): Every service with pricing.`,
    `- [Process](${SITE}/process): How a project runs from first call to launch.`,
    `- [Results](${SITE}/results): Outcomes and client feedback.`,
    `- [About](${SITE}/about): Who runs Vortura.`,
    `- [Contact](${SITE}/contact): Book a call or send a message.`,
    "",
    "## Services",
    "",
    ...mod.services.map((s) => `- [${s.title}](${SITE}/services/${s.slug}): ${s.desc}`),
    "",
    "## Industries",
    "",
    ...mod.INDUSTRIES.map((i) => `- [${i.name}](${SITE}/industries/${i.slug}): ${i.subtext}`),
    "",
    "## Blog",
    "",
    ...posts.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}): ${p.excerpt}`),
    "",
    "## Optional",
    "",
    `- [Privacy](${SITE}/privacy)`,
    `- [Terms](${SITE}/terms)`,
    `- [Refund policy](${SITE}/refund)`,
    "",
  ].join("\n");
}

export function prerender(): Plugin {
  let config: ResolvedConfig;
  return {
    name: "vortura-prerender",
    apply: "build",
    configResolved(c) {
      config = c;
    },
    async closeBundle() {
      // Only after the browser build (not the nested SSR build below).
      if (config.build.ssr || process.env.VORTURA_PRERENDER_CHILD) return;
      const root = config.root;
      const outDir = path.resolve(root, config.build.outDir);
      const started = Date.now();

      try {
        process.env.VORTURA_PRERENDER_CHILD = "1";
        await build({
          root,
          mode: config.mode,
          logLevel: "warn",
          build: {
            ssr: "src/prerender.tsx",
            outDir: SSR_OUT,
            emptyOutDir: true,
            copyPublicDir: false,
            minify: false,
          },
        });
      } catch (err) {
        console.warn("\n[prerender] SSR build failed, shipping the SPA without static pages.\n", err);
        return;
      } finally {
        delete process.env.VORTURA_PRERENDER_CHILD;
      }

      try {
        const entry = path.resolve(root, SSR_OUT, "prerender.js");
        const mod: PrerenderModule = await import(pathToFileURL(entry).href);
        const template = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
        const routes = mod.publicRoutes();
        const manifestPath = path.join(outDir, ".vite", "manifest.json");
        const manifest: Manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
        let written = 0;

        for (const route of routes) {
          try {
            const { html, head } = await mod.render(route);
            if (!head) console.warn(`[prerender] ${route}: page rendered no <Seo>, keeping default head tags`);
            // A share image that isn't in the build would break link previews.
            if (head?.image.startsWith(SITE) && !fs.existsSync(path.join(outDir, head.image.slice(SITE.length)))) {
              console.warn(`[prerender] ${route}: ${head.image} not found, using /og-image.png (run scripts/og-images.py)`);
              head.image = `${SITE}/og-image.png`;
            }
            let page = head ? applyHead(template, head) : template;
            const preloads = pagePreloads(manifest, mod.routeSource(route), template);
            if (preloads.length) page = page.replace("</head>", `    ${preloads.join("\n    ")}\n  </head>`);
            page = page.replace('<div id="root"></div>', `<div id="root" data-prerendered>${stripDecorativeSvgs(revealMotionStarts(html))}</div>`);
            const file = route === "/" ? path.join(outDir, "index.html") : path.join(outDir, route, "index.html");
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, page);
            written++;
          } catch (err) {
            console.warn(`[prerender] ${route} failed, it will be served by the SPA shell.`, err);
          }
        }

        // Client-only routes get the bare shell (HTTP 200); anything else gets
        // 404.html, which static hosts serve with a real 404 status. It is the
        // same shell, so the app still boots and shows the not-found page.
        for (const route of mod.shellRoutes()) {
          const file = path.join(outDir, route, "index.html");
          fs.mkdirSync(path.dirname(file), { recursive: true });
          fs.writeFileSync(file, shellPage(template, "Vortura Agency"));
        }
        fs.writeFileSync(path.join(outDir, "404.html"), shellPage(template, "Page not found | Vortura Agency"));

        // Build metadata only; don't publish it.
        fs.rmSync(path.join(outDir, ".vite"), { recursive: true, force: true });
        fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemapXml(mod, routes));
        fs.writeFileSync(path.join(outDir, "llms.txt"), llmsTxt(mod));

        console.log(`[prerender] ${written}/${routes.length} routes, sitemap.xml, llms.txt in ${Date.now() - started}ms`);
      } catch (err) {
        console.warn("\n[prerender] Rendering failed, shipping the SPA without static pages.\n", err);
      }
    },
  };
}
