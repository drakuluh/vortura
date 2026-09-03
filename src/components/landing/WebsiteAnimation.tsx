import { cn } from "@/lib/utils";
import { MacbookPro } from "@/components/ui/macbook-pro";
import { useInViewPause } from "@/hooks/useInViewPause";
import "./website-animation.css";

/**
 * Looping "website that books customers" demonstration for the websites
 * service page: a MacBook Pro shows a local-business homepage on its screen,
 * a cursor glides to the "Book Now" button and clicks, and a booking
 * confirmation slides up. Pure CSS motion; settles on the booked state under
 * reduced-motion. Same container size as the NFC animation.
 */
export const WebsiteAnimation = ({ className }: { className?: string }) => {
  const ref = useInViewPause<HTMLDivElement>();
  return (
  <div
    ref={ref}
    className={cn("web-anim", className)}
    role="img"
    aria-label="A local business website on a laptop where a visitor clicks Book Now and a booking is confirmed."
  >
    <div className="web-device">
      <MacbookPro className="web-mac text-[#0b1220]" />

      <div className="web-page" aria-hidden="true">
        <div className="web-hero">
          <span className="web-eyebrow">Local · Trusted · 5★</span>
          <span className="web-title">Book your visit in seconds</span>
          <span className="web-sub">Modern care, friendly team, instant online scheduling.</span>
          <span className="web-book">
            Book Now
            <span className="web-book-ripple" />
          </span>
        </div>

        <span className="web-cursor">
          <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none">
            <path
              d="M5 3l14 8-6 1.5L10 19 5 3z"
              fill="#fff"
              stroke="#0f172a"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <div className="web-toast">
          <span className="web-toast-check">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none">
              <path d="M5 12l4 4 10-10" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="web-toast-text">
            <b>Booking confirmed</b>
            <span>Tue · 2:30 PM</span>
          </span>
        </div>
      </div>
    </div>
  </div>
  );
};

export default WebsiteAnimation;
