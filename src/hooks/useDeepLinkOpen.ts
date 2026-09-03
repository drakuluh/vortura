import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Reads a query param (default `id`) and, when the matching row appears in
 * `rows`, calls `onOpen(row)` and strips the param from the URL.
 * Used to deep-link from Slack notifications into the right record.
 */
export function useDeepLinkOpen<T extends { id: string }>({
  rows,
  onOpen,
  param = "id",
}: {
  rows: T[] | undefined;
  onOpen: (row: T) => void;
  param?: string;
}) {
  const [params, setParams] = useSearchParams();
  const target = params.get(param);

  useEffect(() => {
    if (!target || !rows) return;
    const match = rows.find((r) => r.id === target);
    if (!match) return;
    onOpen(match);
    const next = new URLSearchParams(params);
    next.delete(param);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, rows]);
}