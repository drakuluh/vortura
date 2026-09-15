import { lazy, Suspense, useEffect, useState } from "react";

/**
 * Both toast systems (sonner and the Radix toaster) render nothing until a
 * toast fires, and toasts only fire after someone interacts. Mount them once
 * the browser is idle so their ~50 KB stays off the first-load path.
 */
const Toasters = lazy(async () => {
  const [{ Toaster }, { Toaster: Sonner }] = await Promise.all([
    import("@/components/ui/toaster"),
    import("@/components/ui/sonner"),
  ]);
  return {
    default: () => (
      <>
        <Toaster />
        <Sonner />
      </>
    ),
  };
});

export const DeferredToasters = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(id);
  }, []);

  return ready ? (
    <Suspense fallback={null}>
      <Toasters />
    </Suspense>
  ) : null;
};
