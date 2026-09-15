import { Link } from "react-router-dom";
import { ArrowRight, Zap, Target, Shield, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { useHeaderAnim, useRevealAnim } from "@/hooks/use-anim";

const VALUES = [
  {
    icon: Zap,
    title: "Speed over perfection",
    body: "Most agencies spend weeks on proposals. We deliver a working blueprint in 7 days, because your business can't wait on a committee.",
  },
  {
    icon: Target,
    title: "Outcomes, not deliverables",
    body: "We don't sell hours or page counts. We measure every automation by what it does for your business: more calls answered, more reviews collected, and more revenue.",
  },
  {
    icon: Shield,
    title: "No lock-in, ever",
    body: "You own everything we build. We don't use proprietary platforms, raise your price once you're locked in, or ask for 12-month contracts. If we stop being useful, you should be free to leave.",
  },
  {
    icon: Lightbulb,
    title: "Built for small teams",
    body: "Enterprise tools are built for enterprises. We build systems for businesses with 1 to 50 people, capable enough to compete with bigger companies and simple enough to use every day.",
  },
];

const AboutPage = () => {
  const header = useHeaderAnim();
  const reveal = useRevealAnim();

  return (
    <PageLayout>
      <Seo
        title="About Vortura"
        description="Vortura is a one-person AI automation studio in Mississauga that builds websites and automated systems for local businesses across the GTA and beyond."
      />
      <div className="relative overflow-hidden">
        <PageHeroBg />

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="relative z-10 pt-12 md:pt-14 lg:pt-24 pb-10 md:pb-14 lg:pb-20">
          <div className="container max-w-4xl">
            <motion.div className="max-w-3xl mx-auto text-center" {...header}>
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-4">
                About Vortura
              </p>
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-4 leading-tight">
                One person. Every automation{" "}
                <span className="text-gradient">built from scratch.</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Vortura doesn't have layers of account managers. One person
                builds every system, answers every call, and stands behind the
                code.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── The Story ─────────────────────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-4xl">
            <motion.div
              className="glass-strong border-gradient rounded-3xl p-6 md:p-10 lg:p-12"
              {...reveal(0)}
            >
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-4">
                The story
              </p>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-depth mb-6 leading-tight">
                Why Vortura exists
              </h2>
              <div className="space-y-4 text-sm md:text-[15px] text-muted-foreground leading-relaxed">
                <p>
                  We started Vortura after watching restaurants, trades
                  contractors, and clinics lose customers to problems that
                  already have solutions: calls going to voicemail, empty review
                  pages, websites that look like they were built in 2014, and
                  follow-ups that never happen.
                </p>
                <p>
                  The technology to fix this is already here. AI can answer a
                  call, book the appointment, and send a follow-up text before
                  the owner has finished their morning coffee. An NFC card lets a
                  happy customer leave a Google review with one tap, and a
                  well-built website can rank on Google and bring in calls every
                  week.
                </p>
                <p>
                  Most local businesses don't have the time, budget, or technical
                  knowledge to connect all of it. We build the systems, handle
                  the setup, and keep everything running, so owners can get on
                  with the work they're good at.
                </p>
                <p>
                  We build each automation from scratch, and clients talk
                  directly to the person who built their system. We judge every
                  project by whether it made a real difference to the business.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Values ────────────────────────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-4xl">
            <motion.div className="max-w-2xl mx-auto text-center mb-8 md:mb-12" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                What we believe
              </h2>
              <p className="text-sm text-muted-foreground">
                We follow these on every project.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4 lg:gap-5">
              {VALUES.map((v, i) => (
                <motion.div
                  key={v.title}
                  className="glass rounded-2xl p-5 md:p-6"
                  {...reveal(i)}
                >
                  <div className="btn-hero-glass pointer-events-none w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <v.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold tracking-tight text-depth mb-2">
                    {v.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {v.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Location ──────────────────────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-4xl">
            <motion.div
              className="glass rounded-2xl p-6 md:p-8 text-center"
              {...reveal(0)}
            >
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-3">
                Based in Mississauga &middot; Working worldwide
              </p>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-depth mb-3 leading-tight">
                Local roots, global reach
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Vortura is based in Mississauga, Ontario, and works with local
                businesses across the GTA and beyond, including Brampton,
                Toronto, and Hamilton. We also work with clients remotely, since
                everything is built, delivered, and supported online.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-4xl">
            <motion.div className="max-w-2xl mx-auto text-center" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-4 leading-tight">
                Want to work together?
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Book a free discovery call and we'll talk through what
                automation could do for your business, with no sales pressure.
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

export default AboutPage;
