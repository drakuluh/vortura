/**
 * Build-time render entry. Not part of the browser bundle: the prerender
 * plugin (scripts/prerender-plugin.ts) builds this file for Node, renders
 * every public route to HTML, and writes one static file per route. That
 * gives crawlers, AI assistants, and link-preview scrapers real content and
 * the right title and share tags without running JavaScript.
 */
import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { AppRoutes } from "./AppRoutes.tsx";
import { ssrHead, type ResolvedSeo } from "@/components/Seo";
import { BLOG_POSTS } from "@/data/blog-posts";
import { services } from "@/data/services";
import { INDUSTRIES } from "@/data/industries";
import { MARKETING_SERVICES } from "@/data/marketing-services";

export { BLOG_POSTS, services, INDUSTRIES };

/** Public, indexable routes. Auth, dashboard, admin, and the parked
 *  /marketing pages stay client-only. */
export function publicRoutes(): string[] {
  return [
    "/",
    "/services",
    ...services.map((s) => `/services/${s.slug}`),
    "/process",
    "/results",
    "/contact",
    "/about",
    "/blog",
    ...BLOG_POSTS.map((p) => `/blog/${p.slug}`),
    ...INDUSTRIES.map((i) => `/industries/${i.slug}`),
    "/privacy",
    "/terms",
    "/refund",
  ];
}

/** Source module of each route's page, so the prerenderer can preload its
 *  chunk. Home is in the main bundle and needs none. */
export function routeSource(route: string): string | null {
  const exact: Record<string, string> = {
    "/services": "src/pages/Services.tsx",
    "/services/nfc-review-cards": "src/pages/NfcReviewCardsPage.tsx",
    "/process": "src/pages/ProcessPage.tsx",
    "/results": "src/pages/ResultsPage.tsx",
    "/contact": "src/pages/ContactPage.tsx",
    "/about": "src/pages/AboutPage.tsx",
    "/blog": "src/pages/BlogPage.tsx",
    "/privacy": "src/pages/legal/Privacy.tsx",
    "/terms": "src/pages/legal/Terms.tsx",
    "/refund": "src/pages/legal/Refund.tsx",
  };
  if (exact[route]) return exact[route];
  if (route.startsWith("/services/")) return "src/pages/ServiceDetail.tsx";
  if (route.startsWith("/blog/")) return "src/pages/BlogPostPage.tsx";
  if (route.startsWith("/industries/")) return "src/pages/IndustryPage.tsx";
  return null;
}

/**
 * Real routes that stay client-only (sign-in, dashboard, admin, parked
 * pages). Each gets a copy of the plain app shell so the host answers them
 * with 200; everything else falls through to 404.html. Routes with an :id
 * can't be listed, so they're served by 404.html, which is the same shell and
 * still loads the right page, just with a 404 status nobody sees.
 */
export function shellRoutes(): string[] {
  return [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/onboarding",
    "/checkout/return",
    "/dashboard",
    "/dashboard/request-change",
    "/dashboard/messages",
    "/dashboard/invoices",
    "/dashboard/billing",
    "/dashboard/profile",
    "/admin",
    ...["tasks", "bookings", "clients", "packages", "invoices", "messages", "change-requests", "admins", "settings"].map((p) => `/admin/${p}`),
    "/admin-demo",
    ...["clients", "packages", "invoices", "messages", "change-requests", "admins", "settings"].map((p) => `/admin-demo/${p}`),
    "/marketing",
    ...MARKETING_SERVICES.map((s) => `/marketing/${s.slug}`),
  ];
}

export async function render(url: string): Promise<{ html: string; head: ResolvedSeo | null }> {
  ssrHead.current = null;
  const queryClient = new QueryClient();

  const html = await new Promise<string>((resolve, reject) => {
    let out = "";
    const sink = new PassThrough();
    sink.on("data", (chunk) => (out += chunk));
    sink.on("end", () => resolve(out));

    const { pipe } = renderToPipeableStream(
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          <StaticRouter location={url}>
            <AppRoutes />
          </StaticRouter>
        </MotionConfig>
      </QueryClientProvider>,
      {
        // Wait for every lazy route chunk so the page itself is in the
        // output, not the loading spinner.
        onAllReady: () => pipe(sink),
        onShellError: reject,
        onError: (err) => reject(err),
      },
    );
  });

  return { html, head: ssrHead.current };
}
