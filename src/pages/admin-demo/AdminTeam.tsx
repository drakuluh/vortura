import { useState } from "react";
import { Mail, MoreHorizontal, Plus, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPage } from "@/components/admin/AdminPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminUsers, type AdminRole, type AdminUser } from "@/data/admin";
import { toast } from "@/hooks/use-toast";

const roleOptions: AdminRole[] = ["owner", "admin", "support"];

const roleTone = (r: AdminRole) =>
  r === "owner" ? "primary" : r === "admin" ? "secondary" : "muted";

export default function AdminTeam() {
  const [team, setTeam] = useState<AdminUser[]>(adminUsers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRole>("admin");

  const updateRole = (id: string, role: AdminRole) => {
    setTeam((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast({ title: "Role updated", description: `New role: ${role}` });
  };

  const remove = (id: string) => {
    setTeam((prev) => prev.filter((u) => u.id !== id));
    toast({ title: "Removed from team" });
  };

  const sendInvite = () => {
    if (!inviteEmail.trim()) return;
    setTeam((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: inviteEmail,
        email: inviteEmail,
        role: inviteRole,
        lastActive: "—",
        invited: true,
      },
    ]);
    toast({ title: "Invite sent", description: inviteEmail });
    setInviteEmail("");
    setInviteOpen(false);
  };

  return (
    <AdminPage
      eyebrow="Team"
      title="Admins & Support"
      description="Anyone here can sign in to /admin. Owner can promote, demote, or remove members."
      actions={
        <Button variant="hero" size="sm" onClick={() => setInviteOpen((v) => !v)}>
          <UserPlus className="w-3.5 h-3.5" />
          Invite admin
        </Button>
      }
    >
      {inviteOpen && (
        <div className="glass rounded-2xl p-4 md:p-5 mb-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-3">
            // Invite a new admin
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@yourcompany.com"
                className="w-full h-10 pl-9 pr-3 rounded-md bg-white/[0.03] border border-white/[0.06] text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as AdminRole)}
              className="h-10 px-3 rounded-md bg-white/[0.03] border border-white/[0.06] text-sm focus:outline-none focus:border-primary/40 transition-colors"
            >
              {roleOptions
                .filter((r) => r !== "owner")
                .map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
            </select>
            <Button variant="hero" size="default" onClick={sendInvite}>
              <Plus className="w-3.5 h-3.5" />
              Send invite
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            They'll receive an email with a sign-up link. Until they accept, they appear as
            "invited".
          </p>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="text-left font-normal px-4 py-3">Member</th>
                <th className="text-left font-normal px-4 py-3">Role</th>
                <th className="text-left font-normal px-4 py-3">Status</th>
                <th className="text-left font-normal px-4 py-3">Last active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {team.map((u) => {
                const isOwner = u.role === "owner";
                return (
                  <tr
                    key={u.id}
                    className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-gradient-purple flex items-center justify-center text-xs font-semibold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{u.name}</p>
                          <p className="font-mono text-[11px] text-muted-foreground truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isOwner ? (
                        <StatusBadge tone={roleTone(u.role)}>{u.role}</StatusBadge>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value as AdminRole)}
                          className="h-8 px-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-xs focus:outline-none focus:border-primary/40 transition-colors"
                        >
                          {roleOptions
                            .filter((r) => r !== "owner")
                            .map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.invited ? (
                        <StatusBadge tone="warn">Invited</StatusBadge>
                      ) : (
                        <StatusBadge tone="success">Active</StatusBadge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.lastActive}</td>
                    <td className="px-4 py-3 text-right">
                      {isOwner ? (
                        <button
                          type="button"
                          disabled
                          className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground/40 cursor-not-allowed"
                          aria-label="Owner cannot be removed"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => remove(u.id)}
                          className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          aria-label="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
        <RoleCard
          name="Owner"
          tone="primary"
          desc="Full access. Can manage billing, invite or remove admins, and delete the workspace."
        />
        <RoleCard
          name="Admin"
          tone="secondary"
          desc="Manage clients, packages, invoices, and respond to messages and change requests."
        />
        <RoleCard
          name="Support"
          tone="muted"
          desc="Read-only access plus the ability to reply to messages."
        />
      </div>
    </AdminPage>
  );
}

const RoleCard = ({
  name,
  desc,
  tone,
}: {
  name: string;
  desc: string;
  tone: "primary" | "secondary" | "muted";
}) => (
  <div className="glass rounded-2xl p-4">
    <StatusBadge tone={tone}>{name}</StatusBadge>
    <p className="text-sm text-muted-foreground leading-relaxed mt-2.5">{desc}</p>
  </div>
);
