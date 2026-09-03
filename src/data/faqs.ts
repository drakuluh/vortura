/**
 * Home-page FAQ content. Answers are drawn from claims already made elsewhere
 * on the site (service data, About copy, hero badges) so the FAQ stays
 * consistent with the rest of the marketing. Also feeds FAQPage JSON-LD.
 */
export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "How fast can we launch?",
    a: "Most websites go live in about two weeks from the kickoff call. Smaller add-ons move faster — NFC review cards are usually programmed and installed within a few days, and automations like review requests or database reactivation can be live in about a week.",
  },
  {
    q: "How do we get started?",
    a: "It starts with a free discovery call. We learn about your business and goals, recommend the right build, and give you a fixed price before you commit to anything. Once you're in, most projects kick off within a few days.",
  },
  {
    q: "What does it cost?",
    a: "Websites start at $799, NFC Google review cards start at $49, and ongoing automations like 24/7 AI call answering start at $299/month. Every build is scoped on a discovery call first, so you get a fixed number before committing to anything.",
  },
  {
    q: "Do I need to be technical to use any of this?",
    a: "No. Everything is set up, configured, and handed over working. You never have to touch code or a developer — when something needs changing, you message us and we handle it.",
  },
  {
    q: "What happens after launch?",
    a: "Every project includes hands-on onboarding, ongoing technical support, and a direct line to a real person for updates and changes. Website plans also include hosting, backups, and monthly edits.",
  },
  {
    q: "How does the AI call answering actually work?",
    a: "We train a natural-sounding voice agent on your business, then set up a phone number and call routing. It answers calls day or night, handles common questions, and books appointments straight into your calendar — and you get a text and transcript for every call.",
  },
  {
    q: "Am I locked into a contract?",
    a: "No. Monthly services are cancel-anytime — there's no long-term lock-in. One-time builds like a website or NFC cards are simply yours once delivered.",
  },
];
