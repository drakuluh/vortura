import { useState } from "react";
import { Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPage } from "@/components/admin/AdminPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminClients, type AdminClient } from "@/data/admin";

const statusTone = (s: AdminClient["status"]) =>
  s === "active" ? "success" : s === "onboarding" ? "primary" : s === "paused" ? "warn" : "danger";

const healthTone = (h: AdminClient["health"]) =>
  h === "healthy" ? "success" : h === "watch" ? "warn" : "danger";

export default function AdminClients() {
  const [query, setQuery] = useState("");
  const filtered = adminClients.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.contact.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AdminPage
      eyebrow="Clients"
      title="All Clients"
      description="Every client account, plan, and health signal."
      actions={
        <>
          <Button variant="glass" size="sm">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </Button>
          <Button variant="hero" size="sm">
            <Plus className="w-3.5 h-3.5" />
            New client
          </Button>
        </>
      }
    >
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients…"
              className="w-full h-9 pl-9 pr-3 rounded-md bg-white/[0.03] border border-white/[0.06] text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground ml-auto">
            {filtered.length} of {adminClients.length}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="text-left font-normal px-4 py-3">Client</th>
                <th className="text-left font-normal px-4 py-3">Plan</th>
                <th className="text-left font-normal px-4 py-3">Status</th>
                <th className="text-left font-normal px-4 py-3">Health</th>
                <th className="text-right font-normal px-4 py-3">MRR</th>
                <th className="text-left font-normal px-4 py-3">Packages</th>
                <th className="text-left font-normal px-4 py-3">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-xs font-semibold shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{c.name}</p>
                        <p className="font-mono text-[11px] text-muted-foreground truncate">
                          {c.contact} · {c.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.plan}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={statusTone(c.status)}>{c.status}</StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={healthTone(c.health)}>
                      {c.health.replace("_", " ")}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    ${c.mrr.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.packages}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.joined}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
                      aria-label="Actions"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPage>
  );
}
