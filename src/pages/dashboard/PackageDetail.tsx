import { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Paperclip, FileText, Download } from "lucide-react";
import { DashboardSubPage } from "@/components/dashboard/DashboardSubPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import {
  usePackage,
  usePackageUpdates,
  markUpdatesRead,
  type PackageUpdateAttachment,
} from "@/hooks/usePackageUpdates";
import { formatRelative } from "@/lib/admin/format";

// Renders text with any URLs converted into clickable links.
const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,:;!?)\]"'])|(www\.[^\s<]+[^\s<.,:;!?)\]"'])/gi;
const Linkified = ({ text }: { text: string }) => {
  const parts: Array<string | { href: string; label: string }> = [];
  let lastIndex = 0;
  for (const m of text.matchAll(URL_RE)) {
    const start = m.index ?? 0;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    const raw = m[0];
    const href = raw.startsWith("http") ? raw : `https://${raw}`;
    parts.push({ href, label: raw });
    lastIndex = start + raw.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : (
          <a
            key={i}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary-glow break-all"
          >
            {p.label}
          </a>
        )
      )}
    </>
  );
};

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
      download={att.file_name}
      className="flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 bg-white/[0.03] hover:border-primary/40 transition-colors text-sm"
    >
      <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <span className="truncate flex-1">{att.file_name}</span>
      <Download className="w-3.5 h-3.5 text-muted-foreground" />
    </a>
  );
};

export default function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: client } = useCurrentClient();
  const { data: pkg, isLoading } = usePackage(id);
  const { data: updates = [], isLoading: updatesLoading } = usePackageUpdates(id);

  const updateIds = useMemo(() => updates.map((u) => u.id), [updates]);

  // Mark updates as read once they're visible.
  useEffect(() => {
    if (!user?.id || updateIds.length === 0) return;
    markUpdatesRead(user.id, updateIds);
  }, [user?.id, updateIds]);

  if (isLoading) {
    return (
      <DashboardSubPage eyebrow="Package" title="Loading…" description="">
        <Skeleton className="h-32 w-full" />
      </DashboardSubPage>
    );
  }

  if (!pkg) {
    return <Navigate to="/dashboard" replace />;
  }

  // Authorization: ensure the package belongs to the current client
  if (client && (pkg as any).client_id !== client.id) {
    return <Navigate to="/dashboard" replace />;
  }

  const displayName = (pkg as any).nickname?.trim() || pkg.name;

  return (
    <DashboardSubPage
      eyebrow="Package"
      title={displayName}
      description={`Track progress and read updates from your team on ${pkg.name}.`}
    >
      {/* Package info card */}
      <div className="glass rounded-2xl p-5 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
              {pkg.name}
            </p>
            <h2 className="text-lg font-semibold tracking-tight">{displayName}</h2>
            {(pkg as any).is_custom && (pkg as any).custom_id && (
              <span className="inline-block mt-2 font-mono text-[11px] tracking-wider rounded-md border border-primary/40 bg-primary/10 text-primary px-1.5 py-0.5">
                {(pkg as any).custom_id}
              </span>
            )}
          </div>
          <StatusBadge tone={statusTone(pkg.status)}>{pkg.status.replace("_", " ")}</StatusBadge>
        </div>
        <div>
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
      </div>

      {/* Updates timeline */}
      <div>
        <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-3">
          Updates
        </h3>
        {updatesLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : updates.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">No updates yet. Your team will post progress here.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {updates.map((u) => (
              <li key={u.id} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-base font-semibold leading-tight">{u.title}</h4>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground shrink-0">
                    {formatRelative(u.created_at)}
                    {u.edited_at && <span className="ml-1.5 italic">(edited)</span>}
                  </span>
                </div>
                {u.body && (
                  <p className="text-sm text-foreground/85 whitespace-pre-wrap mb-3">
                    <Linkified text={u.body} />
                  </p>
                )}
                {(u.status_change || u.progress_change != null) && (
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {u.status_change && (
                      <span className="font-mono text-[11px] uppercase tracking-widest rounded-md bg-primary/10 text-primary border border-primary/30 px-2 py-1">
                        Status → {u.status_change.replace("_", " ")}
                      </span>
                    )}
                    {u.progress_change != null && (
                      <span className="font-mono text-[11px] uppercase tracking-widest rounded-md bg-secondary/10 text-secondary border border-secondary/30 px-2 py-1">
                        Progress → {u.progress_change}%
                      </span>
                    )}
                  </div>
                )}
                {u.attachments.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                      <Paperclip className="w-3 h-3" />
                      {u.attachments.length} attachment{u.attachments.length === 1 ? "" : "s"}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {u.attachments.map((a) => (
                        <AttachmentItem key={a.id} att={a} />
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardSubPage>
  );
}