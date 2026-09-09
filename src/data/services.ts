import {
  Phone,
  Globe,
  Database,
  QrCode,
  Mail,
  Nfc,
  Palette,
  PenLine,
  type LucideIcon,
} from "lucide-react";

export type ProcessStep = {
  step: string;
  title: string;
  desc: string;
  icon?: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type Stat = {
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
};

export type Service = {
  slug: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: string;
  accent: "primary" | "secondary";
  priceFrom?: string;
  checkout?: { lookupKey: string };
  details: string;
  headline: string;
  headlineAccent?: string;
  problem: string[];
  solution: string[];
  process: ProcessStep[];
  faq: FaqItem[];
  features: string[];
  outcomes: string[];
  stats: Stat[];
  deliverables: string[];
  included: string[];
  tech: string[];
  timeline: string;
  comingSoon?: boolean;
  hidden?: boolean;
};

export const services: Service[] = [
  {
    slug: "nfc-review-cards",
    icon: Nfc,
    title: "NFC Google Review Cards",
    desc: "Tap-to-review cards and stands that turn happy customers into 5-star Google reviews in one tap.",
    tag: "TAP · REVIEW · RANK",
    accent: "primary",
    priceFrom: "From $49",
    details:
      "Customers tap the card with their phone and land straight on your Google review page — no app, no searching, no typing a thing. It's the fastest, most frictionless way to turn a great experience into a 5-star review. Each card is custom-branded to your business and pre-programmed to your exact Google listing. We include a printed QR code fallback for older phones. Place them at checkout, on tables, or at the front desk — wherever customers linger after a good experience. Most businesses see 3–5x more reviews within the first month.",
    headline: "Turn happy customers into",
    headlineAccent: "5-star reviews.",
    problem: [
      "Happy customers rarely leave reviews — too many steps",
      "They forget, get distracted, or can't find your listing",
      "One unhappy customer always finds the time",
      "Your star rating stays flat while competitors climb",
    ],
    solution: [
      "One tap on an NFC card opens your Google review page",
      "No searching, no app, no QR scanning required",
      "The moment of delight becomes a 5-star review",
      "Reviews stack up week after week, automatically",
    ],
    process: [
      { step: "01", title: "We design your cards", desc: "Custom-branded NFC cards and a counter stand, matched to your business.", icon: "palette" },
      { step: "02", title: "We program them", desc: "Each card is encoded to open your Google review page in one tap.", icon: "cpu" },
      { step: "03", title: "We install on-site", desc: "Cards placed at checkout, tables, or the front desk — wherever customers linger.", icon: "map-pin" },
      { step: "04", title: "Reviews start rolling in", desc: "Customers tap, write a review, and you climb the rankings.", icon: "star" },
    ],
    faq: [
      { q: "Do customers need an app?", a: "No. NFC works natively on every modern iPhone and Android. They just tap and their browser opens your review page." },
      { q: "What if their phone doesn't support NFC?", a: "Every card includes a printed QR code as a fallback. Any phone with a camera can scan it." },
      { q: "How many reviews can I expect?", a: "Most businesses see 3–5x more reviews within the first month. The easier you make it, the more people do it." },
      { q: "Can I change the review link later?", a: "Yes. We can reprogram the cards if you change your Google listing or want to point to a different platform." },
    ],
    features: ["Tap-to-review NFC cards", "Branded counter stand", "QR code fallback", "On-site setup + training"],
    stats: [
      { value: 70, suffix: "%", label: "Typical tap-to-review conversion rate" },
      { value: 3, suffix: "×", label: "More reviews than QR codes alone" },
      { value: 30, suffix: "+", label: "New reviews per month for busy locations" },
      { value: 4.7, suffix: "", label: "Average star rating from in-person prompts", decimals: 1 },
    ],
    outcomes: [
      "Collect more 5-star reviews every week",
      "Climb Google Maps in your service area",
      "Make leaving a review effortless for customers",
      "Turn every visit into fresh social proof",
    ],
    deliverables: [
      "Custom-branded NFC cards + counter stand",
      "Cards pre-programmed to your Google review link",
      "Printed QR code fallback for any phone",
      "On-site placement + quick staff how-to",
    ],
    included: [
      "Custom-branded NFC cards + counter stand, installed on-site",
      "Cards pre-programmed to your Google review page",
      "QR code fallback so any phone can leave a review",
      "More 5-star reviews, week after week",
      "A higher ranking on Google Maps in your area",
      "Replacement cards available anytime you need more",
    ],
    tech: ["NFC (NTAG215)", "Google Business", "QR fallback", "Custom print"],
    timeline: "Installed in days",
  },
  {
    slug: "websites-local-business",
    icon: Globe,
    title: "Websites for Local Business",
    desc: "Fast, mobile-first websites that bring in customers — built and maintained for you.",
    tag: "DESIGN · BUILD · MAINTAIN",
    accent: "secondary",
    priceFrom: "From $799",
    details:
      "We design and build the website your business deserves — clean, fast, and laser-focused on getting the phone to ring. Every site comes with click-to-call, Google Maps integration, and online booking baked in. We handle the copy, the photos, the layout, and the hosting. Once it's live, we maintain it every month — edits, backups, security updates — so you never have to touch a developer again. Most sites launch in under two weeks, and you'll show up on Google the day it goes live.",
    headline: "A website that",
    headlineAccent: "brings in customers.",
    problem: [
      "Your website is outdated, slow, or invisible on Google",
      "Customers search, find nothing credible, and call your competitor",
      "A bad website costs you more than no website",
      "You can't update it without calling a developer",
    ],
    solution: [
      "A fast, mobile-first site designed to make the phone ring",
      "Click-to-call, Google Maps, and online booking built in",
      "Show up when locals search for your services",
      "Monthly maintenance so you never touch the code",
    ],
    process: [
      { step: "01", title: "Discovery call", desc: "We learn your business, your customers, and what makes you different.", icon: "phone" },
      { step: "02", title: "Design & build", desc: "A mobile-first site built around your brand, optimized to convert.", icon: "pencil-ruler" },
      { step: "03", title: "Launch & optimize", desc: "We go live, set up Google Business, and make sure you show up in search.", icon: "rocket" },
      { step: "04", title: "Ongoing maintenance", desc: "Monthly edits, hosting, backups — you never touch the code.", icon: "wrench" },
    ],
    faq: [
      { q: "How long does it take?", a: "Most sites launch in under 2 weeks. Complex builds with custom features may take 3–4 weeks." },
      { q: "Do I need to provide content?", a: "We handle everything — copy, photos, layout. Just tell us about your business and we'll take it from there." },
      { q: "What about hosting and updates?", a: "Included. We host, back up, and maintain your site every month. Need a change? Just send us a message." },
      { q: "Can I see examples?", a: "Absolutely. Book a call and we'll walk you through sites we've built for businesses like yours." },
    ],
    features: ["Mobile-first design", "Click-to-call + directions", "Google Business setup", "Monthly maintenance"],
    stats: [
      { value: 14, suffix: "", label: "Days average time from kickoff to launch" },
      { value: 3, suffix: "×", label: "More calls than a DIY site builder" },
      { value: 95, suffix: "+", label: "Mobile speed score on Google PageSpeed" },
      { value: 24, suffix: "/7", label: "Your site is always online and working" },
    ],
    outcomes: [
      "Launch a real website in under 2 weeks",
      "Show up on Google when locals search for you",
      "Customers call or book straight from your homepage",
      "Stay updated without ever touching the code",
    ],
    deliverables: [
      "4–6 page mobile-first website",
      "Click-to-call + Google Maps integration",
      "Google Business Profile setup",
      "Hosting, backups, and monthly edits",
    ],
    included: [
      "A 4–6 page, mobile-first website — live in under 2 weeks",
      "Click-to-call and Google Maps built in",
      "Google Business Profile setup so locals find you",
      "Hosting, backups, and monthly edits, handled for you",
      "Customers who call or book straight from your homepage",
      "Analytics dashboard so you can see what's working",
    ],
    tech: ["React", "Vercel", "Google Business", "GA4"],
    timeline: "2 weeks to launch",
  },
  {
    slug: "print-digital-design",
    icon: Palette,
    title: "Print & Digital Design",
    desc: "Business cards, flyers, logos, social media templates, and full brand identity — designed and delivered print-ready.",
    tag: "DESIGN · PRINT · DIGITAL",
    accent: "primary",
    priceFrom: "From $149",
    details:
      "Business cards, flyers, logos, social media templates, signage, and full brand identity packages — all print-ready and digital-ready. We design everything in one cohesive pass so your brand looks consistent across every touchpoint. You get 2–3 initial concepts, two rounds of revisions, and final delivery in every format you need — print-ready PDFs with bleed and crop marks, plus web-optimized exports for social and email. One-time projects start at $149; ongoing design support is available from $99/month.",
    headline: "Design that's",
    headlineAccent: "impossible to ignore.",
    problem: [
      "Inconsistent branding makes your business look unestablished",
      "Logo from one freelancer, cards from another, Canva posts at midnight",
      "Nothing feels like the same company",
      "You're paying piecemeal for work that should be cohesive",
    ],
    solution: [
      "Your entire visual identity designed in one cohesive pass",
      "Logo, cards, flyers, and social templates — all matching",
      "Everything looks like it belongs to the same brand",
      "Print-ready and digital files you own forever",
    ],
    process: [
      { step: "01", title: "Brand brief", desc: "We learn your style, audience, and competitors to define the visual direction.", icon: "clipboard" },
      { step: "02", title: "Concepts & revision", desc: "You see 2–3 concepts and we refine your favorite until it's perfect.", icon: "layers" },
      { step: "03", title: "Full suite design", desc: "We extend the chosen direction across every deliverable — cards, flyers, social, signage.", icon: "palette" },
      { step: "04", title: "Handoff", desc: "You get print-ready files, digital exports, and source files you own forever.", icon: "package" },
    ],
    faq: [
      { q: "Can I just get a logo?", a: "Yes — single deliverables start at $149. But most clients find a full identity package is more cost-effective than piecemeal work." },
      { q: "How many revisions do I get?", a: "Every project includes 2 rounds of revisions. We don't stop until you love it." },
      { q: "Do I own the files?", a: "100%. You get source files (Figma, AI, PSD) and all exports. They're yours forever." },
      { q: "Can you match my existing brand?", a: "Absolutely. Send us what you have and we'll build everything to match — or suggest refinements that elevate the whole system." },
    ],
    features: ["Logo & brand identity", "Business cards & flyers", "Social media templates", "Print-ready + digital files"],
    stats: [
      { value: 5, suffix: " days", label: "Average turnaround from brief to delivery" },
      { value: 4, suffix: "+", label: "Platforms covered — print, social, and web" },
      { value: 100, suffix: "%", label: "Print-ready files with bleed and crop marks" },
      { value: 0, suffix: "", label: "Ongoing fees — one project, one price" },
    ],
    outcomes: [
      "Look polished and professional everywhere",
      "Build a cohesive brand identity from day one",
      "Launch a campaign or promotion in days, not weeks",
      "Stop paying agency rates for simple design work",
    ],
    deliverables: [
      "Custom logo and brand identity package",
      "Business cards, flyers, and print materials",
      "Social media templates sized for every platform",
      "Print-ready files (PDF, CMYK) + digital exports",
    ],
    included: [
      "A custom logo and cohesive brand identity",
      "Business cards, flyers, and branded print materials",
      "Social media templates sized for every platform",
      "Print-ready files with bleed, crop marks, and CMYK color",
      "Source files so you can make future edits",
      "Unlimited revisions until you're happy",
    ],
    tech: ["Figma", "Adobe CC", "Print-ready PDF", "Social export"],
    timeline: "Delivered in 5 days",
  },
  {
    slug: "ai-call-answering",
    icon: Phone,
    title: "24/7 AI Call Answering",
    desc: "A human-sounding AI that answers every call — even after hours — and books the appointment.",
    tag: "INBOUND · AFTER-HOURS",
    accent: "secondary",
    priceFrom: "From $299/mo",
    details:
      "Stop losing customers to voicemail. Our AI agent picks up every call — day or night — and sounds like a real person on the line. It answers common questions about your services, hours, and pricing, then books appointments straight into your calendar. You get a text and full transcript after every call. Set your own rules for when calls route to AI: after hours, on overflow, weekends, or all the time. Most clients launch in 2–3 weeks and never miss a call again.",
    headline: "Never lose",
    headlineAccent: "another call.",
    problem: [
      "Every voicemail is a customer choosing someone else",
      "After-hours and weekend calls go completely unanswered",
      "Missed calls are booked revenue walking out the door",
      "Customers don't leave messages — they call the next business",
    ],
    solution: [
      "An AI agent picks up every call, 24/7",
      "Sounds like a real person — callers can't tell the difference",
      "Answers FAQs and books appointments into your calendar",
      "You wake up to a full schedule instead of missed-call alerts",
    ],
    process: [
      { step: "01", title: "Train the voice", desc: "We build a custom AI voice trained on your business — services, hours, pricing, FAQs.", icon: "mic" },
      { step: "02", title: "Set up routing", desc: "Calls route to AI after hours, on overflow, or anytime — your rules.", icon: "git-branch" },
      { step: "03", title: "Connect your calendar", desc: "The AI books appointments directly into Google Calendar, Calendly, or your CRM.", icon: "calendar" },
      { step: "04", title: "Go live", desc: "Every call gets answered. You get a transcript and summary by text.", icon: "zap" },
    ],
    faq: [
      { q: "Does it actually sound human?", a: "Yes. We use ElevenLabs voice synthesis — callers routinely can't tell the difference. It's not a robocall menu." },
      { q: "What if the caller needs a real person?", a: "The AI can transfer to your cell or office line anytime. You set the rules for when it escalates." },
      { q: "What languages does it support?", a: "English and Spanish out of the box. Other languages available on request." },
      { q: "Can I change what it says?", a: "Anytime. Update your script, FAQs, and booking rules through a simple dashboard — or just tell us and we'll handle it." },
    ],
    features: ["24/7 call answering", "Calendar booking", "Sounds human", "Call transcripts to your phone"],
    stats: [
      { value: 24, suffix: "/7", label: "Every call answered, even after hours" },
      { value: 100, suffix: "%", label: "Of calls picked up — zero missed leads" },
      { value: 30, suffix: "s", label: "Average time to answer and engage" },
      { value: 5, suffix: "×", label: "Fewer missed leads than voicemail" },
    ],
    outcomes: [
      "Never miss another after-hours call",
      "Book appointments while you sleep",
      "Get a text + transcript for every call",
      "Sound bigger and more professional",
    ],
    deliverables: [
      "Custom AI voice trained on your business",
      "Phone number setup + call routing",
      "Calendar + booking integration",
      "Daily call summaries to your phone",
    ],
    included: [
      "A human-sounding AI voice trained on your business",
      "Every call answered 24/7 — even after hours",
      "Appointments booked straight into your calendar",
      "A text and transcript for every call",
      "Phone number setup and call routing, done for you",
      "Monthly call analytics and performance reports",
    ],
    tech: ["Twilio", "Vapi", "ElevenLabs", "Google Calendar"],
    timeline: "2–3 weeks to launch",
  },
  {
    slug: "email-signatures",
    icon: PenLine,
    title: "Custom Email Signatures",
    desc: "Professional email signatures your team will actually use — designed, built, and ready to paste.",
    tag: "BRAND · IDENTITY · EMAIL",
    accent: "primary",
    priceFrom: "From $29",
    checkout: { lookupKey: "email-signature" },
    details:
      "A polished email signature turns every message your team sends into a brand impression. Pick from four premium templates in our live builder, fill in your details, and preview it in real time. We refine every pixel to match your brand — colors, fonts, social icons, and photo. The finished signature works flawlessly in Gmail, Outlook, and Apple Mail. Paste it in under a minute and every email you send looks professional. Volume discounts available for teams of five or more.",
    headline: "Every email you send,",
    headlineAccent: "branded.",
    problem: [
      "Your team sends hundreds of emails with inconsistent signatures",
      "Plain-text sign-offs — or worse, none at all",
      "Every message is a missed brand impression",
      "New hires have no idea what format to use",
    ],
    solution: [
      "A pixel-perfect email signature that works in every client",
      "Your name, title, socials, and brand — all consistent",
      "Installed in under a minute with one click",
      "New hires get a matching signature on day one",
    ],
    process: [
      { step: "01", title: "Pick a template", desc: "Choose from 4 premium layouts in our live builder.", icon: "layout-template" },
      { step: "02", title: "Fill in your details", desc: "Name, title, phone, socials, photo — preview it in real time.", icon: "user" },
      { step: "03", title: "We refine it", desc: "Pixel-perfect adjustments to match your brand exactly.", icon: "sparkles" },
      { step: "04", title: "Paste and done", desc: "One-click install into Gmail, Outlook, or Apple Mail.", icon: "clipboard-check" },
    ],
    faq: [
      { q: "Will it work in my email client?", a: "Yes. We test in Gmail, Outlook (desktop and web), Apple Mail, and Thunderbird. It looks right everywhere." },
      { q: "Can I include my photo?", a: "Absolutely. Photos, logos, social icons, and even a banner link — all supported." },
      { q: "What about team signatures?", a: "Order multiple signatures and we'll keep them consistent. Volume discounts available for 5+." },
      { q: "Can I edit it later?", a: "You get the source. But if you want changes, just ask — revisions are included until you're happy." },
    ],
    features: ["Live signature builder", "4 premium templates", "Social links + photo", "Works in every email client"],
    stats: [
      { value: 48, suffix: " hrs", label: "From brief to a finished signature" },
      { value: 3, suffix: "+", label: "Email clients supported out of the box" },
      { value: 100, suffix: "%", label: "Brand-consistent across every employee" },
      { value: 0, suffix: "", label: "Lines of code you need to touch" },
    ],
    outcomes: [
      "Look polished in every email you send",
      "Turn every reply into a brand touchpoint",
      "Onboard new hires with a consistent look",
      "Stop wasting time on HTML formatting",
    ],
    deliverables: [
      "Custom-designed email signature",
      "Compatible with Gmail, Outlook, Apple Mail",
      "Social icons + branded color scheme",
      "One-click install instructions",
    ],
    included: [
      "A pixel-perfect email signature, designed to your brand",
      "Works in Gmail, Outlook, and Apple Mail",
      "Social links, title, photo art, and company branding",
      "One-click copy — paste into your email client and done",
      "Revisions until you love it",
      "Team rollout guide so everyone installs it the same way",
    ],
    tech: ["HTML Email", "Gmail", "Outlook", "Apple Mail"],
    timeline: "Delivered in 48 hours",
    hidden: true,
  },
  {
    slug: "database-reactivation",
    icon: Database,
    title: "Database Reactivation",
    desc: "Wake up your old customer list with smart SMS + email campaigns that bring them back.",
    tag: "WIN-BACK CAMPAIGNS",
    accent: "secondary",
    priceFrom: "From $499",
    details:
      "You're sitting on a goldmine of past customers who already trust you. We import your old list — from a spreadsheet, CRM, or POS export — clean the bad data, and segment contacts by recency and value. Then we craft a 5–7 touch SMS and email sequence designed to re-engage and convert. Messages go out on a smart schedule, and replies route straight to your phone or inbox. Most campaigns recover 5–15% of the list as active bookings within the first two weeks. No ad spend required.",
    headline: "Revenue hiding in your",
    headlineAccent: "old customer list.",
    problem: [
      "Hundreds of past customers sitting in a spreadsheet",
      "They already trust you, but you haven't talked to them in months",
      "You're spending on ads to find new customers instead",
      "Revenue is hiding in contacts you already have",
    ],
    solution: [
      "We clean your list and craft a multi-touch SMS + email sequence",
      "A win-back campaign fills your calendar with people who know you",
      "No ad spend required — these are your existing customers",
      "Replies route to your phone or inbox automatically",
    ],
    process: [
      { step: "01", title: "Import & clean", desc: "We pull your contacts, remove bad data, and segment by recency and value.", icon: "database" },
      { step: "02", title: "Craft the campaign", desc: "A 5–7 touch sequence of SMS and email, written to re-engage and convert.", icon: "pen-line" },
      { step: "03", title: "Launch", desc: "Messages go out on a smart schedule. Replies route to your phone or inbox.", icon: "send" },
      { step: "04", title: "Report", desc: "You get a clear breakdown of opens, replies, bookings, and revenue recovered.", icon: "bar-chart-3" },
    ],
    faq: [
      { q: "How old can the contacts be?", a: "We've reactivated lists that were 2–3 years dormant. As long as the phone numbers and emails are valid, they're worth reaching." },
      { q: "Is this spam?", a: "No. These are your existing customers who opted in. We follow all SMS and email compliance rules (TCPA, CAN-SPAM)." },
      { q: "What kind of results should I expect?", a: "Most campaigns recover 5–15% of the list as active bookings within the first 2 weeks." },
      { q: "Do I need a CRM?", a: "No. We can work from a spreadsheet, old POS export, or any list you have. We'll organize it for you." },
    ],
    features: ["List cleanup + segmentation", "Multi-touch SMS + email", "Offer + booking flow", "Performance reporting"],
    stats: [
      { value: 7, suffix: " days", label: "From signup to first campaign live" },
      { value: 5, suffix: "-7", label: "Touch sequences across SMS and email" },
      { value: 25, suffix: "%+", label: "Typical open rate on reactivation emails" },
      { value: 3, suffix: "×", label: "ROI compared to cold ad spend" },
    ],
    outcomes: [
      "Book new revenue from old contacts in days",
      "Recover customers you thought were gone",
      "Test offers without spending on ads",
      "Get a clean, segmented list going forward",
    ],
    deliverables: [
      "Database import + cleanup",
      "Custom 5–7 touch reactivation sequence",
      "Booking link + offer page",
      "Campaign performance report",
    ],
    included: [
      "Your old customer list cleaned and segmented",
      "A custom 5–7 touch SMS + email campaign",
      "A booking link and offer page",
      "New bookings from customers you already have",
      "A clear report on what worked",
      "A reusable campaign template for future blasts",
    ],
    tech: ["Twilio SMS", "Resend", "n8n", "Supabase"],
    timeline: "Live in 7 days",
    comingSoon: true,
  },
  {
    slug: "qr-code-menus",
    icon: QrCode,
    title: "QR Code Menus & Service Lists",
    desc: "A scannable, always-up-to-date menu or service list customers can pull up in one tap.",
    tag: "IN-STORE · MOBILE",
    accent: "primary",
    priceFrom: "From $149",
    details:
      "Give customers a clean, mobile-friendly menu or service list they can pull up with a single scan. We design a branded page that looks great on any phone, then deliver print-ready QR codes for table tents, door signs, stickers, and counter displays. Update prices, add daily specials, or swap items yourself in seconds — the QR code never changes, so you print once and update forever. Each menu supports photos, dietary tags, pricing tiers, and a built-in click-to-call button.",
    headline: "Your menu,",
    headlineAccent: "always up to date.",
    problem: [
      "Reprinting menus every time you change a price or item",
      "Customers squint at faded paper menus",
      "Competitors have clean digital menus on every table",
      "No way to push daily specials or seasonal changes quickly",
    ],
    solution: [
      "A branded, mobile-friendly menu customers scan from a QR code",
      "Update prices, add specials, swap items — instantly",
      "No reprinting, no developer, no friction",
      "The same QR code works forever, even as you update",
    ],
    process: [
      { step: "01", title: "Send us your menu", desc: "Share your current menu, price list, or service catalog in any format.", icon: "upload" },
      { step: "02", title: "We design it", desc: "A clean, mobile-friendly page branded to your business.", icon: "smartphone" },
      { step: "03", title: "QR codes delivered", desc: "Print-ready QR codes for table tents, signs, stickers, and doors.", icon: "qr-code" },
      { step: "04", title: "Update anytime", desc: "Change prices or items yourself in seconds — the QR code never changes.", icon: "refresh-cw" },
    ],
    faq: [
      { q: "Can I update the menu myself?", a: "Yes. A simple editor lets you change prices, descriptions, and items in seconds. No technical skill needed." },
      { q: "Does the QR code change when I update?", a: "No. The same QR code always points to your live menu. Print once, update forever." },
      { q: "Can I add photos?", a: "Yes. Menu items can include photos, descriptions, dietary tags, and pricing tiers." },
      { q: "What about multiple locations?", a: "Each location gets its own menu page and QR code set. Manage them all from one dashboard." },
    ],
    features: ["Custom branded menu", "Update anytime", "Printable QR code pack", "Click-to-call + book"],
    stats: [
      { value: 7, suffix: "", label: "Days from signup to a live digital menu" },
      { value: 0, suffix: "", label: "Reprinting costs — update digitally anytime" },
      { value: 100, suffix: "%", label: "Mobile-friendly for any customer's phone" },
      { value: 3, suffix: "×", label: "Faster to update than a printed menu" },
    ],
    outcomes: [
      "Look modern and professional in-store",
      "Update prices and items in seconds",
      "Save thousands on printed menus",
      "Drive more bookings + calls from walk-ins",
    ],
    deliverables: [
      "Mobile-friendly menu or service page",
      "Custom branded QR code pack",
      "Self-serve content updates",
      "Print-ready table tents + signs",
    ],
    included: [
      "A branded, mobile-friendly menu or service list",
      "A print-ready QR code pack for signs and tables",
      "Prices and items you update yourself in seconds",
      "Click-to-call and booking built in",
      "A modern look in-store — with no reprinting, ever",
      "Staff training so your team can make updates themselves",
    ],
    tech: ["React", "Vercel", "Supabase", "QR Toolkit"],
    timeline: "Live in 7 days",
  },
  {
    slug: "email-newsletters",
    icon: Mail,
    title: "Automated Email Newsletters",
    desc: "Done-for-you monthly newsletters that keep customers coming back — written and sent for you.",
    tag: "EMAIL · RETENTION",
    accent: "secondary",
    priceFrom: "From $199/mo",
    details:
      "We write, design, and send a branded newsletter to your customer list every month — promotions, tips, seasonal updates, whatever keeps them engaged and coming back. We import and segment your contacts from any source, then handle every detail: subject lines, copy, layout, timing, and compliance. You get a draft to approve with one click. After each send, we deliver a clear report on open rates, click-throughs, and booking attribution so you can see exactly what's working.",
    headline: "Stay top-of-mind",
    headlineAccent: "without lifting a finger.",
    problem: [
      "You know you should be emailing your customers — but you never do",
      "Writing and designing a newsletter never makes the to-do list",
      "Customers forget about you between visits",
      "Competitors who email consistently stay top-of-mind",
    ],
    solution: [
      "We write, design, and send a branded newsletter every month",
      "Promotions, tips, and updates that keep customers engaged",
      "One click to approve — we handle timing and compliance",
      "You stay top-of-mind without lifting a finger",
    ],
    process: [
      { step: "01", title: "Import your list", desc: "We pull your contacts from your CRM, POS, or spreadsheet and segment them.", icon: "users" },
      { step: "02", title: "We write & design", desc: "A branded newsletter with promotions, tips, and updates — ready for your review.", icon: "pen-line" },
      { step: "03", title: "You approve", desc: "One click to approve. We handle timing, deliverability, and compliance.", icon: "check-circle" },
      { step: "04", title: "Results delivered", desc: "Open rates, click rates, and booking attribution — every month.", icon: "trending-up" },
    ],
    faq: [
      { q: "Do I need to write anything?", a: "No. We write everything based on your business, promotions, and seasonal trends. You just approve or request changes." },
      { q: "How do you get my customer list?", a: "We import from whatever you have — a CRM, POS system, email provider, or even a spreadsheet." },
      { q: "What's the unsubscribe rate like?", a: "Typically under 1% per send. We follow best practices for subject lines, frequency, and content quality to keep engagement high." },
      { q: "Can I promote a specific offer?", a: "Absolutely. Tell us about sales, events, or seasonal promos and we'll build the newsletter around them." },
    ],
    features: ["Done-for-you content", "Branded templates", "List management", "Performance reporting"],
    stats: [
      { value: 12, suffix: "", label: "Newsletters written and sent per year" },
      { value: 35, suffix: "%+", label: "Typical open rate on monthly sends" },
      { value: 2, suffix: "×", label: "More repeat bookings from engaged customers" },
      { value: 0, suffix: "", label: "Hours you spend writing — we handle it all" },
    ],
    outcomes: [
      "Stay top-of-mind with every customer",
      "Drive repeat bookings every month",
      "Promote offers without lifting a finger",
      "Grow lifetime value of every customer",
    ],
    deliverables: [
      "Monthly branded newsletter",
      "List import + segmentation",
      "Approval + send workflow",
      "Open + click performance report",
    ],
    included: [
      "A branded newsletter written and sent every month",
      "Your customer list imported and segmented",
      "A simple approve-and-send workflow",
      "Repeat bookings from customers who stay engaged",
      "Open and click reports every month",
      "A/B subject line testing to maximize opens",
    ],
    tech: ["Resend", "OpenAI", "n8n", "Supabase"],
    timeline: "Live in 7 days",
  },
];
