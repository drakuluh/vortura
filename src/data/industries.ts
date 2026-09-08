import {
  Phone,
  Globe,
  QrCode,
  Nfc,
  Mail,
  Database,
  type LucideIcon,
} from "lucide-react";

export type IndustryService = {
  icon: LucideIcon;
  title: string;
  desc: string;
  slug: string;
};

export type Industry = {
  slug: string;
  name: string;
  headline: string;
  accentWord: string;
  subtext: string;
  painPoints: string[];
  services: IndustryService[];
  stats: { value: string; label: string }[];
  ctaHeadline: string;
  ctaAccent: string;
};

export const INDUSTRIES: Industry[] = [
  {
    slug: "restaurants",
    name: "Restaurants",
    headline: "Fill every seat, answer every",
    accentWord: "call.",
    subtext:
      "AI automation built for restaurants — from reservation calls to 5-star reviews on autopilot.",
    painPoints: [
      "Missed phone calls during the rush — every unanswered call is a lost reservation",
      "Empty Google review pages while competitors stack up 5-star ratings",
      "Menus that cost thousands to reprint every time prices change",
      "No follow-up system to bring one-time diners back for a second visit",
    ],
    services: [
      {
        icon: Phone,
        title: "AI Call Answering",
        desc: "An AI host answers every call — during the rush, after hours, holidays — takes reservations, answers menu questions, and sends confirmation texts.",
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
        desc: "A branded, mobile-friendly menu customers scan from the table. Update prices and specials instantly — no reprinting, no developer needed.",
        slug: "qr-code-menus",
      },
      {
        icon: Mail,
        title: "Email Newsletters",
        desc: "Monthly emails that bring diners back — new specials, seasonal menus, event announcements. Written, designed, and sent for you.",
        slug: "email-newsletters",
      },
    ],
    stats: [
      { value: "40–60%", label: "of restaurant calls go unanswered during peak hours" },
      { value: "70%+", label: "tap-to-review conversion with NFC cards at the table" },
      { value: "$6,000+", label: "saved annually by switching to digital QR menus" },
    ],
    ctaHeadline: "Ready to fill more",
    ctaAccent: "seats?",
  },
  {
    slug: "trades",
    name: "Trades & Contractors",
    headline: "Book more jobs, miss",
    accentWord: "nothing.",
    subtext:
      "HVAC, plumbing, electrical, landscaping — AI automation that turns missed calls into booked jobs.",
    painPoints: [
      "Calls going to voicemail while you're on a job site — each one is a customer calling your competitor next",
      "Quotes sent and never followed up on, leaving revenue on the table",
      "A list of past customers collecting dust instead of generating repeat business",
      "A basic website that doesn't rank on Google or generate any leads",
    ],
    services: [
      {
        icon: Phone,
        title: "AI Call Answering",
        desc: "An AI agent answers every call — even at 9 PM on a Saturday — describes your services, confirms your service area, and books the appointment.",
        slug: "ai-call-answering",
      },
      {
        icon: Nfc,
        title: "NFC Review Cards",
        desc: "Hand the customer a review card before you leave the job site. One tap and they're writing a 5-star Google review while the work is still fresh.",
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
        desc: "Re-engage past customers with automated SMS and email campaigns. Seasonal offers, maintenance reminders, and check-ins that fill your calendar.",
        slug: "database-reactivation",
      },
    ],
    stats: [
      { value: "80%", label: "of callers who hit voicemail hang up without leaving a message" },
      { value: "15–25%", label: "of cold quotes recovered with automated follow-up sequences" },
      { value: "3×", label: "more Google clicks for businesses with 40+ reviews vs. a handful" },
    ],
    ctaHeadline: "Ready to book more",
    ctaAccent: "jobs?",
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    headline: "Capture every lead, close",
    accentWord: "faster.",
    subtext:
      "AI automation for brokerages and agents — from lead qualification to client follow-up.",
    painPoints: [
      "Leads from Zillow and Realtor.com going cold because response time is too slow",
      "Spending hours on the phone with unqualified buyers instead of closing deals",
      "No systematic follow-up for past clients who could send referrals",
      "A website that looks like every other agent's IDX template",
    ],
    services: [
      {
        icon: Phone,
        title: "AI Call Answering",
        desc: "An AI agent qualifies inbound leads instantly — asks about budget, timeline, and preferences — then routes hot leads to you with a full summary.",
        slug: "ai-call-answering",
      },
      {
        icon: Globe,
        title: "Agent Website",
        desc: "A fast, distinctive website that showcases your listings, captures leads, and ranks for local searches. Not another cookie-cutter IDX template.",
        slug: "websites-local-business",
      },
      {
        icon: Nfc,
        title: "NFC Review Cards",
        desc: "Hand clients a review card at closing. A tap and they're writing a Google review — the kind of social proof that wins the next listing appointment.",
        slug: "nfc-review-cards",
      },
      {
        icon: Mail,
        title: "Client Newsletters",
        desc: "Monthly market updates and home tips sent to your sphere. Keep past clients engaged and top-of-mind for referrals — written and sent for you.",
        slug: "email-newsletters",
      },
    ],
    stats: [
      { value: "78%", label: "of buyers go with the first agent who responds" },
      { value: "5–9%", label: "revenue increase per additional Google star (Harvard Business School)" },
      { value: "12×", label: "more likely to get a referral from a client you stay in touch with" },
    ],
    ctaHeadline: "Ready to close",
    ctaAccent: "faster?",
  },
];
