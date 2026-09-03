import { useMemo, useState, useEffect, useCallback } from "react";
import { Search, Sparkles, Flame, Globe, ExternalLink, Mail, Phone, MapPin, Briefcase, Copy, Check, Pencil, X, Plus, UserPlus, Trash2, Archive, Loader2 } from "lucide-react";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
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
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Temp = "hot" | "warm" | "cool" | "cold";

interface Lead {
  id: string;
  business: string;
  phone: string;
  email: string;
  city: string;
  industry: string;
  website: string | null;
  score: number;
  notes: string;
  createdAt: string;
  hidden?: boolean;
}

const API_BASE = "https://vortura-production.up.railway.app";

const DEFAULT_PROMPT = `⚠️ DASHBOARD INTEGRATION TASK — READ BEFORE STARTING ⚠️

This task feeds directly into the Vortura dashboard lead table via automated JSON parsing.

OVERRIDE: Ignore the LEAD SCHEMA and FILE NAMING instructions from the system context.

Do NOT save any spreadsheet or file. Output ONLY the ===LEADS_JSON=== block described below.

You are a lead generation specialist for Vortura — a web design and digital marketing agency.

Your task: find exactly {count} local businesses in the Greater Toronto Area (GTA) that would benefit from Vortura's services.

{industry}{{SKIP_LIST}}

━━━ DATA SOURCING RULES ━━━

PRIMARY SOURCE — Google Business Profiles (GBP) via Google Maps:
  • Search Google Maps for businesses in GTA cities: Toronto, Mississauga, Brampton, Vaughan, Markham,
    Richmond Hill, Oakville, Burlington, Scarborough, North York, Etobicoke, Ajax, Pickering, Oshawa, Hamilton.
  • For each candidate, open its full Google Maps listing page and inspect the info panel carefully.
  • The GBP panel may show: "Website", "Directions", "Call", "Save", "Share" — look for a "Website" button.
  • If a "Website" button is present, click it or copy the URL exactly as listed.

━━━ WEBSITE VERIFICATION (MANDATORY — do ALL steps before marking website as null) ━━━

For EVERY business, you must complete all four checks before concluding it has no website:
  STEP 1 — Google Maps / GBP:
    • Open the business's Google Maps listing. Look for a "Website" link in the info panel.
    • Use WebFetch on the Maps URL if needed to read the page source for a website link.
  STEP 2 — Direct Google search:
    • Search: "[Business Name] [City] Ontario"
    • If an official website appears in the organic results (not directories), record it.
  STEP 3 — Directory cross-check:
    • Check YellowPages.ca, Yelp.ca, and Facebook for the business.
    • If any listing shows a website URL, record it.
  STEP 4 — Domain guess check:
    • Try fetching common domain patterns: businessname.ca, businessname.com, businessnameCity.ca
    • If any resolves to a real business page, record it.
  ⚠️  Only set "website": null if ALL FOUR steps find nothing. A single confirmed URL from any
      source means the business has a website — record it and adjust the score accordingly.

TARGET NICHES (prioritise high-revenue service businesses):
  Automotive repair, Dental/medical clinics, Restaurants & cafes, Real estate agents,
  HVAC / plumbers / electricians, Hair salons & spas, Gyms & fitness studios, Law offices,
  Accountants, Cleaning services, Landscapers, Daycare centres, Roofing, Pest control.

━━━ SCORING (1–10) ━━━

Score each lead based on how valuable they are as a Vortura prospect:
  8–10  🔥 Hot  — High-revenue industry + no/minimal web presence + clear pain point + easy to contact
  5–7   🌡️ Warm — Good potential but has a basic website, or harder to reach, or lower revenue
  2–4   ❄️ Cool — Low budget signals, very basic needs, or significant friction to convert
  0–1   🥶 Cold — Unlikely to convert (e.g. franchise, already has good web presence)

Scoring factors:
  + Revenue potential of the industry
  + No website (maximum gap) or outdated/poor website
  + Pain points visible in Google reviews (complaints about hard to find, no online booking, etc.)
  + Business size / activity signals (many reviews, long hours, multiple staff)
  - Modern, professional-looking website already in place
  - Appears to be a franchise or chain

━━━ OUTPUT — CRITICAL ━━━

When research is complete, you MUST output the block below EXACTLY as shown.
This block is automatically parsed by the Vortura dashboard to display leads in real time.

RULES:
  1. Output ===LEADS_JSON=== on its own line, followed immediately by a raw JSON array (NO code fences, NO \`\`\`json).
  2. Close with ===END_LEADS=== on its own line.
  3. Do NOT add any text after ===END_LEADS===.
  4. Return exactly {count} leads.
  5. "website" must be a full URL string (e.g. "https://example.com") or null — never "–" or "N/A".
  6. Every lead must be unique and NOT in the {{SKIP_LIST}} section above.
  7. Complete the 4-step website verification for every lead before outputting results.

===LEADS_JSON===
[
  {
    "name": "Business Name",
    "phone": "416-555-0000",
    "city": "Toronto",
    "industry": "Automotive",
    "address": "123 Main St, Toronto, ON",
    "website": null,
    "score": 9,
    "notes": "One sentence: why this is a strong lead and what their web presence gap is."
  }
]
===END_LEADS===`;
const PROMPT_STORAGE_KEY = "vortura.leadGenPrompt.v2";

const mapApiLead = (raw: any): Lead => ({
  id: String(raw.id ?? raw._id ?? crypto.randomUUID()),
  business: raw.name ?? raw.business ?? "",
  phone: raw.phone ?? "",
  email: raw.email ?? "",
  city: raw.city ?? "",
  industry: raw.industry ?? "",
  website: raw.website ?? null,
  score: typeof raw.score === "number" ? raw.score : 0,
  notes: raw.notes ?? "",
  createdAt: raw.createdAt ?? raw.created_at ?? "",
  hidden: !!raw.hidden,
});

const tempFor = (score: number): Temp =>
  score >= 8 ? "hot" : score >= 5 ? "warm" : score >= 2 ? "cool" : "cold";

const tempMeta: Record<Temp, { label: string; className: string; dot: string }> = {
  hot: { label: "Hot", className: "text-destructive border-destructive/40 bg-destructive/10", dot: "bg-destructive" },
  warm: { label: "Warm", className: "text-amber-300 border-amber-400/30 bg-amber-400/10", dot: "bg-amber-400" },
  cool: { label: "Cool", className: "text-primary border-primary/30 bg-primary/10", dot: "bg-primary" },
  cold: { label: "Cold", className: "text-muted-foreground border-white/10 bg-white/[0.04]", dot: "bg-muted-foreground" },
};

export default function AdminLeads() {
  const { isAdmin } = useUserRole();
  const [search, setSearch] = useState("");
  const [tempFilter, setTempFilter] = useState<"all" | Temp>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [hasWebsite, setHasWebsite] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [leadCount, setLeadCount] = useState(25);
  const [industry, setIndustry] = useState("");
  const [movingToClients, setMovingToClients] = useState(false);
  const [movedLeadIds, setMovedLeadIds] = useState<Set<string>>(new Set());
  const [deletedLeadIds, setDeletedLeadIds] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState<Lead | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [promptTemplate, setPromptTemplate] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_PROMPT;
    return localStorage.getItem(PROMPT_STORAGE_KEY) ?? DEFAULT_PROMPT;
  });
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [promptDraft, setPromptDraft] = useState(promptTemplate);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/leads`);
      if (!res.ok) throw new Error(`Failed to load leads (${res.status})`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.leads ?? [];
      setLeads(arr.map(mapApiLead));
    } catch (e: any) {
      toast.error(e?.message || "Failed to load leads.");
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const patchLead = async (id: string, patch: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`PATCH failed (${res.status})`);
  };

  const stats = useMemo(() => {
    const visible = leads.filter((l) => !l.hidden);
    const total = visible.length;
    const hot = visible.filter((l) => l.score >= 8).length;
    const avg = total > 0 ? Math.round(visible.reduce((s, l) => s + l.score, 0) / total) : 0;
    const generated = leads.length;
    const conversions = movedLeadIds.size;
    const archived = leads.filter((l) => l.hidden).length - conversions;
    const denom = generated - archived;
    const conversion = denom > 0 ? `${((conversions / denom) * 100).toFixed(1)}%` : "0.0%";
    return { total, hot, avg, conversion };
  }, [leads, movedLeadIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = leads.filter((l) => !deletedLeadIds.has(l.id));
    list = showArchived
      ? list.filter((l) => !!l.hidden)
      : list.filter((l) => !l.hidden);
    if (tempFilter !== "all") list = list.filter((l) => tempFor(l.score) === tempFilter);
    if (hasWebsite) list = list.filter((l) => !!l.website);
    if (q) {
      list = list.filter((l) =>
        `${l.business} ${l.email} ${l.city} ${l.industry}`.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) =>
      sort === "newest"
        ? b.createdAt.localeCompare(a.createdAt)
        : a.createdAt.localeCompare(b.createdAt)
    );
    return list;
  }, [leads, search, tempFilter, hasWebsite, sort, deletedLeadIds, showArchived]);

  return (
    <AdminPage
      eyebrow="Leads"
      title="Leads"
      description="Discover, score, and qualify prospective clients."
      actions={
        <div className="flex items-center gap-2">
          {generateLoading && (
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
          )}
        <Dialog
          open={editingPrompt}
          onOpenChange={(o) => {
            setEditingPrompt(o);
            if (o) setPromptDraft(promptTemplate);
          }}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="hover:bg-white/10 hover:text-white">
              <Pencil className="w-3.5 h-3.5" />
              Edit Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg border-2 border-white/15 bg-card text-foreground">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Edit Generate Leads Prompt
              </DialogTitle>
              <DialogDescription>
                Use <code>{"{count}"}</code> and <code>{"{industry}"}</code> as placeholders. They will be replaced when you run Generate Leads.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={promptDraft}
              onChange={(e) => setPromptDraft(e.target.value)}
              rows={8}
              className="font-mono text-xs"
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditingPrompt(false)} className="hover:bg-white/10 hover:text-white">
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={() => {
                  setPromptTemplate(promptDraft);
                  try { localStorage.setItem(PROMPT_STORAGE_KEY, promptDraft); } catch { /* ignore storage write failures (e.g. private mode) */ }
                  setEditingPrompt(false);
                  toast.success("Prompt saved.");
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={generating} onOpenChange={setGenerating}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm">
              {generateLoading ? (
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                  <Loader2 className="relative w-3.5 h-3.5 animate-spin text-emerald-300" />
                </span>
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {generateLoading ? "Prompt Active" : "Generate Leads"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg border-2 border-white/15 bg-card text-foreground">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Generate Leads
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Number of Leads: {leadCount}</Label>
                <Slider
                  value={[leadCount]}
                  onValueChange={([v]) => setLeadCount(v)}
                  min={10}
                  max={50}
                  step={1}
                  className="mt-3"
                />
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mt-2">
                  Min 10 · Max 50
                </p>
              </div>
              <div>
                <Label>Industry</Label>
                <Input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Plumbing, Dental, Landscaping…"
                  className="mt-1.5"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setGenerating(false)} disabled={generateLoading} className="hover:bg-white/10 hover:text-white">
                Cancel
              </Button>
              <Button
                variant="hero"
                disabled={generateLoading}
                onClick={async () => {
                  setGenerateLoading(true);
                  try {
                    const industryValue = industry.trim();
                    const industryBlock = industryValue
                      ? `INDUSTRY OVERRIDE: Only find businesses in the "${industryValue}" industry. Ignore the TARGET NICHES list below — every lead returned must be in ${industryValue}.\n\n`
                      : "";
                    const renderedPrompt = promptTemplate
                      .replace(/\{count\}/g, String(leadCount))
                      .replace(/\{industry\}/g, industryBlock);
                    const res = await fetch(`${API_BASE}/api/tasks`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ prompt: renderedPrompt }),
                    });
                    if (!res.ok) throw new Error(`Generate failed (${res.status})`);
                    const { id: taskId } = await res.json();
                    toast.success("Lead generation started. This may take a few minutes.");
                    setGenerating(false);

                    // Poll the task until it finishes, then refresh leads.
                    const startedAt = Date.now();
                    const maxMs = 15 * 60 * 1000;
                    const poll = async () => {
                      try {
                        const r = await fetch(`${API_BASE}/api/tasks/${taskId}`);
                        if (r.ok) {
                          const t = await r.json();
                          if (t?.status === "done") {
                            await fetchLeads();
                            toast.success("New leads added.");
                            return;
                          }
                          if (t?.status === "error") {
                            toast.error("Lead generation failed.");
                            return;
                          }
                        }
                      } catch { /* transient poll error — keep polling until timeout */ }
                      if (Date.now() - startedAt < maxMs) {
                        setTimeout(poll, 5000);
                      }
                    };
                    setTimeout(poll, 5000);
                  } catch (e: any) {
                    toast.error(e?.message || "Failed to generate leads.");
                  } finally {
                    setGenerateLoading(false);
                  }
                }}
              >
                {generateLoading ? "Generating…" : "Generate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      }
    >
      {/* Sub-Header metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <div className="glass rounded-2xl p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">Total Leads</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">Hot Leads</p>
          <p className="text-xl font-bold">{stats.hot}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">Avg. Score</p>
          <p className="text-xl font-bold">{stats.avg}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">Conversion Rate</p>
          <p className="text-xl font-bold">{stats.conversion}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by business, email, city, or industry…"
            className="pl-9"
          />
        </div>
        <Select value={tempFilter} onValueChange={(v) => setTempFilter(v as typeof tempFilter)}>
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Temperature" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All temps</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cool">Cool</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="md:w-36">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 px-3 h-10 rounded-md border border-input bg-background text-sm shadow-elev-1 cursor-pointer select-none">
          <Checkbox
            checked={hasWebsite}
            onCheckedChange={(v) => setHasWebsite(v === true)}
            id="has-website"
          />
          <span>Has Website</span>
        </label>
        <label
          className={cn(
            "flex items-center gap-2 px-3 h-10 rounded-md border border-input bg-background text-sm shadow-elev-1 cursor-pointer select-none",
            showArchived && "border-primary/40 bg-primary/10 text-primary"
          )}
        >
          <Checkbox
            checked={showArchived}
            onCheckedChange={(v) => setShowArchived(v === true)}
            id="show-archived"
          />
          <span>Archived</span>
        </label>
      </div>

      {/* Table */}
      {(() => {
        const gridCols = "lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_4rem_minmax(0,1fr)_minmax(0,1fr)_4rem_8rem_minmax(0,9rem)]";
        return (
          <div className="glass rounded-2xl overflow-hidden">
            <div
              className={cn(
                "hidden lg:grid gap-4 px-5 py-3 border-b border-white/[0.06] font-mono text-[11px] uppercase tracking-widest text-muted-foreground",
                gridCols
              )}
            >
              <span>Business Name</span>
              <span>Phone Number</span>
              <span>E-mail</span>
              <span>City</span>
              <span>Industry</span>
              <span>Website</span>
              <span>Lead Score</span>
              <span>Actions</span>
            </div>

            {filtered.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">No leads match your filters.</p>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {filtered.map((l) => {
                  const t = tempMeta[tempFor(l.score)];
                  return (
                    <li key={l.id} className="odd:bg-white/[0.02]">
                      <button
                        type="button"
                        onClick={() => setActiveLead(l)}
                        className={cn(
                          "w-full text-left grid grid-cols-1 gap-2 lg:gap-4 px-4 lg:px-5 py-3.5 items-center transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:bg-white/[0.05]",
                          gridCols
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground shrink-0">
                            <Flame className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium truncate">{l.business}</p>
                          </div>
                        </div>
                        <p className="text-[12px] text-muted-foreground truncate">
                          <span className="lg:hidden font-mono text-[11px] uppercase tracking-widest mr-2">Phone</span>
                          {l.phone}
                        </p>
                        <div className="text-[12px] truncate" onClick={(e) => e.stopPropagation()}>
                          <span className="lg:hidden font-mono text-[11px] uppercase tracking-widest mr-2 text-muted-foreground">Email</span>
                          {l.email ? (
                            <a
                              href={`mailto:${l.email}`}
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                              aria-label="Create email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                        <p className="text-[12px] text-muted-foreground truncate">
                          <span className="lg:hidden font-mono text-[11px] uppercase tracking-widest mr-2">City</span>
                          {l.city}
                        </p>
                        <p className="text-[12px] text-muted-foreground truncate">
                          <span className="lg:hidden font-mono text-[11px] uppercase tracking-widest mr-2">Industry</span>
                          {l.industry}
                        </p>
                        <div className="text-[12px] truncate" onClick={(e) => e.stopPropagation()}>
                          <span className="lg:hidden font-mono text-[11px] uppercase tracking-widest mr-2 text-muted-foreground">Website</span>
                          {l.website ? (
                            <a
                              href={l.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Open ${l.name ?? "lead"} website in a new tab`}
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold tabular-nums">{l.score}</span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border font-mono text-[11px] uppercase tracking-widest w-fit whitespace-nowrap",
                              t.className
                            )}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full", t.dot)} />
                            {t.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                          <span className="lg:hidden font-mono text-[11px] uppercase tracking-widest mr-1 text-muted-foreground">Actions</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title={l.hidden ? "Unarchive lead" : "Archive lead"}
                            onClick={async () => {
                              if (l.hidden) {
                                try {
                                  await patchLead(l.id, { hidden: false });
                                  setLeads((prev) => prev.map((x) => (x.id === l.id ? { ...x, hidden: false } : x)));
                                  toast.success(`${l.business} unarchived.`);
                                } catch (e: any) {
                                  toast.error(e?.message || "Failed to unarchive.");
                                }
                              } else {
                                setConfirmArchive(l);
                              }
                            }}
                          >
                            <Archive className={cn("w-3.5 h-3.5", l.hidden ? "text-primary" : "text-amber-400")} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-500/10 group"
                            title="Delete lead"
                            onClick={() => setConfirmDelete(l)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-400" />
                          </Button>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })()}

      <Dialog open={!!activeLead} onOpenChange={(open) => { if (!open) { setActiveLead(null); setCopiedEmail(false); setEditingNotes(false); } }}>
        <DialogContent className="max-w-2xl border-2 border-white/15 bg-card text-foreground">
          {activeLead && (() => {
            const t = tempMeta[tempFor(activeLead.score)];
            return (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <DialogTitle className="flex items-center gap-2 text-xl">
                        {activeLead.business}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border font-mono text-[11px] uppercase tracking-widest whitespace-nowrap shrink-0",
                            t.className
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", t.dot)} />
                          {t.label}
                        </span>
                      </DialogTitle>
                      <DialogDescription className="font-mono text-[11px] uppercase tracking-widest mt-1">
                        Lead #{activeLead.id} · Added {activeLead.createdAt}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-xl p-3">
                      <Label>Lead Score</Label>
                      <p className="text-2xl font-bold text-gradient mt-1">{activeLead.score}</p>
                    </div>
                    <div className="glass rounded-xl p-3">
                      <Label>Industry</Label>
                      <p className="text-sm mt-1 flex items-center gap-2 truncate">
                        <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        {activeLead.industry}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-xl p-3">
                      <Label>Phone Number</Label>
                      <a href={`tel:${activeLead.phone}`} className="block text-sm mt-1 hover:text-primary transition-colors truncate">
                        {activeLead.phone}
                      </a>
                    </div>
                    <div
                      className="glass rounded-xl p-3 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(activeLead.email);
                        setCopiedEmail(true);
                        setTimeout(() => setCopiedEmail(false), 1500);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <Label>E-mail</Label>
                        <span className="text-muted-foreground">
                          {copiedEmail ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </div>
                      <p className="text-sm mt-1 truncate select-all">
                        {activeLead.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-xl p-3">
                      <Label>City</Label>
                      <p className="text-sm mt-1 flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        {activeLead.city}
                      </p>
                    </div>
                    {activeLead.website ? (
                      <div
                        className="glass rounded-xl p-3 cursor-pointer"
                        onClick={() => window.open(activeLead.website!, "_blank", "noopener,noreferrer")}
                      >
                        <div className="flex items-center justify-between">
                          <Label>Website</Label>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <p className="text-sm mt-1 truncate text-primary">
                          {activeLead.website}
                        </p>
                      </div>
                    ) : (
                      <div className="glass rounded-xl p-3">
                        <Label>Website</Label>
                        <p className="text-sm text-muted-foreground mt-1">No website</p>
                      </div>
                    )}
                  </div>

                  <div className="glass rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <Label>Notes</Label>
                      {isAdmin && !editingNotes && (
                        <button
                          type="button"
                          onClick={() => {
                            setNoteDraft(activeLead.notes);
                            setEditingNotes(true);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      )}
                    </div>
                    {editingNotes ? (
                      <div className="mt-1.5 space-y-2">
                        <Textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          rows={3}
                          className="text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            variant="hero"
                            size="sm"
                            onClick={async () => {
                              try {
                                await patchLead(activeLead.id, { notes: noteDraft });
                                setLeads((prev) => prev.map((x) => (x.id === activeLead.id ? { ...x, notes: noteDraft } : x)));
                                setActiveLead({ ...activeLead, notes: noteDraft });
                                toast.success("Notes saved.");
                              } catch (e: any) {
                                toast.error(e?.message || "Failed to save notes.");
                              } finally {
                                setEditingNotes(false);
                              }
                            }}
                          >
                            <Check className="w-3 h-3" />
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingNotes(false)}
                            className="hover:bg-white/10 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm mt-1">{activeLead.notes}</p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="hero"
                    size="sm"
                    disabled={movingToClients || movedLeadIds.has(activeLead.id)}
                    onClick={async () => {
                      if (!activeLead) return;
                      setMovingToClients(true);
                      try {
                        const res = await fetch(`${API_BASE}/api/contacts`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: activeLead.id,
                            name: activeLead.business,
                            phone: activeLead.phone,
                            email: activeLead.email,
                            city: activeLead.city,
                            industry: activeLead.industry,
                            website: activeLead.website,
                            score: activeLead.score,
                            notes: activeLead.notes,
                            createdAt: activeLead.createdAt,
                          }),
                        });
                        if (!res.ok) throw new Error(`Move failed (${res.status})`);
                        await patchLead(activeLead.id, { hidden: true });
                        setLeads((prev) => prev.map((x) => (x.id === activeLead.id ? { ...x, hidden: true } : x)));
                        setMovedLeadIds((prev) => new Set(prev).add(activeLead.id));
                        toast.success(`${activeLead.business} added to Clients.`);
                        setActiveLead(null);
                      } catch (e: any) {
                        toast.error(e?.message || "Failed to move to clients.");
                      } finally {
                        setMovingToClients(false);
                      }
                    }}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {movedLeadIds.has(activeLead.id) ? "Added to Clients" : movingToClients ? "Adding…" : "Move to Clients"}
                  </Button>
                  <Button variant="ghost" onClick={() => setActiveLead(null)} className="hover:bg-white/10 hover:text-white">
                    Close
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmArchive} onOpenChange={(o) => !o && setConfirmArchive(null)}>
        <AlertDialogContent className="border-2 border-white/15 bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmArchive ? `"${confirmArchive.business}" will be hidden from the leads table. You can view it again by toggling the Archived filter.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmArchive) {
                  const lead = confirmArchive;
                  try {
                    await patchLead(lead.id, { hidden: true });
                    setLeads((prev) => prev.map((x) => (x.id === lead.id ? { ...x, hidden: true } : x)));
                    toast.success(`${lead.business} archived.`);
                  } catch (e: any) {
                    toast.error(e?.message || "Failed to archive.");
                  }
                }
                setConfirmArchive(null);
              }}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent className="border-2 border-white/15 bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete ? `"${confirmDelete.business}" will be permanently removed from the leads table. This cannot be undone.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (confirmDelete) {
                  const lead = confirmDelete;
                  try {
                    const res = await fetch(`${API_BASE}/api/leads/${lead.id}`, { method: "DELETE" });
                    if (!res.ok) throw new Error(`Delete failed (${res.status})`);
                    setDeletedLeadIds((prev) => new Set(prev).add(lead.id));
                    setLeads((prev) => prev.filter((x) => x.id !== lead.id));
                    toast.success(`${lead.business} deleted.`);
                  } catch (e: any) {
                    toast.error(e?.message || "Failed to delete.");
                  }
                }
                setConfirmDelete(null);
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