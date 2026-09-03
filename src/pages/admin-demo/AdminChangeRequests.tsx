import { AdminPage } from "@/components/admin/AdminPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminChangeRequests, type ChangeStatus } from "@/data/admin";

const statusTone = (s: ChangeStatus) =>
  s === "new" ? "secondary" : s === "in_review" ? "primary" : "success";

const priorityTone = (p: "low" | "med" | "high") =>
  p === "high" ? "danger" : p === "med" ? "warn" : "muted";

export default function AdminChangeRequests() {
  return (
    <AdminPage
      eyebrow="Change requests"
      title="Inbound Requests"
      description="Tweaks, additions, and edits clients have asked for."
    >
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="text-left font-normal px-4 py-3">Request</th>
                <th className="text-left font-normal px-4 py-3">Client</th>
                <th className="text-left font-normal px-4 py-3">Package</th>
                <th className="text-left font-normal px-4 py-3">Priority</th>
                <th className="text-left font-normal px-4 py-3">Status</th>
                <th className="text-left font-normal px-4 py-3">Owner</th>
                <th className="text-left font-normal px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {adminChangeRequests.map((cr) => (
                <tr
                  key={cr.id}
                  className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{cr.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cr.client}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cr.package}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={priorityTone(cr.priority)}>{cr.priority}</StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={statusTone(cr.status)}>
                      {cr.status.replace("_", " ")}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{cr.owner}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cr.submitted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPage>
  );
}
