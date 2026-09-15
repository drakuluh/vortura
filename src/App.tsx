import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { BrowserRouter } from "react-router-dom";
import { DeferredToasters } from "@/components/DeferredToasters";
import { Canonical } from "./components/Canonical.tsx";
import { RouteFallback } from "./components/RouteFallback.tsx";
import { AppRoutes } from "./AppRoutes.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MotionConfig reducedMotion="user">
      <DeferredToasters />
      <BrowserRouter>
        <Canonical />
        <Suspense fallback={<RouteFallback />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  </QueryClientProvider>
);

export default App;
