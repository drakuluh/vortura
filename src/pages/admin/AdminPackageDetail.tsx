import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Paperclip, Send, Pencil, Trash2, X, Check, FileText, Download } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  usePackage,
  usePackageUpdates,
  type PackageUpdate,
  type PackageUpdateAttachment,
} from "@/hooks/usePackageUpdates";
import { formatRelative } from "@/lib/admin/format";
import { logActivity } from "@/lib/admin/activity";

const statusTone = (s: string) =>
  s === "active" ? "success" : s === "in_progress" ? "primary" : s === "review" ? "secondary" : "warn";

const AttachmentItem = ({ att }: { att: PackageUpdateAttachment }) => {
  const [url, setUrl] = useState<string | null>(null);
  const isImage = att.mime_type?.startsWith("image/");
  useEffect(() => {
    let cancelled = false;
    supabase.storage
      .from("package-updates")
      .createSignedUrl(att.file_path, 60 * 60)
      .then(({ data }) => {
        if (!cancelled) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [att.file_path]);
  if (!url) return <div className="h-20 rounded-md bg-white/[0.04] animate-pulse" />;
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
        <img
          src={url}
          alt={att.file_name}
          className="rounded-md border border-white/10 max-h-48 object-cover w-full group-hover:border-primary/40 transition-colors"
        />
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mt-1 truncate">
          {att.file_name}
        </p>
      </a>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 bg-white/[0.03] hover:border-primary/40 transition-colors text-sm"
    >
      <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <span className="truncate flex-1">{att.file_name}</span>
      <Download className="w-3.5 h-3.5 text-muted-foreground" />
    </a>
  );
};

const Composer = ({ packageId }: { packageId: string }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const reset = () => {
    setTitle("");
    setBody("");
    setFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const post = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      if (!title.trim()) throw new Error("Title required");
      const { data: insertRes, error } = await supabase
        .from("package_updates")
        .insert({
          package_id: packageId,
          author_user_id: user.id,
          title: title.trim(),
          body: body.trim(),
          status_change: null,
          progress_change: null,
        })
        .select("id")
        .single();
      if (error) throw error;
      const updateId = insertRes.id as string;

      // Upload attachments
      for (const file of files) {
        const safeName = file.name.replace(/[^\w.-]+/g, "_");
        const path = `${packageId}/${updateId}/${crypto.randomUUID()}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("package-updates")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        await supabase.from("package_update_attachments").insert({
          update_id: updateId,
          file_path: path,
          file_name: file.name,
          mime_type: file.type || null,
          size_bytes: file.size,
        });
      }

      await logActivity({
        entity_type: "package_update",
        entity_id: updateId,
        action: "create",
        summary: `Posted update: ${title.trim()}`,
        metadata: { package_id: packageId },
      });

      // Notify (best-effort)
      try {
        await supabase.functions.invoke("notify-package-update", {
          body: { kind: "new_package_update", entity_id: updateId },
        });
      } catch (e) {
        console.error("notify-package-update failed:", e);
      }
    },
    onSuccess: () => {
      toast.success("Update posted.");
      qc.invalidateQueries({ queryKey: ["package-updates", packageId] });
      qc.invalidateQueries({ queryKey: ["package", packageId] });
      qc.invalidateQueries({ queryKey: ["admin", "packages"] });
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="glass rounded-2xl p-5 mb-6 space-y-3">
      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's the update?"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label>Details</Label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share progress, blockers, screenshots…"
          rows={4}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label>Attachments</Label>
        <input
          ref={fileRef}
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="mt-1.5 block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
        {files.length > 0 && (
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mt-2">
            {files.length} file{files.length === 1 ? "" : "s"} selected
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={reset} disabled={post.isPending} className="hover:bg-white/10 hover:text-white">
          Clear
        </Button>
        <Button variant="hero" onClick={() => post.mutate()} disabled={post.isPending}>
          <Send className="w-3.5 h-3.5" />
          {post.isPending ? "Posting…" : "Post update"}
        </Button>
      </div>
    </div>
  );
};

const UpdateCard = ({ update, packageId }: { update: PackageUpdate; packageId: string }) => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(update.title);
  const [body, setBody] = useState(update.body);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Title required");
      const { error } = await supabase
        .from("package_updates")
        .update({ title: title.trim(), body: body.trim() })
        .eq("id", update.id);
      if (error) throw error;
      await logActivity({
        entity_type: "package_update",
        entity_id: update.id,
        action: "update",
        summary: `Edited update: ${title.trim()}`,
      });
    },
    onSuccess: () => {
      toast.success("Update saved.");
      qc.invalidateQueries({ queryKey: ["package-updates", packageId] });
      setEditing(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      // Best-effort: remove storage objects first
      if (update.attachments.length > 0) {
        await supabase.storage.from("package-updates").remove(update.attachments.map((a) => a.file_path));
      }
      const { error } = await supabase.from("package_updates").delete().eq("id", update.id);
      if (error) throw error;
      await logActivity({
        entity_type: "package_update",
        entity_id: update.id,
        action: "delete",
        summary: `Deleted update: ${update.title}`,
      });
    },
    onSuccess: () => {
      toast.success("Update deleted.");
      qc.invalidateQueries({ queryKey: ["package-updates", packageId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <li className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        {editing ? (
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1" />
        ) : (
          <h4 className="text-base font-semibold leading-tight flex-1">{update.title}</h4>
        )}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {formatRelative(update.created_at)}
            {update.edited_at && <span className="ml-1.5 italic">(edited)</span>}
          </span>
          {!editing && (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Edit update"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-muted-foreground hover:text-red-400"
                aria-label="Delete update"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
      {editing ? (
        <>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="mb-3" />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setEditing(false); setTitle(update.title); setBody(update.body); }}
              className="hover:bg-white/10 hover:text-white"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </Button>
            <Button variant="hero" size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
              <Check className="w-3.5 h-3.5" /> Save
            </Button>
          </div>
        </>
      ) : (
        <>
          {update.body && (
            <p className="text-sm text-foreground/85 whitespace-pre-wrap mb-3">{update.body}</p>
          )}
          {(update.status_change || update.progress_change != null) && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {update.status_change && (
                <span className="font-mono text-[11px] uppercase tracking-widest rounded-md bg-primary/10 text-primary border border-primary/30 px-2 py-1">
                  Status → {update.status_change.replace("_", " ")}
                </span>
              )}
              {update.progress_change != null && (
                <span className="font-mono text-[11px] uppercase tracking-widest rounded-md bg-secondary/10 text-secondary border border-secondary/30 px-2 py-1">
                  Progress → {update.progress_change}%
                </span>
              )}
            </div>
          )}
          {update.attachments.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                <Paperclip className="w-3 h-3" />
                {update.attachments.length} attachment{update.attachments.length === 1 ? "" : "s"}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {update.attachments.map((a) => (
                  <AttachmentItem key={a.id} att={a} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="border-2 border-white/15 bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this update?</AlertDialogTitle>
            <AlertDialogDescription>
              "{update.title}" and any attachments will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => remove.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
};

export default function AdminPackageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: pkg, isLoading } = usePackage(id);
  const { data: updates = [], isLoading: updatesLoading } = usePackageUpdates(id);

  if (isLoading) {
    return (
      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-5xl mx-auto">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-5xl mx-auto">
        <p className="text-sm text-muted-foreground">Package not found.</p>
      </div>
    );
  }

  const displayName = (pkg as any).nickname?.trim() || pkg.name;
  const clientName = (pkg as any).clients?.name ?? "—";

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/admin/packages"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to packages
        </Link>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-2">// {clientName}</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{displayName}</h1>
            {(pkg as any).is_custom && (pkg as any).custom_id && (
              <span className="inline-block mt-2 font-mono text-[11px] tracking-wider rounded-md border border-primary/40 bg-primary/10 text-primary px-1.5 py-0.5">
                {(pkg as any).custom_id}
              </span>
            )}
          </div>
          <StatusBadge tone={statusTone(pkg.status)}>{pkg.status.replace("_", " ")}</StatusBadge>
        </div>

        {/* Package summary */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span>{pkg.progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
              style={{ width: `${pkg.progress}%` }}
            />
          </div>
        </div>

        <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-3">
          Post an update
        </h3>
        <Composer packageId={pkg.id} />

        <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-3">
          Updates ({updates.length})
        </h3>
        {updatesLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : updates.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">No updates yet.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {updates.map((u) => (
              <UpdateCard key={u.id} update={u} packageId={pkg.id} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}