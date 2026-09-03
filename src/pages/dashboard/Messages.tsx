import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DashboardSubPage } from "@/components/dashboard/DashboardSubPage";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatRelative } from "@/lib/admin/format";

const Messages = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: client, loading: clientLoading } = useCurrentClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: threads } = useQuery({
    queryKey: ["client-threads", client?.id],
    enabled: !!client?.id,
    queryFn: async () => {
      const { data } = await supabase.from("message_threads").select("*").eq("client_id", client!.id).order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  // Ensure exactly one thread exists for this client; auto-create if none.
  useEffect(() => {
    if (!client?.id || !threads) return;
    if (threads.length > 0) {
      if (!activeId) setActiveId(threads[0].id);
      return;
    }
    // No thread yet — create one named after the client.
    (async () => {
      const { data, error } = await supabase
        .from("message_threads")
        .insert({ client_id: client.id, subject: client.name ?? "Conversation" })
        .select("id")
        .single();
      if (!error && data) {
        setActiveId(data.id);
        qc.invalidateQueries({ queryKey: ["client-threads", client.id] });
      }
    })();
  }, [client, threads, activeId, qc]);

  const { data: messages } = useQuery({
    queryKey: ["client-messages", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data } = await supabase.from("messages").select("*").eq("thread_id", activeId!).order("created_at");
      return data ?? [];
    },
  });

  // Mark unread admin messages as read when viewing a thread
  useEffect(() => {
    if (!activeId || !messages) return;
    const unreadIds = messages
      .filter((m: any) => m.sender_side === "admin" && !m.read_at)
      .map((m: any) => m.id);
    if (unreadIds.length === 0) return;
    (async () => {
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", unreadIds);
      qc.invalidateQueries({ queryKey: ["client-unread-strategist-messages", client?.id] });
    })();
  }, [activeId, messages, qc, client?.id]);

  // Realtime
  useEffect(() => {
    if (!activeId) return;
    const ch = supabase.channel(`client-thread-${activeId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${activeId}` },
        () => qc.invalidateQueries({ queryKey: ["client-messages", activeId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeId, qc]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages?.length, activeId]);

  const send = useMutation({
    mutationFn: async () => {
      const text = draft.trim();
      if (!text || !activeId || !user) return;
      const { data, error } = await supabase.from("messages").insert({
        thread_id: activeId, body: text, sender_user_id: user.id, sender_side: "client",
      }).select("id").single();
      if (error) throw error;
      if (data?.id) {
        supabase.functions.invoke("notify-event", {
          body: { kind: "new_message_from_client", entity_id: data.id },
        }).catch(() => {});
      }
    },
    onSuccess: () => { setDraft(""); qc.invalidateQueries({ queryKey: ["client-messages", activeId] }); qc.invalidateQueries({ queryKey: ["client-threads", client?.id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const active = threads?.find((t) => t.id === activeId);

  return (
    <DashboardSubPage
      eyebrow="Messages"
      title={<>Talk to Your <span className="text-gradient">Strategist</span></>}
      description="Direct line to your team. Fast replies during working hours."
      centered
    >
      {clientLoading ? (
        <p className="text-sm text-muted-foreground text-center">Loading…</p>
      ) : !client ? (
        <div className="glass rounded-2xl p-10 text-center max-w-xl mx-auto">
          <p className="text-sm text-muted-foreground">No client account is linked to your login yet. Your strategist will set this up shortly.</p>
        </div>
      ) : (
      <div className="max-w-3xl mx-auto">
        <div>
          <div className="glass rounded-2xl flex flex-col h-[60vh] min-h-[420px]">
            {active ? (
              <>
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-[13px] font-medium truncate">Your strategist</p>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Updated {formatRelative(active.last_message_at)}</p>
                </div>
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {(messages ?? []).map((m) => {
                    const mine = m.sender_side === "client";
                    return (
                      <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
                          mine ? "bg-gradient-primary text-primary-foreground rounded-br-sm" : "bg-white/[0.05] border border-white/[0.08] text-foreground/90 rounded-bl-sm")}>
                          <p className="whitespace-pre-wrap text-secondary-foreground">{m.body}</p>
                          <p className={cn("mt-1 text-[11px] font-mono", mine ? "text-secondary-foreground/60" : "text-secondary-foreground/60")}>{formatRelative(m.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); send.mutate(); }} className="border-t border-white/[0.06] p-3 flex items-center gap-2">
                  <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…" className="text-base md:text-sm bg-white/[0.02] border-white/10 focus-visible:border-primary/40 focus-visible:ring-primary/20 h-10" />
                  <Button type="submit" variant="hero" size="sm" disabled={!draft.trim() || send.isPending}>
                    <Send className="w-3.5 h-3.5" />Send
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Loading conversation…</div>
            )}
          </div>
        </div>
      </div>
      )}
    </DashboardSubPage>
  );
};

export default Messages;
