import { useInViewPause } from "@/hooks/useInViewPause";
import { SparklesText } from "@/components/ui/sparkles-text";
import { TRUSTED_BY_CLIENTS } from "@/data/testimonials";
import "./trusted-by.css";

const LogoTile = ({ name, logo }: { name: string; logo: string }) => (
  <div className="tb-logo flex h-16 shrink-0 items-center justify-center px-8 md:px-12 opacity-55 hover:opacity-80 transition-opacity duration-300">
    <img src={logo} alt={name} className="h-8 md:h-10 lg:h-12 w-auto" draggable={false} />
  </div>
);

export const TrustedBy = () => {
  const marqueeRef = useInViewPause<HTMLDivElement>();
  return (
    <section className="relative py-10 md:py-14 lg:py-16">
      <div className="relative z-10">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth text-center mb-6 md:mb-8">
          Trusted by <SparklesText text="local businesses." className="text-gradient" />
        </h2>

        <div className="glass-strong py-8 md:py-10 relative overflow-hidden">
          <div ref={marqueeRef} className="tb-marquee relative" aria-label="Businesses we've worked with">
            <div className="tb-track">
              {TRUSTED_BY_CLIENTS.map((c) => (
                <LogoTile key={`a-${c.name}`} name={c.name} logo={c.logo} />
              ))}
              {TRUSTED_BY_CLIENTS.map((c) => (
                <div key={`b-${c.name}`} aria-hidden="true" className="contents">
                  <LogoTile name={c.name} logo={c.logo} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
