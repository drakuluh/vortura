import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PackageUpdateAttachment {
  id: string;
  update_id: string;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

export interface PackageUpdate {
  id: string;
  package_id: string;
  author_user_id: string;
  title: string;
  body: string;
  status_change: string | null;
  progress_change: number | null;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  attachments: PackageUpdateAttachment[];
}

export const usePackage = (packageId: string | undefined) =>
  useQuery({
    queryKey: ["package", packageId],
    enabled: !!packageId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*, clients(id, name, user_id)")
        .eq("id", packageId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const usePackageUpdates = (packageId: string | undefined) => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["package-updates", packageId],
    enabled: !!packageId,
    queryFn: async () => {
      const { data: updates, error } = await supabase
        .from("package_updates")
        .select("*")
        .eq("package_id", packageId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const ids = (updates ?? []).map((u) => u.id);
      let attachments: PackageUpdateAttachment[] = [];
      if (ids.length > 0) {
        const { data: atts } = await supabase
          .from("package_update_attachments")
          .select("*")
          .in("update_id", ids);
        attachments = (atts ?? []) as PackageUpdateAttachment[];
      }
      return ((updates ?? []) as Omit<PackageUpdate, "attachments">[]).map((u) => ({
        ...u,
        attachments: attachments.filter((a) => a.update_id === u.id),
      })) as PackageUpdate[];
    },
  });

  useEffect(() => {
    if (!packageId) return;
    const channel = supabase
      .channel(`package-updates-${packageId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "package_updates", filter: `package_id=eq.${packageId}` },
        () => qc.invalidateQueries({ queryKey: ["package-updates", packageId] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "package_update_attachments" },
        () => qc.invalidateQueries({ queryKey: ["package-updates", packageId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [packageId, qc]);

  return query;
};

/** Counts unread updates per package for the current user. */
export const usePackageUnreadCounts = (packageIds: string[] | undefined) => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["package-unread-counts", user?.id, packageIds?.sort().join(",")],
    enabled: !!user?.id && !!packageIds && packageIds.length > 0,
    queryFn: async () => {
      const { data: updates } = await supabase
        .from("package_updates")
        .select("id, package_id")
        .in("package_id", packageIds!);
      const all = (updates ?? []) as { id: string; package_id: string }[];
      if (all.length === 0) return {} as Record<string, number>;

      const { data: reads } = await supabase
        .from("package_update_reads")
        .select("update_id")
        .eq("user_id", user!.id)
        .in("update_id", all.map((u) => u.id));
      const readSet = new Set((reads ?? []).map((r) => r.update_id));

      const counts: Record<string, number> = {};
      for (const u of all) {
        if (!readSet.has(u.id)) counts[u.package_id] = (counts[u.package_id] ?? 0) + 1;
      }
      return counts;
    },
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`package-unread-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "package_updates" },
        () => qc.invalidateQueries({ queryKey: ["package-unread-counts", user.id] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "package_update_reads", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["package-unread-counts", user.id] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, qc]);

  return query;
};

/** Marks every given update as read for the current user (idempotent). */
export const markUpdatesRead = async (userId: string, updateIds: string[]) => {
  if (updateIds.length === 0) return;
  const rows = updateIds.map((update_id) => ({ update_id, user_id: userId }));
  await supabase.from("package_update_reads").upsert(rows, { onConflict: "update_id,user_id" });
};