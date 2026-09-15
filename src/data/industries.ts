import {
  Phone,
  Globe,
  QrCode,
  Nfc,
  Mail,
  Database,
  UtensilsCrossed,
  Wrench,
  Building2,
  type LucideIcon,
} from "lucide-react";

export type IndustryService = {
  icon: LucideIcon;
  title: string;
  desc: string;
  slug: string;
};

export type IndustryStat = {
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
};

export type Industry = {
  slug: string;
  name: string;
  icon: LucideIcon;
  headline: string;
  accentWord: string;
  subtext: string;
  painPoints: string[];
  solutions: string[];
  services: IndustryService[];
  stats: IndustryStat[];
  ctaHeadline: string;
  ctaAccent: string;
};

export const INDUSTRIES: Industry[] = [
  {
    slug: "restaurants",
    name: "Restaurants",
    icon: UtensilsCrossed,
    headline: "Fill every seat, answer every",
    accentWord: "call.",
    subtext:
      "AI automation for restaurants that answers reservation calls and collects 5-star reviews for you.",
    painPoints: [
      "Missed phone calls during the rush, where every unanswered call is a lost reservation",
      "Empty Google review pages while competitors stack up 5-star ratings",
      "Menus that cost thousands to reprint every time prices change",
      "No follow-up system to bring one-time diners back for a second visit",
    ],
    solutions: [
      "AI answers every call, whether it's the dinner rush, after hours, or a holiday, and books the reservation",
      "NFC cards at every table turn happy diners into 5-star Google reviews automatically",
      "Digital QR menus you can update instantly without reprinting or hiring a developer",
      "Automated email campaigns bring one-time diners back for seconds",
    ],
    services: [
      {
        icon: Phone,
        title: "AI Call Answering",
        desc: "An AI host answers every call, including during the rush, after hours, and on holidays. It takes reservations, answers menu questions, and sends confirmation texts.",
        slug: "ai-call-answering",
      },
      {
        icon: Nfc,
        title: "NFC Review Cards",
        desc: "Table tents and checkout cards that let diners tap to leave a Google review. Restaurants using NFC typically see dozens of new reviews per month.",
        slug: "nfc-review-cards",
      },
      {
        icon: QrCode,
        title: "QR Code Menus",
        desc: "A branded, mobile-friendly menu customers scan from the table. You can update prices and specials instantly, without reprinting or calling a developer.",
        slug: "qr-code-menus",
      },
      {
        icon: Mail,
        title: "Email Newsletters",
        desc: "Monthly emails about new specials, seasonal menus, and events that bring diners back. We write, design, and send them for you.",
        slug: "email-newsletters",
      },
    ],
    stats: [
      { value: 60, suffix: "%", label: "Of restaurant calls go unanswered during peak hours" },
      { value: 70, suffix: "%+", label: "Tap-to-review conversion with NFC cards at the table" },
      { value: 6, suffix: "k+", label: "Saved annually by switching to digital QR menus" },
    ],
    ctaHeadline: "Ready to fill more",
    ctaAccent: "seats?",
  },
  {
    slug: "trades",
    name: "Trades & Contractors",
    icon: Wrench,
    headline: "Book more jobs, miss",
    accentWord: "nothing.",
    subtext:
      "AI automation for HVAC, plumbing, electrical, and landscaping businesses that turns missed calls into booked jobs.",
    painPoints: [
      "Calls go to voicemail while you're on a job site, and each caller tries your competitor next",
      "Quotes sent and never followed up on, leaving revenue on the table",
      "A list of past customers you haven't contacted in years",
      "A basic website that doesn't rank on Google or generate any leads",
    ],
    solutions: [
      "AI answers every call, even at 9 PM on a Saturday, then books the job and texts the customer",
      "Automated follow-up messages recover 15 to 25% of cold quotes",
      "Seasonal reminders bring past customers back for repeat work",
      "A fast, mobile-first website with click-to-call that ranks on Google and brings in leads every week",
    ],
    services: [
      {
        icon: Phone,
        title: "AI Call Answering",
        desc: "An AI agent answers every call, even at 9 PM on a Saturday. It explains your services, confirms you cover the caller's area, and books the appointment.",
        slug: "ai-call-answering",
      },
      {
        icon: Nfc,
        title: "NFC Review Cards",
        desc: "Hand the customer a review card before you leave the job site. With one tap they can write a 5-star Google review while the work is still fresh in their mind.",
        slug: "nfc-review-cards",
      },
      {
        icon: Globe,
        title: "Lead-Generating Website",
        desc: "A fast, mobile-first website with click-to-call, online booking, and service area pages that rank on Google and bring in calls every week.",
        slug: "websites-local-business",
      },
      {
        icon: Database,
        title: "Database Reactivation",
        desc: "Automated SMS and email campaigns send past customers seasonal offers, maintenance reminders, and check-ins that fill your calendar.",
        slug: "database-reactivation",
      },
    ],
    stats: [
      { value: 80, suffix: "%", label: "Of callers who hit voicemail hang up without leaving a message" },
      { value: 25, suffix: "%", label: "Of cold quotes recovered with automated follow-up sequences" },
      { value: 3, suffix: "×", label: "More Google clicks for businesses with 40+ reviews" },
    ],
    ctaHeadline: "Ready to book more",
    ctaAccent: "jobs?",
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    icon: Building2,
    headline: "Capture every lead, close",
    accentWord: "faster.",
    subtext:
      "AI automation for brokerages and agents, covering everything from qualifying leads to following up with clients.",
    painPoints: [
      "Leads from Zillow and Realtor.com going cold because response time is too slow",
      "Hours spent on the phone with buyers who aren't ready, when you could be closing deals",
      "No regular follow-up with past clients who could send you referrals",
      "A website that looks like every other agent's IDX template",
    ],
    solutions: [
      "AI qualifies new leads instantly by asking about budget, timeline, and preferences, then sends the best ones to you",
      "Automated messages keep cold leads warm, so you spend your time on closings",
      "Monthly newsletters keep you top-of-mind for referrals from past clients",
      "A website that looks like yours, shows your listings, and ranks for local searches",
    ],
    services: [
      {
        icon: Phone,
        title: "AI Call Answering",
        desc: "An AI agent qualifies new leads instantly by asking about budget, timeline, and preferences, then sends the best ones to you with a full summary.",
        slug: "ai-call-answering",
      },
      {
        icon: Globe,
        title: "Agent Website",
        desc: "A fast website built for you rather than an IDX template. It shows your listings, captures leads, and ranks for local searches.",
        slug: "websites-local-business",
      },
      {
        icon: Nfc,
        title: "NFC Review Cards",
        desc: "Hand clients a review card at closing. One tap opens your Google review page, and those reviews help you win the next listing appointment.",
        slug: "nfc-review-cards",
      },
      {
        icon: Mail,
        title: "Client Newsletters",
        desc: "Monthly market updates and home tips for your past clients and contacts, so they think of you when someone needs an agent. We write and send them for you.",
        slug: "email-newsletters",
      },
    ],
    stats: [
      { value: 78, suffix: "%", label: "Of buyers go with the first agent who responds" },
      { value: 5, suffix: "-9%", label: "Revenue increase per additional Google star" },
      { value: 12, suffix: "×", label: "More likely to get a referral from a client you stay in touch with" },
    ],
    ctaHeadline: "Ready to close",
    ctaAccent: "faster?",
  },
];
