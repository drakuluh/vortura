/**
 * Plain-fetch calls to Supabase for signed-out visitors. The marketing pages
 * deliberately avoid loading the ~50 KB Supabase client for guests (see
 * useAuth), so the contact form and booking calendar use these instead.
 * Signed-in users pass their access token so functions know who they are.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public fields?: Record<string, string>,
  ) {
    super(code);
  }
}

async function request<T>(path: string, body: unknown, accessToken?: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${accessToken ?? ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data?.error ?? "request_failed", data?.fields);
  return data as T;
}

/** Call an edge function. */
export const callFunction = <T = { ok: true }>(name: string, body: unknown, accessToken?: string) =>
  request<T>(`/functions/v1/${name}`, body, accessToken);

/** Call a Postgres function exposed through PostgREST. */
export const callRpc = <T>(name: string, args: Record<string, unknown>) =>
  request<T>(`/rest/v1/rpc/${name}`, args);

/** The signed-in user's access token, loading the Supabase client only if needed. */
export async function currentAccessToken(): Promise<string | undefined> {
  const { loadSupabase } = await import("@/integrations/supabase/load");
  const supabase = await loadSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}
