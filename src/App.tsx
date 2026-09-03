import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Canonical } from "./components/Canonical.tsx";
import { RouteFallback } from "./components/RouteFallback.tsx";
import { MarketingShell } from "./components/landing/MarketingShell.tsx";
import { OnboardingGate } from "./components/auth/OnboardingGate.tsx";
import Index from "./pages/Index.tsx";

// Route-level code splitting: only the landing page (Index) and the shells are
// eager. Every other page — the rest of the marketing site, the client
// dashboard, and the entire admin panel — loads in its own chunk on demand,
// so a first-time visitor no longer downloads the admin app to view the home
// page. Each layout wraps its <Outlet> in its own <Suspense>, so the navbar
// or sidebar stays visible during a route transition.
const Services = lazy(() => import("./pages/Services.tsx"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail.tsx"));
const ProcessPage = lazy(() => import("./pages/ProcessPage.tsx"));
const ResultsPage = lazy(() => import("./pages/ResultsPage.tsx"));
// Pricing page removed — to restore, uncomment this and its <Route> below.
// The page component is kept intact at src/pages/Pricing.tsx.
// const Pricing = lazy(() => import("./pages/Pricing.tsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.tsx"));
// ROI page removed — to restore, uncomment this and its <Route> below.
// The page component is kept intact at src/pages/RoiPage.tsx (the ROI
// calculator still appears as a section on the home page).
// const RoiPage = lazy(() => import("./pages/RoiPage.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const Privacy = lazy(() => import("./pages/legal/Privacy.tsx"));
const Terms = lazy(() => import("./pages/legal/Terms.tsx"));
const Refund = lazy(() => import("./pages/legal/Refund.tsx"));
const About = lazy(() => import("./pages/legal/About.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.tsx"));
const RequestChange = lazy(() => import("./pages/dashboard/RequestChange.tsx"));
const ChangeRequestDetail = lazy(() => import("./pages/dashboard/ChangeRequestDetail.tsx"));
const Messages = lazy(() => import("./pages/dashboard/Messages.tsx"));
const Invoices = lazy(() => import("./pages/dashboard/Invoices.tsx"));
const Profile = lazy(() => import("./pages/dashboard/Profile.tsx"));
const Billing = lazy(() => import("./pages/dashboard/Billing.tsx"));
const PackageDetail = lazy(() => import("./pages/dashboard/PackageDetail.tsx"));
const CheckoutReturn = lazy(() => import("./pages/CheckoutReturn.tsx"));

const AdminLayout = lazy(() =>
  import("./components/admin/AdminLayout.tsx").then((m) => ({ default: m.AdminLayout })),
);
const RequireAdmin = lazy(() =>
  import("./components/admin/RequireAdmin.tsx").then((m) => ({ default: m.RequireAdmin })),
);
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview.tsx"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings.tsx"));
const AdminTasks = lazy(() => import("./pages/admin/AdminTasks.tsx"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients.tsx"));
const AdminPackages = lazy(() => import("./pages/admin/AdminPackages.tsx"));
const AdminPackageDetail = lazy(() => import("./pages/admin/AdminPackageDetail.tsx"));
const AdminInvoices = lazy(() => import("./pages/admin/AdminInvoices.tsx"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages.tsx"));
const AdminChangeRequests = lazy(() => import("./pages/admin/AdminChangeRequests.tsx"));
const AdminTeam = lazy(() => import("./pages/admin/AdminTeam.tsx"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings.tsx"));
const AdminNotFound = lazy(() => import("./pages/admin/AdminNotFound.tsx"));

const AdminLayoutDemo = lazy(() =>
  import("./components/admin-demo/AdminLayoutDemo.tsx").then((m) => ({ default: m.AdminLayoutDemo })),
);
const DemoOverview = lazy(() => import("./pages/admin-demo/AdminOverview.tsx"));
const DemoClients = lazy(() => import("./pages/admin-demo/AdminClients.tsx"));
const DemoPackages = lazy(() => import("./pages/admin-demo/AdminPackages.tsx"));
const DemoInvoices = lazy(() => import("./pages/admin-demo/AdminInvoices.tsx"));
const DemoMessages = lazy(() => import("./pages/admin-demo/AdminMessages.tsx"));
const DemoChangeRequests = lazy(() => import("./pages/admin-demo/AdminChangeRequests.tsx"));
const DemoTeam = lazy(() => import("./pages/admin-demo/AdminTeam.tsx"));
const DemoSettings = lazy(() => import("./pages/admin-demo/AdminSettings.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const Gated = ({ children }: { children: React.ReactNode }) => (
  <OnboardingGate>{children}</OnboardingGate>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MotionConfig reducedMotion="user">
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Canonical />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Real admin (auth-protected) */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="tasks" element={<AdminTasks />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="packages/:id" element={<AdminPackageDetail />} />
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="change-requests" element={<AdminChangeRequests />} />
              <Route path="admins" element={<AdminTeam />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="*" element={<AdminNotFound />} />
            </Route>

            {/* Demo admin (public, sample data) */}
            <Route path="/admin-demo" element={<AdminLayoutDemo />}>
              <Route index element={<DemoOverview />} />
              <Route path="clients" element={<DemoClients />} />
              <Route path="packages" element={<DemoPackages />} />
              <Route path="invoices" element={<DemoInvoices />} />
              <Route path="messages" element={<DemoMessages />} />
              <Route path="change-requests" element={<DemoChangeRequests />} />
              <Route path="admins" element={<DemoTeam />} />
              <Route path="settings" element={<DemoSettings />} />
            </Route>

            <Route element={<MarketingShell />}>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/process" element={<ProcessPage />} />
              <Route path="/results" element={<ResultsPage />} />
              {/* <Route path="/roi" element={<RoiPage />} /> */}
              {/* <Route path="/pricing" element={<Pricing />} /> */}
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Gated><Dashboard /></Gated>} />
              <Route path="/dashboard/request-change" element={<Gated><RequestChange /></Gated>} />
              <Route path="/dashboard/request-change/:id" element={<Gated><ChangeRequestDetail /></Gated>} />
              <Route path="/dashboard/messages" element={<Gated><Messages /></Gated>} />
              <Route path="/dashboard/invoices" element={<Gated><Invoices /></Gated>} />
              <Route path="/dashboard/billing" element={<Gated><Billing /></Gated>} />
              <Route path="/dashboard/profile" element={<Gated><Profile /></Gated>} />
              <Route path="/dashboard/packages/:id" element={<Gated><PackageDetail /></Gated>} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/about" element={<About />} />
              <Route path="/checkout/return" element={<CheckoutReturn />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </MotionConfig>
  </QueryClientProvider>
);

export default App;
