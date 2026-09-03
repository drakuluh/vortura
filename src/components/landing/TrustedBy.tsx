import { Image as ImageIcon } from "lucide-react";
import { useInViewPause } from "@/hooks/useInViewPause";
import { SparklesText } from "@/components/ui/sparkles-text";
import "./trusted-by.css";

const CLIENTS = [
  "Client 01",
  "Client 02",
  "Client 03",
  "Client 04",
  "Client 05",
  "Client 06",
  "Client 07",
  "Client 08",
];

const LogoTile = ({ label }: { label: string }) => (
  <div className="tb-logo flex h-16 w-40 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground">
    <ImageIcon className="h-5 w-5 opacity-60" />
    <span className="font-mono text-[11px] uppercase tracking-widest">{label}</span>
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
              {CLIENTS.map((c) => (
                <LogoTile key={`a-${c}`} label={c} />
              ))}
              {CLIENTS.map((c) => (
                <div key={`b-${c}`} aria-hidden="true" className="contents">
                  <LogoTile label={c} />
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
