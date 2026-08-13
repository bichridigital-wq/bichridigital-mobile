import AsyncStorage from '@react-native-async-storage/async-storage';

import { UUID_PATTERN } from '@/utils/followed-emissions';
import { parseAccountProgramSyncOutbox } from '@/utils/account-program-reconciliation';

export const ACCOUNT_PROGRAM_SYNC_STORAGE_KEY = 'bichridigital:account-program-sync:v1';
const MAX_PENDING_IDS = 100;

export type AccountProgramSyncOutbox = {
  pendingFollowIds: string[];
  pendingUnfollowIds: string[];
  lastSuccessfulSyncAt: string | null;
};

const emptyOutbox = (): AccountProgramSyncOutbox => ({
  pendingFollowIds: [],
  pendingUnfollowIds: [],
  lastSuccessfulSyncAt: null,
});

function uniqueIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string =>
    typeof id === 'string' && UUID_PATTERN.test(id),
  ))].slice(0, MAX_PENDING_IDS).sort();
}

let storageQueue = Promise.resolve();

export async function loadAccountProgramSyncOutbox() {
  await storageQueue.catch(() => undefined);
  const stored = await AsyncStorage.getItem(ACCOUNT_PROGRAM_SYNC_STORAGE_KEY);
  if (!stored) return emptyOutbox();
  try { return parseAccountProgramSyncOutbox(JSON.parse(stored)); }
  catch { return emptyOutbox(); }
}

function updateOutbox(update: (current: AccountProgramSyncOutbox) => AccountProgramSyncOutbox) {
  let result = emptyOutbox();
  storageQueue = storageQueue.catch(() => undefined).then(async () => {
    const stored = await AsyncStorage.getItem(ACCOUNT_PROGRAM_SYNC_STORAGE_KEY);
    let current = emptyOutbox();
    try { current = stored ? parseAccountProgramSyncOutbox(JSON.parse(stored)) : current; }
    catch { /* Invalid non-secret outbox is safely replaced. */ }
    result = update(current);
    await AsyncStorage.setItem(ACCOUNT_PROGRAM_SYNC_STORAGE_KEY, JSON.stringify(result));
  });
  return storageQueue.then(() => result);
}

export function enqueueAccountProgramMutation(programId: string, intent: 'follow' | 'unfollow') {
  if (!UUID_PATTERN.test(programId)) return Promise.resolve(emptyOutbox());
  return updateOutbox((current) => ({
    ...current,
    pendingFollowIds: intent === 'follow'
      ? uniqueIds([...current.pendingFollowIds, programId])
      : current.pendingFollowIds.filter((id) => id !== programId),
    pendingUnfollowIds: intent === 'unfollow'
      ? uniqueIds([...current.pendingUnfollowIds, programId])
      : current.pendingUnfollowIds.filter((id) => id !== programId),
  }));
}

export function completeAccountProgramMutation(programId: string, intent: 'follow' | 'unfollow') {
  return updateOutbox((current) => ({
    ...current,
    pendingFollowIds: intent === 'follow'
      ? current.pendingFollowIds.filter((id) => id !== programId)
      : current.pendingFollowIds,
    pendingUnfollowIds: intent === 'unfollow'
      ? current.pendingUnfollowIds.filter((id) => id !== programId)
      : current.pendingUnfollowIds,
  }));
}

export function markAccountProgramSyncSuccessful() {
  return updateOutbox((current) => ({
    ...current,
    lastSuccessfulSyncAt: new Date().toISOString(),
  }));
}
