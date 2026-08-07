import type { NotificationPreferences } from '@/types/notification-preferences';
import type {
  PushRegistrationPayload,
  PushRuntimeEnvironment,
  PushServerPreferences,
} from '@/types/push-notifications';

type OptionalString = string | null | undefined;

type PushRegistrationPayloadInput = {
  installationId: string;
  expoPushToken: string;
  platform: 'android' | 'ios';
  runtimeEnvironment: Exclude<PushRuntimeEnvironment, 'expo-go'>;
  appVersion?: OptionalString;
  device: {
    brand?: OptionalString;
    modelName?: OptionalString;
    osName?: OptionalString;
    osVersion?: OptionalString;
  };
  locale?: OptionalString;
  timezone?: OptionalString;
  preferences: NotificationPreferences;
  followedEmissionSlugs: string[];
};

function optionalString(value: OptionalString) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function getPushDeviceOsName(platform: 'android' | 'ios') {
  return platform;
}

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

export function createPushRegistrationPayload(
  input: PushRegistrationPayloadInput,
): PushRegistrationPayload {
  const appVersion = optionalString(input.appVersion);
  const locale = optionalString(input.locale);
  const timezone = optionalString(input.timezone);
  const device = Object.fromEntries(
    Object.entries(input.device)
      .map(([key, value]) => [key, optionalString(value)] as const)
      .filter((entry): entry is readonly [string, string] => entry[1] !== undefined),
  );

  return {
    installationId: input.installationId,
    expoPushToken: input.expoPushToken,
    platform: input.platform,
    runtimeEnvironment: input.runtimeEnvironment,
    ...(appVersion ? { appVersion } : {}),
    device,
    ...(locale ? { locale } : {}),
    ...(timezone ? { timezone } : {}),
    preferences: createPushPreferences(
      input.preferences,
      input.followedEmissionSlugs,
    ),
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
