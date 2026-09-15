import { useId } from "react";

/**
 * Glyphs whose vertical text-shadow stack animates out of phase, producing a
 * travelling colour wave. The characters themselves are transparent — every
 * visible pixel is shadow.
 */
interface TextWaveProps {
  /** Split into characters; each one animates on its own offset. */
  text?: string;
  /** Repeats the whole string. `text="✦" count={5}` renders five glyphs. */
  count?: number;
  colors?: string[];
  animationDuration?: number;
  fontSize?: string;
  staggerDelay?: number;
  /** vh travelled per colour band. Total sweep is roughly ±5×this. */
  heightFactor?: number;
  className?: string;
  /** Announced to screen readers; the glyphs themselves are hidden from them. */
  label?: string;
}

// Module scope keeps the reference stable across renders.
const DEFAULT_COLORS = [
  "#7400b8",
  "#6930c3",
  "#5e60ce",
  "#5390d9",
  "#4ea8de",
  "#48bfe3",
  "#56cfe1",
  "#64dfdf",
  "#72efdd",
  "#80ffdb",
];

const buildShadow = (colors: string[], heightFactor: number, direction: 1 | -1) =>
  colors
    .map((c, i) => `0 ${(i - 5) * heightFactor * direction}vh ${i * 2}px ${c}`)
    .join(",");

export function TextWave({
  text = "✦",
  count = 1,
  colors = DEFAULT_COLORS,
  animationDuration = 2,
  fontSize = "12vw",
  staggerDelay = 200,
  heightFactor = 2,
  className,
  label,
}: TextWaveProps) {
  // Scopes the keyframes to this instance so two waves with different props
  // can coexist without clobbering each other's animation name.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const animation = `text-wave-${uid}`;
  const glyphClass = `${animation}-glyph`;

  const from = buildShadow(colors.slice().reverse(), heightFactor, 1);
  const to = buildShadow(colors, heightFactor, -1);

  const glyphs = Array.from({ length: count }, () => Array.from(text)).flat();

  return (
    <>
      <style>{`
        @keyframes ${animation} {
          0% { text-shadow: ${from}; }
          100% { text-shadow: ${to}; }
        }
        @media (prefers-reduced-motion: reduce) {
          .${glyphClass} {
            animation: none !important;
            text-shadow: ${to};
          }
        }
      `}</style>

      <div className={className}>
        {label ? <span className="sr-only">{label}</span> : null}
        <span
          aria-hidden="true"
          className="flex items-center justify-center gap-[0.08em] font-black leading-none"
          style={{ fontSize, color: "transparent" }}
        >
          {glyphs.map((glyph, i) => (
            <span
              key={i}
              className={glyphClass}
              style={{
                display: "inline-block",
                animation: `${animation} ${animationDuration}s cubic-bezier(0.3, 0, 0.7, 1) infinite alternate both`,
                // Negative delay starts each glyph mid-cycle, which is what
                // offsets them into a wave rather than a synchronised pulse.
                animationDelay: `${-1000 + i * staggerDelay}ms`,
              }}
            >
              {glyph}
            </span>
          ))}
        </span>
      </div>
    </>
  );
}
