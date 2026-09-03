import { cn } from "@/lib/utils";
import { useInViewPause } from "@/hooks/useInViewPause";
import "./ai-call-animation.css";

/**
 * Looping "24/7 AI call answering" demonstration for the AI call service
 * page: a phone cycles through after-hours idle → an incoming call → the
 * AI answering with a live voice waveform → a booked appointment. Blue
 * carries the AI voice, green the booking. Pure CSS motion; settles on the
 * booked state under reduced-motion.
 */
export const AiCallAnimation = ({ className }: { className?: string }) => {
  const ref = useInViewPause<HTMLDivElement>();
  return (
  <div
    ref={ref}
    className={cn("call-anim", className)}
    role="img"
    aria-label="A phone answering an after-hours call with an AI voice assistant, then booking an appointment."
  >
    <div className="call-phone" aria-hidden="true">
      <img className="call-phone-img" src="/call/phone-off.webp" alt="" draggable={false} />
      <img className="call-screen-wall" src="/call/phone-overlay.webp" alt="" draggable={false} />
      <span className="call-glow call-glow-blue" />
      <span className="call-glow call-glow-green" />
      <div className="call-screen">
        {/* Idle — after hours */}
        <div className="call-layer call-idle">
          <span className="call-moon" />
          <span className="call-clock">11:47 PM</span>
          <span className="call-idle-label">After hours</span>
        </div>

        {/* Incoming call */}
        <div className="call-layer call-incoming">
          <span className="call-status">Incoming call</span>
          <span className="call-avatar-wrap">
            <span className="call-ring" />
            <span className="call-ring" />
            <span className="call-ring" />
            <span className="call-avatar">NC</span>
          </span>
          <span className="call-name">New Customer</span>
          <span className="call-sub">mobile</span>
          <span className="call-answer">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
              <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1l-2.1 2.2z" />
            </svg>
          </span>
        </div>

        {/* Active — AI on the line */}
        <div className="call-layer call-active">
          <span className="call-active-title">AI Assistant</span>
          <span className="call-timer">on the line · 0:14</span>
          <span className="call-wave">
            <span className="call-bar" />
            <span className="call-bar" />
            <span className="call-bar" />
            <span className="call-bar" />
            <span className="call-bar" />
            <span className="call-bar" />
            <span className="call-bar" />
          </span>
          <span className="call-caption">Booking your appointment…</span>
        </div>

        {/* Booked */}
        <div className="call-layer call-booked">
          <span className="call-check">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
              <path d="M5 12l4 4 10-10" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="call-booked-title">Appointment booked</span>
          <span className="call-booked-time">Tue · 9:00 AM</span>
          <span className="call-booked-sub">Added to your calendar</span>
        </div>
      </div>
    </div>
  </div>
  );
};

export default AiCallAnimation;
