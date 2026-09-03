import { useState } from "react";
import { Trash2, ShieldCheck } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminPage } from "@/components/admin/AdminPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Role = "admin" | "support" | "user";

interface RoleRow { id: string; user_id: string; role: Role; created_at: string }
interface Profile { id: string; display_name: string | null }

export default function AdminTeam() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "team"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("*").order("created_at");
      const userIds = Array.from(new Set((roles ?? []).map((r) => r.user_id)));
      const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
      return { roles: (roles ?? []) as RoleRow[], profiles: (profiles ?? []) as Profile[] };
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const { error } = await supabase.from("user_roles").update({ role }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Role updated."); qc.invalidateQueries({ queryKey: ["admin", "team"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Removed."); qc.invalidateQueries({ queryKey: ["admin", "team"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  // Group: only show admin/support rows
  const teamRoles = (data?.roles ?? []).filter((r) => r.role === "admin" || r.role === "support");
  const profileMap = new Map((data?.profiles ?? []).map((p) => [p.id, p]));

  return (
    <AdminPage
      eyebrow="Team"
      title="Workspace Team"
      description="Admins and support staff with access to the control room."
    >
      <div className="glass rounded-2xl p-5 mb-5">
        <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-2">// How to add team members</p>
        <p className="text-sm text-muted-foreground">
          Have your teammate sign up at <code className="px-1.5 py-0.5 rounded bg-white/[0.04] text-xs">/login</code>. Once they have an account, paste their user ID below to grant access.
          (Email-based invites coming next.)
        </p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="text-left font-normal px-4 py-3">Member</th>
                <th className="text-left font-normal px-4 py-3">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              ) : teamRoles.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No admins or support users yet.</td></tr>
              ) : teamRoles.map((r) => {
                const profile = profileMap.get(r.user_id);
                const isMe = r.user_id === user?.id;
                return (
                  <tr key={r.id} className="border-t border-white/[0.04] odd:bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium flex items-center gap-2">
                        {profile?.display_name ?? "—"}
                        {isMe && <StatusBadge tone="primary">You</StatusBadge>}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground truncate">{r.user_id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={r.role} onValueChange={(v) => update.mutate({ id: r.id, role: v as Role })} disabled={isMe}>
                        <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" disabled={isMe} onClick={() => { if (confirm("Remove this team member?")) remove.mutate(r.id); }}>
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <GrantAccessForm onDone={() => qc.invalidateQueries({ queryKey: ["admin", "team"] })} />
    </AdminPage>
  );
}

const GrantAccessForm = ({ onDone }: { onDone: () => void }) => {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<Role>("admin");

  const grant = useMutation({
    mutationFn: async () => {
      if (!userId.trim()) throw new Error("User ID required");
      const { error } = await supabase.from("user_roles").insert({ user_id: userId.trim(), role });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Access granted."); setUserId(""); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="glass rounded-2xl p-5 mt-5">
      <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-3">// Grant access</p>
      <div className="flex flex-col md:flex-row gap-2">
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID (UUID)"
          className="flex-1 h-10 px-3 rounded-md bg-white/[0.03] border border-white/[0.06] text-sm font-mono"
        />
        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
          <SelectTrigger className="md:w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="hero" onClick={() => grant.mutate()} disabled={grant.isPending}>
          <ShieldCheck className="w-3.5 h-3.5" />Grant
        </Button>
      </div>
    </div>
  );
};
