import type { Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { supabase, isAuthConfigured } from '@/lib/supabase';
import { AUTH_REDIRECT_URLS } from '@/lib/auth-redirects';
import { getMe, updateDisplayName } from '@/services/account';
import { authStorage, PENDING_DISPLAY_NAME_KEY } from '@/services/auth-storage';
import type { AccountProfile } from '@/types/account';
import { unlinkAccountDeviceBeforeSignOut } from '@/services/account-device-link';

type Value = {
  user: User | null; session: Session | null; profile: AccountProfile | null;
  isRestoring: boolean; isAuthenticated: boolean; isConfigured: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(name: string, email: string, password: string): Promise<{ confirmationRequired: boolean }>;
  signOut(): Promise<void>; sendPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>; refreshProfile(): Promise<void>;
  handleRecoveryUrl(url: string): Promise<boolean>;
};
const Context = createContext<Value | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const mounted = useRef(true);
  const loadProfile = useCallback(async (next: Session) => {
    try {
      let me = await getMe(next.access_token);
      const pending = await authStorage.getItem(PENDING_DISPLAY_NAME_KEY);
      if (pending) {
        me = { ...me, profile: await updateDisplayName(next.access_token, pending) };
        await authStorage.removeItem(PENDING_DISPLAY_NAME_KEY);
      }
      if (mounted.current) setProfile(me.profile);
    } catch { /* Offline/backend failure does not invalidate the session. */ }
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!supabase) { setIsRestoring(false); return () => { mounted.current = false; }; }
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted.current) return;
      setSession(next); if (next) void loadProfile(next); else setProfile(null);
    });
    void supabase.auth.getSession().then(({ data: current }) => {
      if (!mounted.current) return;
      setSession(current.session); if (current.session) void loadProfile(current.session);
    }).finally(() => { if (mounted.current) setIsRestoring(false); });
    return () => { mounted.current = false; data.subscription.unsubscribe(); };
  }, [loadProfile]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    if (AppState.currentState === 'active') client.auth.startAutoRefresh();
    const listener = AppState.addEventListener('change', (state) => state === 'active' ? client.auth.startAutoRefresh() : client.auth.stopAutoRefresh());
    return () => { listener.remove(); client.auth.stopAutoRefresh(); };
  }, []);

  const refreshProfile = useCallback(async () => { if (session) await loadProfile(session); }, [loadProfile, session]);
  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('AUTH_NOT_CONFIGURED');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password }); if (error) throw error;
  }, []);
  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!supabase) throw new Error('AUTH_NOT_CONFIGURED');
    await authStorage.setItem(PENDING_DISPLAY_NAME_KEY, name.trim());
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: AUTH_REDIRECT_URLS.signupConfirmation },
    });
    if (error) { await authStorage.removeItem(PENDING_DISPLAY_NAME_KEY); throw error; }
    if (data.session) await loadProfile(data.session);
    return { confirmationRequired: !data.session };
  }, [loadProfile]);
  const signOut = useCallback(async () => {
    if (!supabase) return;
    if (session?.access_token) await unlinkAccountDeviceBeforeSignOut(session.access_token);
    const { error } = await supabase.auth.signOut(); if (error) throw error;
    await authStorage.removeItem(PENDING_DISPLAY_NAME_KEY); setSession(null); setProfile(null);
  }, [session]);
  const sendPasswordReset = useCallback(async (email: string) => {
    if (!supabase) throw new Error('AUTH_NOT_CONFIGURED');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: AUTH_REDIRECT_URLS.passwordRecovery }); if (error) throw error;
  }, []);
  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) throw new Error('AUTH_NOT_CONFIGURED'); const { error } = await supabase.auth.updateUser({ password }); if (error) throw error;
  }, []);
  const handleRecoveryUrl = useCallback(async (url: string) => {
    if (!supabase) return false; const parsed = new URL(url.replace('#', '?')); const code = parsed.searchParams.get('code');
    if (code) return !(await supabase.auth.exchangeCodeForSession(code)).error;
    const access_token = parsed.searchParams.get('access_token'); const refresh_token = parsed.searchParams.get('refresh_token');
    return Boolean(access_token && refresh_token && !(await supabase.auth.setSession({ access_token, refresh_token })).error);
  }, []);
  const value = useMemo<Value>(() => ({ user: session?.user ?? null, session, profile, isRestoring, isAuthenticated: Boolean(session), isConfigured: isAuthConfigured,
    signIn, signUp, signOut, sendPasswordReset, updatePassword, refreshProfile, handleRecoveryUrl,
  }), [session, profile, isRestoring, signIn, signUp, signOut, sendPasswordReset, updatePassword, refreshProfile, handleRecoveryUrl]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth() { const value = useContext(Context); if (!value) throw new Error('useAuth must be used within AuthProvider.'); return value; }
