import {
  Search,
  Bot,
  MousePointerClick,
  Megaphone,
  Users,
  Palette,
  FileText,
  MailCheck,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

export type MarketingService = {
  slug: string;
  title: string;
  shortDesc: string;
  icon: LucideIcon;
  heroHeadline: string;
  heroAccent: string;
  heroSub: string;
  intro: string[];
  sections: {
    heading: string;
    body: string[];
  }[];
  /**
   * Deliberately empty. The previous values here were invented placeholders
   * ("312% avg. organic traffic increase", "42x ROI") that read as Vortura's
   * own client results. Populate only with figures you can stand behind —
   * either measured outcomes or cited industry benchmarks with the source in
   * the label. The stats block does not render while this is empty.
   */
  stats: { value: number; suffix: string; label: string; decimals?: number }[];
  faq: { q: string; a: string }[];
};

export const MARKETING_SERVICES: MarketingService[] = [
  {
    slug: "seo",
    title: "SEO",
    shortDesc: "Top-ranking content that targets specific niches and captures high-intent traffic.",
    icon: Search,
    heroHeadline: "Dominate search with",
    heroAccent: "organic SEO.",
    heroSub: "We build search strategies that put your business in front of buyers actively looking for what you sell.",
    intro: [
      "SEO is the highest-ROI channel for local businesses — period. When someone searches 'plumber near me' or 'best dentist in [city],' they're ready to buy. Ranking for those searches means a steady stream of high-intent leads without paying per click.",
      "We don't chase vanity metrics. Every keyword we target, every page we optimize, and every link we build is tied to a measurable business outcome: more calls, more bookings, more revenue.",
    ],
    sections: [
      {
        heading: "Technical Foundation",
        body: [
          "We audit your site's technical health — crawlability, page speed, mobile experience, structured data — and fix everything that's holding you back in search rankings.",
          "Most local business websites have critical technical issues they don't know about. A slow site, broken links, or missing schema markup can tank your rankings regardless of how good your content is.",
        ],
      },
      {
        heading: "Local SEO & Google Business",
        body: [
          "For local businesses, Google Business Profile optimization is as important as your website. We optimize your listing, manage reviews, build local citations, and ensure NAP consistency across the web.",
          "We target the local pack — the map results that appear above organic listings — because that's where the highest-intent local searches convert.",
        ],
      },
      {
        heading: "Content & Link Building",
        body: [
          "We create content that ranks and converts. Not blog posts for the sake of blogging — strategic pages targeting the exact queries your ideal customers are searching for.",
          "Our link building is earned, not bought. We build authority through digital PR, local partnerships, and content that naturally attracts backlinks.",
        ],
      },
    ],
    stats: [],
    faq: [
      { q: "How long until I see SEO results?", a: "Most businesses see measurable improvements in 3–6 months. SEO is a compounding investment — results accelerate over time as your domain authority grows." },
      { q: "Do you guarantee first-page rankings?", a: "No legitimate SEO provider guarantees rankings. We guarantee the work: technical optimization, content creation, and link building that consistently moves the needle." },
      { q: "Is SEO worth it for a small local business?", a: "Absolutely. Local SEO is often the highest-ROI marketing channel for small businesses because you're targeting people who are actively searching for your service in your area." },
    ],
  },
  {
    slug: "aeo",
    title: "AEO",
    shortDesc: "Research-backed strategies that boost brand visibility in AI-powered search.",
    icon: Bot,
    heroHeadline: "Get found in",
    heroAccent: "AI search.",
    heroSub: "AI engines are answering the questions your customers used to Google. We make sure your business is the answer.",
    intro: [
      "ChatGPT, Perplexity, and Google AI Overviews are fundamentally changing how people find businesses. When someone asks an AI 'who's the best HVAC company in Dallas,' your business needs to be in that answer.",
      "AEO (Answer Engine Optimization) is the discipline of structuring your content and digital presence so AI models cite and recommend your business. It's not replacing SEO — it's the next layer on top of it.",
    ],
    sections: [
      {
        heading: "AI Visibility Audit",
        body: [
          "We test how major AI platforms currently represent your business. Are you being mentioned? Are you being recommended? Is the information accurate? Most businesses have no idea what AI is saying about them.",
          "We identify the gaps between your actual reputation and your AI visibility, then build a strategy to close them.",
        ],
      },
      {
        heading: "Structured Data & Entity Optimization",
        body: [
          "AI models pull from structured data, knowledge graphs, and authoritative sources. We optimize your digital footprint to be machine-readable and authoritative.",
          "This includes schema markup, knowledge panel optimization, and ensuring your business information is consistent across every source AI models reference.",
        ],
      },
      {
        heading: "Content for AI Citation",
        body: [
          "We create content specifically designed to be cited by AI models — clear, authoritative, well-structured content that directly answers the questions your customers are asking.",
          "The format matters as much as the substance. AI models favor content with clear headings, definitive statements, and structured data that's easy to extract and attribute.",
        ],
      },
    ],
    stats: [],
    faq: [
      { q: "What's the difference between SEO and AEO?", a: "SEO optimizes for traditional search rankings. AEO optimizes for AI-generated answers. You need both — SEO drives organic traffic, AEO ensures you're cited when AI answers questions about your industry." },
      { q: "Which AI platforms does AEO target?", a: "We optimize for ChatGPT, Google AI Overviews, Perplexity, Microsoft Copilot, and other AI assistants that are increasingly replacing traditional search for discovery." },
      { q: "Is AEO relevant for local businesses?", a: "Increasingly yes. As more consumers use AI to find local services, businesses that aren't optimized for AI citation are becoming invisible to a growing segment of potential customers." },
    ],
  },
  {
    slug: "paid-search",
    title: "Paid Search",
    shortDesc: "Hyper-targeted campaigns that maximize lead volume with high-impact keyword strategies.",
    icon: MousePointerClick,
    heroHeadline: "Scale leads with",
    heroAccent: "paid search.",
    heroSub: "We build and manage Google Ads campaigns that turn ad spend into predictable, profitable customer acquisition.",
    intro: [
      "Paid search puts your business at the top of Google the day you launch. But without expert management, it's easy to burn through budget on irrelevant clicks, broad match disasters, and landing pages that don't convert.",
      "We build campaigns that are profitable from month one. Every keyword, ad copy variant, and bid strategy is optimized for one metric: cost per qualified lead.",
    ],
    sections: [
      {
        heading: "Campaign Architecture",
        body: [
          "We structure campaigns around your actual business goals — not Google's default settings that maximize spend. Tight ad groups, surgical keyword targeting, and aggressive negative keyword management.",
          "Our account structures are built for scale. As campaigns prove profitable, we expand methodically into new keyword territories without diluting performance.",
        ],
      },
      {
        heading: "Landing Page Optimization",
        body: [
          "Your ads are only as good as where they land. We build dedicated landing pages for each campaign that are designed to convert — clear value props, strong CTAs, and zero friction.",
          "We A/B test headlines, layouts, and offers continuously. Small improvements in landing page conversion rate multiply the value of every dollar you spend on ads.",
        ],
      },
      {
        heading: "Bid Strategy & Budget Management",
        body: [
          "We use automated bidding where it makes sense and manual control where it doesn't. The goal is always the same: maximize qualified leads at the lowest possible cost.",
          "Transparent reporting shows exactly where every dollar goes. No hidden fees, no opaque dashboards — you see the same data we see.",
        ],
      },
    ],
    stats: [],
    faq: [
      { q: "How much should I spend on Google Ads?", a: "It depends on your market and goals. We typically recommend starting with enough budget to generate statistically significant data — usually $2K–$5K/month for local businesses — then scaling what works." },
      { q: "How quickly will I see results?", a: "Paid search produces leads immediately. Within the first week you'll have data. Within the first month, we'll have optimized for performance. ROI-positive campaigns typically emerge in 60–90 days." },
      { q: "Do you manage the landing pages too?", a: "Yes. We build, test, and optimize dedicated landing pages for each campaign. Sending paid traffic to your homepage is one of the most common — and expensive — mistakes in paid search." },
    ],
  },
  {
    slug: "social-ads",
    title: "Social Ads",
    shortDesc: "Thumb-stopping creative that meets your audience across the social feeds that matter.",
    icon: Megaphone,
    heroHeadline: "Convert attention into",
    heroAccent: "customers.",
    heroSub: "We create and manage social ad campaigns on Meta, TikTok, and LinkedIn that drive real business results.",
    intro: [
      "Social ads let you reach people who aren't searching for you yet but match your ideal customer profile perfectly. The targeting capabilities on Meta and TikTok are unmatched — you can reach homeowners within 5 miles who just moved in.",
      "But social ads require a different playbook than search. People aren't looking for you — you're interrupting their scroll. The creative has to stop thumbs, the offer has to compel action, and the funnel has to convert cold traffic into warm leads.",
    ],
    sections: [
      {
        heading: "Creative That Converts",
        body: [
          "We produce ad creative designed for social — short-form video, carousel ads, and static images that stop the scroll and drive action. No stock photos, no generic templates.",
          "We test creative variations aggressively. The difference between a 1% and 3% click-through rate is the difference between a profitable campaign and a money pit.",
        ],
      },
      {
        heading: "Audience Strategy",
        body: [
          "We build audience strategies layered by funnel stage — cold prospecting, warm retargeting, and hot remarketing. Each audience gets creative and messaging tailored to where they are in the buying journey.",
          "Lookalike audiences built from your best customers are the fastest path to scaling. We use your first-party data to find more people who look like the customers you already love.",
        ],
      },
      {
        heading: "Platform Selection",
        body: [
          "Not every platform is right for every business. We recommend and manage the platforms where your customers actually spend time — whether that's Meta, TikTok, LinkedIn, or a combination.",
          "Each platform has its own creative language and audience behavior. We adapt strategy and creative for each rather than running the same ads everywhere.",
        ],
      },
    ],
    stats: [],
    faq: [
      { q: "Which social platform should I advertise on?", a: "It depends on your audience. Meta (Facebook/Instagram) works for almost every local business. TikTok is strong for younger demographics. LinkedIn is best for B2B and professional services." },
      { q: "Do you create the ad creative?", a: "Yes. We handle everything — strategy, creative production, copywriting, and campaign management. You approve the creative before it runs." },
      { q: "What's the minimum budget for social ads?", a: "We typically recommend $1.5K–$3K/month minimum for local businesses. Below that, there isn't enough data to optimize effectively." },
    ],
  },
  {
    slug: "organic-social",
    title: "Organic Social",
    shortDesc: "Strategies that tap into culture, fuel community, and keep your brand top-of-mind.",
    icon: Users,
    heroHeadline: "Build community with",
    heroAccent: "organic social.",
    heroSub: "We create organic social strategies that make your brand visible, valuable, and impossible to ignore.",
    intro: [
      "Organic social is your brand's public face. It's how potential customers decide whether you're credible, current, and worth their time before they ever pick up the phone.",
      "We don't just post to fill a content calendar. Every piece of content has a job — build trust, demonstrate expertise, or drive action. Consistency and quality beat viral moments every time.",
    ],
    sections: [
      {
        heading: "Content Strategy",
        body: [
          "We develop a content strategy rooted in what your audience actually cares about — not what's easiest to produce. That means understanding your customers' questions, pain points, and decision-making process.",
          "Content pillars keep your feed focused and purposeful. We balance educational content, social proof, behind-the-scenes, and direct offers to maintain engagement without burning out your audience.",
        ],
      },
      {
        heading: "Production & Scheduling",
        body: [
          "We handle end-to-end content production — from concept to caption to scheduling. Short-form video, carousels, stories, and static posts, all formatted for each platform's best practices.",
          "Consistent posting at optimal times builds momentum. We use data to determine when your audience is most active and engaged.",
        ],
      },
      {
        heading: "Community Management",
        body: [
          "Social media is a two-way street. We monitor and respond to comments, DMs, and mentions to keep your community engaged and your reputation protected.",
          "Active community management turns followers into advocates. A brand that responds quickly and authentically builds loyalty that compounds over time.",
        ],
      },
    ],
    stats: [],
    faq: [
      { q: "How often should we post?", a: "Quality matters more than quantity. For most local businesses, 3–5 high-quality posts per week across 1–2 platforms is more effective than daily low-effort content." },
      { q: "Do we need to be on every platform?", a: "No. We recommend focusing on 1–2 platforms where your audience is most active. Doing two platforms well beats doing five platforms poorly." },
      { q: "Can organic social actually drive leads?", a: "Yes, but indirectly. Organic social builds trust, credibility, and top-of-mind awareness. When someone needs your service, they remember the brand they've been seeing consistently in their feed." },
    ],
  },
  {
    slug: "performance-branding",
    title: "Performance Branding",
    shortDesc: "Purpose-driven brand stories rooted in data and performance analytics.",
    icon: Palette,
    heroHeadline: "Brand that drives",
    heroAccent: "performance.",
    heroSub: "We build brands that don't just look good — they convert. Every design decision is backed by data.",
    intro: [
      "Most branding agencies create beautiful work that doesn't move business metrics. Most performance agencies create ugly ads that convert. We do both — brand identity that's distinctive and measurable.",
      "Performance branding is the intersection of creative excellence and data-driven optimization. Your brand should be recognizable, trustworthy, and designed to convert at every touchpoint.",
    ],
    sections: [
      {
        heading: "Brand Identity & Strategy",
        body: [
          "We define your brand positioning, visual identity, and messaging framework — all grounded in competitive analysis, customer research, and market positioning.",
          "Your brand identity isn't just a logo. It's the complete system of visual and verbal cues that make your business instantly recognizable and trustworthy.",
        ],
      },
      {
        heading: "Conversion-Focused Design",
        body: [
          "Every brand asset we create is designed to perform. Website layouts, ad templates, social formats — all built with conversion principles baked in from the start.",
          "We test brand creative the same way we test performance ads. A/B testing visual treatments, messaging angles, and design variations to find what resonates and converts.",
        ],
      },
      {
        heading: "Brand Consistency at Scale",
        body: [
          "We build brand systems that scale. Templates, guidelines, and asset libraries that ensure consistency across every channel without requiring a designer for every piece of content.",
          "Consistency builds trust. When your brand looks and sounds the same across your website, ads, social, and print, customers perceive you as more professional and reliable.",
        ],
      },
    ],
    stats: [],
    faq: [
      { q: "What's the difference between branding and performance branding?", a: "Traditional branding focuses on aesthetics and identity. Performance branding ties every brand decision to measurable business outcomes — conversion rates, cost per acquisition, and revenue." },
      { q: "How long does a rebrand take?", a: "A full performance branding engagement typically takes 8–12 weeks from discovery to launch, including brand strategy, visual identity, and initial asset production." },
      { q: "Do I need a rebrand?", a: "Not always. Sometimes the strategy is sound but the execution is inconsistent. We audit your current brand first and recommend only the work that will actually move metrics." },
    ],
  },
  {
    slug: "content-marketing",
    title: "Content Marketing",
    shortDesc: "Culturally relevant content that resonates with the right audiences and drives conversions.",
    icon: FileText,
    heroHeadline: "Attract and convert with",
    heroAccent: "content.",
    heroSub: "We create content strategies that build authority, drive organic traffic, and convert readers into customers.",
    intro: [
      "Content marketing is the engine behind sustainable organic growth. But most businesses confuse 'having a blog' with 'doing content marketing.' They're not the same thing.",
      "Strategic content marketing means creating the right content for the right audience at the right stage of their buying journey. Every piece of content should earn its place in your marketing mix by driving measurable results.",
    ],
    sections: [
      {
        heading: "Content Strategy & Planning",
        body: [
          "We start with keyword research and competitive analysis to identify the content gaps that represent the biggest opportunities. Then we build an editorial calendar that balances quick wins with long-term authority building.",
          "Every content piece maps to a stage in the buyer journey — awareness, consideration, or decision. We create content that moves people through the funnel, not just attracts them to the top.",
        ],
      },
      {
        heading: "Production & Distribution",
        body: [
          "We produce blog posts, guides, case studies, and video content — all optimized for search and designed to convert. Quality matters more than volume.",
          "Creating great content is half the battle. We have distribution strategies for each piece — email, social, outreach — to ensure it reaches the right audience.",
        ],
      },
      {
        heading: "Performance Tracking",
        body: [
          "We track content performance beyond pageviews. Which articles generate leads? Which pages influence purchase decisions? Which topics drive the highest-value customers?",
          "Data drives our editorial decisions. We double down on what works, sunset what doesn't, and continuously refine the strategy based on real business outcomes.",
        ],
      },
    ],
    stats: [],
    faq: [
      { q: "How often should we publish content?", a: "Quality over quantity. 2–4 well-researched, well-written pieces per month will outperform daily thin content. Consistency matters more than frequency." },
      { q: "What types of content do you create?", a: "Blog posts, long-form guides, case studies, landing pages, email sequences, and video scripts. We recommend the formats that will have the most impact for your specific business and audience." },
      { q: "How do you measure content marketing ROI?", a: "We track organic traffic growth, keyword rankings, lead generation from content, and content-influenced revenue. Every piece of content is tied to measurable business outcomes." },
    ],
  },
  {
    slug: "lifecycle-marketing",
    title: "Lifecycle Marketing",
    shortDesc: "Hyper-customized experiences through granular segmentation and automated flows.",
    icon: MailCheck,
    heroHeadline: "Nurture leads with",
    heroAccent: "lifecycle marketing.",
    heroSub: "We build automated email and SMS sequences that turn leads into customers and customers into repeat buyers.",
    intro: [
      "Acquiring a new customer costs 5–7x more than retaining an existing one. Lifecycle marketing maximizes the value of every lead and customer you've already paid to acquire.",
      "We build automated flows that nurture leads, onboard new customers, re-engage lapsed ones, and turn your best customers into advocates — all running 24/7 without manual effort.",
    ],
    sections: [
      {
        heading: "Segmentation & Personalization",
        body: [
          "Generic blasts are dead. We segment your audience by behavior, purchase history, engagement level, and lifecycle stage — then deliver personalized messaging that feels relevant, not robotic.",
          "The right message to the right person at the right time. That's the difference between an email that gets deleted and one that drives a purchase.",
        ],
      },
      {
        heading: "Automated Flows",
        body: [
          "We build the automated sequences that generate revenue while you sleep: welcome series, abandoned cart recovery, post-purchase follow-up, win-back campaigns, and review requests.",
          "Each flow is optimized with A/B testing on subject lines, send times, content, and CTAs. Small improvements compound across thousands of sends.",
        ],
      },
      {
        heading: "Retention & Loyalty",
        body: [
          "We design retention programs that increase customer lifetime value — repeat purchase incentives, referral programs, and VIP tiers that reward your best customers.",
          "Retention is where the real profit lives. A 5% increase in customer retention can increase profits by 25–95%.",
        ],
      },
    ],
    stats: [],
    faq: [
      { q: "What platforms do you work with?", a: "We work with Klaviyo, Mailchimp, HubSpot, ActiveCampaign, and most major email/SMS platforms. We recommend the platform that best fits your business size and needs." },
      { q: "How many emails should we send per week?", a: "It depends on your audience and business. We use engagement data to find the optimal frequency — enough to stay top-of-mind without causing unsubscribes." },
      { q: "Do you handle SMS marketing too?", a: "Yes. SMS is a powerful complement to email, especially for time-sensitive offers, appointment reminders, and post-purchase follow-ups. We integrate both channels into a cohesive strategy." },
    ],
  },
  {
    slug: "consulting",
    title: "Consulting",
    shortDesc: "We identify real growth blockers and build a plan your team can actually execute.",
    icon: Lightbulb,
    heroHeadline: "Strategic growth",
    heroAccent: "consulting.",
    heroSub: "We work with your team to identify what's actually holding back growth and build a plan to fix it.",
    intro: [
      "Sometimes you don't need another agency running campaigns. You need someone who can look at the whole picture — your marketing, your sales process, your operations — and tell you where the real bottlenecks are.",
      "Our consulting engagements are designed for businesses that have the team to execute but need the strategic direction. We diagnose, plan, and advise — your team implements.",
    ],
    sections: [
      {
        heading: "Growth Audit",
        body: [
          "We conduct a comprehensive audit of your marketing and sales funnel — from first touch to closed deal. We identify the specific bottlenecks that are costing you the most revenue.",
          "Most businesses have 2–3 critical bottlenecks that account for the majority of lost revenue. We find them, quantify the impact, and prioritize the fixes.",
        ],
      },
      {
        heading: "Strategy & Roadmap",
        body: [
          "We build a prioritized roadmap based on impact and effort. Quick wins first, then structural improvements. Every recommendation comes with a clear business case and expected ROI.",
          "The roadmap is designed for your team to execute. We don't hand you a 100-page document and walk away — we build a practical, actionable plan with clear milestones.",
        ],
      },
      {
        heading: "Ongoing Advisory",
        body: [
          "For businesses that want ongoing strategic support, we offer fractional CMO and advisory retainers. Regular strategy sessions, performance reviews, and ad-hoc guidance as your team executes.",
          "Think of it as having a senior marketing leader on speed dial without the six-figure salary.",
        ],
      },
    ],
    stats: [],
    faq: [
      { q: "How is consulting different from hiring an agency?", a: "An agency executes campaigns on your behalf. Consulting gives your team the strategy and direction to execute themselves. It's best for businesses with in-house marketing talent that needs senior-level guidance." },
      { q: "What does a consulting engagement look like?", a: "Typically: a 2–4 week discovery and audit phase, followed by strategy development, then ongoing advisory. The exact format depends on your needs and team structure." },
      { q: "Do you offer fractional CMO services?", a: "Yes. For businesses that need ongoing strategic leadership without a full-time hire, we offer fractional CMO retainers with regular strategy sessions and executive-level marketing guidance." },
    ],
  },
];
