import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Star,
  Smartphone,
  QrCode,
  MessageSquare,
  Zap,
  TrendingUp,
  Clock,
  MapPin,
  CreditCard,
  Nfc,
  Shield,
  Users,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { SparklesText } from "@/components/ui/sparkles-text";
import { Counter } from "@/components/effects/Counter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHeaderAnim, useRevealAnim } from "@/hooks/use-anim";
import { NfcTapAnimation } from "@/components/landing/NfcTapAnimation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ── Data ────────────────────────────────────────────────── */

const COMPARISON = [
  {
    method: "NFC Tap",
    icon: Smartphone,
    steps: "1 tap",
    conversion: "60–80%",
    setup: "Place card on counter",
    highlight: true,
  },
  {
    method: "QR Code",
    icon: QrCode,
    steps: "3–4 steps",
    conversion: "35–50%",
    setup: "Print + display code",
    highlight: false,
  },
  {
    method: "Verbal / Email / Text",
    icon: MessageSquare,
    steps: "5+ steps",
    conversion: "5–15%",
    setup: "Train staff + send follow-ups",
    highlight: false,
  },
];

const STEPS = [
  {
    num: "01",
    title: "Customer finishes their visit",
    desc: "A great meal, a clean cut, a finished repair — the moment a customer is happiest with your service.",
  },
  {
    num: "02",
    title: "They tap the card",
    desc: "The card sits on the counter, table, or checkout area. One tap with any modern iPhone or Android — no app needed.",
  },
  {
    num: "03",
    title: "Google review page opens instantly",
    desc: "Your Google Business Profile review form loads in their browser, ready to go. No searching, no typing your business name.",
  },
  {
    num: "04",
    title: "Review posted in seconds",
    desc: "The customer taps a star rating, writes a quick note, and hits submit. The whole thing takes under 30 seconds.",
  },
];

const IMPACT_STATS = [
  { value: 70, suffix: "%", label: "Typical tap-to-review conversion rate" },
  { value: 3, suffix: "×", label: "More reviews than QR codes alone" },
  { value: 30, suffix: "+", label: "New reviews per month (typical for busy locations)" },
  { value: 4.7, suffix: "", label: "Average star rating from in-person prompts", decimals: 1 },
];

const INCLUDED = [
  { icon: CreditCard, text: "Durable NFC cards, custom-branded to your business" },
  { icon: Nfc, text: "Pre-programmed to your Google Business Profile — ready out of the box" },
  { icon: Smartphone, text: "Works on modern iPhone (7+) and Android (NFC-enabled) — no app needed" },
  { icon: QrCode, text: "Printed QR code fallback for older phones" },
  { icon: Shield, text: "Branded counter stand for front desk or checkout placement" },
  { icon: Users, text: "On-site setup and a quick staff walkthrough" },
];

const FAQS = [
  {
    q: "Does it work on all phones?",
    a: "NFC works on iPhone 7 and newer (iOS 13+) and most Android phones made after 2018. That covers the vast majority of smartphones in use today. For older phones, every card comes with a printed QR code fallback that opens the same review page.",
  },
  {
    q: "What if a customer's phone doesn't support NFC?",
    a: "Every card includes a QR code on the back. The customer scans it with their camera and lands on the same Google review page. Between NFC and QR, virtually every smartphone is covered.",
  },
  {
    q: "Can I use this for multiple locations?",
    a: "Yes. Each card is programmed to a specific Google Business Profile, so you can order separate cards for each location. Each set points to the right review page for that location.",
  },
  {
    q: "Is there a subscription, or is it a one-time purchase?",
    a: "The cards are a one-time purchase — no monthly fees. You buy the cards, we program and brand them, and they're yours. If you need replacements or want to order more later, you can do that anytime.",
  },
  {
    q: "How long do the cards last?",
    a: "NFC cards use passive NTAG215 chips with no battery. They don't wear out with normal use and are designed to last for years. The cards themselves are durable PVC — the same material as a credit card.",
  },
];

/* ── Page ─────────────────────────────────────────────────── */

const NfcReviewCardsPage = () => {
  const isMobile = useIsMobile();
  const header = useHeaderAnim();
  const reveal = useRevealAnim();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "NFC Google Review Cards",
    description:
      "Tap-to-review NFC cards that turn happy customers into 5-star Google reviews in one tap. From $49.",
    provider: { "@type": "Organization", name: "Vortura Agency" },
    offers: { "@type": "Offer", price: "49", priceCurrency: "USD" },
  };

  return (
    <PageLayout>
      <Seo
        title="NFC Google Review Cards"
        description="Tap-to-review NFC cards that turn happy customers into 5-star Google reviews. One tap, no app, no friction. From $49."
        jsonLd={jsonLd}
      />
      <div className="relative overflow-hidden">
        <PageHeroBg />

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="relative z-10 pt-12 md:pt-14 lg:pt-24 pb-10 md:pb-14 lg:pb-20">
          <div className="container max-w-5xl">
            <div className="flex justify-center mb-8">
              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2 px-3 -ml-3 rounded-lg hover:bg-white/[0.05]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> All services
              </Link>
            </div>

            <motion.div className="max-w-3xl mx-auto text-center" {...header}>
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-4">
                TAP &middot; REVIEW &middot; RANK
              </p>
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-4 leading-tight">
                Turn every visit into a{" "}
                <SparklesText text="5-star review." className="text-gradient" />
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-8">
                Customers don't leave reviews because it's awkward to ask and
                too many steps to follow through. NFC cards fix both — one
                tap and they're writing a review.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/contact"
                  className="btn-hero-glass inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold"
                >
                  Get your cards <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  From $49
                </span>
              </div>
            </motion.div>

            <motion.div className="mt-10 max-w-md mx-auto" {...reveal(2)}>
              <NfcTapAnimation />
            </motion.div>
          </div>
        </section>

        {/* ── Why Google Reviews Matter ─────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                Google reviews are your{" "}
                <SparklesText text="growth engine." className="text-gradient" />
              </h2>
              <p className="text-sm text-muted-foreground">
                The data is clear — reviews drive rankings, trust, and revenue.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4 lg:gap-5 max-w-4xl mx-auto">
              {[
                {
                  icon: Star,
                  title: "Buyers check reviews first",
                  body: "Industry research consistently shows that roughly 9 in 10 consumers read Google reviews before choosing a local business. Google is the first place most people look — ahead of Yelp, Facebook, and TripAdvisor.",
                },
                {
                  icon: MapPin,
                  title: "Reviews control your local ranking",
                  body: "Star rating and review count are key factors in Google's local map-pack algorithm. Businesses with 40 or more reviews typically see around 3× more clicks and are significantly more likely to appear in local search results.",
                },
                {
                  icon: Clock,
                  title: "Freshness matters as much as volume",
                  body: "Both Google and consumers weight recent reviews heavily. Most studies find that reviews older than a month or two carry significantly less influence — a steady stream of new reviews outperforms a one-time burst.",
                },
                {
                  icon: TrendingUp,
                  title: "Higher stars, higher revenue",
                  body: "Commonly cited research, including studies from Harvard Business School, links each additional star to a 5–9% increase in revenue. And the bar keeps rising — a growing share of consumers now won't consider businesses rated below 4.5 stars.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  className="glass rounded-2xl p-5 md:p-6"
                  {...reveal(i)}
                >
                  <div className="btn-hero-glass pointer-events-none w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold tracking-tight text-depth mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── NFC vs QR vs Verbal Comparison ────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                Why NFC{" "}
                <SparklesText text="wins." className="text-gradient" />
              </h2>
              <p className="text-sm text-muted-foreground">
                Less friction means more reviews. Here's how the methods compare.
              </p>
            </motion.div>

            {/* Desktop comparison table */}
            <div className="hidden md:block max-w-3xl mx-auto">
              <motion.div className="glass-strong border-gradient rounded-2xl overflow-hidden" {...reveal(0)}>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.07]">
                      <th className="px-6 py-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Method</th>
                      <th className="px-6 py-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Steps</th>
                      <th className="px-6 py-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Conversion</th>
                      <th className="px-6 py-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Setup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row) => (
                      <tr
                        key={row.method}
                        className={`border-b last:border-0 border-white/[0.07] ${
                          row.highlight ? "bg-primary/[0.06]" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <row.icon className={`w-4 h-4 ${row.highlight ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={`text-sm font-semibold ${row.highlight ? "text-foreground" : "text-muted-foreground"}`}>
                              {row.method}
                              {row.highlight && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-primary/15 border border-primary/25 text-primary">
                                  Best
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm ${row.highlight ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                          {row.steps}
                        </td>
                        <td className={`px-6 py-4 text-sm ${row.highlight ? "text-primary font-bold" : "text-muted-foreground"}`}>
                          {row.conversion}
                        </td>
                        <td className={`px-6 py-4 text-sm ${row.highlight ? "text-foreground" : "text-muted-foreground"}`}>
                          {row.setup}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
              <p className="text-center text-xs text-muted-foreground/60 mt-3">
                Conversion ranges based on general industry data for local businesses.
              </p>
            </div>

            {/* Mobile comparison cards */}
            <div className="md:hidden space-y-3">
              {COMPARISON.map((row, i) => (
                <motion.div
                  key={row.method}
                  className={`glass rounded-2xl p-5 ${
                    row.highlight ? "border border-primary/25" : ""
                  }`}
                  {...reveal(i)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <row.icon className={`w-5 h-5 ${row.highlight ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm font-bold text-depth">{row.method}</span>
                    {row.highlight && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-primary/15 border border-primary/25 text-primary">
                        Best
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Steps</p>
                      <p className={`text-sm font-semibold ${row.highlight ? "text-foreground" : "text-muted-foreground"}`}>{row.steps}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Conv.</p>
                      <p className={`text-sm font-bold ${row.highlight ? "text-primary" : "text-muted-foreground"}`}>{row.conversion}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Setup</p>
                      <p className="text-xs text-muted-foreground">{row.setup}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              <p className="text-center text-xs text-muted-foreground/60 mt-2">
                Conversion ranges based on general industry data.
              </p>
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                From tap to{" "}
                <SparklesText text="5 stars." className="text-gradient" />
              </h2>
              <p className="text-sm text-muted-foreground">
                The entire process takes under 30 seconds.
              </p>
            </motion.div>

            <div className="max-w-2xl mx-auto relative">
              {/* Vertical timeline line */}
              <div className="absolute left-5 md:left-6 top-3 bottom-3 w-px">
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background:
                      "linear-gradient(to bottom, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--primary)) 90%, transparent 100%)",
                  }}
                />
                <div
                  className="absolute inset-0 blur-md"
                  style={{
                    background:
                      "linear-gradient(to bottom, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--primary)) 90%, transparent 100%)",
                  }}
                />
              </div>

              <div className="space-y-5 md:space-y-6">
                {STEPS.map((step, i) => (
                  <div key={step.num} className="relative flex gap-4 md:gap-6">
                    <div className="relative flex-shrink-0">
                      <motion.div
                        className="btn-hero-glass pointer-events-none relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                        initial={isMobile ? false : { y: 80, opacity: 0, scale: 0.5 }}
                        {...(isMobile
                          ? { animate: { y: 0, opacity: 1, scale: 1 } }
                          : {
                              whileInView: { y: 0, opacity: 1, scale: 1 },
                              viewport: { once: true, margin: "-100px" },
                            })}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 14,
                          delay: i * 0.18,
                        }}
                      >
                        <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </motion.div>
                    </div>

                    <motion.div className="glass rounded-2xl p-4 md:p-5 flex-1" {...reveal(i)}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-[11px] text-primary tracking-widest">
                          STEP {step.num}
                        </span>
                        <div className="h-px flex-1 bg-white/[0.07]" />
                      </div>
                      <h3 className="text-base md:text-lg font-bold tracking-tight text-depth mb-1.5">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Expected Impact ───────────────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                Typical{" "}
                <SparklesText text="results." className="text-gradient" />
              </h2>
              <p className="text-sm text-muted-foreground">
                Illustrative ranges based on general industry data for local businesses using NFC review cards.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {IMPACT_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="glass rounded-2xl p-5 md:p-6 aspect-square flex flex-col items-center justify-center text-center"
                  {...reveal(i)}
                >
                  <div className="flex-1" />
                  <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient leading-none">
                    <Counter
                      to={stat.value}
                      suffix={stat.suffix}
                      decimals={stat.decimals ?? 0}
                    />
                  </p>
                  <div className="flex-1 flex items-end pb-1">
                    <p className="text-xs text-muted-foreground leading-snug">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What's Included ───────────────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                Everything{" "}
                <SparklesText text="included." className="text-gradient" />
              </h2>
              <p className="text-sm text-muted-foreground">
                Cards, stand, setup, and training — ready to collect reviews from day one.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {INCLUDED.map((item, i) => (
                <motion.div
                  key={item.text}
                  className="glass rounded-2xl p-5 flex items-start gap-4"
                  {...reveal(i)}
                >
                  <div className="btn-hero-glass pointer-events-none w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed pt-2">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div className="max-w-md mx-auto" {...reveal(0)}>
              <div className="glass-strong border-gradient rounded-2xl p-6 md:p-8 text-center relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-primary opacity-[0.05]"
                />
                <div className="relative">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-3">
                    One-time purchase
                  </p>
                  <p className="flex items-baseline justify-center gap-1 leading-none mb-2">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mr-1">
                      From
                    </span>
                    <span className="text-5xl md:text-6xl font-bold text-gradient">$49</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    No subscriptions. No monthly fees. Cards are yours forever.
                  </p>

                  <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto">
                    {[
                      "Custom-branded NFC cards",
                      "Branded counter stand",
                      "QR code fallback included",
                      "On-site setup + staff training",
                      "Installed in days",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 w-5 h-5 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </span>
                        <span className="text-sm text-foreground/85">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/contact"
                    className="btn-hero-glass inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold w-full justify-center"
                  >
                    Get your cards <ArrowRight className="w-4 h-4" />
                  </Link>

                  <p className="text-center mt-4">
                    <Link
                      to="/contact"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Have questions? Book a call
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                Common{" "}
                <SparklesText text="questions." className="text-gradient" />
              </h2>
            </motion.div>

            <div className="max-w-2xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                {FAQS.map((item, i) => (
                  <AccordionItem
                    key={item.q}
                    value={`faq-${i}`}
                    className="glass rounded-2xl border border-white/10 px-5 md:px-6 overflow-hidden"
                  >
                    <AccordionTrigger className="py-4 md:py-5 text-left text-[15px] md:text-base font-semibold tracking-tight hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm md:text-[15px] leading-relaxed text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-5xl">
            <motion.div className="max-w-2xl mx-auto text-center" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-4 leading-tight">
                Ready to stack{" "}
                <SparklesText text="5-star reviews?" className="text-gradient" />
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Most businesses are set up and collecting new reviews within a week.
              </p>
              <Link
                to="/contact"
                className="btn-hero-glass inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold"
              >
                Book a call <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default NfcReviewCardsPage;
