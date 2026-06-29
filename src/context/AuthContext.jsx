import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signUp(email, password) {
    if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured.' } };
    return supabase.auth.signUp({ email, password });
  }

  async function signIn(email, password) {
    if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured.' } };
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  }

  const value = { session, user, loading, signUp, signIn, signOut, isSupabaseConfigured };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
