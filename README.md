# Vortura Agency

Marketing site, client dashboard, and admin portal for **Vortura Agency** — websites and AI automations for local service businesses (missed-call text-back, AI voice agents, review automation, and done-for-you growth systems).

Live at **[vortura.ai](https://vortura.ai)**.

---

## Tech stack

| Area | Choice |
|------|--------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 (SWC) |
| Styling | Tailwind CSS 3 + custom design tokens (`src/index.css`) |
| UI components | shadcn/ui (Radix primitives) — `src/components/ui` |
| Animation | Framer Motion |
| Routing | React Router 6 (route-level code splitting via `React.lazy`) |
| Data fetching | TanStack Query |
| Backend | Supabase (Postgres, Auth, Edge Functions) |
| Payments | Stripe (embedded checkout + invoices) |
| Forms / validation | React Hook Form + Zod |
| Tests | Vitest + Testing Library |

## Getting started

Requires **Node 18+**.

```bash
npm install
npm run dev
```

The dev server runs at **http://localhost:8080**.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |

## Environment variables

Copy the values into a local `.env` (all are `VITE_`-prefixed and safe to expose to the browser — they are public keys, not secrets):

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |
| `VITE_PAYMENTS_CLIENT_TOKEN` | Client token for the payments flow |

> Server-side secrets (Stripe secret key, service-role key, email provider keys) live in **Supabase Edge Function** environment variables, never in this repo.

## Project structure

```
src/
  pages/            Route components
    admin/          Auth-protected admin portal
    admin-demo/     Public admin demo (sample data, no backend)
    dashboard/      Client dashboard (auth-gated)
    legal/          Privacy, Terms, Refund, About
  components/
    landing/        Marketing site (hero, services, ROI calculator, …)
    admin/          Admin layout + shared admin UI
    ui/             shadcn/ui primitives
    Seo.tsx         Per-route <title>/meta/OG/JSON-LD manager
    Canonical.tsx   Per-route canonical URL
  contexts/         React context providers (currency, …)
  hooks/            Custom hooks (auth, subscription, Stripe, …)
  integrations/     Supabase client + generated types
  data/             Static content (services, admin nav, …)
  lib/              Utilities

supabase/
  functions/        Edge Functions (Stripe, invoices, email queue, webhooks, chat)
  migrations/       Database schema migrations

public/             Static assets, robots.txt, sitemap.xml, llms.txt
```

## SEO

- Per-route titles, meta descriptions, Open Graph, and Twitter tags are managed by [`src/components/Seo.tsx`](src/components/Seo.tsx).
- Site-wide structured data (Organization / WebSite / ProfessionalService) is embedded statically in [`index.html`](index.html); per-page structured data (e.g. the Service list) is injected by `<Seo jsonLd={…} />`.
- `public/robots.txt` disallows crawling of auth-gated app routes; `public/sitemap.xml` lists the indexable marketing pages.

## Deployment

The app builds to a static `dist/` folder (`npm run build`) and can be hosted on any static host. Because it is a client-side SPA, the host must be configured to **rewrite all routes to `index.html`** so deep links (e.g. `/pricing`) resolve.
