import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useCurrentClient = () => {
  const { user, loading: authLoading } = useAuth();
  const q = useQuery({
    queryKey: ["current-client", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });
  return { ...q, loading: authLoading || q.isLoading };
};
