import { BLOG_POSTS, type BlogPost } from "./blog-posts";

/**
 * Which service (and, where one fits, which industry page) each post is about.
 * Drives the "related service" card on posts and the "from the blog" links on
 * service and industry pages, so readers and crawlers can move between the
 * two. The first service listed is the one a post promotes.
 *
 * When you add a post, add it here too. Posts missing from this map simply
 * show no service card.
 */
export const BLOG_LINKS: Record<string, { services: string[]; industry?: string }> = {
  "missed-calls-costing-you": { services: ["ai-call-answering"] },
  "nfc-vs-qr-google-reviews": { services: ["nfc-review-cards", "qr-code-menus"] },
  "5-automations-trades-contractors": { services: ["ai-call-answering", "database-reactivation"], industry: "trades" },
  "google-business-profile-local-search": { services: ["websites-local-business", "nfc-review-cards"] },
  "qr-menus-done-right": { services: ["qr-code-menus"], industry: "restaurants" },
  "reactivating-dormant-customers": { services: ["database-reactivation"] },
  "newsletters-local-customers-open": { services: ["email-newsletters"] },
  "website-speed-local-business": { services: ["websites-local-business"] },
  "after-hours-calls-revenue": { services: ["ai-call-answering"] },
  "how-many-google-reviews": { services: ["nfc-review-cards"] },
  "local-seo-service-businesses": { services: ["websites-local-business", "nfc-review-cards"] },
  "ai-receptionist-vs-answering-service": { services: ["ai-call-answering"] },
  "repeat-customers-local-business": { services: ["email-newsletters", "database-reactivation"] },
  "booking-link-local-business": { services: ["websites-local-business", "ai-call-answering"] },
  "print-still-works-local": { services: ["print-digital-design"] },
  "email-signatures-marketing-channel": { services: ["email-signatures"] },
  "real-estate-lead-response-time": { services: ["ai-call-answering"], industry: "real-estate" },
  "restaurant-covers-and-tech": { services: ["qr-code-menus", "ai-call-answering"], industry: "restaurants" },
  "contractor-quote-speed": { services: ["ai-call-answering"], industry: "trades" },
  "what-to-automate-first": { services: ["ai-call-answering", "database-reactivation"] },
  "seasonal-demand-automation": { services: ["email-newsletters", "database-reactivation"] },
  "measuring-marketing-roi-small-business": { services: ["websites-local-business"] },
  "one-person-business-systems": { services: ["ai-call-answering", "websites-local-business"] },
};

const newestFirst = (a: BlogPost, b: BlogPost) => b.date.localeCompare(a.date);

/** Up to `limit` other posts: same category first, then shared services, then newest. */
export function relatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const mine = new Set(BLOG_LINKS[post.slug]?.services ?? []);
  const score = (p: BlogPost) =>
    (p.category === post.category ? 2 : 0) +
    ((BLOG_LINKS[p.slug]?.services ?? []).some((s) => mine.has(s)) ? 1 : 0);
  return BLOG_POSTS.filter((p) => p.slug !== post.slug)
    .sort((a, b) => score(b) - score(a) || newestFirst(a, b))
    .slice(0, limit);
}

/** Posts about a service, newest first. */
export function postsForService(slug: string, limit = 3): BlogPost[] {
  return BLOG_POSTS.filter((p) => BLOG_LINKS[p.slug]?.services.includes(slug))
    .sort(newestFirst)
    .slice(0, limit);
}

/** Posts about an industry, newest first. */
export function postsForIndustry(slug: string, limit = 3): BlogPost[] {
  return BLOG_POSTS.filter((p) => BLOG_LINKS[p.slug]?.industry === slug)
    .sort(newestFirst)
    .slice(0, limit);
}
