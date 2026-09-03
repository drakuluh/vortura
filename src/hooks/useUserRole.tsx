import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export type AppRole = "admin" | "user" | "support";

const roleCache = new Map<string, AppRole[]>();
const inFlight = new Map<string, Promise<AppRole[]>>();

const getRoles = async (userId: string) => {
  const cached = roleCache.get(userId);
  if (cached) return cached;

  const existing = inFlight.get(userId);
  if (existing) return existing;

  const request = (async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = (data ?? []).map((r) => r.role as AppRole);
    roleCache.set(userId, roles);
    inFlight.delete(userId);
    return roles;
  })();

  inFlight.set(userId, request);
  return request;
};

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>(() => user ? roleCache.get(user.id) ?? [] : []);
  const [loading, setLoading] = useState(() => (user ? !roleCache.has(user.id) : true));

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const cached = roleCache.get(user.id);
    if (cached) {
      setRoles(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const data = await getRoles(user.id);
      if (cancelled) return;
      setRoles(data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return {
    roles,
    isAdmin: roles.includes("admin"),
    isSupport: roles.includes("support"),
    loading: authLoading || loading,
  };
};
