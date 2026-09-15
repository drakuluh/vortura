import { lazy, Suspense, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * The contact form and booking calendar pull in about 160 KB of libraries
 * (zod, react-hook-form, react-day-picker, date-fns). They sit at the bottom
 * of the page, so load them only once the visitor scrolls near. The
 * placeholder holds the panel's height so nothing below jumps when they
 * arrive, including a jump from the hero's "#contact" link.
 */
const ContactFormPanel = lazy(() =>
  import("./contact-form-shared").then((m) => ({ default: m.ContactFormPanel })),
);
const BookingPanel = lazy(() =>
  import("./BookingCalendar").then((m) => ({ default: m.BookingPanel })),
);

// Start fetching this far before the panel reaches the viewport.
const LOAD_MARGIN = "800px 0px";

const useNearViewport = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: LOAD_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  return [ref, near] as const;
};

const Placeholder = ({ className }: { className: string }) => (
  <div className={className} role="status" aria-label="Loading">
    <div className="h-full w-full rounded-2xl bg-white/[0.02] animate-pulse" />
  </div>
);

/**
 * Development only: once the real panel is in, compare its height with the
 * placeholder's and warn if they drift, so a form change that needs new
 * placeholder heights gets noticed instead of shipping a layout jump.
 */
const HeightCheck = ({ wrapper, placeholderHeight, label }: { wrapper: RefObject<HTMLDivElement>; placeholderHeight: RefObject<number>; label: string }) => {
  useEffect(() => {
    const id = window.setTimeout(() => {
      const expected = placeholderHeight.current;
      const actual = wrapper.current?.offsetHeight;
      if (expected && actual && Math.abs(actual - expected) > 2) {
        console.warn(
          `[LazyContactPanels] ${label} placeholder is ${expected}px but the loaded panel is ${actual}px at ${window.innerWidth}px wide. Update its height class in LazyContactPanels.tsx.`,
        );
      }
    }, 500);
    return () => window.clearTimeout(id);
  }, [wrapper, placeholderHeight, label]);
  return null;
};

const Deferred = ({ children, placeholderClass, label }: { children: ReactNode; placeholderClass: string; label: string }) => {
  const [ref, near] = useNearViewport();
  const placeholderHeight = useRef(0);
  const placeholder = <Placeholder className={placeholderClass} />;

  // Record the placeholder's height while it's still the one on screen.
  useEffect(() => {
    if (!near && ref.current) placeholderHeight.current = ref.current.offsetHeight;
  });

  return (
    <div ref={ref} className="flex flex-col flex-1">
      {near ? (
        <Suspense fallback={placeholder}>
          {children}
          {import.meta.env.DEV && <HeightCheck wrapper={ref} placeholderHeight={placeholderHeight} label={label} />}
        </Suspense>
      ) : (
        placeholder
      )}
    </div>
  );
};

// Heights match the loaded panels, measured on the production build at
// 390, 640, 768 and 1440px wide. Update them if the panels change.
export const LazyContactFormPanel = (props: { idPrefix?: string }) => (
  <Deferred label="Contact form" placeholderClass="h-[611px] md:h-[399px]">
    <ContactFormPanel {...props} />
  </Deferred>
);

/**
 * Home page contact section: signed-in visitors skip the name/email form and
 * get pointed at their conversation instead.
 */
export const ContactOrMessagePanel = (props: { idPrefix?: string }) => {
  const { user, loading } = useAuth();
  if (loading) return <Placeholder className="h-[611px] md:h-[399px]" />;
  if (!user) return <LazyContactFormPanel {...props} />;
  return (
    <div className="flex flex-1 flex-col">
      <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-4">// Message the team</p>
      <div className="flex flex-1 flex-col items-center justify-center text-center rounded-xl glass !bg-white/[0.06] px-6 py-10">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-4">
          <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-depth mb-1.5">You're signed in, so skip the form.</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-5">
          Message the team directly. We usually reply within 24 hours.
        </p>
        <Link
          to="/contact"
          className="btn-hero-glass inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
        >
          Open your conversation <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export const LazyBookingPanel = () => (
  <Deferred label="Booking calendar" placeholderClass="h-[375px] sm:h-[354px] lg:h-[399px]">
    <BookingPanel />
  </Deferred>
);
