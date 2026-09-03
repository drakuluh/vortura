## Scope B — Local-Business Repositioning

Rewrite four files so the entire landing experience speaks to local SMB owners (plumbers, salons, dentists, gyms, restaurants) instead of B2B SaaS teams.

### 1. `src/pages/Pricing.tsx` — replace tiers

Replace the existing `tiers` array with three local-business packages:

- **Get Online** — `$799` one-time
  - Tag: `FOR LOCAL BUSINESSES`
  - Blurb: "A real website for your business — live in 2 weeks."
  - Features: 4-page mobile-first site · Click-to-call + directions · Contact form to your email · Google Business Profile setup · Basic local SEO · 1 round of revisions
  - CTA: "Get online"

- **Get More Calls** — `$1,200` one-time + `$149 / month` *(MOST POPULAR, featured)*
  - Tag: `MOST POPULAR`
  - Blurb: "Website + automated lead capture so you never miss a customer."
  - Features: Everything in Get Online · Missed-call text-back (auto-text in 30s) · Automated SMS review requests · Lead notifications to your phone · Monthly performance report · Site care included
  - CTA: "Capture more leads"

- **Get More Customers** — `$2,500` setup + `$399 / month`
  - Tag: `FULL GROWTH SYSTEM`
  - Blurb: "Site + lead capture + 24/7 AI call answering."
  - Features: Everything in Get More Calls · AI voice agent answers after-hours · Automated lead qualification + booking · CRM setup + lead routing · Bi-weekly strategy calls · Priority support
  - CTA: "Grow with us"

Update hero copy:
- Eyebrow: `// Pricing`
- Heading: `Built for <span class="text-gradient">local business.</span>`
- Subhead: "Flat pricing. No surprises. Cancel anytime."

Update footer line to: "Every package includes onboarding, training, and a real human you can call."

Layout stays `md:grid-cols-3`. Cadence rendering already handles tiers with both one-time + monthly via the existing `cadence` field — for the two combo tiers, embed the combo in the `price` string (e.g. `$1,200 + $149/mo`) so the layout doesn't need restructuring. Cadence field stays empty for combo tiers.

### 2. `src/data/services.ts` — prune to 3, reframe

Reduce the `services` array from 6 to 3 entries focused on local SMB needs. Remove: Workflow Automation, Custom Chatbots, AI Outreach, Lead Enrichment & CRM.

- **Websites for Local Business** (slug `websites-local-business`, icon `Globe`, accent `primary`)
  - Tag: `DESIGN · BUILD · MAINTAIN`
  - Outcomes/deliverables/tech rewritten for local biz: fast mobile site, click-to-call, Google Business setup, monthly maintenance, no developer needed.
  - Timeline: "2 weeks to launch"

- **24/7 AI Call Answering** (slug `ai-call-answering`, icon `Phone`, accent `secondary`)
  - Tag: `INBOUND · AFTER-HOURS`
  - Reframe of current Voice AI Agents copy: never miss an after-hours call, books appointments into your calendar, sends transcripts to your phone, sounds human.
  - Timeline: "2–3 weeks to launch"

- **Missed-Call Text-Back & Reviews** (slug `missed-call-reviews`, icon `Send`, accent `primary`)
  - Tag: `SMS AUTOMATION`
  - Outcomes: auto-text customers within 30 seconds of a missed call, automated review requests after each job, more 5-star Google reviews, recover 30%+ of missed calls.
  - Timeline: "Live in 7 days"

All three have `comingSoon: false`. Keep the existing `Service` type unchanged so `BentoServices.tsx` and `Services.tsx` continue to work without edits.

### 3. `src/components/landing/Hero.tsx` — speak to local owners

- Update `WORDS` array from `["Sales", "Operations", "Support", "Marketing", "Outreach", "Workflows", "Onboarding"]` to `["Calls", "Bookings", "Reviews", "Follow-ups", "Customers", "Leads"]`
- Eyebrow chip text: "AI Automation Agency" → "Built for Local Business"
- Subhead rewrite: "We build websites and AI agents that answer your calls, book your appointments, and bring in more customers — 24/7."
- Trust strip rewrite: `Trusted by local businesses` · `Setup in 2 weeks` · `Cancel anytime` (replaces SOC 2 / 99.9% uptime / 80+ teams)

Heading structure ("Automate your [typewriter] with AI.") stays — only the cycled words change.

### 4. `src/components/landing/RoiCalculator.tsx` — recovered-calls model

Rework the calculator around local-business economics. Need to view the file first to preserve the exact `SliderRow` / `Stat` API, but the math swap:

**Inputs (replaces hours/rate):**
- `weeklyMissed` — missed calls per week (range ~5–100, default 20)
- `customerValue` — average value of one new customer in dollars (range ~$50–$2,000, default $400)

**Outputs (replaces monthlySaved/yearlySaved/dollarsSaved):**
- `monthlyRecovered` — `Math.round(weeklyMissed * 4.33 * 0.30)` calls recovered per month (30% close rate on recovered calls)
- `yearlyRecovered` — `Math.round(weeklyMissed * 52 * 0.30)` calls recovered per year
- `yearlyRevenue` — `yearlyRecovered * customerValue` in dollars

**Copy updates:**
- Section heading: "See what missed calls are costing you."
- Subhead: "Most local businesses miss 1 in 4 calls. Here's what recovering them is worth."
- Stat labels: "Calls recovered / month", "Calls recovered / year", "Extra revenue / year"
- Slider labels: "Missed calls per week" and "Average customer value"

Close-rate (`0.30`) lives as a single named constant near the top of the component so it's trivial to tweak later.

### Out of scope (intentionally)

- Navbar, Footer, ContactForm, ChatWidget, Process — copy there is generic enough to leave alone.
- Admin / dashboard / auth pages — unrelated to public marketing positioning.
- No new routes (`/local`) and no Pricing tabs — single-page repositioning so the whole site speaks one consistent local-biz story.

After implementation I'll spot-check the Pricing, Services, Index, and ROI sections render cleanly at the current 1000px viewport and on mobile breakpoints.