import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useState } from "react";
import { Seo } from "@/components/Seo";

const tiers = [
  {
    name: "Get Online",
    tag: "FOR LOCAL BUSINESSES",
    price: "$800",
    cadence: "+ $50 / 4 weeks",
    blurb: "A real website for your business — live in 2 weeks.",
    accent: "primary" as const,
    priceId: "get_online_onetime",
    features: [
      "4-page mobile-first website",
      "Click-to-call + directions buttons",
      "Contact form straight to your email",
      "Google Business Profile setup",
      "Basic local SEO",
      "1 round of revisions",
    ],
    cta: "Get online",
    details: {
      headline: "Your storefront on the internet.",
      description:
        "A clean, fast, mobile-first site that makes you look credible the moment a customer Googles you.",
      sections: [
        {
          title: "Timeline",
          items: ["Kickoff call within 48h", "Live in ~2 weeks", "1 revision round included"],
        },
        {
          title: "What's included",
          items: ["Hosting + SSL", "Domain setup help", "Mobile + desktop optimized", "Google Maps embed"],
        },
      ],
    },
  },
  {
    name: "Get More Calls",
    tag: "MOST POPULAR",
    price: "$1,200",
    cadence: "+ $200 / 4 weeks",
    blurb: "Website + automated lead capture so you never miss a customer.",
    accent: "secondary" as const,
    featured: true,
    priceId: "get_more_calls_monthly_sub",
    setupPriceId: "get_more_calls_setup_fee",
    features: [
      "Everything in Get Online",
      "Missed-call text-back (auto-text in 30s)",
      "Automated SMS review requests",
      "Lead notifications to your phone",
      "Site care + edits included every 4 weeks",
      "Performance report every 4 weeks",
    ],
    cta: "Capture more leads",
    details: {
      headline: "Stop losing customers to voicemail.",
      description:
        "Every missed call gets an instant text. Every happy customer gets a review request. All automated.",
      sections: [
        {
          title: "Automations",
          items: [
            "Missed-call text-back in 30s",
            "Review request after each job",
            "Lead alerts to your phone + email",
          ],
        },
        {
          title: "Ongoing",
          items: ["Site edits every 4 weeks", "Performance report", "Priority email support"],
        },
      ],
    },
  },
  {
    name: "Get More Customers",
    tag: "FULL GROWTH SYSTEM",
    price: "$3,000",
    cadence: "+ $500 / 4 weeks",
    blurb: "Site, lead capture, and 24/7 AI call answering — done for you.",
    accent: "primary" as const,
    priceId: "get_more_customers_monthly_sub",
    setupPriceId: "get_more_customers_setup_fee",
    features: [
      "Everything in Get More Calls",
      "AI voice agent answers after-hours calls",
      "Automated lead qualification + booking",
      "CRM setup + lead routing",
      "Bi-weekly strategy calls",
      "Priority support",
    ],
    cta: "Grow with us",
    details: {
      headline: "A full growth team without the payroll.",
      description:
        "AI answers calls 24/7, books jobs straight to your calendar, and a real strategist meets with you every two weeks.",
      sections: [
        {
          title: "AI Voice Agent",
          items: [
            "Answers after-hours + overflow calls",
            "Qualifies leads + books appointments",
            "Sends transcripts to your CRM",
          ],
        },
        {
          title: "Done-for-you",
          items: ["CRM setup + lead routing", "Bi-weekly strategy calls", "Priority phone support"],
        },
      ],
    },
  },
];

const Pricing = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openCheckout, closeCheckout, isOpen, checkoutElement } = useStripeCheckout();
  const { currency, convertPriceString } = useCurrency();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const handleBuy = (tier: (typeof tiers)[number]) => {
    if (!user) {
      navigate("/login?redirect=/pricing");
      return;
    }
    openCheckout({
      priceId: tier.priceId,
      setupPriceId: tier.setupPriceId,
      customerEmail: user.email,
      userId: user.id,
      returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });
  };

  const headerAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };
  return (
    <PageLayout>
      <Seo
        title="Pricing"
        description="Flat-rate packages — Get Online, Get More Calls, and Get More Customers — with simple monthly care plans. No surprises, cancel anytime."
      />
      <section className="relative pt-12 md:pt-14 lg:pt-24 pb-12 md:pb-16 lg:pb-24 overflow-hidden">
        <PageHeroBg />
        <div className="container relative z-10">
          <motion.div className="max-w-lg mx-auto text-center mb-7 md:mb-9 lg:mb-12 mt-12 md:mt-10 lg:mt-8" {...headerAnim}>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5">
              Built for <span className="text-gradient">local business.</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Flat pricing. No surprises. Cancel anytime.
            </p>
          </motion.div>

          <div className="max-w-3xl lg:max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {tiers.map((t, i) => {
              const isPrimary = t.accent === "primary";
              const featured = t.featured;
              const spinIn = featured;
              const isFlipped = !!flipped[t.name];
              return (
                <motion.div
                  key={t.name}
                  className={`relative ${featured ? "md:scale-[1.03] order-first md:order-none" : ""}`}
                  style={{ perspective: 1600 }}
                  initial={
                    isMobile
                      ? false
                      : spinIn
                        ? { opacity: 0, rotateY: -90 }
                        : { opacity: 0, y: 80, scale: 0.85 }
                  }
                  {...(isMobile
                    ? { animate: spinIn ? { opacity: 1, rotateY: 0 } : { opacity: 1, y: 0, scale: 1 } }
                    : {
                        whileInView: spinIn ? { opacity: 1, rotateY: 0 } : { opacity: 1, y: 0, scale: 1 },
                        viewport: { once: true, margin: "-60px" },
                      })}
                  transition={
                    spinIn
                      ? { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.15 }
                      : { type: "spring", stiffness: 220, damping: 18, delay: i * 0.15 }
                  }
                >
                  <motion.div
                    className="relative w-full h-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* FRONT */}
                    <div
                      className={`group glass rounded-2xl p-5 flex flex-col overflow-hidden transition-colors duration-500 ${
                        isPrimary ? "hover:border-primary/40" : "hover:border-secondary/40"
                      } ${isFlipped ? "" : "relative"}`}
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        ...(isFlipped ? { position: "absolute", inset: 0 } : {}),
                      }}
                    >
                      {featured && (
                        <div className="absolute -inset-px rounded-2xl bg-gradient-primary opacity-25 blur-md pointer-events-none" />
                      )}
                      <div
                        className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                          isPrimary
                            ? "bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.14),transparent_70%)]"
                            : "bg-[radial-gradient(circle_at_50%_0%,hsl(var(--secondary)/0.14),transparent_70%)]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setFlipped((s) => ({ ...s, [t.name]: true }))}
                        aria-label={`More info about ${t.name}`}
                        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                          isPrimary
                            ? "border-primary/30 text-primary hover:bg-primary/10"
                            : "border-secondary/30 text-secondary hover:bg-secondary/10"
                        } bg-background/40 backdrop-blur-sm`}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <div className="relative flex flex-col flex-1">
                    <p
                      className={`font-mono text-[11px] uppercase tracking-widest mb-1.5 ${
                        featured ? "text-secondary" : "text-muted-foreground"
                      }`}
                    >
                      {t.tag}
                    </p>
                    <h3 className="text-lg font-semibold tracking-tight mb-1.5">{t.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{t.blurb}</p>

                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold tracking-tight">{convertPriceString(t.price)}</span>
                      {t.cadence && (
                        <span className="text-xs font-mono text-muted-foreground">
                          {t.cadence.replace(/\$([\d,]+(?:\.\d+)?)/g, (m) => convertPriceString(m))}
                        </span>
                      )}
                    </div>

                    <ul className="space-y-2 mb-5 flex-1">
                      {t.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span
                            className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                              isPrimary
                                ? "bg-primary/10 border border-primary/30 text-primary"
                                : "bg-secondary/10 border border-secondary/30 text-secondary"
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={featured ? "hero" : "glass"}
                      size="default"
                      className="w-full"
                      onClick={() => handleBuy(t)}
                    >
                      {t.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                      </div>
                    </div>

                    {/* BACK */}
                    <div
                      className={`absolute inset-0 glass rounded-2xl p-5 flex flex-col overflow-hidden ${
                        isPrimary ? "border-primary/30" : "border-secondary/30"
                      }`}
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      {featured && (
                        <div className="absolute -inset-px rounded-2xl bg-gradient-primary opacity-25 blur-md pointer-events-none" />
                      )}
                      <button
                        type="button"
                        onClick={() => setFlipped((s) => ({ ...s, [t.name]: false }))}
                        aria-label={`Back to ${t.name} pricing`}
                        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                          isPrimary
                            ? "border-primary/30 text-primary hover:bg-primary/10"
                            : "border-secondary/30 text-secondary hover:bg-secondary/10"
                        } bg-background/40 backdrop-blur-sm`}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <div className="relative flex flex-col flex-1">
                        <p
                          className={`font-mono text-[11px] uppercase tracking-widest mb-1.5 ${
                            featured ? "text-secondary" : "text-muted-foreground"
                          }`}
                        >
                          {t.name}
                        </p>
                        <h3 className="text-base font-semibold tracking-tight mb-1.5 pr-10">
                          {t.details.headline}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                          {t.details.description}
                        </p>
                        <div className="space-y-3 flex-1">
                          {t.details.sections.map((s) => (
                            <div key={s.title}>
                              <p
                                className={`font-mono text-[11px] uppercase tracking-widest mb-1.5 ${
                                  isPrimary ? "text-primary" : "text-secondary"
                                }`}
                              >
                                {s.title}
                              </p>
                              <ul className="space-y-1.5">
                                {s.items.map((it) => (
                                  <li
                                    key={it}
                                    className="flex items-start gap-2 text-xs text-muted-foreground"
                                  >
                                    <span
                                      className={`mt-1 w-1 h-1 rounded-full shrink-0 ${
                                        isPrimary ? "bg-primary" : "bg-secondary"
                                      }`}
                                    />
                                    <span>{it}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant={featured ? "hero" : "glass"}
                          size="default"
                          className="w-full mt-4"
                          onClick={() => handleBuy(t)}
                        >
                          {t.cta}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          <motion.p
            className="text-center text-[11px] font-mono uppercase tracking-widest text-muted-foreground/70 mt-8"
            initial={isMobile ? false : { opacity: 0 }}
            {...(isMobile
              ? { animate: { opacity: 1 } }
              : { whileInView: { opacity: 1 }, viewport: { once: true, margin: "-40px" } })}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Every package includes onboarding, training, and a real human you can call.
          </motion.p>
          {currency.code !== "CAD" && (
            <p className="text-center text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-2">
              Prices shown in {currency.code} are estimates. All charges are billed in CAD.
            </p>
          )}
        </div>
      </section>

      <Dialog open={isOpen} onOpenChange={(o) => !o && closeCheckout()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete your purchase</DialogTitle>
          </DialogHeader>
          {checkoutElement}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Pricing;