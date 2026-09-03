import { cn } from "@/lib/utils";
import { MacbookPro } from "@/components/ui/macbook-pro";
import { useInViewPause } from "@/hooks/useInViewPause";
import "./email-newsletter-animation.css";

/**
 * Looping "automated email newsletters" demonstration, shown on the MacBook
 * (from the websites animation) over the same mesh wallpaper: a branded
 * newsletter composes itself, an "Approve & Send" press launches it (paper
 * plane), then a green open-rate bar fills. Pure CSS motion; settles on the
 * opened result under reduced-motion.
 */
export const EmailNewsletterAnimation = ({ className }: { className?: string }) => {
  const ref = useInViewPause<HTMLDivElement>();
  return (
  <div
    ref={ref}
    className={cn("news-anim", className)}
    role="img"
    aria-label="A branded newsletter being written, sent, and reaching a high open rate."
  >
    <div className="news-device">
      <MacbookPro className="news-mac text-[#0b1220]" />

      <div className="news-screen" aria-hidden="true">
        <div className="news-card">
          <div className="news-topbar" style={{ ["--d" as string]: "0s" }}>
            <span className="news-brand-dot" />
            <b>Monthly Update</b>
          </div>

          <div className="news-body">
            <span className="news-img" style={{ ["--d" as string]: "0.09s" }} />
            <span className="news-line w1" style={{ ["--d" as string]: "0.18s" }} />
            <span className="news-line w2" style={{ ["--d" as string]: "0.27s" }} />
            <span className="news-chip" style={{ ["--d" as string]: "0.36s" }}>Read more</span>
          </div>

          <div className="news-foot">
            <div className="news-send">
              <span className="news-send-btn">Approve &amp; Send</span>
            </div>

            <div className="news-stat">
              <span className="news-stat-top">
                <span className="news-stat-check">
                  <svg viewBox="0 0 24 24" width="8" height="8" fill="none">
                    <path d="M5 12l4 4 10-10" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                68% opened
              </span>
              <span className="news-stat-track">
                <span className="news-stat-fill" />
              </span>
              <span className="news-stat-sub">Sent to 1,240 customers</span>
            </div>

            <span className="news-plane">
              <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                <path d="M2 12L22 3l-6 18-4.5-6.5L2 12z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default EmailNewsletterAnimation;
