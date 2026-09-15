import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { PageGlows } from "@/components/landing/PageGlows";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
// Chat widget disabled — to re-enable, uncomment this import and the <ChatWidget /> below.
// The component itself lives at src/components/landing/ChatWidget.tsx (kept intact).
// import { ChatWidget } from "@/components/landing/ChatWidget";
import { RouteFallback } from "@/components/RouteFallback";
import { useGridFit } from "@/hooks/useGridFit";
import { BackToTop } from "@/components/landing/BackToTop";
import { SkipLink } from "@/components/SkipLink";

export const MarketingShell = () => {
  // Both grid layers (here and inside PageHeroBg) are viewport-width, so one
  // measurement on the root serves both.
  useGridFit();

  return (
  <CurrencyProvider>
    <div className="relative isolate min-h-screen bg-background overflow-x-clip">
      {/* Fixed, not absolute, so the grid stays locked to the viewport while
          content scrolls over it — and stays in phase with PageHeroBg's grid. */}
      <SkipLink />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 grid-bg-page -z-10 print:hidden"
      />
      <PageGlows />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background -z-10 print:hidden"
      />
      <Navbar />
      {/* tabIndex -1 so the skip link and back-to-top can move focus here. */}
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BackToTop />
      {/* <ChatWidget /> */}
      <PaymentTestModeBanner />
    </div>
  </CurrencyProvider>
  );
};