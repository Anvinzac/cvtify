import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { SignInDialog } from "@/components/auth/SignInDialog";

interface AuthState {
  session: Session | null;
  credits: number | null;
  refreshCredits: () => Promise<void>;
  setCredits: (n: number) => void;
  /** Opens the sign-in dialog. Resolves true if the user ends up signed in. */
  requireSignIn: (reason?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [prompt, setPrompt] = useState<{ reason?: string; resolve: (ok: boolean) => void } | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const refreshCredits = useCallback(async () => {
    if (!session) { setCredits(null); return; }
    const { data } = await supabase.from("user_credits").select("balance").eq("user_id", session.user.id).maybeSingle();
    setCredits(data?.balance ?? 0);
  }, [session]);

  useEffect(() => { void refreshCredits(); }, [refreshCredits]);

  useEffect(() => {
    if (session && prompt) { prompt.resolve(true); setPrompt(null); }
  }, [session, prompt]);

  const requireSignIn = useCallback((reason?: string) => {
    if (session) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => setPrompt({ reason, resolve }));
  }, [session]);

  const signOut = useCallback(async () => { await supabase.auth.signOut(); }, []);

  return (
    <AuthContext.Provider value={{ session, credits, refreshCredits, setCredits, requireSignIn, signOut }}>
      {children}
      {prompt && (
        <SignInDialog reason={prompt.reason} onClose={() => { prompt.resolve(false); setPrompt(null); }} />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider is required.");
  return ctx;
}
