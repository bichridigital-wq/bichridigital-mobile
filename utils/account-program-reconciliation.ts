import type { FavoriteEmission } from '@/types/user-library';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function parseAccountProgramIds(value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('ACCOUNT_SUBSCRIPTIONS_RESPONSE_INVALID');
  const ids = (value as Record<string, unknown>).programIds;
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string' || !UUID_PATTERN.test(id))) {
    throw new Error('ACCOUNT_SUBSCRIPTIONS_RESPONSE_INVALID');
  }
  return [...new Set(ids)].sort();
}

export function parseAccountProgramSyncOutbox(value: unknown) {
  const unique = (items: unknown) => Array.isArray(items)
    ? [...new Set(items.filter((id): id is string => typeof id === 'string' && UUID_PATTERN.test(id)))].slice(0, 100).sort()
    : [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { pendingFollowIds: [], pendingUnfollowIds: [], lastSuccessfulSyncAt: null };
  }
  const item = value as Record<string, unknown>;
  return {
    pendingFollowIds: unique(item.pendingFollowIds),
    pendingUnfollowIds: unique(item.pendingUnfollowIds),
    lastSuccessfulSyncAt: typeof item.lastSuccessfulSyncAt === 'string' ? item.lastSuccessfulSyncAt : null,
  };
}

export function getReconcileLocalProgramIds(
  emissions: FavoriteEmission[],
  pendingUnfollowIds: string[],
) {
  const excluded = new Set(pendingUnfollowIds);
  return [...new Set(emissions
    .map((emission) => emission.programId)
    .filter((id): id is string => Boolean(id && UUID_PATTERN.test(id) && !excluded.has(id))),
  )].slice(0, 100).sort();
}

export function getSafeServerMergeIds(serverIds: string[], pendingUnfollowIds: string[]) {
  const excluded = new Set(pendingUnfollowIds);
  return [...new Set(serverIds.filter((id) => UUID_PATTERN.test(id) && !excluded.has(id)))].sort();
}
