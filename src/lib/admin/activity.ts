import { supabase } from "@/integrations/supabase/client";

export const logActivity = async (params: {
  entity_type: string;
  entity_id?: string;
  action: string;
  summary?: string;
  metadata?: Record<string, unknown>;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("activity_log").insert({
    actor_user_id: user.id,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    action: params.action,
    summary: params.summary,
    metadata: (params.metadata ?? {}) as never,
  });
};
