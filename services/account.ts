import { apiGet, apiPatch } from '@/services/api-client';
import type { AccountProfile, MeResponse } from '@/types/account';

const headers = (token: string) => ({ Authorization: `Bearer ${token}` });
export const getMe = (token: string) => apiGet<MeResponse>('/me', { headers: headers(token), debugLabel: 'Account profile' });
export async function updateDisplayName(token: string, displayName: string) {
  const result = await apiPatch<{ profile: AccountProfile }>('/me', { headers: headers(token), body: { displayName }, debugLabel: 'Account profile update' });
  return result.profile;
}
