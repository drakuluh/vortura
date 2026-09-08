export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  location: string;
  service: string;
  logo?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Since Vortura redesigned our website and set up the AI call agent, we haven't missed a single reservation. Our online orders are up and the whole system just runs itself.",
    name: "Owner",
    role: "Restaurant Owner",
    company: "Dear Delhi",
    location: "Mississauga, ON",
    service: "Website + AI Automation",
    logo: "/logos/dear.png",
  },
  {
    quote:
      "We went from scrambling to answer calls during peak hours to having every enquiry handled automatically. The NFC review cards alone doubled our Google reviews in a month.",
    name: "Owner",
    role: "Founder",
    company: "SweetsNOW",
    location: "Brampton, ON",
    service: "AI Call Answering + NFC Reviews",
    logo: "/logos/sweets.png",
  },
  {
    quote:
      "Vortura built us a professional site and automated our intake workflow. New client enquiries get responded to in seconds instead of hours — it's completely changed how we operate.",
    name: "Partner",
    role: "Managing Partner",
    company: "Brunson & Brunson Law",
    location: "Toronto, ON",
    service: "Website + Workflow Automation",
    logo: "/logos/brunson.png",
  },
];

export const PROCESS_TESTIMONIAL: Testimonial = {
  quote:
    "Vortura took us from missing half our calls to never missing one. The whole process was seamless — we were up and running in under three weeks.",
  name: "Owner",
  role: "Owner",
  company: "SaugaJunk",
  location: "Mississauga, ON",
  service: "AI Call Answering",
  logo: "/logos/junk.png",
};

export const TRUSTED_BY_CLIENTS = [
  { name: "Dear Delhi", logo: "/logos/dear.png" },
  { name: "SweetsNOW", logo: "/logos/sweets.png" },
  { name: "Brunson & Brunson Law", logo: "/logos/brunson.png" },
  { name: "SaugaJunk", logo: "/logos/junk.png" },
  { name: "Gamelaser", logo: "/logos/gamelaser.png" },
  { name: "Hutchinson's Painting", logo: "/logos/h painting.png" },
  { name: "Mississauga Investment Group", logo: "/logos/invest.png" },
  { name: "Mishree", logo: "/logos/mishrea.png" },
];
