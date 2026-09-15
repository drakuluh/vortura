import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { TextWave } from "@/components/ui/text-wave-animation";
import { useHeaderAnim } from "@/hooks/use-anim";

// Blue → purple ramp matching --primary through --secondary.
const BRAND_WAVE = [
  "#1AB3FF",
  "#35A8FF",
  "#4F9DFF",
  "#6A92FF",
  "#8487FF",
  "#9E7CFF",
  "#B071FF",
  "#C44DFF",
  "#D45CFF",
  "#E86BFF",
];

const DESTINATIONS = [
  { to: "/services", label: "Services" },
  { to: "/process", label: "Process" },
  { to: "/results", label: "Results" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

const NotFound = () => {
  const { pathname } = useLocation();
  const header = useHeaderAnim();

  useEffect(() => {
    console.warn("404: no route matched", pathname);
  }, [pathname]);

  return (
    <PageLayout>
      <Seo title="Page not found" description="That page doesn't exist." noindex />
      {/* Clipped because the wave's shadow stack sweeps well past the glyphs. */}
      <section className="relative overflow-hidden min-h-[calc(100vh-5rem)] flex items-center py-24 md:py-28">
        <PageHeroBg />
        <div className="container max-w-5xl">
          {/* Bottom clearance must exceed the shadow sweep (5 bands x heightFactor). */}
          <TextWave
            text="404"
            colors={BRAND_WAVE}
            fontSize="clamp(3.5rem, 16vw, 11rem)"
            heightFactor={1.5}
            animationDuration={2.4}
            staggerDelay={180}
            label="404: page not found"
            className="mb-[10vh]"
          />

          <motion.div className="text-center max-w-xl mx-auto" {...header}>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-depth mb-3">
              This page doesn't exist.
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mb-2">
              The link may be broken, or the page may have moved.
            </p>
            <p className="text-xs font-mono text-muted-foreground/50 mb-8 truncate">
              {pathname}
            </p>

            <Link
              to="/"
              className="btn-hero-glass inline-flex items-center gap-2 px-10 py-4 rounded-xl text-lg font-semibold"
            >
              Back to home <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="mt-10 pt-8 border-t border-white/[0.06]">
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-4">
                Or try one of these
              </p>
              <nav className="flex items-center justify-center gap-x-5 gap-y-2 flex-wrap text-sm">
                {DESTINATIONS.map((d) => (
                  <Link
                    key={d.to}
                    to={d.to}
                    className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center min-h-[44px] px-2"
                  >
                    {d.label}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default NotFound;
