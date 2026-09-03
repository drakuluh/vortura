import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const location = useLocation();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full glass rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldOff className="w-5 h-5 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Not authorized</h1>
          <p className="text-sm text-muted-foreground mb-5">
            Your account ({user.email}) doesn't have admin access. If this is wrong, contact the workspace owner.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="glass" size="sm" asChild>
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/">Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
