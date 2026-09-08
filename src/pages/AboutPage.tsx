import { Link } from "react-router-dom";
import { ArrowRight, Zap, Target, Shield, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { SparklesText } from "@/components/ui/sparkles-text";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHeaderAnim, useRevealAnim } from "@/hooks/use-anim";

const VALUES = [
  {
    icon: Zap,
    title: "Speed over perfection",
    body: "Most agencies spend weeks on proposals. We ship a working blueprint in 7 days. Iteration beats deliberation — your business can't wait for a committee.",
  },
  {
    icon: Target,
    title: "Outcomes, not deliverables",
    body: "We don't sell hours or page counts. Every automation is measured by what it does for your bottom line — more calls answered, more reviews collected, more revenue.",
  },
  {
    icon: Shield,
    title: "No lock-in, ever",
    body: "You own everything we build. No proprietary platforms, no hostage pricing, no 12-month contracts. If we stop being useful, you should be free to leave.",
  },
  {
    icon: Lightbulb,
    title: "Built for small teams",
    body: "Enterprise tools are built for enterprises. We build systems sized for businesses with 1–50 people — powerful enough to compete, simple enough to actually use.",
  },
];

const AboutPage = () => {
  const header = useHeaderAnim();
  const reveal = useRevealAnim();

  return (
    <PageLayout>
      <Seo
        title="About Vortura"
        description="Vortura is a one-person AI automation studio based in Mississauga, building websites and intelligent systems for local businesses across the GTA and beyond."
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
                <SparklesText text="built from scratch." className="text-gradient" />
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Vortura isn't a big agency with layers of account managers. It's
                one person who builds every system, answers every call, and
                stands behind every line of code.
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
                  I started Vortura after watching local businesses — restaurants,
                  trades contractors, clinics — lose customers to problems that
                  already have solutions. Missed calls going to voicemail. Review
                  pages sitting empty. Websites that look like they were built in
                  2014. Follow-ups that never happen.
                </p>
                <p>
                  The technology to fix all of this exists right now. AI can
                  answer a phone call, book an appointment, and send a follow-up
                  text — all before the business owner finishes their morning
                  coffee. NFC cards can turn every happy customer into a Google
                  review with one tap. A well-built website can rank on Google
                  and bring in calls every week.
                </p>
                <p>
                  But most local businesses don't have the time, budget, or
                  technical knowledge to wire all of this together. That's where
                  Vortura comes in. I build the systems, handle the setup, and
                  make sure everything runs — so business owners can focus on
                  what they're actually good at.
                </p>
                <p>
                  Every automation is custom-built, not a reskinned template.
                  Every client gets a direct line to the person who built their
                  system. And every project is measured by one thing: did it move
                  the needle?
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
                What I{" "}
                <SparklesText text="believe." className="text-gradient" />
              </h2>
              <p className="text-sm text-muted-foreground">
                These aren't slogans — they're the rules every project is built on.
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
                Vortura is based in Mississauga, Ontario and works with local
                businesses across the GTA — Brampton, Toronto, Hamilton, and
                beyond. Remote clients welcome — everything is built, delivered,
                and supported online.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────── */}
        <section className="relative z-10 py-10 md:py-14 lg:py-20">
          <div className="container max-w-4xl">
            <motion.div className="max-w-2xl mx-auto text-center" {...header}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-4 leading-tight">
                Ready to{" "}
                <SparklesText text="automate?" className="text-gradient" />
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Book a free discovery call and I'll map out what automation can
                do for your business — no pitch deck, no pressure.
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
