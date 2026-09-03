// Resolves the public-facing site URL for building deep links in notifications.
// Override via the SITE_URL env var if you ever swap domains.
const DEFAULT_SITE_URL = "https://www.vortura.ai";

export function siteUrl(): string {
  return (Deno.env.get("SITE_URL") ?? DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export function adminUrl(path: string, params?: Record<string, string | undefined>): string {
  const base = siteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!params) return `${base}${cleanPath}`;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
  const q = qs.toString();
  return `${base}${cleanPath}${q ? `?${q}` : ""}`;
}