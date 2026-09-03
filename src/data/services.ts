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

export type Service = {
  slug: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: string;
  accent: "primary" | "secondary";
  /** Rough starting price shown on the card so customers have a ballpark. */
  priceFrom?: string;
  /**
   * If set, this service can be bought directly via Stripe embedded checkout.
   * `lookupKey` must match a Stripe Price lookup key (create it in your Stripe
   * dashboard). Services without this fall back to a "Book a call" CTA.
   */
  checkout?: { lookupKey: string };
  details: string;
  features: string[];
  outcomes: string[];
  deliverables: string[];
  /**
   * Curated "What you get" list for the service detail page — a single
   * deduplicated blend of the key benefits (outcomes) and concrete
   * deliverables. `outcomes`/`deliverables` are kept for the service cards.
   */
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
      "Customers tap the card with their phone and land straight on your Google review page — no app, no searching, no typing. It's the fastest way to stack up 5-star reviews and climb the local map rankings.",
    features: ["Tap-to-review NFC cards", "Branded counter stand", "QR code fallback", "On-site setup + training"],
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
      "We design and build the website your business deserves — clean, fast, and focused on getting the phone to ring. Then we keep it updated for you, so you never have to touch a developer again.",
    features: ["Mobile-first design", "Click-to-call + directions", "Google Business setup", "Monthly maintenance"],
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
      "Business cards, flyers, logos, social media templates, signage, and full brand identity packages — print-ready and digital-ready. One-time projects from $149; ongoing design support from $99/month.",
    features: ["Logo & brand identity", "Business cards & flyers", "Social media templates", "Print-ready + digital files"],
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
      "Stop losing customers to voicemail. Our AI agent picks up every call — day or night — sounds like a real person, answers common questions, and books appointments straight into your calendar.",
    features: ["24/7 call answering", "Calendar booking", "Sounds human", "Call transcripts to your phone"],
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
      "A polished email signature turns every message into a brand impression. Pick a template, fill in your details, preview it live, and order — we deliver a pixel-perfect signature you paste into Gmail, Outlook, or Apple Mail in under a minute.",
    features: ["Live signature builder", "4 premium templates", "Social links + photo", "Works in every email client"],
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
      "You're sitting on a goldmine of past customers. We launch a multi-touch SMS and email campaign that re-engages your old list, fills your calendar, and turns dormant contacts into paying customers — fast.",
    features: ["List cleanup + segmentation", "Multi-touch SMS + email", "Offer + booking flow", "Performance reporting"],
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
      "Give customers a clean, mobile-friendly menu or service list they can scan from a sticker, sign, or table tent. Update it any time — no reprinting, no developer, no hassle.",
    features: ["Custom branded menu", "Update anytime", "Printable QR code pack", "Click-to-call + book"],
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
      "We write, design, and send a branded newsletter to your customer list every month. Promotions, tips, updates — whatever keeps them engaged and coming back. You approve, we ship.",
    features: ["Done-for-you content", "Branded templates", "List management", "Performance reporting"],
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
    ],
    tech: ["Resend", "OpenAI", "n8n", "Supabase"],
    timeline: "Live in 7 days",
  },
];
