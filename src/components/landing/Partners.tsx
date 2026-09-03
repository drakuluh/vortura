import { useInViewPause } from "@/hooks/useInViewPause";
import { SparklesText } from "@/components/ui/sparkles-text";
import "./partners.css";

const PARTNERS = [
  { name: "Retell AI", src: "/logos/retell.png" },
  { name: "Claude", src: "/logos/claude.png" },
  { name: "ElevenLabs", src: "/logos/elevenlabs.png" },
  { name: "Stripe", src: "/logos/stripe.png" },
  { name: "React", src: "/logos/react.png" },
  { name: "Google", src: "/logos/google.png" },
  { name: "Supabase", src: "/logos/supabase.png" },
  { name: "Lovable", src: "/logos/lovable.png" },
];

const LogoTile = ({ name, src }: { name: string; src: string }) => (
  <div className="pt-logo flex h-16 shrink-0 items-center justify-center px-8 md:px-12 opacity-55 hover:opacity-80 transition-opacity duration-300">
    <img src={src} alt={name} className="h-8 md:h-10 lg:h-12 w-auto" draggable={false} />
  </div>
);

export const Partners = () => {
  const marqueeRef = useInViewPause<HTMLDivElement>();
  return (
    <section className="relative py-10 md:py-14 lg:py-16">
      <div className="relative z-10">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth text-center mb-6 md:mb-8">
          Our <SparklesText text="partners." className="text-gradient" />
        </h2>

        <div className="glass-strong py-8 md:py-10 relative overflow-hidden">
          <div ref={marqueeRef} className="pt-marquee relative" aria-label="Technology partners">
            <div className="pt-track">
              {PARTNERS.map((p) => (
                <LogoTile key={`a-${p.name}`} {...p} />
              ))}
              {PARTNERS.map((p) => (
                <div key={`b-${p.name}`} aria-hidden="true" className="contents">
                  <LogoTile {...p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
