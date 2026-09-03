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

export const MarketingShell = () => (
  <CurrencyProvider>
    <div className="relative isolate min-h-screen bg-background overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg-page -z-10"
      />
      <PageGlows />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background -z-10"
      />
      <Navbar />
      <main>
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {/* <ChatWidget /> */}
      <PaymentTestModeBanner />
    </div>
  </CurrencyProvider>
);