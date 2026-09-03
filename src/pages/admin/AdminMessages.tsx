import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Search } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPage } from "@/components/admin/AdminPage";
import { supabase } from "@/integrations/supabase/client";
import { useDeepLinkOpen } from "@/hooks/useDeepLinkOpen";
import { useAuth } from "@/hooks/useAuth";
import { formatRelative } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

interface Thread { id: string; subject: string; client_id: string; last_message_at: string; clients?: { name: string } | null }
interface Msg { id: string; body: string; sender_side: "admin" | "client"; created_at: string; sender_user_id: string | null; read_at: string | null }

export default function AdminMessages() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: threads } = useQuery({
    queryKey: ["admin", "threads"],
    queryFn: async () => {
      const { data } = await supabase.from("message_threads").select("*, clients(name)").order("last_message_at", { ascending: false });
      return (data ?? []) as Thread[];
    },
  });

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads ?? [];
    return (threads ?? []).filter((t) =>
      (t.clients?.name ?? "").toLowerCase().includes(q)
    );
  }, [threads, search]);

  // Deep-link from Slack: /admin/messages?thread=<uuid>
  useDeepLinkOpen<Thread>({
    rows: threads,
    param: "thread",
    onOpen: (t) => setActiveId(t.id),
  });

  const { data: messages } = useQuery({
    queryKey: ["admin", "messages", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data } = await supabase.from("messages").select("*").eq("thread_id", activeId!).order("created_at");
      return (data ?? []) as Msg[];
    },
  });

  // Realtime subscription on the active thread's messages
  useEffect(() => {
    if (!activeId) return;
    const channel = supabase
      .channel(`messages:${activeId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${activeId}` }, () => {
        qc.invalidateQueries({ queryKey: ["admin", "messages", activeId] });
        qc.invalidateQueries({ queryKey: ["admin", "threads"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeId, qc]);

  // Auto-pick first thread
  useEffect(() => {
    if (!activeId && threads?.[0]) setActiveId(threads[0].id);
  }, [threads, activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages?.length, activeId]);

  // Mark client messages as read when admin opens / receives messages in a thread
  useEffect(() => {
    if (!activeId || !messages?.length) return;
    const unreadIds = messages
      .filter((m) => m.sender_side === "client" && !m.read_at)
      .map((m) => m.id);
    if (unreadIds.length === 0) return;
    supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds)
      .then(({ error }) => {
        if (!error) {
          qc.invalidateQueries({ queryKey: ["admin", "nav-counts"] });
        }
      });
  }, [activeId, messages, qc]);

  const send = useMutation({
    mutationFn: async () => {
      if (!activeId || !draft.trim()) return;
      const { error } = await supabase.from("messages").insert({
        thread_id: activeId, sender_user_id: user!.id, sender_side: "admin", body: draft.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["admin", "messages", activeId] });
      qc.invalidateQueries({ queryKey: ["admin", "threads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const active = threads?.find((t) => t.id === activeId);

  return (
    <AdminPage
      eyebrow="Messages"
      title="Inbox"
      description="Conversations with every client, in one place."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <aside className="md:col-span-1 glass rounded-2xl p-2 max-h-[70vh] overflow-y-auto">
          <div className="relative p-1.5 pb-2 sticky top-0 bg-card/80 backdrop-blur-md z-10">
            <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="pl-9 h-9"
            />
          </div>
          {(threads ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No threads yet.</p>
          ) : filteredThreads.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No threads match "{search}".</p>
          ) : (
            <ul className="space-y-1">
              {filteredThreads.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setActiveId(t.id)}
                    className={cn(
                      "w-full text-left rounded-xl px-3 py-2.5 transition-colors",
                      t.id === activeId ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"
                    )}
                  >
                    <p className="text-[13px] font-medium truncate">{t.clients?.name ?? "—"}</p>
                    <p className="font-mono text-[11px] text-muted-foreground truncate">{formatRelative(t.last_message_at)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="md:col-span-2 glass rounded-2xl flex flex-col h-[70vh]">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Pick a thread.</div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-sm font-medium truncate">{active.clients?.name ?? "—"}</p>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {(messages ?? []).map((m) => {
                  const mine = m.sender_side === "admin";
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
                        mine ? "bg-gradient-primary text-primary-foreground rounded-br-sm" : "bg-white/[0.05] border border-white/[0.08] text-white rounded-bl-sm"
                      )}>
                        <p className="text-secondary-foreground">{m.body}</p>
                        <p className={cn("mt-1 text-[11px] font-mono", mine ? "text-secondary-foreground/60" : "text-secondary-foreground/60")}>
                          {formatRelative(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); send.mutate(); }} className="border-t border-white/[0.06] p-3 flex gap-2">
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Reply…" className="flex-1" />
                <Button type="submit" variant="hero" size="sm" disabled={!draft.trim() || send.isPending}>
                  <Send className="w-3.5 h-3.5" />Send
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </AdminPage>
  );
}
