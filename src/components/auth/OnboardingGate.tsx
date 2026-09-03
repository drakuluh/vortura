import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

/**
 * Wraps dashboard routes. If the signed-in user hasn't completed onboarding
 * (account type + name) yet, redirects them to /onboarding.
 */
export const OnboardingGate = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const location = useLocation();

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not signed in: let the underlying page handle its own auth redirect.
  if (!user) return <>{children}</>;

  // Profile row missing or onboarding not done -> force onboarding.
  if (profile && profile.onboarding_completed === false) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/onboarding?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
};