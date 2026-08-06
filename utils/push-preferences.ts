import type { NotificationPreferences } from '@/types/notification-preferences';
import type { PushServerPreferences } from '@/types/push-notifications';

export function createPushPreferences(
  preferences: NotificationPreferences,
  followedEmissionSlugs: string[],
): PushServerPreferences {
  return {
    ...preferences,
    followedEmissionSlugs: [
      ...new Set(
        followedEmissionSlugs
          .map((slug) => slug.trim().toLowerCase())
          .filter(Boolean),
      ),
    ].sort(),
  };
}

export function serializePushPreferences(preferences: PushServerPreferences) {
  return JSON.stringify(preferences);
}

export function shouldSyncPushPreferences(
  confirmedSnapshot: string | null,
  preferences: PushServerPreferences,
) {
  return confirmedSnapshot !== serializePushPreferences(preferences);
}
