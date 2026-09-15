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
    desc: "Cards and stands your customers tap with their phone to leave a 5-star Google review.",
    tag: "TAP · REVIEW · RANK",
    accent: "primary",
    priceFrom: "From $49",
    details:
      "Customers tap the card with their phone and your Google review page opens. They don't need an app, and they don't have to search for your business. Each card is branded for your business and programmed to your exact Google listing, and we print a QR code on it for older phones. Put them at checkout, on tables, or at the front desk, wherever customers spend a minute after a good visit. Most businesses see 3 to 5 times more reviews within the first month.",
    headline: "Turn happy customers into",
    headlineAccent: "5-star reviews.",
    problem: [
      "Happy customers rarely leave reviews because it takes too many steps",
      "They forget, get distracted, or can't find your listing",
      "An unhappy customer always finds the time",
      "Your star rating stays flat while competitors climb",
    ],
    solution: [
      "One tap on an NFC card opens your Google review page",
      "Customers don't have to search, download an app, or scan anything",
      "They leave a 5-star review while they're still pleased with the visit",
      "New reviews keep coming in every week",
    ],
    process: [
      { step: "01", title: "We design your cards", desc: "Branded NFC cards and a counter stand designed for your business.", icon: "palette" },
      { step: "02", title: "We program them", desc: "We set each card to open your Google review page with one tap.", icon: "cpu" },
      { step: "03", title: "We install on-site", desc: "We place the cards at checkout, on tables, or at the front desk, wherever customers tend to wait.", icon: "map-pin" },
      { step: "04", title: "Reviews start rolling in", desc: "Customers tap and write a review, and your Google ranking goes up.", icon: "star" },
    ],
    faq: [
      { q: "Do customers need an app?", a: "No. NFC works on every modern iPhone and Android phone. Customers tap, and their browser opens your review page." },
      { q: "What if their phone doesn't support NFC?", a: "Every card has a printed QR code as a backup, so any phone with a camera can still reach your review page." },
      { q: "How many reviews can I expect?", a: "Most businesses see 3 to 5 times more reviews within the first month. The fewer steps it takes, the more people leave one." },
      { q: "Can I change the review link later?", a: "Yes. We can reprogram the cards if your Google listing changes or you want them to point to a different platform." },
    ],
    features: ["Tap-to-review NFC cards", "Branded counter stand", "QR code fallback", "On-site setup and training"],
    stats: [
      { value: 70, suffix: "%", label: "Typical tap-to-review conversion rate" },
      { value: 3, suffix: "×", label: "More reviews than QR codes alone" },
      { value: 30, suffix: "+", label: "New reviews per month for busy locations" },
      { value: 4.7, suffix: "", label: "Average star rating from in-person prompts", decimals: 1 },
    ],
    outcomes: [
      "Collect more 5-star reviews every week",
      "Rank higher on Google Maps in your service area",
      "Make it easy for customers to leave a review",
      "Keep your reviews recent",
    ],
    deliverables: [
      "Branded NFC cards and a counter stand",
      "Cards programmed to your Google review link",
      "A printed QR code backup for any phone",
      "On-site placement and a quick walkthrough for staff",
    ],
    included: [
      "Branded NFC cards and a counter stand, installed on-site",
      "Cards programmed to your Google review page",
      "A QR code backup so any phone can leave a review",
      "A steady flow of new 5-star reviews",
      "A higher ranking on Google Maps in your area",
      "Replacement cards whenever you need more",
    ],
    tech: ["NFC (NTAG215)", "Google Business", "QR fallback", "Custom print"],
    timeline: "Installed in days",
  },
  {
    slug: "websites-local-business",
    icon: Globe,
    title: "Websites for Local Business",
    desc: "Fast, mobile-first websites that bring in customers, built and maintained for you.",
    tag: "DESIGN · BUILD · MAINTAIN",
    accent: "secondary",
    priceFrom: "From $799",
    details:
      "We design and build a clean, fast website with one job: getting your phone to ring. Every site includes click-to-call, Google Maps, and online booking. We handle the copy, photos, layout, and hosting. After launch we maintain it every month with edits, backups, and security updates, so you never need to call a developer. Most sites launch in under two weeks, and you'll show up on Google the day yours goes live.",
    headline: "A website that",
    headlineAccent: "brings in customers.",
    problem: [
      "Your website is outdated, slow, or hard to find on Google",
      "Customers search, find nothing convincing, and call a competitor",
      "A bad website can cost you more than having no website",
      "You can't update it without calling a developer",
    ],
    solution: [
      "A fast, mobile-first site designed to get you calls",
      "Click-to-call, Google Maps, and online booking built in",
      "You show up when locals search for what you do",
      "Monthly maintenance, so you never touch the code",
    ],
    process: [
      { step: "01", title: "Discovery call", desc: "We learn about your business, your customers, and what sets you apart.", icon: "phone" },
      { step: "02", title: "Design & build", desc: "A mobile-first site built around your brand and designed to turn visitors into customers.", icon: "pencil-ruler" },
      { step: "03", title: "Launch & optimize", desc: "We launch the site, set up your Google Business Profile, and make sure you show up in search.", icon: "rocket" },
      { step: "04", title: "Ongoing maintenance", desc: "We handle monthly edits, hosting, and backups, so you never touch the code.", icon: "wrench" },
    ],
    faq: [
      { q: "How long does it take?", a: "Most sites launch in under 2 weeks. Builds with custom features can take 3 to 4 weeks." },
      { q: "Do I need to provide content?", a: "No. We handle the copy, photos, and layout. Tell us about your business and we'll take it from there." },
      { q: "What about hosting and updates?", a: "They're included. We host, back up, and maintain your site every month. If you need a change, send us a message." },
      { q: "Can I see examples?", a: "Yes. Book a call and we'll show you sites we've built for businesses like yours." },
    ],
    features: ["Mobile-first design", "Click-to-call and directions", "Google Business setup", "Monthly maintenance"],
    stats: [
      { value: 14, suffix: "", label: "Days average time from kickoff to launch" },
      { value: 3, suffix: "×", label: "More calls than a DIY site builder" },
      { value: 95, suffix: "+", label: "Mobile speed score on Google PageSpeed" },
      { value: 24, suffix: "/7", label: "Your site is always online and working" },
    ],
    outcomes: [
      "Launch a real website in under 2 weeks",
      "Show up on Google when locals search for you",
      "Let customers call or book from your homepage",
      "Get updates made without touching the code",
    ],
    deliverables: [
      "A mobile-first website of 4 to 6 pages",
      "Click-to-call and Google Maps integration",
      "Google Business Profile setup",
      "Hosting, backups, and monthly edits",
    ],
    included: [
      "A mobile-first website of 4 to 6 pages, live in under 2 weeks",
      "Click-to-call and Google Maps built in",
      "Google Business Profile setup so locals can find you",
      "Hosting, backups, and monthly edits handled for you",
      "Customers who call or book straight from your homepage",
      "An analytics dashboard that shows what's working",
    ],
    tech: ["React", "Vercel", "Google Business", "GA4"],
    timeline: "2 weeks to launch",
  },
  {
    slug: "print-digital-design",
    icon: Palette,
    title: "Print & Digital Design",
    desc: "Business cards, flyers, logos, social media templates, and full brand identity, delivered ready to print.",
    tag: "DESIGN · PRINT · DIGITAL",
    accent: "primary",
    priceFrom: "From $149",
    details:
      "We design business cards, flyers, logos, social media templates, signage, and full brand identity packages, with files ready for both print and screen. Everything is designed together, so it all looks like the same business. You get 2 or 3 initial concepts, two rounds of revisions, and final files in every format you need: print-ready PDFs with bleed and crop marks, plus web exports for social and email. One-time projects start at $149, and ongoing design support is available from $99/month.",
    headline: "Design that's",
    headlineAccent: "impossible to ignore.",
    problem: [
      "Inconsistent branding makes your business look less established",
      "A logo from one freelancer, cards from another, and Canva posts made at midnight",
      "Nothing looks like it comes from the same company",
      "You're paying for separate pieces of work that should match",
    ],
    solution: [
      "Your whole visual identity designed at the same time",
      "A logo, cards, flyers, and social templates that all match",
      "Everything clearly belongs to the same brand",
      "Print and digital files that are yours to keep",
    ],
    process: [
      { step: "01", title: "Brand brief", desc: "We learn your style, audience, and competitors to set the visual direction.", icon: "clipboard" },
      { step: "02", title: "Concepts & revision", desc: "You see 2 or 3 concepts, and we refine the one you like best until you're happy with it.", icon: "layers" },
      { step: "03", title: "Full suite design", desc: "We apply that direction to every piece: cards, flyers, social posts, and signage.", icon: "palette" },
      { step: "04", title: "Handoff", desc: "You get print-ready files, digital exports, and source files that are yours to keep.", icon: "package" },
    ],
    faq: [
      { q: "Can I just get a logo?", a: "Yes. Single pieces start at $149, although most clients find a full identity package costs less than ordering pieces one at a time." },
      { q: "How many revisions do I get?", a: "Every project includes 2 rounds of revisions, and we keep going until you love it." },
      { q: "Do I own the files?", a: "Yes, all of them. You get the source files (Figma, AI, PSD) and every export, and they're yours to keep." },
      { q: "Can you match my existing brand?", a: "Yes. Send us what you have and we'll design everything to match, or suggest changes that improve the whole system." },
    ],
    features: ["Logo & brand identity", "Business cards & flyers", "Social media templates", "Print-ready + digital files"],
    stats: [
      { value: 5, suffix: " days", label: "Average turnaround from brief to delivery" },
      { value: 4, suffix: "+", label: "Platforms covered: print, social, and web" },
      { value: 100, suffix: "%", label: "Print-ready files with bleed and crop marks" },
      { value: 0, suffix: "", label: "Ongoing fees. You pay once per project" },
    ],
    outcomes: [
      "Look polished and professional everywhere",
      "Have a consistent brand identity from day one",
      "Launch a campaign or promotion within days",
      "Stop paying agency rates for simple design work",
    ],
    deliverables: [
      "Custom logo and brand identity package",
      "Business cards, flyers, and print materials",
      "Social media templates sized for every platform",
      "Print-ready files (PDF, CMYK) and digital exports",
    ],
    included: [
      "A custom logo and a consistent brand identity",
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
    desc: "An AI that sounds like a person, answers every call (including after hours), and books the appointment.",
    tag: "INBOUND · AFTER-HOURS",
    accent: "secondary",
    priceFrom: "From $299/mo",
    details:
      "Stop losing customers to voicemail. Our AI agent answers every call, day or night, and sounds like a real person. It answers common questions about your services, hours, and pricing, then books appointments straight into your calendar. After every call you get a text and a full transcript. You decide when calls go to the AI: after hours, when you're busy, on weekends, or all the time. Most clients launch in 2 to 3 weeks and never miss a call again.",
    headline: "Never lose",
    headlineAccent: "another call.",
    problem: [
      "A caller who reaches voicemail often books someone else",
      "After-hours and weekend calls go unanswered",
      "Every missed call is a booking you didn't get",
      "Callers hang up and try the next business instead of leaving a message",
    ],
    solution: [
      "An AI agent answers every call, 24/7",
      "It sounds like a real person, and callers can't tell the difference",
      "It answers common questions and books appointments into your calendar",
      "You wake up to a full schedule instead of missed-call alerts",
    ],
    process: [
      { step: "01", title: "Train the voice", desc: "We build a custom AI voice that knows your services, hours, pricing, and FAQs.", icon: "mic" },
      { step: "02", title: "Set up routing", desc: "You choose when calls go to the AI: after hours, when you're busy, or all the time.", icon: "git-branch" },
      { step: "03", title: "Connect your calendar", desc: "The AI books appointments directly into Google Calendar, Calendly, or your CRM.", icon: "calendar" },
      { step: "04", title: "Go live", desc: "Every call gets answered, and you get a transcript and summary by text.", icon: "zap" },
    ],
    faq: [
      { q: "Does it actually sound human?", a: "Yes. We use ElevenLabs voice synthesis, and callers usually can't tell the difference. It's nothing like a robocall menu." },
      { q: "What if the caller needs a real person?", a: "The AI can transfer the call to your cell or office line at any time. You decide when it hands a call over." },
      { q: "What languages does it support?", a: "English and Spanish are included. Other languages are available on request." },
      { q: "Can I change what it says?", a: "Yes, anytime. You can update the script, FAQs, and booking rules in a simple dashboard, or tell us and we'll make the change." },
    ],
    features: ["24/7 call answering", "Calendar booking", "Sounds human", "Call transcripts to your phone"],
    stats: [
      { value: 24, suffix: "/7", label: "Every call answered, even after hours" },
      { value: 100, suffix: "%", label: "Of calls picked up, with no missed leads" },
      { value: 30, suffix: "s", label: "Average time to answer and engage" },
      { value: 5, suffix: "×", label: "Fewer missed leads than voicemail" },
    ],
    outcomes: [
      "Never miss another after-hours call",
      "Book appointments while you sleep",
      "Get a text and transcript for every call",
      "Sound bigger and more professional",
    ],
    deliverables: [
      "Custom AI voice trained on your business",
      "Phone number setup and call routing",
      "Calendar and booking integration",
      "Daily call summaries to your phone",
    ],
    included: [
      "An AI voice that sounds human, trained on your business",
      "Every call answered 24/7, including after hours",
      "Appointments booked straight into your calendar",
      "A text and transcript for every call",
      "Phone number setup and call routing done for you",
      "Monthly call analytics and performance reports",
    ],
    tech: ["Twilio", "Vapi", "ElevenLabs", "Google Calendar"],
    timeline: "2–3 weeks to launch",
  },
  {
    slug: "email-signatures",
    icon: PenLine,
    title: "Custom Email Signatures",
    desc: "Professional email signatures your team will actually use, designed and ready to paste.",
    tag: "BRAND · IDENTITY · EMAIL",
    accent: "primary",
    priceFrom: "From $29",
    checkout: { lookupKey: "email-signature" },
    details:
      "A well-made email signature makes every message your team sends look professional. Pick one of four templates in our live builder, fill in your details, and watch the preview update as you type. We then adjust it to match your brand's colors, fonts, social icons, and photo. The finished signature works in Gmail, Outlook, and Apple Mail, and takes under a minute to paste in. Volume discounts are available for teams of five or more.",
    headline: "Every email you send,",
    headlineAccent: "branded.",
    problem: [
      "Your team sends hundreds of emails with signatures that don't match",
      "Some people use plain text, and some have no signature at all",
      "Every email could be showing your brand and isn't",
      "New hires don't know which format to use",
    ],
    solution: [
      "An email signature that displays correctly in every email client",
      "Names, titles, socials, and branding that match across the team",
      "Installed in under a minute with one click",
      "New hires get a matching signature on their first day",
    ],
    process: [
      { step: "01", title: "Pick a template", desc: "Choose from 4 layouts in our live builder.", icon: "layout-template" },
      { step: "02", title: "Fill in your details", desc: "Add your name, title, phone, socials, and photo, and preview it as you type.", icon: "user" },
      { step: "03", title: "We refine it", desc: "We adjust the details so it matches your brand exactly.", icon: "sparkles" },
      { step: "04", title: "Paste and done", desc: "Install it in Gmail, Outlook, or Apple Mail with one click.", icon: "clipboard-check" },
    ],
    faq: [
      { q: "Will it work in my email client?", a: "Yes. We test it in Gmail, Outlook (desktop and web), Apple Mail, and Thunderbird, and it displays correctly in all of them." },
      { q: "Can I include my photo?", a: "Yes. Photos, logos, social icons, and even a banner link are all supported." },
      { q: "What about team signatures?", a: "Order several and we'll keep them consistent. Volume discounts are available for 5 or more." },
      { q: "Can I edit it later?", a: "You get the source files. If you'd rather we make the changes, just ask. Revisions are included until you're happy." },
    ],
    features: ["Live signature builder", "4 templates", "Social links and photo", "Works in every email client"],
    stats: [
      { value: 48, suffix: " hrs", label: "From brief to a finished signature" },
      { value: 3, suffix: "+", label: "Email clients supported out of the box" },
      { value: 100, suffix: "%", label: "Brand-consistent across every employee" },
      { value: 0, suffix: "", label: "Lines of code you need to touch" },
    ],
    outcomes: [
      "Look polished in every email you send",
      "Put your brand on every reply",
      "Give new hires the same signature as everyone else",
      "Stop wasting time on HTML formatting",
    ],
    deliverables: [
      "Custom-designed email signature",
      "Compatible with Gmail, Outlook, and Apple Mail",
      "Social icons and your brand colors",
      "One-click install instructions",
    ],
    included: [
      "An email signature designed to match your brand",
      "Works in Gmail, Outlook, and Apple Mail",
      "Social links, title, photo, and company branding",
      "One-click copy, so you paste it into your email client and you're done",
      "Revisions until you love it",
      "A team rollout guide so everyone installs it the same way",
    ],
    tech: ["HTML Email", "Gmail", "Outlook", "Apple Mail"],
    timeline: "Delivered in 48 hours",
    hidden: true,
  },
  {
    slug: "database-reactivation",
    icon: Database,
    title: "Database Reactivation",
    desc: "SMS and email campaigns that bring past customers from your old list back.",
    tag: "WIN-BACK CAMPAIGNS",
    accent: "secondary",
    priceFrom: "From $499",
    details:
      "You already have a list of past customers who trust you. We import it from a spreadsheet, CRM, or POS export, clean out bad data, and group contacts by how recently they bought and how much they spent. Then we write a sequence of 5 to 7 SMS and email messages to bring them back. Messages go out on a schedule, and replies come straight to your phone or inbox. Most campaigns turn 5 to 15% of the list into active bookings within the first two weeks, with no ad spend.",
    headline: "Revenue hiding in your",
    headlineAccent: "old customer list.",
    problem: [
      "Hundreds of past customers sitting in a spreadsheet",
      "They already trust you, but you haven't talked to them in months",
      "Meanwhile you're paying for ads to find new customers",
      "Some of your easiest revenue is in contacts you already have",
    ],
    solution: [
      "We clean your list and write a sequence of SMS and email messages",
      "The campaign fills your calendar with people who already know you",
      "There's no ad spend, because these are existing customers",
      "Replies go to your phone or inbox automatically",
    ],
    process: [
      { step: "01", title: "Import & clean", desc: "We pull in your contacts, remove bad data, and group them by recency and value.", icon: "database" },
      { step: "02", title: "Craft the campaign", desc: "A sequence of 5 to 7 SMS and email messages written to bring customers back.", icon: "pen-line" },
      { step: "03", title: "Launch", desc: "Messages go out on a schedule, and replies come to your phone or inbox.", icon: "send" },
      { step: "04", title: "Report", desc: "You get a clear breakdown of opens, replies, bookings, and revenue recovered.", icon: "bar-chart-3" },
    ],
    faq: [
      { q: "How old can the contacts be?", a: "We've reactivated lists that had been dormant for 2 to 3 years. As long as the phone numbers and emails still work, they're worth contacting." },
      { q: "Is this spam?", a: "No. These are existing customers who opted in, and we follow SMS and email compliance rules (TCPA, CAN-SPAM)." },
      { q: "What kind of results should I expect?", a: "Most campaigns turn 5 to 15% of the list into active bookings within the first 2 weeks." },
      { q: "Do I need a CRM?", a: "No. We can work from a spreadsheet, an old POS export, or any list you have, and we'll organize it for you." },
    ],
    features: ["List cleanup and grouping", "SMS and email sequence", "Offer and booking flow", "Performance reporting"],
    stats: [
      { value: 7, suffix: " days", label: "From signup to first campaign live" },
      { value: 5, suffix: "-7", label: "Messages per sequence across SMS and email" },
      { value: 25, suffix: "%+", label: "Typical open rate on reactivation emails" },
      { value: 3, suffix: "×", label: "ROI compared to cold ad spend" },
    ],
    outcomes: [
      "Book new revenue from old contacts in days",
      "Win back customers you thought were gone",
      "Test offers without spending on ads",
      "Keep a clean, organized list from now on",
    ],
    deliverables: [
      "Database import and cleanup",
      "A custom reactivation sequence of 5 to 7 messages",
      "Booking link and offer page",
      "Campaign performance report",
    ],
    included: [
      "Your old customer list cleaned and organized",
      "A custom SMS and email campaign of 5 to 7 messages",
      "A booking link and offer page",
      "New bookings from customers you already have",
      "A clear report on what worked",
      "A reusable campaign template for future campaigns",
    ],
    tech: ["Twilio SMS", "Resend", "n8n", "Supabase"],
    timeline: "Live in 7 days",
    comingSoon: true,
  },
  {
    slug: "qr-code-menus",
    icon: QrCode,
    title: "QR Code Menus & Service Lists",
    desc: "A menu or service list customers open by scanning a code, and you can update anytime.",
    tag: "IN-STORE · MOBILE",
    accent: "primary",
    priceFrom: "From $149",
    details:
      "Customers scan a code and get a clean, mobile-friendly menu or service list. We design a branded page that works on any phone and give you print-ready QR codes for table tents, door signs, stickers, and counter displays. You can change prices, add daily specials, or swap items yourself in seconds. The QR code stays the same, so you only print it once. Each menu can include photos, dietary tags, pricing tiers, and a click-to-call button.",
    headline: "Your menu,",
    headlineAccent: "always up to date.",
    problem: [
      "Reprinting menus every time you change a price or item",
      "Customers squinting at faded paper menus",
      "Competitors have clean digital menus on every table",
      "No quick way to post daily specials or seasonal changes",
    ],
    solution: [
      "A branded, mobile-friendly menu customers open by scanning a QR code",
      "Change prices, add specials, and swap items instantly",
      "You don't need to reprint anything or hire a developer",
      "The same QR code keeps working through every update",
    ],
    process: [
      { step: "01", title: "Send us your menu", desc: "Share your current menu, price list, or service catalog in any format.", icon: "upload" },
      { step: "02", title: "We design it", desc: "A clean, mobile-friendly page branded to your business.", icon: "smartphone" },
      { step: "03", title: "QR codes delivered", desc: "Print-ready QR codes for table tents, signs, stickers, and doors.", icon: "qr-code" },
      { step: "04", title: "Update anytime", desc: "Change prices or items yourself in seconds. The QR code stays the same.", icon: "refresh-cw" },
    ],
    faq: [
      { q: "Can I update the menu myself?", a: "Yes. A simple editor lets you change prices, descriptions, and items in seconds, with no technical skill needed." },
      { q: "Does the QR code change when I update?", a: "No. The same QR code always points to your live menu, so you only print it once." },
      { q: "Can I add photos?", a: "Yes. Menu items can include photos, descriptions, dietary tags, and pricing tiers." },
      { q: "What about multiple locations?", a: "Each location gets its own menu page and set of QR codes, and you manage them all from one dashboard." },
    ],
    features: ["Custom branded menu", "Update anytime", "Printable QR code pack", "Click-to-call and booking"],
    stats: [
      { value: 7, suffix: "", label: "Days from signup to a live digital menu" },
      { value: 0, suffix: "", label: "Reprinting costs, since updates are digital" },
      { value: 100, suffix: "%", label: "Mobile-friendly for any customer's phone" },
      { value: 3, suffix: "×", label: "Faster to update than a printed menu" },
    ],
    outcomes: [
      "Look modern and professional in-store",
      "Update prices and items in seconds",
      "Save thousands on printed menus",
      "Get more calls and bookings from walk-in customers",
    ],
    deliverables: [
      "Mobile-friendly menu or service page",
      "Custom branded QR code pack",
      "Content you can update yourself",
      "Print-ready table tents and signs",
    ],
    included: [
      "A branded, mobile-friendly menu or service list",
      "A print-ready QR code pack for signs and tables",
      "Prices and items you update yourself in seconds",
      "Click-to-call and booking built in",
      "A modern look in-store with nothing to reprint",
      "Staff training so your team can make updates themselves",
    ],
    tech: ["React", "Vercel", "Supabase", "QR Toolkit"],
    timeline: "Live in 7 days",
  },
  {
    slug: "email-newsletters",
    icon: Mail,
    title: "Automated Email Newsletters",
    desc: "A monthly newsletter we write and send for you, so customers keep coming back.",
    tag: "EMAIL · RETENTION",
    accent: "secondary",
    priceFrom: "From $199/mo",
    details:
      "Every month we write, design, and send a branded newsletter to your customer list, with promotions, tips, or seasonal updates. We import and organize your contacts from any source, then take care of subject lines, copy, layout, timing, and compliance. You approve each draft with one click. After every send you get a report on open rates, clicks, and the bookings it brought in, so you can see what's working.",
    headline: "Stay top-of-mind",
    headlineAccent: "without lifting a finger.",
    problem: [
      "You know you should email your customers, but it never happens",
      "Writing and designing a newsletter never makes the to-do list",
      "Customers forget about you between visits",
      "Competitors who email regularly stay top-of-mind",
    ],
    solution: [
      "We write, design, and send a branded newsletter every month",
      "Promotions, tips, and updates that keep customers interested",
      "You approve with one click, and we handle timing and compliance",
      "Customers keep hearing from you between visits",
    ],
    process: [
      { step: "01", title: "Import your list", desc: "We pull your contacts from your CRM, POS, or spreadsheet and organize them.", icon: "users" },
      { step: "02", title: "We write & design", desc: "A branded newsletter with promotions, tips, and updates, ready for you to review.", icon: "pen-line" },
      { step: "03", title: "You approve", desc: "Approve it with one click. We handle timing, deliverability, and compliance.", icon: "check-circle" },
      { step: "04", title: "Results delivered", desc: "Every month you see open rates, click rates, and the bookings each send brought in.", icon: "trending-up" },
    ],
    faq: [
      { q: "Do I need to write anything?", a: "No. We write everything based on your business, your promotions, and the time of year. You approve it or ask for changes." },
      { q: "How do you get my customer list?", a: "We import from whatever you have: a CRM, POS system, email provider, or even a spreadsheet." },
      { q: "What's the unsubscribe rate like?", a: "Usually under 1% per send. Good subject lines, sensible frequency, and useful content keep people reading." },
      { q: "Can I promote a specific offer?", a: "Yes. Tell us about sales, events, or seasonal promotions and we'll build the newsletter around them." },
    ],
    features: ["Content written for you", "Branded templates", "List management", "Performance reporting"],
    stats: [
      { value: 12, suffix: "", label: "Newsletters written and sent per year" },
      { value: 35, suffix: "%+", label: "Typical open rate on monthly sends" },
      { value: 2, suffix: "×", label: "More repeat bookings from engaged customers" },
      { value: 0, suffix: "", label: "Hours you spend writing. We handle all of it" },
    ],
    outcomes: [
      "Stay top-of-mind with every customer",
      "Get repeat bookings every month",
      "Promote offers without doing the work yourself",
      "Get more from each customer over time",
    ],
    deliverables: [
      "Monthly branded newsletter",
      "List import and organization",
      "Approval and send workflow",
      "Open and click performance report",
    ],
    included: [
      "A branded newsletter written and sent every month",
      "Your customer list imported and organized",
      "A simple approve-and-send workflow",
      "Repeat bookings from customers who stay interested",
      "Open and click reports every month",
      "A/B testing of subject lines to improve open rates",
    ],
    tech: ["Resend", "OpenAI", "n8n", "Supabase"],
    timeline: "Live in 7 days",
  },
];
