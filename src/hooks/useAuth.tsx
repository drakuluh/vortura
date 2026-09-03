import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthSnapshot = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const listeners = new Set<(state: AuthSnapshot) => void>();
let authState: AuthSnapshot = { session: null, user: null, loading: true };
let initStarted = false;

const setAuthState = (next: AuthSnapshot) => {
  authState = next;
  listeners.forEach((listener) => listener(authState));
};

const initAuth = () => {
  if (initStarted) return;
  initStarted = true;

  // IMPORTANT: set up listener BEFORE getSession
  supabase.auth.onAuthStateChange((_event, newSession) => {
    setAuthState({
      session: newSession,
      user: newSession?.user ?? null,
      loading: false,
    });
  });

  supabase.auth.getSession().then(({ data: { session: existing } }) => {
    setAuthState({
      session: existing,
      user: existing?.user ?? null,
      loading: false,
    });
  });
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
    await supabase.auth.signOut();
  };

  return { ...state, signOut };
};