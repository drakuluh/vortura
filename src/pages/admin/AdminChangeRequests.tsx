import { useState, useEffect, useRef, useMemo } from "react";
import { Trash2, Send, Plus, Search, ThumbsUp, CheckCircle2, MessageSquare, FileText, User as UserIcon, Package as PackageIcon, Calendar } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { AdminPage } from "@/components/admin/AdminPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatRelative } from "@/lib/admin/format";
import { logActivity } from "@/lib/admin/activity";
import { useDeepLinkOpen } from "@/hooks/useDeepLinkOpen";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

type CRStatus = "new" | "in_review" | "shipped";
type Priority = "low" | "med" | "high";

interface CR {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: CRStatus;
  submitted_at: string;
  client_approved_at: string | null;
  clients?: { name: string } | null;
  packages?: { name: string } | null;
}

const statusTone = (s: CRStatus) =>
  s === "new" ? "secondary" : s === "in_review" ? "primary" : "success";
const priorityTone = (p: Priority) => (p === "high" ? "danger" : p === "med" ? "warn" : "muted");

const NewRequestDialog = ({ onClose }: { onClose: () => void }) => {
  const qc = useQueryClient();
  const [clientId, setClientId] = useState<string>("");
  const [packageId, setPackageId] = useState<string>("none");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("med");
  const [status, setStatus] = useState<CRStatus>("new");

  const { data: clients } = useQuery({
    queryKey: ["admin", "clients", "for-cr"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: packages } = useQuery({
    queryKey: ["admin", "packages", "for-cr", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("id, name")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!clientId) throw new Error("Client is required");
      if (!title.trim()) throw new Error("Title is required");
      const payload = {
        client_id: clientId,
        package_id: packageId === "none" ? null : packageId,
        title: title.trim().slice(0, 200),
        description: description.trim().slice(0, 2000) || null,
        priority,
        status,
      };
      const { data, error } = await supabase.from("change_requests").insert(payload).select("id").single();
      if (error) throw error;
      await logActivity({
        entity_type: "change_request",
        entity_id: data.id,
        action: "create",
        summary: `Admin created change request: ${payload.title}`,
      });
    },
    onSuccess: () => {
      toast.success("Change request created.");
      qc.invalidateQueries({ queryKey: ["admin", "change_requests"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent hideClose className="sm:max-w-lg border-2 border-white/15 bg-card text-foreground">
      <DialogHeader>
        <DialogTitle>New Change Request</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label>Client</Label>
          <Select value={clientId} onValueChange={(v) => { setClientId(v); setPackageId("none"); }}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a client" /></SelectTrigger>
            <SelectContent>
              {(clients ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Package (optional)</Label>
          <Select value={packageId} onValueChange={setPackageId} disabled={!clientId}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {(packages ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} className="mt-1.5" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={4} className="mt-1.5" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="med">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as CRStatus)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose} className="hover:bg-white/10 hover:text-white">Cancel</Button>
        <Button variant="hero" onClick={() => create.mutate()} disabled={create.isPending}>
          {create.isPending ? "Creating…" : "Create"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default function AdminChangeRequests() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState<CR | null>(null);
  const [draft, setDraft] = useState("");
  const [toDelete, setToDelete] = useState<CR | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CRStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [approveConsent, setApproveConsent] = useState<CR | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: list, isLoading } = useQuery({
    queryKey: ["admin", "change_requests"],
    queryFn: async () => {
      const { data } = await supabase
        .from("change_requests")
        .select("*, clients(name), packages(name)")
        .order("submitted_at", { ascending: false });
      return (data ?? []) as CR[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (list ?? []).filter((cr) => {
      if (statusFilter !== "all" && cr.status !== statusFilter) return false;
      if (priorityFilter !== "all" && cr.priority !== priorityFilter) return false;
      if (!q) return true;
      return `${cr.title} ${cr.clients?.name ?? ""} ${cr.packages?.name ?? ""} ${cr.description ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [list, search, statusFilter, priorityFilter]);

  useDeepLinkOpen<CR>({ rows: list, onOpen: setOpen });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CRStatus }) => {
      const { error } = await supabase.from("change_requests").update({ status }).eq("id", id);
      if (error) throw error;
      await logActivity({ entity_type: "change_request", entity_id: id, action: "status", summary: `Status → ${status}` });
    },
    onSuccess: () => { toast.success("Updated."); qc.invalidateQueries({ queryKey: ["admin", "change_requests"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("change_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["admin", "change_requests"] }); },
  });

  const approveOnBehalf = useMutation({
    mutationFn: async (cr: CR) => {
      if (!user) throw new Error("Not signed in.");
      const { error } = await supabase
        .from("change_requests")
        .update({ client_approved_at: new Date().toISOString(), client_approved_by: user.id })
        .eq("id", cr.id);
      if (error) throw error;
      await logActivity({
        entity_type: "change_request",
        entity_id: cr.id,
        action: "client_approved_by_admin",
        summary: `Admin marked "${cr.title}" approved on client's behalf (consent confirmed).`,
      });
    },
    onSuccess: () => {
      toast.success("Marked approved. Cleared from client's dashboard.");
      qc.invalidateQueries({ queryKey: ["admin", "change_requests"] });
      setApproveConsent(null);
      setConsentChecked(false);
      setOpen(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { data: comments } = useQuery({
    queryKey: ["admin", "change_request_comments", open?.id],
    enabled: !!open?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("change_request_comments")
        .select("id, body, author_side, created_at")
        .eq("change_request_id", open!.id)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!open?.id) return;
    const ch = supabase
      .channel(`admin-cr-${open.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "change_request_comments", filter: `change_request_id=eq.${open.id}` },
        () => qc.invalidateQueries({ queryKey: ["admin", "change_request_comments", open.id] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [open?.id, qc]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [comments?.length, open?.id]);

  const postComment = useMutation({
    mutationFn: async () => {
      const text = draft.trim();
      if (!text || !open?.id || !user) return;
      const { error } = await supabase.from("change_request_comments").insert({
        change_request_id: open.id,
        author_user_id: user.id,
        author_side: "admin",
        body: text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["admin", "change_request_comments", open?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminPage
      eyebrow="Change requests"
      title="Inbound Requests"
      description="Tweaks, additions, and edits clients have asked for."
      actions={
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><Plus className="w-3.5 h-3.5" />New Request</Button>
          </DialogTrigger>
          {creating && <NewRequestDialog onClose={() => setCreating(false)} />}
        </Dialog>
      }
    >
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by request, client, or package…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CRStatus | "all")}>
          <SelectTrigger className="md:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | "all")}>
          <SelectTrigger className="md:w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="med">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="text-left font-normal px-4 py-3">Request</th>
                <th className="text-left font-normal px-4 py-3">Client</th>
                <th className="text-left font-normal px-4 py-3">Priority</th>
                <th className="text-left font-normal px-4 py-3">Status</th>
                <th className="text-left font-normal px-4 py-3">Submitted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              ) : (list ?? []).length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No change requests yet.</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No requests match "{search}".</td></tr>
              ) : filtered.map((cr) => (
                <tr key={cr.id} className="border-t border-white/[0.04] odd:bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer" onClick={() => setOpen(cr)}>
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{cr.title}</span>
                      {cr.client_approved_at && (
                        <span title="Client approved — hidden from their dashboard" className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{cr.clients?.name ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge tone={priorityTone(cr.priority)}>{cr.priority}</StatusBadge></td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Select value={cr.status} onValueChange={(v) => updateStatus.mutate({ id: cr.id, status: v as CRStatus })}>
                      <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[
                          { v: "new", l: "New" },
                          { v: "in_review", l: "In Review" },
                          { v: "shipped", l: "Shipped" },
                        ].map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(cr.submitted_at)}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-blue-500/10 group"
                        title={cr.client_approved_at ? "Already approved" : "Manually approve on client's behalf"}
                        disabled={!!cr.client_approved_at}
                        onClick={() => { setApproveConsent(cr); setConsentChecked(false); }}
                      >
                        <ThumbsUp
                          className={cn(
                            "w-3.5 h-3.5",
                            cr.client_approved_at ? "text-emerald-400" : "text-muted-foreground group-hover:text-blue-400"
                          )}
                        />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-red-500/10 group" onClick={() => setToDelete(cr)}>
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(o) => { if (!o) { setOpen(null); setDraft(""); } }}>
        <DialogContent
          className="p-0 gap-0 border-2 border-white/15 bg-card text-foreground shadow-2xl overflow-hidden sm:max-w-[920px] sm:rounded-2xl max-h-[88vh]"
        >
          {open && (
            <div className="flex flex-col md:grid md:grid-cols-[1.05fr_1fr] h-[88vh] md:h-[80vh]">
              {/* LEFT: meta panel */}
              <div className="flex flex-col border-b md:border-b-0 md:border-r border-white/[0.08] overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-6 pb-5 border-b border-white/[0.08]">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                      Change request
                    </p>
                    <DialogTitle className="text-xl md:text-2xl font-semibold leading-tight tracking-tight pr-8">
                      {open.title}
                    </DialogTitle>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <StatusBadge tone={statusTone(open.status)}>{open.status.replace("_", " ")}</StatusBadge>
                      <StatusBadge tone={priorityTone(open.priority)}>{open.priority}</StatusBadge>
                      {open.client_approved_at && (
                        <StatusBadge tone="success">
                          <CheckCircle2 className="w-3 h-3" />
                          Client approved
                        </StatusBadge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
                        <UserIcon className="w-3 h-3" />
                        Client
                      </div>
                      <p className="text-sm font-medium truncate">{open.clients?.name ?? "—"}</p>
                    </div>
                    <div className="glass rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
                        <PackageIcon className="w-3 h-3" />
                        Package
                      </div>
                      <p className="text-sm font-medium truncate">{open.packages?.name ?? "—"}</p>
                    </div>
                    <div className="glass rounded-xl px-3 py-2.5 col-span-2">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
                        <Calendar className="w-3 h-3" />
                        Submitted
                      </div>
                      <p className="text-sm font-medium">{formatDate(open.submitted_at)}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                      <FileText className="w-3 h-3" />
                      Description
                    </div>
                    <div className="glass rounded-xl px-4 py-3">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                        {open.description ?? "No description provided."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="px-6 py-3 flex items-center gap-2">
                  {!open.client_approved_at ? (
                    <Button
                      variant="outline"
                      className="flex-1 h-10"
                      onClick={() => { setApproveConsent(open); setConsentChecked(false); }}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Approve on client's behalf
                    </Button>
                  ) : (
                    <div className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-mono uppercase tracking-widest">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approved
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: conversation panel */}
              <div className="flex flex-col bg-background/40 overflow-hidden">
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {(comments ?? []).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-10">
                      <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">No messages yet. Send the first reply.</p>
                    </div>
                  ) : (
                    (comments ?? []).map((c) => {
                      const mine = c.author_side === "admin";
                      return (
                        <div key={c.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-sm",
                              mine
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted text-foreground border border-white/[0.08] rounded-bl-sm"
                            )}
                          >
                            <p className={cn("whitespace-pre-wrap", mine ? "text-primary-foreground" : "text-foreground")}>{c.body}</p>
                            <p className={cn("mt-1 text-[11px] font-mono", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                              {formatRelative(c.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <form
                  onSubmit={(e) => { e.preventDefault(); postComment.mutate(); }}
                  className="px-4 py-3 border-t border-white/[0.08] flex items-stretch gap-2"
                >
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (draft.trim()) postComment.mutate();
                      }
                    }}
                    placeholder="Reply to the client…"
                    className="text-sm flex-1"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="hero"
                    disabled={!draft.trim() || postComment.isPending}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => { if (!o) setToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete change request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="text-foreground font-medium">"{toDelete?.title}"</span>
              {toDelete?.clients?.name ? <> from <span className="text-foreground font-medium">{toDelete.clients.name}</span></> : null}
              , along with its comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) remove.mutate(toDelete.id);
                setToDelete(null);
              }}
              className="bg-red-500/90 hover:bg-red-500 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!approveConsent} onOpenChange={(o) => { if (!o) { setApproveConsent(null); setConsentChecked(false); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark approved on client's behalf?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear{" "}
              <span className="text-foreground font-medium">"{approveConsent?.title}"</span>
              {approveConsent?.clients?.name ? <> from <span className="text-foreground font-medium">{approveConsent.clients.name}</span>'s</> : <> from the client's</>}
              {" "}dashboard. The request stays in the control room.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="flex items-start gap-2 px-1 py-2 cursor-pointer">
            <Checkbox
              checked={consentChecked}
              onCheckedChange={(v) => setConsentChecked(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-foreground/90">
              I confirm the client has given explicit consent to approve this change request on their behalf.
            </span>
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!consentChecked || approveOnBehalf.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (approveConsent && consentChecked) approveOnBehalf.mutate(approveConsent);
              }}
              className="bg-emerald-500/90 hover:bg-emerald-500 text-white"
            >
              Mark approved
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  );
}
