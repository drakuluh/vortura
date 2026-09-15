import { useInViewPause } from "@/hooks/useInViewPause";
import { TRUSTED_BY_CLIENTS } from "@/data/testimonials";
import { cn } from "@/lib/utils";
import "./trusted-by.css";

const LogoTile = ({ name, logo, compact }: { name: string; logo: string; compact: boolean }) => (
  <div
    className={cn(
      "tb-logo flex shrink-0 items-center justify-center opacity-55 hover:opacity-80 transition-opacity duration-300",
      compact ? "h-12 px-6 md:px-9" : "h-16 px-8 md:px-12",
    )}
  >
    <img
      src={logo}
      alt={name}
      // Intrinsic size (600x130) reserves the width before the file arrives.
      width={600}
      height={130}
      decoding="async"
      className={compact ? "h-7 md:h-9 w-auto" : "h-8 md:h-10 lg:h-12 w-auto"}
      draggable={false}
    />
  </div>
);

/**
 * `band` — a full-bleed glass stripe with its own section spacing. Suits the
 * home page, where it follows a full-height hero and works as a transition.
 *
 * `contained` — just the label and logos, no band and no padding, so the
 * parent can drop it inside a content column. Under a short page heading a
 * full-bleed stripe reads as a page break rather than as proof of the claim.
 */
export const TrustedBy = ({ variant = "band" }: { variant?: "band" | "contained" }) => {
  const marqueeRef = useInViewPause<HTMLDivElement>();
  const contained = variant === "contained";

  const label = (
    // Demoted to an eyebrow: a logo wall is supporting evidence, not a
    // section that needs to compete with the page's real headings.
    <h2
      className={cn(
        "text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60",
        contained ? "mb-3" : "mb-5 md:mb-6",
      )}
    >
      Trusted by local businesses
    </h2>
  );

  const marquee = (
    <div ref={marqueeRef} className="tb-marquee relative" aria-label="Businesses we've worked with">
      <div className="tb-track">
        {TRUSTED_BY_CLIENTS.map((c) => (
          <LogoTile key={`a-${c.name}`} name={c.name} logo={c.logo} compact={contained} />
        ))}
        {TRUSTED_BY_CLIENTS.map((c) => (
          <div key={`b-${c.name}`} aria-hidden="true" className="contents">
            <LogoTile name={c.name} logo={c.logo} compact={contained} />
          </div>
        ))}
      </div>
    </div>
  );

  if (contained) {
    return (
      <div>
        {label}
        {marquee}
      </div>
    );
  }

  return (
    <section className="relative py-10 md:py-14 lg:py-16">
      <div className="relative z-10">
        {label}
        <div className="glass-strong py-8 md:py-10 relative overflow-hidden">{marquee}</div>
      </div>
    </section>
  );
};

export default TrustedBy;
