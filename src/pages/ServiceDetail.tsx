import { useParams, Link, Navigate } from "react-router-dom";
import { Check, ArrowRight, ArrowLeft, Clock, X, Phone, PencilRuler, Rocket, Wrench, Palette, Cpu, MapPin, Star, Clipboard, Layers, Package, Mic, GitBranch, Calendar, Zap, LayoutTemplate, User, Sparkles, ClipboardCheck, Database, PenLine, Send, BarChart3, Upload, Smartphone, QrCode, RefreshCw, Users, CheckCircle, TrendingUp, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { SparklesText } from "@/components/ui/sparkles-text";
import { services } from "@/data/services";
import { Counter } from "@/components/effects/Counter";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

const STEP_ICON_MAP: Record<string, LucideIcon> = {
  phone: Phone, "pencil-ruler": PencilRuler, rocket: Rocket, wrench: Wrench,
  palette: Palette, cpu: Cpu, "map-pin": MapPin, star: Star,
  clipboard: Clipboard, layers: Layers, package: Package,
  mic: Mic, "git-branch": GitBranch, calendar: Calendar, zap: Zap,
  "layout-template": LayoutTemplate, user: User, sparkles: Sparkles, "clipboard-check": ClipboardCheck,
  database: Database, "pen-line": PenLine, send: Send, "bar-chart-3": BarChart3,
  upload: Upload, smartphone: Smartphone, "qr-code": QrCode, "refresh-cw": RefreshCw,
  users: Users, "check-circle": CheckCircle, "trending-up": TrendingUp,
};

const reveal = (i: number, isMobile: boolean) =>
  isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" as const },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay: 0.06 * i },
      };

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = services.find((s) => s.slug === slug);
  const { openCheckout, closeCheckout, isOpen, checkoutElement } = useStripeCheckout();
  const isMobile = useIsMobile();

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

  const AnimationComponent = ANIMATION_MAP[service.slug];

  const ctaButton = canBuy ? (
    <button
      type="button"
      onClick={handleOrder}
      className="btn-hero-glass inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl text-lg font-semibold w-full sm:w-auto"
    >
      Order now <ArrowRight className="w-5 h-5" />
    </button>
  ) : (
    <Link
      to="/contact"
      className="btn-hero-glass inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl text-lg font-semibold w-full sm:w-auto"
    >
      Get started <ArrowRight className="w-5 h-5" />
    </Link>
  );

  const priceInline = service.priceFrom && (
    <div className="flex items-center gap-1.5 px-6 py-4 rounded-xl glass-strong border-gradient">
      {hasFromPrefix && (
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">From</span>
      )}
      <span className="text-2xl font-bold text-gradient">{priceAmount}</span>
      {pricePeriod && (
        <span className="text-sm font-semibold text-muted-foreground">/{pricePeriod}</span>
      )}
    </div>
  );

  return (
    <PageLayout>
      <Seo title={service.title} description={service.desc} jsonLd={jsonLd} />
      <div className="relative overflow-hidden">
        <PageHeroBg />

        {/* ── Back link ──────────────────────────────────── */}
        <div className="relative z-10 container max-w-5xl">
          <div className="pt-12 md:pt-14 lg:pt-24 mt-12 md:mt-10 lg:mt-8">
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2 px-3 -ml-3 rounded-lg hover:bg-white/[0.05]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All services
            </Link>
          </div>
        </div>

        {service.slug === "email-signatures" ? (
          <section className="relative z-10 pb-12 md:pb-16 lg:pb-20">
            <div className="container max-w-5xl">
              <motion.div
                className="glass-strong border-gradient rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 mt-6"
                {...reveal(0, isMobile)}
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
                <div className="mt-10">{ctaButton}</div>
              </motion.div>
            </div>
          </section>
        ) : (
          <>
            {/* ═══ SECTION 1 — HERO ═══════════════════════ */}
            <section className="relative z-10 pt-6 md:pt-8 pb-10 md:pb-12 lg:pb-16">
              <div className="container max-w-5xl">
                <motion.div className="mx-auto text-center mb-6 md:mb-8" {...reveal(0, isMobile)}>
                  <div className="flex items-center justify-center gap-3 mb-5">
                    <div className="btn-hero-glass pointer-events-none w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-[11px] font-mono uppercase tracking-widest text-primary">
                      <Clock className="w-3 h-3" />
                      {service.timeline}
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-depth leading-[1.08] lg:whitespace-nowrap">
                    {service.headline}{" "}
                    {service.headlineAccent && (
                      <SparklesText text={service.headlineAccent} className="text-gradient" />
                    )}
                  </h1>
                </motion.div>

                <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 xl:gap-14 lg:items-end">
                  <motion.div className="mb-8 lg:mb-0 flex flex-col" {...reveal(1, isMobile)}>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto text-center lg:text-left lg:mx-0">
                      {service.details}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      {ctaButton}
                      {priceInline}
                    </div>
                  </motion.div>

                  {AnimationComponent && (
                    <motion.div
                      className="glass-strong border-gradient rounded-2xl p-5"
                      {...reveal(1, isMobile)}
                    >
                      <AnimationComponent />
                    </motion.div>
                  )}
                </div>
              </div>
            </section>

            {/* ═══ SECTION 2 — PROBLEM / SOLUTION ═════════ */}
            <section className="relative z-10 py-10 md:py-12 lg:py-16">
              <div className="container max-w-5xl">
                <motion.div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-0 items-end mb-6 md:mb-8" {...reveal(0, isMobile)}>
                  <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight leading-tight text-depth text-center">
                    The <SparklesText text="problem." className="text-gradient-danger" colors={{ first: "#FF4444", second: "#FF8C00" }} sparklesCount={6} />
                  </h2>
                  <span className="hidden md:block text-base md:text-lg font-semibold text-muted-foreground px-4 pb-1">
                    Vs.
                  </span>
                  <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight leading-tight text-depth text-center">
                    Our <SparklesText text="approach." className="text-gradient-success" colors={{ first: "#2ECC71", second: "#27AE60" }} sparklesCount={6} />
                  </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <motion.div className="glass rounded-2xl p-6 md:p-8 border-gradient-danger" {...reveal(1, isMobile)}>
                    <ul className="space-y-4">
                      {service.problem.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-0.5 w-5 h-5 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                            <X className="w-3 h-3 text-red-400" />
                          </span>
                          <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div className="glass-strong rounded-2xl p-6 md:p-8 border-gradient-success" {...reveal(2, isMobile)}>
                    <ul className="space-y-4">
                      {service.solution.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-0.5 w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </span>
                          <span className="text-sm text-foreground/85 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* ═══ SECTION 3 — HOW IT WORKS ═══════════════ */}
            <section className="relative z-10 py-10 md:py-14 lg:py-20">
              <div className="container max-w-5xl">
                <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...reveal(0, isMobile)}>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                    How it <SparklesText text="works." className="text-gradient" />
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    A clear, proven process from start to finish.
                  </p>
                </motion.div>

                <div className="max-w-2xl mx-auto relative">
                  <div className="absolute left-5 md:left-6 top-3 bottom-3 w-px">
                    <div className="absolute inset-0 opacity-60" style={{ background: "linear-gradient(to bottom, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--primary)) 90%, transparent 100%)" }} />
                    <div className="absolute inset-0 blur-md" style={{ background: "linear-gradient(to bottom, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--primary)) 90%, transparent 100%)" }} />
                  </div>

                  <div className="space-y-5 md:space-y-6">
                    {service.process.map((step, i) => {
                      const StepIcon = (step.icon && STEP_ICON_MAP[step.icon]) || ArrowRight;
                      return (
                      <div key={step.step} className="relative flex gap-4 md:gap-6">
                        <div className="relative flex-shrink-0">
                          <motion.div
                            className="btn-hero-glass pointer-events-none relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                            initial={isMobile ? false : { y: 80, opacity: 0, scale: 0.5 }}
                            {...(isMobile
                              ? { animate: { y: 0, opacity: 1, scale: 1 } }
                              : { whileInView: { y: 0, opacity: 1, scale: 1 }, viewport: { once: true, margin: "-100px" } })}
                            transition={{ type: "spring", stiffness: 260, damping: 14, delay: i * 0.18 }}
                          >
                            <StepIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          </motion.div>
                        </div>

                        <motion.div className="glass rounded-2xl p-4 md:p-5 flex-1" {...reveal(i, isMobile)}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-[11px] text-primary tracking-widest">STEP {step.step}</span>
                            <div className="h-px flex-1 bg-white/[0.07]" />
                          </div>
                          <h3 className="text-base md:text-lg font-bold tracking-tight text-depth mb-1.5">
                            {step.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                        </motion.div>
                      </div>
                    );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* ═══ SECTION 4 — OUTCOMES ═══════════════════ */}
            <section className="relative z-10 py-10 md:py-14 lg:py-20">
              <div className="container max-w-5xl">
                <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...reveal(0, isMobile)}>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                    Results you can <SparklesText text="expect." className="text-gradient" />
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    What our clients typically see after launch.
                  </p>
                </motion.div>
                <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {service.stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="glass-strong rounded-2xl p-5 md:p-6 text-center flex flex-col items-center justify-between aspect-square"
                      {...reveal(i, isMobile)}
                    >
                      <div />
                      <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient">
                        <Counter
                          to={stat.value}
                          suffix={stat.suffix}
                          decimals={stat.decimals ?? 0}
                        />
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══ SECTION 5 — WHAT'S INCLUDED ════════════ */}
            <section className="relative z-10 py-10 md:py-14 lg:py-20">
              <div className="container max-w-5xl">
                <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...reveal(0, isMobile)}>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                    Everything <SparklesText text="included." className="text-gradient" />
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Everything you need to get started and see results.
                  </p>
                </motion.div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {service.included.map((item, i) => (
                    <motion.div
                      key={item}
                      className="glass rounded-2xl p-5 flex items-center gap-4"
                      {...reveal(i, isMobile)}
                    >
                      <div className="btn-hero-glass pointer-events-none w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm text-foreground/85 leading-relaxed">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══ SECTION 6 — FAQ ════════════════════════ */}
            {service.faq.length > 0 && (
              <section className="relative z-10 py-10 md:py-12 lg:py-16">
                <div className="container max-w-2xl">
                  <motion.div className="text-center mb-6 md:mb-8" {...reveal(0, isMobile)}>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-depth mb-2.5">
                      Common <SparklesText text="questions." className="text-gradient" />
                    </h2>
                    <p className="text-sm md:text-[15px] text-muted-foreground">
                      Everything you need to know before getting started.
                    </p>
                  </motion.div>
                  <Accordion type="single" collapsible className="space-y-3">
                    {service.faq.map((item, i) => (
                      <AccordionItem
                        key={item.q}
                        value={`item-${i}`}
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
              </section>
            )}

            {/* ═══ SECTION 7 — FINAL CTA ═════════════════ */}
            <section className="relative z-10 py-10 md:py-14 lg:py-20">
              <div className="container max-w-3xl">
                <motion.div
                  className="glass-strong border-gradient rounded-3xl p-8 md:p-12 lg:p-16 text-center"
                  {...reveal(0, isMobile)}
                >
                  <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-depth mb-3">
                    Ready to get <SparklesText text="started?" className="text-gradient" />
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-md mx-auto">
                    {canBuy
                      ? "Order now and we'll have everything set up within your timeline."
                      : "Book a free call and we'll build a plan tailored to your business."}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {ctaButton}
                    {priceInline}
                  </div>
                  {canBuy && (
                    <p className="mt-5">
                      <Link
                        to="/contact"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/40"
                      >
                        Or book a free call
                      </Link>
                    </p>
                  )}
                </motion.div>
              </div>
            </section>
          </>
        )}
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
