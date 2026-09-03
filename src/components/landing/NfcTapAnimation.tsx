import { cn } from "@/lib/utils";
import { useInViewPause } from "@/hooks/useInViewPause";
import "./nfc-tap-animation.css";

/**
 * Looping "tap → Google review" demonstration for the NFC service page,
 * composed from real product photos: the actual review card on a wood
 * surface, and a real iPhone whose screen changes as it taps the card.
 * Pure CSS motion; freezes to the finished review screen under reduced-motion.
 */
export const NfcTapAnimation = ({ className }: { className?: string }) => {
  const ref = useInViewPause<HTMLDivElement>();
  return (
  <div
    ref={ref}
    className={cn("nfc-anim", className)}
    role="img"
    aria-label="A phone tapping an NFC review card, then showing a five-star Google review."
  >
    <img className="nfc-card-img" src="/nfc/review-card.webp" alt="" draggable={false} />

    <span className="nfc-tapzone" aria-hidden="true">
      <span className="nfc-ripple" />
      <span className="nfc-ripple" />
      <span className="nfc-ripple" />
    </span>

    <div className="nfc-phone" aria-hidden="true">
      <img className="nfc-screen-off" src="/nfc/phone-off.webp" alt="" draggable={false} />
      <img className="nfc-screen-notif" src="/nfc/phone-notification.webp" alt="" draggable={false} />
      <img className="nfc-screen-google" src="/nfc/phone-google.webp" alt="" draggable={false} />
    </div>
  </div>
  );
};

export default NfcTapAnimation;
