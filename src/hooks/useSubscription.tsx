import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getStripeEnvironment } from "@/lib/stripe";

export const useSubscription = () => {
  const { user, loading: authLoading } = useAuth();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("environment", getStripeEnvironment())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`sub-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["subscription", user.id] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, qc]);

  const sub = q.data;
  const isActive =
    !!sub &&
    ((["active", "trialing", "past_due"].includes(sub.status) &&
      (!sub.current_period_end || new Date(sub.current_period_end) > new Date())) ||
      (sub.status === "canceled" && sub.current_period_end && new Date(sub.current_period_end) > new Date()));

  return {
    subscription: sub,
    isActive,
    tier: sub?.tier ?? null,
    loading: authLoading || q.isLoading,
  };
};