import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { loadSupabase } from "@/integrations/supabase/load";

type AuthSnapshot = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const listeners = new Set<(state: AuthSnapshot) => void>();
let initStarted = false;

const setAuthState = (next: AuthSnapshot) => {
  authState = next;
  listeners.forEach((listener) => listener(authState));
};

/**
 * True when the visitor can't be signed in yet: no saved Supabase session,
 * no auth callback in the URL, and not inside a Lovable preview frame (which
 * keeps the session elsewhere). Then auth can resolve to "signed out"
 * immediately and the Supabase client can load later, off the critical path.
 */
const certainlySignedOut = () => {
  try {
    if (window.parent !== window) return false;
    const { hash, search } = window.location;
    if (/access_token|refresh_token|error_description/.test(hash) || /[?&](code|token_hash|type)=/.test(search)) {
      return false;
    }
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("sb-") && key.endsWith("-auth-token")) return false;
    }
    return true;
  } catch {
    return false;
  }
};

// Known up front where possible, so the first render is already right:
// the build-time prerender and signed-out visitors render the guest view
// immediately instead of a loading state.
let authState: AuthSnapshot =
  typeof window === "undefined" || certainlySignedOut()
    ? { session: null, user: null, loading: false }
    : { session: null, user: null, loading: true };

let subscribed = false;

const subscribe = async () => {
  if (subscribed) return;
  subscribed = true;
  const supabase = await loadSupabase();

  // IMPORTANT: set up listener BEFORE getSession
  supabase.auth.onAuthStateChange((_event, newSession) => {
    setAuthState({
      session: newSession,
      user: newSession?.user ?? null,
      loading: false,
    });
  });

  const { data: { session: existing } } = await supabase.auth.getSession();
  setAuthState({
    session: existing,
    user: existing?.user ?? null,
    loading: false,
  });
};

const initAuth = () => {
  if (initStarted) return;
  initStarted = true;

  if (certainlySignedOut()) {
    setAuthState({ session: null, user: null, loading: false });
    // Nothing can sign this visitor in except the sign-in pages (which call
    // ensureAuthListener) or another tab, which writes the session key.
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("sb-") && e.key.endsWith("-auth-token")) {
        window.removeEventListener("storage", onStorage);
        void subscribe();
      }
    };
    window.addEventListener("storage", onStorage);
  } else {
    void subscribe();
  }
};

/**
 * Pages that can sign someone in (login, password reset) call this on mount
 * so the shared auth state hears about it. Elsewhere, signed-out visitors
 * never download the Supabase client.
 */
export const ensureAuthListener = () => {
  initAuth();
  void subscribe();
};

export const useAuth = () => {
  const [state, setState] = useState<AuthSnapshot>(authState);

  useEffect(() => {
    listeners.add(setState);
    initAuth();

    return () => {
      listeners.delete(setState);
    };
  }, []);

  const signOut = async () => {
    const supabase = await loadSupabase();
    await supabase.auth.signOut();
  };

  return { ...state, signOut };
};