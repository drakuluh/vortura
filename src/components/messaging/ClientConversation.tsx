import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { supabase } from "@/integrations/supabase/client";
import { formatRelative } from "@/lib/admin/format";
import { UNREAD_TEAM_REPLIES_QUERY_KEY } from "@/hooks/useUnreadTeamReplies";
import { cn } from "@/lib/utils";

const REPLY_PROMISE = "We usually reply within 24 hours.";
const MAX_LENGTH = 4000;

type Props = {
  /** Height of the whole chat box. */
  className?: string;
};

/**
 * The signed-in user's one conversation with the Vortura team. Shared by the
 * contact page and Dashboard → Messages so both show the same thread.
 *
 * Anyone signed in can write. Their client record and thread are created on
 * the first message (not on page view), so browsing never leaves empty rows.
 */
export const ClientConversation = ({ className }: Props) => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: client, loading: clientLoading } = useCurrentClient();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ["client-thread", client?.id],
    enabled: !!client?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("message_threads")
        .select("id, last_message_at")
        .eq("client_id", client!.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["client-messages", thread?.id],
    enabled: !!thread?.id,
    queryFn: async () => {
      const { data } = await supabase.from("messages").select("*").eq("thread_id", thread!.id).order("created_at");
      return data ?? [];
    },
  });

  // Mark the team's messages read once they're on screen.
  useEffect(() => {
    if (!thread?.id || !messages) return;
    const unreadIds = messages.filter((m) => m.sender_side === "admin" && !m.read_at).map((m) => m.id);
    if (unreadIds.length === 0) return;
    void supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds)
      .then(() => {
        qc.invalidateQueries({ queryKey: [UNREAD_TEAM_REPLIES_QUERY_KEY] });
        qc.invalidateQueries({ queryKey: ["client-unread-strategist-messages"] });
      });
  }, [thread?.id, messages, qc]);

  // Live updates while the conversation is open.
  useEffect(() => {
    if (!thread?.id) return;
    const channel = supabase
      .channel(`client-thread-${thread.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${thread.id}` },
        () => qc.invalidateQueries({ queryKey: ["client-messages", thread.id] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [thread?.id, qc]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages?.length]);

  const send = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("Sign in to send a message.");

      // 1. Client record (created for first-time writers).
      let clientId = client?.id;
      let createdClient = false;
      if (!clientId) {
        const { data, error } = await supabase.rpc("ensure_my_client");
        if (error) throw error;
        const result = data as { client_id: string; created: boolean };
        clientId = result.client_id;
        createdClient = result.created;
      }

      // 2. Thread (one per client).
      let threadId = thread?.id;
      if (!threadId) {
        const { data: existing } = await supabase
          .from("message_threads")
          .select("id")
          .eq("client_id", clientId)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        threadId = existing?.id;
      }
      if (!threadId) {
        const { data, error } = await supabase
          .from("message_threads")
          .insert({ client_id: clientId, subject: "Conversation with Vortura" })
          .select("id")
          .single();
        if (error) throw error;
        threadId = data.id;
      }

      // 3. The message itself.
      const { data: message, error } = await supabase
        .from("messages")
        .insert({ thread_id: threadId, body: text, sender_user_id: user.id, sender_side: "client" })
        .select("id")
        .single();
      if (error) throw error;

      // Team alerts are best-effort and must not fail the send.
      if (createdClient) {
        supabase.functions.invoke("notify-event", { body: { kind: "new_client", entity_id: clientId } }).catch(() => {});
      }
      supabase.functions
        .invoke("notify-event", { body: { kind: "new_message_from_client", entity_id: message.id } })
        .catch(() => {});

      return { clientId, threadId };
    },
    onSuccess: ({ clientId, threadId }) => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["current-client"] });
      qc.invalidateQueries({ queryKey: ["client-thread", clientId] });
      qc.invalidateQueries({ queryKey: ["client-messages", threadId] });
    },
    onError: (e: Error) => toast.error(e.message || "Your message didn't send. Please try again."),
  });

  const submit = () => {
    const text = draft.trim();
    if (!text || send.isPending) return;
    send.mutate(text.slice(0, MAX_LENGTH));
  };

  const loading = clientLoading || (!!client && threadLoading) || (!!thread && messagesLoading);
  const list = messages ?? [];

  return (
    <div className={cn("glass rounded-2xl flex flex-col h-[60vh] min-h-[420px]", className)}>
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <p className="text-[13px] font-medium truncate">The Vortura team</p>
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground truncate">
          {thread?.last_message_at && list.length > 0 ? `Updated ${formatRelative(thread.last_message_at)}` : REPLY_PROMISE}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" aria-live="polite">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground gap-2">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Loading conversation…
          </div>
        ) : list.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-depth mb-1">Message the team directly</p>
            <p className="text-[13px] text-muted-foreground max-w-xs">
              Ask about your project, pricing, or next steps. {REPLY_PROMISE}
            </p>
          </div>
        ) : (
          list.map((m) => {
            const mine = m.sender_side === "client";
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
                    mine
                      ? "bg-gradient-primary text-primary-foreground rounded-br-sm"
                      : "bg-white/[0.05] border border-white/[0.08] text-foreground/90 rounded-bl-sm",
                  )}
                >
                  {!mine && <p className="text-[10px] font-mono uppercase tracking-widest text-primary mb-0.5">Vortura</p>}
                  <p className="whitespace-pre-wrap break-words text-secondary-foreground">{m.body}</p>
                  <p className="mt-1 text-[11px] font-mono text-secondary-foreground/60">{formatRelative(m.created_at)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="border-t border-white/[0.06] p-3 flex items-end gap-2"
      >
        <label htmlFor="conversation-draft" className="sr-only">
          Message the Vortura team
        </label>
        <Textarea
          id="conversation-draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends; Shift+Enter adds a line.
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          maxLength={MAX_LENGTH}
          placeholder="Type a message…"
          className="min-h-10 max-h-32 resize-none text-base md:text-sm bg-white/[0.02] border-white/10 focus-visible:border-primary/40 focus-visible:ring-primary/20"
        />
        <Button type="submit" variant="hero" size="sm" className="h-10 shrink-0" disabled={!draft.trim() || send.isPending}>
          {send.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Send className="w-3.5 h-3.5" aria-hidden="true" />}
          Send
        </Button>
      </form>
    </div>
  );
};
