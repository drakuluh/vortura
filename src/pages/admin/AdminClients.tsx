import { useState, useEffect } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdminPage } from "@/components/admin/AdminPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatCents } from "@/lib/admin/format";
import { logActivity } from "@/lib/admin/activity";
import { useDeepLinkOpen } from "@/hooks/useDeepLinkOpen";

type ClientStatus = "active" | "onboarding" | "paused" | "churned";
type Health = "healthy" | "watch" | "at_risk";

interface ClientRow {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  plan: string | null;
  status: ClientStatus;
  mrr_cents: number;
  health: Health;
  joined_at: string;
  user_id: string | null;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
    phone: string | null;
    account_type: string | null;
  } | null;
  packages?: { name: string }[];
}

const statusTone = (s: ClientStatus) =>
  s === "active" ? "success" : s === "onboarding" ? "primary" : s === "paused" ? "warn" : "danger";

// Per-package recurring monthly fee in cents. Keyed by tier (preferred) or
// normalized package name. Used to compute MRR from owned packages, not from
// historical purchase rows (which include setup/initial amounts).
const PACKAGE_MONTHLY_CENTS: Record<string, number> = {
  get_online: 0,
  get_more_calls: 14900,
  get_more_customers: 39900,
};
const NAME_TO_TIER: Record<string, string> = {
  "get online": "get_online",
  "website creation & management": "get_online",
  "get more calls": "get_more_calls",
  "get more customers": "get_more_customers",
};
const monthlyForPackage = (pkg: { name: string; tier?: string | null }) => {
  const tier = (pkg.tier ?? "").toLowerCase() || NAME_TO_TIER[(pkg.name ?? "").toLowerCase()] || "";
  return PACKAGE_MONTHLY_CENTS[tier] ?? 0;
};

const usePackageAmountsMap = (clientIds: string[]) =>
  useQuery({
    queryKey: ["admin", "client-package-amounts", clientIds.sort().join(",")],
    enabled: clientIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("client_id, name, tier")
        .in("client_id", clientIds);
      if (error) throw error;
      const map: Record<string, number> = {};
      (data ?? []).forEach((p: any) => {
        map[p.client_id] = (map[p.client_id] ?? 0) + monthlyForPackage(p);
      });
      return map;
    },
  });

// Sum lifetime payments per client from the invoices table.
// Invoices is the source of truth: it captures both checkout-driven
// purchases and any invoice paid via the hosted Stripe invoice page.
// Refunded invoices are excluded; partially-refunded invoices still
// count (the original payment did happen).
const usePaymentsMap = (clientIds: string[]) =>
  useQuery({
    queryKey: ["admin", "client-payments", clientIds.sort().join(",")],
    enabled: clientIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("client_id, amount_cents, status")
        .in("client_id", clientIds)
        .in("status", ["paid", "partially_refunded"]);
      if (error) throw error;
      const map: Record<string, number> = {};
      (data ?? []).forEach((p: any) => {
        if (!p.client_id) return;
        map[p.client_id] = (map[p.client_id] ?? 0) + (p.amount_cents ?? 0);
      });
      return map;
    },
  });

const useClients = () =>
  useQuery({
    queryKey: ["admin", "clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClientRow[];
    },
  });

const useProfilesMap = (userIds: string[]) =>
  useQuery({
    queryKey: ["admin", "client-profiles", userIds.sort().join(",")],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, business_name, phone, account_type")
        .in("id", userIds);
      if (error) throw error;
      const map: Record<string, ClientRow["profile"]> = {};
      (data ?? []).forEach((p: any) => { map[p.id] = p; });
      return map;
    },
  });

const usePackagesMap = (clientIds: string[]) =>
  useQuery({
    queryKey: ["admin", "client-packages", clientIds.sort().join(",")],
    enabled: clientIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("client_id, name, created_at")
        .in("client_id", clientIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const map: Record<string, string[]> = {};
      (data ?? []).forEach((p: any) => {
        if (!map[p.client_id]) map[p.client_id] = [];
        map[p.client_id].push(p.name);
      });
      return map;
    },
  });

const ClientDialog = ({ row, onClose }: { row?: ClientRow; onClose: () => void }) => {
  const qc = useQueryClient();
  const [name, setName] = useState(row?.name ?? "");
  const [contact, setContact] = useState(row?.contact_name ?? "");
  const [email, setEmail] = useState(row?.email ?? "");
  const [status, setStatus] = useState<ClientStatus>(row?.status ?? "onboarding");
  const [health, setHealth] = useState<Health>(row?.health ?? "healthy");
  const [notes, setNotes] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Load list of users (profiles) without an existing client row — for New Client mode
  const { data: availableUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users-without-client"],
    enabled: !row,
    queryFn: async () => {
      const [{ data: profiles, error: pErr }, { data: existingClients, error: cErr }] = await Promise.all([
        supabase.from("profiles").select("id, first_name, last_name, business_name, phone, account_type, display_name"),
        supabase.from("clients").select("user_id"),
      ]);
      if (pErr) throw pErr;
      if (cErr) throw cErr;
      const taken = new Set((existingClients ?? []).map((c) => c.user_id).filter(Boolean));
      return (profiles ?? []).filter((p) => !taken.has(p.id));
    },
  });

  const selectedUser = (availableUsers ?? []).find((u) => u.id === selectedUserId);
  const newFullName = selectedUser
    ? [selectedUser.first_name, selectedUser.last_name].filter(Boolean).join(" ").trim() || selectedUser.display_name || "—"
    : "—";
  const newBusiness = selectedUser?.business_name || (selectedUser?.account_type === "business" ? selectedUser?.display_name : null) || "—";
  const newPhone = selectedUser?.phone || "—";

  // Load profile + packages + existing notes for edit mode
  const { data: details } = useQuery({
    queryKey: ["admin", "client-details", row?.id],
    enabled: !!row?.id,
    queryFn: async () => {
      const [{ data: client }, { data: pkgs }] = await Promise.all([
        supabase.from("clients").select("notes, user_id").eq("id", row!.id).maybeSingle(),
        supabase.from("packages").select("name, created_at").eq("client_id", row!.id).order("created_at", { ascending: false }),
      ]);
      let profile: ClientRow["profile"] = null;
      if (client?.user_id) {
        const { data } = await supabase
          .from("profiles")
          .select("first_name, last_name, business_name, phone, account_type")
          .eq("id", client.user_id)
          .maybeSingle();
        profile = data ?? null;
      }
      return { notes: client?.notes ?? "", packages: pkgs ?? [], profile };
    },
  });

  // Hydrate notes once details load
  useEffect(() => {
    if (details?.notes !== undefined) setNotes(details.notes ?? "");
  }, [details?.notes]);

  // MRR = sum of monthly recurring fees for each owned package (one per package).
  // Payments = sum of all paid one-time purchases for this user.
  const { data: amounts, isLoading: amountsLoading } = useQuery({
    queryKey: ["admin", "client-amounts", row?.id, row?.user_id],
    enabled: !!row?.id,
    queryFn: async () => {
      const { data: pkgs } = await supabase
        .from("packages")
        .select("name, tier")
        .eq("client_id", row!.id);
      const mrr = (pkgs ?? []).reduce((sum, p: any) => sum + monthlyForPackage(p), 0);

      // Source of truth = invoices table (covers both checkout purchases
      // and Stripe-hosted invoice payments).
      const { data: invs } = await supabase
        .from("invoices")
        .select("status, amount_cents")
        .eq("client_id", row!.id);
      let payments = 0;
      let overdue = 0;
      let refunded = 0;
      for (const inv of invs ?? []) {
        const cents = (inv as any).amount_cents ?? 0;
        const status = (inv as any).status;
        if (status === "paid" || status === "partially_refunded") payments += cents;
        if (status === "overdue") overdue += cents;
        if (status === "refunded" || status === "partially_refunded") refunded += cents;
      }
      return { mrr, payments, overdue, refunded };
    },
  });
  const computedMrrCents = amounts?.mrr ?? 0;
  const computedPaymentsCents = amounts?.payments ?? 0;
  const computedOverdueCents = amounts?.overdue ?? 0;
  const computedRefundedCents = amounts?.refunded ?? 0;
  const mrrLoading = amountsLoading;

  // Persist computed MRR back to clients.mrr_cents whenever it changes.
  useEffect(() => {
    if (!row?.id || mrrLoading) return;
    if (computedMrrCents === row.mrr_cents) return;
    supabase.from("clients").update({ mrr_cents: computedMrrCents }).eq("id", row.id).then(() => {
      qc.invalidateQueries({ queryKey: ["admin", "clients"] });
    });
  }, [computedMrrCents, row?.id, row?.mrr_cents, mrrLoading, qc]);

  const profile = details?.profile;
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() || row?.contact_name || "—";
  const business = profile?.business_name || (profile?.account_type === "business" ? row?.name : null) || "—";
  const phone = profile?.phone || "—";
  const pkgNames = (details?.packages ?? []).map((p) => p.name);

  const save = useMutation({
    mutationFn: async () => {
      if (row) {
        const payload = {
          status,
          notes: notes.trim() || null,
        };
        const { error } = await supabase.from("clients").update(payload).eq("id", row.id);
        if (error) throw error;
        await logActivity({ entity_type: "client", entity_id: row.id, action: "update", summary: `Updated client ${row.name}` });
      } else {
        if (!selectedUserId) throw new Error("Select a user");
        if (!selectedUser) throw new Error("Selected user not found");
        // Look up email from existing auth user via RPC-less workaround: read from any related row.
        // Email is auto-filled by sync_client_name_from_profile trigger when profile changes,
        // but for a brand-new admin-created client we need to insert with what we have.
        const derivedName =
          selectedUser.account_type === "business" && selectedUser.business_name
            ? selectedUser.business_name
            : [selectedUser.first_name, selectedUser.last_name].filter(Boolean).join(" ").trim() ||
              selectedUser.display_name ||
              "Customer";
        const contactName = [selectedUser.first_name, selectedUser.last_name].filter(Boolean).join(" ").trim() || null;
        const payload = {
          user_id: selectedUserId,
          name: derivedName,
          contact_name: contactName,
          status,
          notes: notes.trim() || null,
        };
        const { data, error } = await supabase.from("clients").insert(payload).select("id").single();
        if (error) throw error;
        await logActivity({ entity_type: "client", entity_id: data.id, action: "create", summary: `Added client ${derivedName}` });
        supabase.functions.invoke("notify-event", {
          body: { kind: "new_client", entity_id: data.id },
        }).catch(() => {});
      }
    },
    onSuccess: () => {
      toast.success(row ? "Client updated." : "Client added.");
      qc.invalidateQueries({ queryKey: ["admin", "clients"] });
      qc.invalidateQueries({ queryKey: ["admin", "overview"] });
      qc.invalidateQueries({ queryKey: ["admin", "users-without-client"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent hideClose className="sm:max-w-lg border-2 border-white/15 bg-card text-foreground max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{row ? "Edit Client" : "New Client"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        {row && (
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Full name</p>
              <p className="text-sm mt-0.5">{fullName}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Business</p>
              <p className="text-sm mt-0.5">{business}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Email</p>
              <p className="text-sm mt-0.5 truncate">{row.email || "—"}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Phone</p>
              <p className="text-sm mt-0.5">{phone}</p>
            </div>
            <div className="col-span-2">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Plan / Packages</p>
              {pkgNames.length > 0 ? (
                <ul className="text-sm mt-0.5 space-y-0.5">
                  {pkgNames.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              ) : (
                <p className="text-sm mt-0.5">{row.plan || "—"}</p>
              )}
            </div>
          </div>
        )}

        {!row && (
          <>
            <div>
              <Label>User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={usersLoading}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={usersLoading ? "Loading users…" : "Select an existing user"} />
                </SelectTrigger>
                <SelectContent>
                  {(availableUsers ?? []).length === 0 ? (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">No eligible users — every signed-up user is already a client.</div>
                  ) : (
                    (availableUsers ?? []).map((u) => {
                      const label =
                        [u.first_name, u.last_name].filter(Boolean).join(" ").trim() ||
                        u.display_name ||
                        u.business_name ||
                        u.id.slice(0, 8);
                      const sub = u.business_name && u.account_type === "business" ? ` · ${u.business_name}` : "";
                      return (
                        <SelectItem key={u.id} value={u.id}>
                          {label}{sub}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px] text-muted-foreground">Profile info syncs automatically from the user's account.</p>
            </div>

            {selectedUser && (
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Full name</p>
                  <p className="text-sm mt-0.5">{newFullName}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Business</p>
                  <p className="text-sm mt-0.5">{newBusiness}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Phone</p>
                  <p className="text-sm mt-0.5">{newPhone}</p>
                </div>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              Add custom packages for this client from the <span className="font-medium text-foreground">Packages</span> page after creating them.
            </p>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          {row && (
            <>
              <div>
                <Label>Payments</Label>
                <div className="mt-1.5 h-10 flex items-center px-3 rounded-md border border-white/10 bg-white/[0.03] text-sm font-medium tabular-nums">
                  {mrrLoading ? "Calculating…" : formatCents(computedPaymentsCents)}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Sum of one-time package payments.</p>
              </div>
              <div>
                <Label>MRR</Label>
                <div className="mt-1.5 h-10 flex items-center px-3 rounded-md border border-white/10 bg-white/[0.03] text-sm font-medium tabular-nums">
                  {mrrLoading ? "Calculating…" : formatCents(computedMrrCents)}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Sum of monthly recurring subscriptions.</p>
              </div>
              <div>
                <Label>Overdue</Label>
                <div className={`mt-1.5 h-10 flex items-center px-3 rounded-md border border-white/10 bg-white/[0.03] text-sm font-medium tabular-nums ${computedOverdueCents > 0 ? "text-red-400" : ""}`}>
                  {mrrLoading ? "Calculating…" : formatCents(computedOverdueCents)}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Total unpaid past-due invoices.</p>
              </div>
              <div>
                <Label>Refunded</Label>
                <div className={`mt-1.5 h-10 flex items-center px-3 rounded-md border border-white/10 bg-white/[0.03] text-sm font-medium tabular-nums ${computedRefundedCents > 0 ? "text-red-400" : ""}`}>
                  {mrrLoading ? "Calculating…" : formatCents(computedRefundedCents)}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Total refunded (full or partial).</p>
              </div>
            </>
          )}
          <div className={row ? "col-span-2" : "col-span-2"}>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ClientStatus)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[
                  { v: "active", l: "Active" },
                  { v: "onboarding", l: "Onboarding" },
                  { v: "paused", l: "Paused" },
                  { v: "churned", l: "Churned" },
                ].map((p) => <SelectItem key={p.v} value={p.v}>{p.l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1.5"
            rows={4}
            maxLength={2000}
            placeholder="Internal notes about this client…"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose} className="hover:bg-white/10 hover:text-white">Cancel</Button>
        <Button
          variant="hero"
          onClick={() => save.mutate()}
          disabled={save.isPending || (!row && !selectedUserId)}
        >
          {save.isPending ? "Saving…" : row ? "Save" : "Create"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default function AdminClients() {
  const qc = useQueryClient();
  const { data: clients, isLoading } = useClients();
  const userIds = (clients ?? []).map((c) => c.user_id).filter((x): x is string => !!x);
  const clientIds = (clients ?? []).map((c) => c.id);
  const { data: profilesMap } = useProfilesMap(userIds);
  const { data: packagesMap } = usePackagesMap(clientIds);
  const { data: pkgAmountsMap } = usePackageAmountsMap(clientIds);
  const { data: paymentsMap } = usePaymentsMap(clientIds);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [deleting, setDeleting] = useState<ClientRow | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useDeepLinkOpen<ClientRow>({ rows: clients, onOpen: setEditing });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      await logActivity({ entity_type: "client", entity_id: id, action: "delete", summary: "Deleted client" });
    },
    onSuccess: () => {
      toast.success("Client deleted.");
      qc.invalidateQueries({ queryKey: ["admin", "clients"] });
      setDeleting(null);
      setDeleteConfirm("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Persist computed MRR back to clients.mrr_cents whenever a discrepancy
  // is detected, so legacy values stay in sync with the package-derived total.
  useEffect(() => {
    if (!pkgAmountsMap || !clients) return;
    clients.forEach((c) => {
      const computed = pkgAmountsMap[c.id] ?? 0;
      if (computed !== c.mrr_cents) {
        supabase.from("clients").update({ mrr_cents: computed }).eq("id", c.id).then(() => {
          qc.invalidateQueries({ queryKey: ["admin", "clients"] });
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkgAmountsMap, clients]);

  const filtered = (clients ?? []).filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search && !`${c.name} ${c.contact_name ?? ""} ${c.email ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminPage
      eyebrow="Clients"
      title="Client Roster"
      description="Every client across all plans and packages."
      actions={
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><Plus className="w-3.5 h-3.5" />New Client</Button>
          </DialogTrigger>
          {creating && <ClientDialog onClose={() => setCreating(false)} />}
        </Dialog>
      }
    >
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients…" className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="churned">Churned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="text-left font-normal px-4 py-3">Full name</th>
                <th className="text-left font-normal px-4 py-3">Business</th>
                <th className="text-left font-normal px-4 py-3">Plans</th>
                <th className="text-left font-normal px-4 py-3">Payments</th>
                <th className="text-left font-normal px-4 py-3">MRR</th>
                <th className="text-left font-normal px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No clients yet. Click "New Client" to add one.</td></tr>
              ) : filtered.map((c) => {
                const profile = c.user_id ? profilesMap?.[c.user_id] : null;
                const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim()
                  || c.contact_name
                  || "—";
                const business = profile?.business_name || (profile?.account_type === "business" ? c.name : null) || "—";
                const pkgs = packagesMap?.[c.id] ?? [];
                const planLabel = pkgs.length > 0 ? String(pkgs.length) : "—";
                const mrrCents = pkgAmountsMap?.[c.id] ?? c.mrr_cents;
                const paymentsCents = paymentsMap?.[c.id] ?? 0;
                return (
                <tr key={c.id} className="border-t border-white/[0.04] odd:bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer" onClick={() => setEditing(c)}>
                  <td className="px-4 py-3 font-medium">{fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{business}</td>
                  <td className="px-4 py-3 text-muted-foreground">{planLabel}</td>
                  <td className="px-4 py-3 text-left font-medium">{formatCents(paymentsCents)}</td>
                  <td className="px-4 py-3 text-left font-medium">{formatCents(mrrCents)}</td>
                  <td className="px-4 py-3"><StatusBadge tone={statusTone(c.status)}>{c.status}</StatusBadge></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="hover:bg-red-500/10 group" onClick={(e) => { e.stopPropagation(); setDeleting(c); setDeleteConfirm(""); }}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-400" />
                    </Button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && <ClientDialog row={editing} onClose={() => setEditing(null)} />}
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => { if (!o) { setDeleting(null); setDeleteConfirm(""); } }}>
        {deleting && (
          <DialogContent hideClose className="sm:max-w-md border-2 border-white/15 bg-card text-foreground">
            <DialogHeader>
              <DialogTitle>Delete client</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This permanently deletes <span className="font-medium text-foreground">{deleting.name}</span> and cannot be undone.
              </p>
              <div>
                <Label>Type <span className="font-mono text-foreground">{deleting.name}</span> to confirm</Label>
                <Input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder={deleting.name}
                  className="mt-1.5"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => { setDeleting(null); setDeleteConfirm(""); }}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={deleteConfirm.trim() !== deleting.name || remove.isPending}
                onClick={() => remove.mutate(deleting.id)}
              >
                {remove.isPending ? "Deleting…" : "Delete client"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </AdminPage>
  );
}
