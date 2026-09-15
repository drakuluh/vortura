/**
 * Loads the Supabase client on demand. The client is about 50 KB gzipped and
 * most marketing-page visits never need it, so code on those pages imports
 * this instead of "./client". Dashboard and admin code, which always needs
 * it, can keep importing the client directly.
 */
export const loadSupabase = () => import("./client").then((m) => m.supabase);
