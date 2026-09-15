import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, Copy, Inbox, Mail, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { AdminPage } from "@/components/admin/AdminPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useDeepLinkOpen } from "@/hooks/useDeepLinkOpen";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { formatDate, formatRelative } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

type InquiryStatus = "new" | "contacted" | "closed";
type Filter = InquiryStatus | "all";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  status: InquiryStatus;
  page_path: string | null;
  created_at: string;
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];

const statusTone = (s: InquiryStatus) => (s === "new" ? "secondary" : s === "contacted" ? "primary" : "muted");

/**
 * Messages from the public contact form (signed-out visitors). Signed-in
 * users message the team in Messages instead.
 */
const AdminInquiries = () => {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("new");
  const [highlight, setHighlight] = useState<string | null>(null);

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["admin", "inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("id, name, email, company, message, status, page_path, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Inquiry[];
    },
  });

  // Deep link from the team email/Slack alert: show it whatever its status.
  useDeepLinkOpen({
    rows: inquiries,
    onOpen: (row) => {
      setFilter("all");
      setHighlight(row.id);
      requestAnimationFrame(() => document.getElementById(`inquiry-${row.id}`)?.scrollIntoView({ block: "center" }));
    },
  });

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { new: 0, contacted: 0, closed: 0, all: 0 };
    for (const i of inquiries ?? []) {
      c[i.status] += 1;
      c.all += 1;
    }
    return c;
  }, [inquiries]);

  const visible = (inquiries ?? []).filter((i) => filter === "all" || i.status === filter);

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InquiryStatus }) => {
      const { error } = await supabase.from("contact_submissions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      qc.invalidateQueries({ queryKey: ["admin", "nav-counts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminPage eyebrow="Inquiries" title="Inquiries" description="Messages from the public contact form. Signed-in users write to you in Messages.">
      <div className="flex flex-wrap gap-2 mb-5" role="tablist" aria-label="Filter inquiries">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
              filter === f.value
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
            <span className="font-mono text-[10px] text-muted-foreground">{counts[f.value]}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <Inbox className="w-6 h-6 mx-auto mb-3 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            {filter === "new" ? "No new inquiries. You're all caught up." : "Nothing here yet."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((i) => (
            <InquiryCard
              key={i.id}
              inquiry={i}
              highlighted={highlight === i.id}
              busy={setStatus.isPending}
              onStatus={(status) => setStatus.mutate({ id: i.id, status })}
            />
          ))}
        </ul>
      )}
    </AdminPage>
  );
};

const InquiryCard = ({
  inquiry: i,
  highlighted,
  busy,
  onStatus,
}: {
  inquiry: Inquiry;
  highlighted: boolean;
  busy: boolean;
  onStatus: (s: InquiryStatus) => void;
}) => {
  const { copied, copy } = useCopyToClipboard();
  const replyHref = `mailto:${i.email}?subject=${encodeURIComponent("Re: your message to Vortura")}&body=${encodeURIComponent(
    `Hi ${i.name.split(" ")[0]},\n\n\n\n> ${i.message.split("\n").join("\n> ")}`,
  )}`;

  return (
    <li
      id={`inquiry-${i.id}`}
      className={cn("glass rounded-2xl p-4 md:p-5 transition-shadow", highlighted && "ring-2 ring-primary/50")}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-semibold">{i.name}</p>
            <StatusBadge tone={statusTone(i.status)}>{i.status}</StatusBadge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              {i.email}
              <button
                type="button"
                onClick={() => void copy(i.email)}
                aria-label={copied ? "Email copied" : `Copy ${i.email}`}
                className="text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </span>
            {i.company && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                {i.company}
              </span>
            )}
          </div>
        </div>
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground shrink-0" title={formatDate(i.created_at)}>
          {formatRelative(i.created_at)}
          {i.page_path ? ` · ${i.page_path}` : ""}
        </p>
      </div>

      <p className="text-sm whitespace-pre-wrap break-words text-foreground/90 mb-4">{i.message}</p>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="hero">
          <a href={replyHref} onClick={() => i.status === "new" && onStatus("contacted")}>
            <Mail className="w-3.5 h-3.5" /> Reply by email
          </a>
        </Button>
        {i.status === "new" && (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onStatus("contacted")}>
            <Check className="w-3.5 h-3.5" /> Mark contacted
          </Button>
        )}
        {i.status !== "closed" ? (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onStatus("closed")}>
            <X className="w-3.5 h-3.5" /> Close
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onStatus("new")}>
            <RotateCcw className="w-3.5 h-3.5" /> Reopen
          </Button>
        )}
      </div>
    </li>
  );
};

export default AdminInquiries;
