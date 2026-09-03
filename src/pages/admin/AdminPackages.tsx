import { useState, useMemo } from "react";
import { Plus, Trash2, Search, Pencil } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { formatDate } from "@/lib/admin/format";
import { logActivity } from "@/lib/admin/activity";

type PkgStatus = "active" | "in_progress" | "review" | "paused";

interface PackageRow {
  id: string;
  client_id: string;
  name: string;
  status: PkgStatus;
  progress: number;
  engineer: string | null;
  due_date: string | null;
  accent: string;
  is_custom?: boolean | null;
  custom_id?: string | null;
  clients?: { name: string } | null;
}

const statusTone = (s: PkgStatus) =>
  s === "active" ? "success" : s === "in_progress" ? "primary" : s === "review" ? "secondary" : "warn";

const PackageDialog = ({ row, onClose }: { row?: PackageRow; onClose: () => void }) => {
  const qc = useQueryClient();
  const { data: clients } = useQuery({
    queryKey: ["clients-options"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("id, name").order("name");
      return data ?? [];
    },
  });
  const [clientId, setClientId] = useState(row?.client_id ?? "");
  const [name, setName] = useState(row?.name ?? "");
  const [status, setStatus] = useState<PkgStatus>(row?.status ?? "in_progress");
  const [progress, setProgress] = useState(row?.progress ?? 0);
  const [isCustom, setIsCustom] = useState<boolean>(row?.is_custom ?? true);

  const save = useMutation({
    mutationFn: async () => {
      if (!clientId) throw new Error("Pick a client");
      if (!name.trim()) throw new Error("Name required");
      const payload = {
        client_id: clientId,
        name: name.trim(),
        status,
        progress,
        is_custom: isCustom,
      };
      if (row) {
        const { error } = await supabase.from("packages").update(payload).eq("id", row.id);
        if (error) throw error;
        await logActivity({ entity_type: "package", entity_id: row.id, action: "update", summary: `Updated ${name}` });
      } else {
        const { data, error } = await supabase.from("packages").insert(payload).select("id").single();
        if (error) throw error;
        await logActivity({ entity_type: "package", entity_id: data.id, action: "create", summary: `Created ${name}` });
      }
    },
    onSuccess: () => {
      toast.success(row ? "Package updated." : "Package created.");
      qc.invalidateQueries({ queryKey: ["admin", "packages"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent hideClose className="sm:max-w-lg border-2 border-white/15 bg-card text-foreground">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {row ? "Edit Package" : "New Package"}
          {row?.custom_id && (
            <span className="font-mono text-[11px] tracking-wider rounded-md border border-primary/40 bg-primary/10 text-primary px-1.5 py-0.5">
              {row.custom_id}
            </span>
          )}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label>Client</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pick a client" /></SelectTrigger>
            <SelectContent>{(clients ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as PkgStatus)}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[
                { v: "active", l: "Active" },
                { v: "in_progress", l: "In Progress" },
                { v: "review", l: "Review" },
                { v: "paused", l: "Paused" },
              ].map((p) => <SelectItem key={p.v} value={p.v}>{p.l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Progress: {progress}%</Label>
          <Slider value={[progress]} onValueChange={([v]) => setProgress(v)} min={0} max={100} step={1} className="mt-3" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose} className="hover:bg-white/10 hover:text-white">Cancel</Button>
        <Button variant="hero" onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : row ? "Save" : "Create"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default function AdminPackages() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PackageRow | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<PackageRow | null>(null);

  const { data: packages, isLoading } = useQuery({
    queryKey: ["admin", "packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*, clients(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PackageRow[];
    },
  });

  const { data: deletedPackages = [] } = useQuery({
    queryKey: ["admin", "packages", "deleted"],
    enabled: statusFilter === "deleted",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("entity_id, summary, metadata, created_at")
        .eq("entity_type", "package")
        .eq("action", "delete")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = packages ?? [];
    if (statusFilter !== "all" && statusFilter !== "deleted") {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (q) {
      list = list.filter((p) =>
        `${p.name} ${p.clients?.name ?? ""}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [packages, search, statusFilter]);

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const pkg = (packages ?? []).find((p) => p.id === id);
      const clientName = pkg?.clients?.name ?? null;
      const pkgName = pkg?.name ?? "package";
      const { error } = await supabase.from("packages").delete().eq("id", id);
      if (error) throw error;
      await logActivity({
        entity_type: "package",
        entity_id: id,
        action: "delete",
        summary: `Deleted ${pkgName}`,
        metadata: {
          client_id: pkg?.client_id ?? null,
          client_name: clientName,
          package_name: pkgName,
          tier: (pkg as any)?.tier ?? null,
        },
      });
    },
    onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["admin", "packages"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminPage
      eyebrow="Packages"
      title="Active Builds"
      description="Every automation package across all clients."
      actions={
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild><Button variant="hero" size="sm"><Plus className="w-3.5 h-3.5" />New Package</Button></DialogTrigger>
          {creating && <PackageDialog onClose={() => setCreating(false)} />}
        </Dialog>
      }
    >
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by package or client…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {statusFilter === "deleted" ? (
        deletedPackages.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">No deleted packages.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {deletedPackages
              .filter((d: any) => {
                const q = search.trim().toLowerCase();
                if (!q) return true;
                const meta = (d.metadata ?? {}) as Record<string, any>;
                return `${d.summary ?? ""} ${meta.client_name ?? ""} ${meta.package_name ?? ""}`
                  .toLowerCase()
                  .includes(q);
              })
              .map((d: any) => {
                const meta = (d.metadata ?? {}) as Record<string, any>;
                const pkgName = meta.package_name || (d.summary ?? "").replace(/^Deleted\s+/, "") || "Untitled package";
                const clientName = meta.client_name || "Unknown client";
                return (
                  <div key={d.entity_id + d.created_at} className="glass rounded-2xl p-5 flex flex-col opacity-70">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1 truncate">
                          Deleted {formatDate(d.created_at)}
                        </p>
                        <h3 className="text-base font-semibold leading-tight truncate">{pkgName}</h3>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{clientName}</p>
                      </div>
                      <StatusBadge tone="danger">deleted</StatusBadge>
                    </div>
                  </div>
                );
              })}
          </div>
        )
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (packages ?? []).length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-sm text-muted-foreground">No packages yet. Click "New Package" to create one.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-sm text-muted-foreground">No packages match "{search}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/admin/packages/${p.id}`)}
              className="glass rounded-2xl p-5 flex flex-col text-left hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1 truncate">{p.clients?.name ?? "—"}</p>
                  <h3 className="text-base font-semibold leading-tight">{p.name}</h3>
                  {p.is_custom && p.custom_id && (
                    <span className="inline-block mt-1.5 font-mono text-[11px] tracking-wider rounded-md border border-primary/40 bg-primary/10 text-primary px-1.5 py-0.5">
                      {p.custom_id}
                    </span>
                  )}
                </div>
                <StatusBadge tone={statusTone(p.status)}>{p.status.replace("_", " ")}</StatusBadge>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  <span>Progress</span><span>{p.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${p.accent === "primary" ? "bg-gradient-to-r from-primary to-primary-glow" : "bg-gradient-to-r from-secondary to-secondary-glow"}`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
              <div className="mt-auto flex items-center justify-end gap-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <Pencil
                  className="w-3.5 h-3.5 text-muted-foreground hover:text-primary cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setEditing(p); }}
                />
                <Trash2
                  className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setDeleting(p); }}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && <PackageDialog row={editing} onClose={() => setEditing(null)} />}
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="border-2 border-white/15 bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this package?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting ? `"${deleting.name}" for ${deleting.clients?.name ?? "this client"} will be permanently removed. This cannot be undone.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleting) remove.mutate(deleting.id);
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  );
}
