/**
 * AuthContext — manages authentication state across the app.
 *
 * Wraps the entire app and provides:
 * - Current session/user from Supabase Auth
 * - signUp, signIn, signOut, resetPassword functions
 * - signInWithOAuth and signInWithSSO for provider-based auth
 * - Loading state while the session is being restored
 *
 * Uses Supabase's onAuthStateChange to stay in sync automatically —
 * no polling or manual token management needed.
 *
 * IMPORTANT: Never log tokens or session objects to the console in production.
 * They could leak into error-tracking tools (Sentry, LogRocket, etc.).
 */
"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Session, User, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: AuthError | null }>;
  signInWithSSO: (domain: string) => Promise<{ error: AuthError | null; data: { url: string } | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore any existing session on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    // Subscribe to auth state changes (login, logout, token refresh)
    // This is the correct Supabase pattern — it fires automatically when:
    // - User signs in or signs out
    // - Token is refreshed (Supabase refreshes tokens before they expire)
    // - User's email/phone is confirmed
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setLoading(false);
      }
    );

    // Cleanup: unsubscribe on unmount to avoid memory leaks.
    // Without this, the listener would keep firing after the component
    // is removed, potentially causing "setState on unmounted component" warnings.
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // raw_user_meta_data is what the backend Step 3 trigger reads
        // to populate the profiles table. The field name MUST match
        // what the trigger expects (full_name).
        data: { full_name: fullName },
      },
    });
    return { error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // After OAuth completes, Supabase redirects back to this URL
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  }, []);

  const signInWithSSO = useCallback(async (domain: string) => {
    const { data, error } = await supabase.auth.signInWithSSO({ domain });
    return { error, data: data ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signUp,
        signIn,
        signInWithOAuth,
        signInWithSSO,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  // During SSR/prerendering, context may be undefined because
  // the AuthProvider hasn't mounted yet. Return safe defaults
  // instead of throwing, so static pages can prerender without error.
  if (context === undefined) {
    return {
      session: null,
      user: null,
      loading: true,
      signUp: async () => ({ error: null }),
      signIn: async () => ({ error: null }),
      signInWithOAuth: async () => ({ error: null }),
      signInWithSSO: async () => ({ error: null, data: null }),
      signOut: async () => {},
      resetPassword: async () => ({ error: null }),
    };
  }
  return context;
}
