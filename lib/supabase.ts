import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { authStorage } from '@/services/auth-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';
export const isAuthConfigured = Boolean(url && key);
export const supabase: SupabaseClient | null = isAuthConfigured
  ? createClient(url, key, { auth: { storage: authStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
  : null;

export async function clearPersistedSupabaseSession() {
  if (!supabase) return;
  const storageKey = (supabase.auth as unknown as { storageKey?: string }).storageKey;
  if (storageKey) await authStorage.removeItem(storageKey);
}
