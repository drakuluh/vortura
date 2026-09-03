import { cn } from "@/lib/utils";
import { MacbookPro } from "@/components/ui/macbook-pro";
import { useInViewPause } from "@/hooks/useInViewPause";
import "./database-reactivation.css";

/* Flat "corporate art" bust avatars — a coloured field, shoulders, a head,
   and a hair cap. Faceless by design (that style), and legible even tiny. */
const FACES = [
  { bg: "#FCD34D", shirt: "#7C3AED", skin: "#F1B892", hair: "#2A1D16" },
  { bg: "#93C5FD", shirt: "#DB2777", skin: "#E7AE86", hair: "#111827" },
  { bg: "#F9A8D4", shirt: "#2563EB", skin: "#C68642", hair: "#0B1220" },
  { bg: "#6EE7B7", shirt: "#EA580C", skin: "#F2C6A0", hair: "#5B3A29" },
];

const Face = ({ bg, shirt, skin, hair }: (typeof FACES)[number]) => (
  <svg viewBox="0 0 40 40" width="100%" height="100%">
    <rect width="40" height="40" fill={bg} />
    <rect x="7" y="29" width="26" height="16" rx="13" fill={shirt} />
    <circle cx="20" cy="19" r="7.5" fill={skin} />
    <path d="M12.5 19 A7.5 7.5 0 0 1 27.5 19 Z" fill={hair} />
  </svg>
);

const ROWS = [0, 1, 2, 3];

/**
 * Looping "database reactivation" demonstration, shown on the MacBook (from
 * the websites animation) over the same mesh wallpaper: a dormant customer
 * list wakes up row-by-row as a campaign sweep passes over it (grey → brand
 * purple), then a green "rebooked" result lands. Pure CSS motion; settles on
 * the reactivated state under reduced-motion.
 */
export const DatabaseReactivationAnimation = ({ className }: { className?: string }) => {
  const ref = useInViewPause<HTMLDivElement>();
  return (
  <div
    ref={ref}
    className={cn("dbr-anim", className)}
    role="img"
    aria-label="A dormant customer list being reactivated by a campaign, producing new bookings."
  >
    <div className="dbr-device">
      <MacbookPro className="dbr-mac text-[#0b1220]" />

      <div className="dbr-screen" aria-hidden="true">
        <div className="dbr-card">
          <div className="dbr-head">
            <span className="dbr-title">Customer list</span>
            <span className="dbr-chip">Reactivating…</span>
          </div>

          <div className="dbr-list">
            <span className="dbr-sweep" />
            {ROWS.map((i) => (
              <div key={i} className="dbr-row" style={{ ["--d" as string]: `${i * 0.14}s` }}>
                <span className="dbr-av">
                  <Face {...FACES[i]} />
                </span>
                <span className="dbr-bars">
                  <span className="dbr-bar" />
                  <span className="dbr-bar short" />
                </span>
                <span className="dbr-status">
                  <span className="dbr-st dbr-st-dormant">Dormant</span>
                  <span className="dbr-st dbr-st-sent">Reached</span>
                </span>
              </div>
            ))}
          </div>

          <div className="dbr-result">
            <span className="dbr-pill">
              <span className="dbr-result-check">
                <svg viewBox="0 0 24 24" width="8" height="8" fill="none">
                  <path d="M5 12l4 4 10-10" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              3 rebooked this week
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default DatabaseReactivationAnimation;
