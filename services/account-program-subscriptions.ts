import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api-client';
import type { AccountDeviceProof } from '@/services/account-device-link';
import { parseAccountProgramIds } from '@/utils/account-program-reconciliation';

const ACCOUNT_SUBSCRIPTIONS_PATH = '/me/program-subscriptions';
const RECONCILE_PATH = `${ACCOUNT_SUBSCRIPTIONS_PATH}/reconcile`;

const headers = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

export async function listAccountProgramSubscriptions(accessToken: string) {
  return parseAccountProgramIds(await apiGet<unknown>(ACCOUNT_SUBSCRIPTIONS_PATH, {
    headers: headers(accessToken),
    debugLabel: 'Account subscriptions',
  }));
}

export async function reconcileAccountProgramSubscriptions(
  accessToken: string,
  localProgramIds: string[],
  proof: AccountDeviceProof | null,
) {
  return parseAccountProgramIds(await apiPost<unknown>(RECONCILE_PATH, {
    headers: headers(accessToken),
    body: { localProgramIds, ...(proof ?? {}) },
    debugLabel: 'Account subscription reconcile',
  }));
}

export async function followAccountProgram(accessToken: string, programId: string) {
  await apiPut<void>(`${ACCOUNT_SUBSCRIPTIONS_PATH}/${programId}`, {
    headers: headers(accessToken),
    debugLabel: 'Account subscription follow',
  });
}

export async function unfollowAccountProgram(accessToken: string, programId: string) {
  await apiDelete<void>(`${ACCOUNT_SUBSCRIPTIONS_PATH}/${programId}`, {
    headers: headers(accessToken),
    debugLabel: 'Account subscription unfollow',
  });
}
