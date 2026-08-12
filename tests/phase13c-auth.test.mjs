import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Auth uses SecureStore and never AsyncStorage', async () => {
  const storage = await source('services/auth-storage.ts');
  assert.match(storage, /SecureStore\.getItemAsync/);
  assert.match(storage, /SecureStore\.setItemAsync/);
  assert.match(storage, /SecureStore\.deleteItemAsync/);
  assert.doesNotMatch(storage, /AsyncStorage/);
  const chunkedStorage = await source('services/chunked-secure-storage.ts');
  assert.doesNotMatch(chunkedStorage, /AsyncStorage/);
});

test('Supabase persists and refreshes the secure session', async () => {
  const client = await source('lib/supabase.ts');
  assert.match(client, /persistSession: true/);
  assert.match(client, /autoRefreshToken: true/);
  assert.match(client, /detectSessionInUrl: false/);
  const provider = await source('hooks/use-auth.tsx');
  assert.match(provider, /getSession\(\)/);
  assert.match(provider, /onAuthStateChange/);
  assert.match(provider, /subscription\.unsubscribe/);
  assert.match(provider, /startAutoRefresh/);
});

test('Network profile errors do not sign out or erase local data', async () => {
  const provider = await source('hooks/use-auth.tsx');
  const loadProfile = provider.slice(provider.indexOf('const loadProfile'), provider.indexOf('useEffect', provider.indexOf('const loadProfile')));
  assert.doesNotMatch(loadProfile, /signOut|AsyncStorage|clearAllLibraryData/);
});

test('Registration never sends an administrative role', async () => {
  const provider = await source('hooks/use-auth.tsx');
  const redirects = await source('lib/auth-redirects.ts');
  assert.doesNotMatch(provider, /role\s*:|is_admin|service_role/);
  assert.match(provider, /updateDisplayName/);
  assert.match(provider, /emailRedirectTo: AUTH_REDIRECT_URLS\.signupConfirmation/);
  assert.match(redirects, /signupConfirmation: 'bichridigitalmobile:\/\/\/auth\/login'/);
  assert.match(redirects, /passwordRecovery: 'bichridigitalmobile:\/\/\/auth\/reset-password'/);
});

test('Forgot password response is non-enumerating', async () => {
  const forgot = await source('app/auth/forgot-password.tsx');
  assert.match(forgot, /Si un compte correspond/);
  assert.doesNotMatch(forgot, /n'existe pas|existe déjà/);
});

test('Recovery supports PKCE and token-session callbacks', async () => {
  const provider = await source('hooks/use-auth.tsx');
  assert.match(provider, /exchangeCodeForSession/);
  assert.match(provider, /setSession/);
  assert.match(provider, /updateUser\(\{ password \}\)/);
  assert.match(provider, /redirectTo: AUTH_REDIRECT_URLS\.passwordRecovery/);
});

test('Profile keeps existing sections and adds account card', async () => {
  const profile = await source('app/(tabs)/profil.tsx');
  for (const marker of ['AccountCard', 'ProfileSummary', 'NotificationDeviceStatusCard', 'Effacer mes données locales']) assert.match(profile, new RegExp(marker));
});

test('Auth does not link devices, sync follows, or invoke push', async () => {
  const provider = await source('hooks/use-auth.tsx');
  assert.doesNotMatch(provider, /link-device|unlink-device|program-subscriptions|useNotifications|ExpoPushToken/);
});
