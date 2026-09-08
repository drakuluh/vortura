import { useParams, Link, Navigate } from "react-router-dom";
import { Check, ArrowRight, ArrowLeft, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { services } from "@/data/services";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NfcTapAnimation } from "@/components/landing/NfcTapAnimation";
import { WebsiteAnimation } from "@/components/landing/WebsiteAnimation";
import { AiCallAnimation } from "@/components/landing/AiCallAnimation";
import { DatabaseReactivationAnimation } from "@/components/landing/DatabaseReactivationAnimation";
import { QrMenuAnimation } from "@/components/landing/QrMenuAnimation";
import { EmailNewsletterAnimation } from "@/components/landing/EmailNewsletterAnimation";
import { BusinessMediaAnimation } from "@/components/landing/BusinessMediaAnimation";
import { EmailSignatureAnimation } from "@/components/landing/EmailSignatureAnimation";
import { EmailSignatureBuilder } from "@/components/landing/EmailSignatureBuilder";
import { RoiCalculator } from "@/components/landing/RoiCalculator";

const ANIMATION_MAP: Record<string, React.FC<{ className?: string }>> = {
  "nfc-review-cards": NfcTapAnimation,
  "websites-local-business": WebsiteAnimation,
  "ai-call-answering": AiCallAnimation,
  "database-reactivation": DatabaseReactivationAnimation,
  "qr-code-menus": QrMenuAnimation,
  "email-newsletters": EmailNewsletterAnimation,
  "print-digital-design": BusinessMediaAnimation,
  "email-signatures": EmailSignatureAnimation,
};

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = services.find((s) => s.slug === slug);
  const { openCheckout, closeCheckout, isOpen, checkoutElement } = useStripeCheckout();

  if (!service) return <Navigate to="/services" replace />;

  const Icon = service.icon;
  const canBuy = !!service.checkout;

  const rawPrice = service.priceFrom ?? "";
  const hasFromPrefix = /^from\s+/i.test(rawPrice);
  const [priceAmount, pricePeriod] = rawPrice.replace(/^from\s+/i, "").split("/");

  const handleOrder = () => {
    if (!service.checkout) return;
    openCheckout({
      priceId: service.checkout.lookupKey,
      returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.desc,
    provider: { "@type": "Organization", name: "Vortura Agency" },
    ...(service.priceFrom && {
      offers: {
        "@type": "Offer",
        price: service.priceFrom.replace(/[^0-9.]/g, ""),
        priceCurrency: "USD",
      },
    }),
  };

  const reveal = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" as const },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay: 0.05 * i },
  });

  const AnimationComponent = ANIMATION_MAP[service.slug];

  /* ── Price + CTA block (reused in both layouts) ────────── */
  const priceCta = (
    <div>
      <div className="glass border-gradient rounded-2xl px-5 py-5 sm:px-8 sm:py-6 relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-primary opacity-[0.07]"
        />
        <div className="relative flex items-center justify-evenly gap-3 sm:gap-0 lg:flex-col lg:gap-4">
          {service.priceFrom && (
            <div className="text-center">
              {hasFromPrefix && (
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  From
                </p>
              )}
              <p className="flex items-baseline justify-center gap-1 leading-none">
                <span className="text-4xl md:text-5xl lg:text-4xl font-bold text-gradient">{priceAmount}</span>
                {pricePeriod && (
                  <span className="text-lg md:text-xl lg:text-lg font-semibold text-muted-foreground">
                    /{pricePeriod}
                  </span>
                )}
              </p>
            </div>
          )}
          {canBuy ? (
            <button
              type="button"
              onClick={handleOrder}
              className="btn-hero-glass inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-7 py-3 rounded-xl text-sm sm:text-lg lg:text-base font-semibold shrink-0 lg:w-full"
            >
              Order now <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : (
            <Link
              to="/contact"
              className="btn-hero-glass inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-7 py-3 rounded-xl text-sm sm:text-lg lg:text-base font-semibold shrink-0 lg:w-full"
            >
              Book a call <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          )}
        </div>
      </div>
      {canBuy && (
        <p className="text-center mt-5">
          <Link
            to="/contact"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Have questions? Book a call
          </Link>
        </p>
      )}
    </div>
  );

  return (
    <PageLayout>
      <Seo title={service.title} description={service.desc} jsonLd={jsonLd} />
      <div className="relative overflow-hidden">
        <PageHeroBg />
        <section className="relative z-10 pt-12 md:pt-14 lg:pt-24 pb-16 md:pb-20 lg:pb-28">
          <div className="container max-w-4xl lg:max-w-6xl">
            <div className="flex justify-center mb-8 mt-6 md:mt-4 lg:mt-0">
              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2 px-3 -ml-3 rounded-lg hover:bg-white/[0.05]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> All services
              </Link>
            </div>

            {service.slug === "email-signatures" ? (
              <motion.div
                className="glass-strong border-gradient rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12"
                {...reveal(0)}
              >
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-4">
                    <div className="btn-hero-glass pointer-events-none w-16 h-16 rounded-2xl flex items-center justify-center shrink-0">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-depth leading-[1.1] text-left">
                      {service.title}
                    </h1>
                  </div>
                </div>
                <EmailSignatureBuilder />
                <div className="mt-10">
                  {priceCta}
                </div>
              </motion.div>
            ) : (
              <>
                {/* ── Hero header ─────────────────────────── */}
                <motion.div className="text-center mb-8 md:mb-10 lg:mb-12" {...reveal(0)}>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="btn-hero-glass pointer-events-none w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0">
                      <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-depth leading-[1.1] text-left">
                      {service.title}
                    </h1>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-[11px] font-mono uppercase tracking-widest text-primary mb-5">
                    <Clock className="w-3 h-3 text-primary" />
                    {service.timeline}
                  </span>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                    {service.details}
                  </p>
                </motion.div>

                {/* ── Desktop: two-column layout ────────────── */}
                <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-8 xl:gap-10 lg:items-start">
                  {/* ── Left column: features ──────────────── */}
                  <div>
                    {/* Animation — mobile only */}
                    {AnimationComponent && (
                      <div className="lg:hidden mb-8">
                        <AnimationComponent />
                      </div>
                    )}

                    {/* Price + CTA — mobile only */}
                    <div className="lg:hidden mb-8">
                      {priceCta}
                    </div>

                    {/* What you get */}
                    <motion.div
                      className="glass-strong border-gradient rounded-3xl p-6 sm:p-8 md:p-10"
                      {...reveal(1)}
                    >
                      <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-6">
                        What you get
                      </p>
                      <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                        {service.included.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <span className="mt-0.5 w-5 h-5 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-primary" />
                            </span>
                            <p className="text-sm md:text-[15px] text-foreground/85 leading-relaxed">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>

                  {/* ── Right column: animation + price (desktop) ── */}
                  <div className="hidden lg:flex lg:flex-col lg:gap-6 lg:sticky lg:top-24">
                    {AnimationComponent && (
                      <motion.div
                        className="glass-strong border-gradient rounded-3xl p-6"
                        {...reveal(1)}
                      >
                        <AnimationComponent />
                      </motion.div>
                    )}
                    <motion.div {...reveal(2)}>
                      {priceCta}
                    </motion.div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {service.slug === "ai-call-answering" && <RoiCalculator />}

      {canBuy && (
        <Dialog open={isOpen} onOpenChange={(o) => !o && closeCheckout()}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Complete your order</DialogTitle>
            </DialogHeader>
            {checkoutElement}
          </DialogContent>
        </Dialog>
      )}
    </PageLayout>
  );
};

export default ServiceDetail;
