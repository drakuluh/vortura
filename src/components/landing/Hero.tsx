import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SparkleField } from "@/components/ui/sparkles-text";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { HeroPanels } from "@/components/landing/HeroPanels";

const WORDS = ["Call", "Booking", "Review", "Lead", "Sale"];

const Typewriter = () => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[index];
    const speed = deleting ? 60 : 110;
    const timeout = setTimeout(() => {
      if (!deleting) {
        const next = word.slice(0, text.length + 1);
        setText(next);
        if (next === word) setTimeout(() => setDeleting(true), 1600);
      } else {
        const next = word.slice(0, text.length - 1);
        setText(next);
        if (next === "") {
          setDeleting(false);
          setIndex((i) => (i + 1) % WORDS.length);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [text, deleting, index]);

  return (
    <span
      className="inline-flex items-baseline leading-[1.15] pb-[0.1em] min-h-[1.15em]"
      style={{ WebkitMaskImage: "none", maskImage: "none" }}
    >
      <span className="text-gradient relative inline-block" style={{ WebkitMaskImage: "none", maskImage: "none" }}>
        {text}{"\u200B"}
        <SparkleField />
      </span>
      <span className="ml-1 inline-block w-[3px] h-[0.9em] bg-primary animate-blink shadow-glow-blue" />
    </span>
  );
};

export const Hero = () => {
  const { user } = useAuth();
  return (
    <section className="relative isolate min-h-[100svh] flex items-center justify-center pt-20 sm:pt-28 lg:pt-32 pb-10 sm:pb-16 lg:pb-20 overflow-hidden">
      <PageHeroBg />
      {/* Sibling of the container, not a child: the container is padded, and
          inset-0 against it was clipping the outer edge off both side panels. */}
      <HeroPanels />

      <div className="container relative z-10">
        <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 mb-6 lg:mb-8 text-[11px] font-mono uppercase tracking-wider"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-primary">Built for Local Business</span>
            <span className="w-1 h-1 rounded-full bg-primary animate-pulse shadow-glow-blue" />
          </motion.div>

          <h1 className="text-[2.5rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold tracking-tight text-depth mb-4 sm:mb-6 lg:mb-8">
            Never miss
            <br />
            another <Typewriter />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-xl md:max-w-2xl mx-auto mb-7 sm:mb-9 lg:mb-10 leading-relaxed px-2 sm:px-0"
          >
            AI agents that answer your calls, book appointments, and collect reviews
            for you 24/7, so callers never end up in voicemail.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 max-w-sm mx-auto sm:max-w-none"
          >
            {/* Primary action carries the weight; the secondary is a quiet
                link so the page has one unmistakable next step. */}
            <Button
              variant="hero"
              size="lg"
              asChild
              className="w-full sm:w-auto h-12 sm:h-13 px-7 sm:px-9 text-sm sm:text-base font-semibold"
            >
              {user ? (
                <Link to="/dashboard">
                  <span>View Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <a href="#contact">
                  <span>Book a Discovery Call</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </Button>
            <a
              href="#services"
              className="inline-flex items-center gap-1.5 py-3 px-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View automations
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-8 sm:mt-12 lg:mt-10 flex justify-center"
          >
            {/* Same pill as the "Built for Local Business" badge. Text stays
                muted so it reads as reassurance under the CTA, not a second
                headline badge. On phones it can't fit one line, so it becomes
                two centered rows with squarer corners. */}
            <div className="inline-flex flex-col sm:flex-row items-center gap-1 sm:gap-5 px-4 py-2 sm:py-1 rounded-2xl sm:rounded-full bg-primary/10 border border-primary/25 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              <span>Trusted by local businesses</span>
              <span aria-hidden="true" className="hidden sm:block w-1 h-1 rounded-full bg-primary/60" />
              <span className="inline-flex items-center gap-4 sm:gap-5">
                <span>Setup in 2 weeks</span>
                <span aria-hidden="true" className="w-1 h-1 rounded-full bg-primary/60" />
                <span>Cancel anytime</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
        </div>
      </div>
    </section>
  );
};
