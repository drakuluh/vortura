import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Send, Check, MessageSquare, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { formatRelative } from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import {
  changeStatusLabel,
  changeStatusTone,
  priorityTone,
  STATUS_ORDER,
} from "@/lib/changeRequests";

const ChangeRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: client } = useCurrentClient();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const headerAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };
  const bodyAnim = isMobile
    ? { initial: false as const, animate: { y: 0 } }
    : {
        initial: { y: 24 },
        whileInView: { y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.6, ease: "easeOut" as const, delay: 0.1 },
      };
  const [draft, setDraft] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: request, isLoading } = useQuery({
    queryKey: ["client-change-request", id],
    enabled: !!id && !!client?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("change_requests")
        .select("id, title, description, status, priority, submitted_at, updated_at, package_id, client_id, client_approved_at, packages:package_id(name, nickname)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["client-change-request-comments", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from("change_request_comments")
        .select("id, body, author_side, author_user_id, created_at")
        .eq("change_request_id", id!)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  // Realtime updates for comments and status
  useEffect(() => {
    if (!id) return;
    const ch = supabase
      .channel(`change-request-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "change_request_comments", filter: `change_request_id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["client-change-request-comments", id] })
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "change_requests", filter: `id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["client-change-request", id] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, qc]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [comments?.length]);

  const post = useMutation({
    mutationFn: async () => {
      const text = draft.trim();
      if (!text) return;
      if (!user || !id) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("change_request_comments")
        .insert({
          change_request_id: id,
          author_user_id: user.id,
          author_side: "client",
          body: text,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (data?.id) {
        supabase.functions
          .invoke("notify-event", {
            body: { kind: "new_change_request_comment", entity_id: data.id },
          })
          .catch(() => {});
      }
    },
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["client-change-request-comments", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approve = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error("Not signed in.");
      const { error } = await supabase
        .from("change_requests")
        .update({ client_approved_at: new Date().toISOString(), client_approved_by: user.id })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Approved. This request has been cleared from your list.");
      qc.invalidateQueries({ queryKey: ["client-change-requests"] });
      navigate("/dashboard/request-change");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const currentStep = request ? STATUS_ORDER.indexOf(request.status as any) : -1;
  const canApprove = !!request && !(request as any).client_approved_at;

  return (
    <PageLayout>
      <section className="relative pt-12 md:pt-14 lg:pt-24 pb-16 md:pb-20 lg:pb-28 overflow-hidden">
        <PageHeroBg />
        <div className="container relative z-10">
          <motion.div
            className="mt-12 md:mt-10 lg:mt-8 mb-6 flex justify-center"
            {...headerAnim}
          >
            <Link
              to="/dashboard/request-change"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              All change requests
            </Link>
          </motion.div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
          ) : !request ? (
            <div className="glass rounded-2xl p-10 text-center max-w-xl mx-auto">
              <p className="text-sm text-muted-foreground">Change request not found.</p>
            </div>
          ) : (
            <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-6xl mx-auto lg:items-stretch" {...bodyAnim}>
              {/* Left: details + timeline */}
              <div className="lg:col-span-1 space-y-4">
                <div className="glass rounded-2xl p-5">
                  <h1 className="text-lg md:text-xl font-semibold tracking-tight mb-3">{request.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <StatusBadge tone={changeStatusTone(request.status)}>{changeStatusLabel(request.status)}</StatusBadge>
                    <StatusBadge tone={priorityTone(request.priority)}>{request.priority}</StatusBadge>
                  </div>
                  {request.description && (
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed mb-4">
                      {request.description}
                    </p>
                  )}
                  <dl className="space-y-1.5 font-mono text-[11px] text-muted-foreground border-t border-white/[0.06] pt-3">
                    <div className="flex justify-between gap-3">
                      <dt>Submitted</dt>
                      <dd className="text-foreground/80">{formatRelative(request.submitted_at)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Updated</dt>
                      <dd className="text-foreground/80">{formatRelative(request.updated_at)}</dd>
                    </div>
                    {(request as any).packages?.name && (
                      <div className="flex justify-between gap-3">
                        <dt>Package</dt>
                        <dd className="text-foreground/80 truncate max-w-[60%]">{(request as any).packages.nickname?.trim() || (request as any).packages.name}</dd>
                      </div>
                    )}
                  </dl>
                  {canApprove && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06]">
                      <Button
                        size="sm"
                        variant="hero"
                        onClick={() => setConfirmOpen(true)}
                        disabled={approve.isPending}
                        className="w-full"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Approve & close request
                      </Button>
                    </div>
                  )}
                  {(request as any).client_approved_at && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06]">
                      <p className="text-[11px] font-mono text-emerald-400 inline-flex items-center gap-1.5">
                        <Check className="w-3 h-3" /> Approved
                      </p>
                    </div>
                  )}
                </div>

                <div className="glass rounded-2xl p-5">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-3">// Progress</p>
                  <ol className="space-y-3">
                      {STATUS_ORDER.map((step, i) => {
                        const reached = i <= currentStep;
                        const isCurrent = i === currentStep;
                        return (
                          <li key={step} className="flex items-start gap-3">
                            <span
                              className={cn(
                                "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border shrink-0",
                                reached
                                  ? "bg-primary/15 border-primary/40 text-primary"
                                  : "bg-white/[0.02] border-white/10 text-muted-foreground"
                              )}
                            >
                              {reached ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </span>
                            <div className="flex-1 -mt-0.5">
                              <p className={cn("text-sm font-medium", reached ? "text-foreground" : "text-muted-foreground")}>
                                {changeStatusLabel(step)}
                              </p>
                              {isCurrent && (
                                <p className="text-[11px] font-mono text-primary/80">Current</p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                </div>
              </div>

              {/* Right: comments */}
              <div className="lg:col-span-2 flex">
                <div className="glass rounded-2xl flex flex-col w-full h-[60vh] min-h-[480px] lg:h-auto">
                  <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">Conversation with your engineer</p>
                  </div>
                  <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {(comments ?? []).length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center">
                        <p className="text-sm text-muted-foreground max-w-xs">
                          No messages yet. Add a note below if you have questions or extra context for your engineer.
                        </p>
                      </div>
                    ) : (
                      (comments ?? []).map((c) => {
                        const mine = c.author_side === "client";
                        return (
                          <div key={c.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                            <div
                              className={cn(
                                "max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
                                mine
                                  ? "bg-gradient-primary text-primary-foreground rounded-br-sm"
                                  : "bg-white/[0.05] border border-white/[0.08] text-foreground/90 rounded-bl-sm"
                              )}
                            >
                              <p className="whitespace-pre-wrap text-secondary-foreground">{c.body}</p>
                              <p
                                className={cn(
                                  "mt-1 text-[11px] font-mono",
                                  mine ? "text-secondary-foreground" : "text-secondary-foreground"
                                )}
                              >
                                {formatRelative(c.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      post.mutate();
                    }}
                    className="border-t border-white/[0.06] p-3 flex items-stretch gap-2"
                  >
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Add a comment for your engineer…"
                      rows={1}
                      className="text-base md:text-sm bg-white/[0.02] border-white/10 focus-visible:border-primary/40 focus-visible:ring-primary/20 resize-none min-h-9 h-9 py-1.5"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          post.mutate();
                        }
                      }}
                    />
                    <Button type="submit" variant="hero" size="sm" className="h-9 shrink-0" disabled={!draft.trim() || post.isPending}>
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </Button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve and close this change request?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm you're happy with the changes made for{" "}
              <span className="text-foreground font-medium">"{request?.title}"</span>. Approving will
              close the request and remove it from your dashboard. This can't be undone from your side.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approve.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={approve.isPending}
              onClick={(e) => {
                e.preventDefault();
                approve.mutate();
              }}
              className={cn(buttonVariants({ variant: "hero", size: "sm" }))}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Yes, approve & close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default ChangeRequestDetail;