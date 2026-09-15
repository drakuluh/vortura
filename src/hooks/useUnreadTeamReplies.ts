import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { loadSupabase } from "@/integrations/supabase/load";

// Mirrors ClientConversation's key so reading a thread clears the badge.
export const UNREAD_TEAM_REPLIES_QUERY_KEY = "unread-team-replies";

/**
 * Messages from the team the signed-in user hasn't read yet. Row-level
 * security limits the count to the user's own conversation. Team members see
 * every thread, so the count is meaningless for them: pass `enabled: false`.
 */
export function useUnreadTeamReplies(enabled: boolean): number {
  const { user } = useAuth();
  const { data = 0 } = useQuery({
    queryKey: [UNREAD_TEAM_REPLIES_QUERY_KEY, user?.id],
    enabled: enabled && !!user,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const supabase = await loadSupabase();
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("sender_side", "admin")
        .is("read_at", null);
      return count ?? 0;
    },
  });
  return user ? data : 0;
}
