import { cn } from "@/lib/utils";
import { useInViewPause } from "@/hooks/useInViewPause";
import "./qr-menu-animation.css";

/**
 * Looping "QR code menus" demonstration: a printed MENU + QR card sits on a
 * wood table (in the background image); a phone glides in with the same
 * smooth motion as the NFC review phone, a blue frame scans the QR, and the
 * phone loads a branded menu. Pure CSS motion; settles on the menu under
 * reduced-motion.
 */
export const QrMenuAnimation = ({ className }: { className?: string }) => {
  const ref = useInViewPause<HTMLDivElement>();
  return (
  <div
    ref={ref}
    className={cn("qr-anim", className)}
    role="img"
    aria-label="A phone scanning the QR code on a printed menu, then loading a branded menu."
  >
    {/* Blue scan frame over the QR baked into the background */}
    <span className="qr-scanbox" aria-hidden="true">
      <span className="qr-corner tl" />
      <span className="qr-corner tr" />
      <span className="qr-corner bl" />
      <span className="qr-corner br" />
      <span className="qr-scanline" />
    </span>

    {/* Phone that glides in to scan */}
    <div className="qr-phone" aria-hidden="true">
      <img className="qr-phone-img" src="/call/phone-off.webp" alt="" draggable={false} />
      <img className="qr-screen-wall" src="/call/phone-overlay.webp" alt="" draggable={false} />

      <div className="qr-screen">
        {/* Viewfinder while scanning — same blue frame as on the QR */}
        <div className="qr-layer qr-scan">
          <span className="qr-vf">
            <span className="qr-corner tl" />
            <span className="qr-corner tr" />
            <span className="qr-corner bl" />
            <span className="qr-corner br" />
            <span className="qr-scanline" />
          </span>
          <span className="qr-scan-label">Scanning…</span>
        </div>

        {/* Menu on the screen — cropped menu, clipped to the phone's display */}
        <img className="qr-menu-screen" src="/call/qr-menu-screen.png" alt="" draggable={false} />
      </div>
    </div>
  </div>
  );
};

export default QrMenuAnimation;
