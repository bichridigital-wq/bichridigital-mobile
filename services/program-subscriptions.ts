import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiDelete, apiPost } from '@/services/api-client';
import type { PushRegistration } from '@/types/push-notifications';
import { UUID_PATTERN } from '@/utils/followed-emissions';

export const PROGRAM_SUBSCRIPTIONS_LIST_PATH = '/push/program-subscriptions/list';
export const PROGRAM_SUBSCRIPTIONS_PATH = '/push/program-subscriptions';
export const PROGRAM_SUBSCRIPTIONS_MIGRATION_KEY =
  'bichridigital:program-subscriptions-migrated:v1';

function proof(registration: PushRegistration) {
  return {
    installationId: registration.installationId,
    expoPushToken: registration.expoPushToken,
  };
}

export function parseProgramSubscriptionList(value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('PROGRAM_SUBSCRIPTIONS_RESPONSE_INVALID');
  }
  const ids = (value as Record<string, unknown>).programIds;
  if (!Array.isArray(ids)) throw new Error('PROGRAM_SUBSCRIPTIONS_RESPONSE_INVALID');
  return [...new Set(ids.filter((id): id is string => typeof id === 'string' && UUID_PATTERN.test(id)))].sort();
}

export async function listProgramSubscriptions(registration: PushRegistration) {
  const response = await apiPost<unknown>(PROGRAM_SUBSCRIPTIONS_LIST_PATH, {
    body: proof(registration),
    debugLabel: 'Program subscriptions',
  });
  return parseProgramSubscriptionList(response);
}

export async function followProgramSubscription(
  registration: PushRegistration,
  programId: string,
) {
  await apiPost<void>(PROGRAM_SUBSCRIPTIONS_PATH, {
    body: { ...proof(registration), programId },
    debugLabel: 'Program subscription',
  });
}

export async function unfollowProgramSubscription(
  registration: PushRegistration,
  programId: string,
) {
  await apiDelete<void>(PROGRAM_SUBSCRIPTIONS_PATH, {
    body: { ...proof(registration), programId },
    debugLabel: 'Program subscription',
  });
}

export async function hasCompletedProgramSubscriptionMigration() {
  return (await AsyncStorage.getItem(PROGRAM_SUBSCRIPTIONS_MIGRATION_KEY)) === '1';
}

export async function markProgramSubscriptionMigrationComplete() {
  await AsyncStorage.setItem(PROGRAM_SUBSCRIPTIONS_MIGRATION_KEY, '1');
}
