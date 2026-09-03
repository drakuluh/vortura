import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPage } from "@/components/admin/AdminPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminPackages, type PackageStatus } from "@/data/admin";

const statusTone = (s: PackageStatus) =>
  s === "active" ? "success" : s === "in_progress" ? "primary" : s === "review" ? "secondary" : "warn";

export default function AdminPackages() {
  return (
    <AdminPage
      eyebrow="Packages"
      title="Active Builds"
      description="Every automation package across all clients."
      actions={
        <Button variant="hero" size="sm">
          <Plus className="w-3.5 h-3.5" />
          New package
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
        {adminPackages.map((p) => (
          <div
            key={p.id}
            className="glass rounded-2xl p-5 flex flex-col hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
                  {p.client}
                </p>
                <h3 className="text-base font-semibold leading-tight">{p.name}</h3>
              </div>
              <StatusBadge tone={statusTone(p.status)}>{p.status.replace("_", " ")}</StatusBadge>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
                <span>Progress</span>
                <span>{p.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    p.accent === "primary"
                      ? "bg-gradient-to-r from-primary to-primary-glow"
                      : "bg-gradient-to-r from-secondary to-secondary-glow"
                  }`}
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <span>{p.engineer}</span>
              <span>{p.due}</span>
            </div>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
