/**
 * Home-page FAQ content. Answers are drawn from claims already made elsewhere
 * on the site (service data, About copy, hero badges) so the FAQ stays
 * consistent with the rest of the marketing. Also feeds FAQPage JSON-LD.
 */
export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "How fast can we launch?",
    a: "Most websites go live about two weeks after the kickoff call. Smaller projects are quicker. NFC review cards are usually programmed and installed within a few days, and automations like review requests or database reactivation can be live in about a week.",
  },
  {
    q: "How do we get started?",
    a: "We start with a free discovery call. We learn about your business and goals, recommend what to build, and give you a fixed price before you commit to anything. Once you sign on, most projects start within a few days.",
  },
  {
    q: "What does it cost?",
    a: "Websites start at $799, NFC Google review cards start at $49, and ongoing automations like 24/7 AI call answering start at $299/month. Every build is scoped on a discovery call first, so you get a fixed number before committing to anything.",
  },
  {
    q: "Do I need to be technical to use any of this?",
    a: "No. We set everything up and hand it over working. You never have to touch code or hire a developer. When something needs changing, send us a message and we'll take care of it.",
  },
  {
    q: "What happens after launch?",
    a: "We walk you through everything at the start, and you can reach a real person on our team for support, updates, and changes afterward. Website plans also include hosting, backups, and monthly edits.",
  },
  {
    q: "How does the AI call answering actually work?",
    a: "We train a voice agent that sounds like a person on your business, then set up a phone number and call routing. It answers calls day or night, handles common questions, and books appointments straight into your calendar. You get a text and a transcript after every call.",
  },
  {
    q: "Am I locked into a contract?",
    a: "No. You can cancel monthly services at any time. One-time projects like a website or NFC cards are yours once they're delivered.",
  },
];
