import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { apiDelete, apiPatch, apiPost } from '@/services/api-client';
import {
  completeInstallationIdMigration,
  getOrCreateInstallationId,
} from '@/services/installation-id';
import type { NotificationPreferences } from '@/types/notification-preferences';
import type {
  PushAvailabilityReason,
  PushRegistration,
  PushRuntimeEnvironment,
  PushServerPreferences,
} from '@/types/push-notifications';
import {
  createPushPreferences,
  createPushRegistrationPayload,
  getPushDeviceOsName,
} from '@/utils/push-preferences';

export { createPushPreferences } from '@/utils/push-preferences';

export const PUSH_REGISTRATION_PATH = '/push/register';
export const PUSH_PREFERENCES_PATH = '/push/preferences';
export const PUSH_UNREGISTER_PATH = '/push/unregister';

const EXPO_PUSH_TOKEN_PATTERN = /^(Expo(nent)?PushToken)\[[^\]]+\]$/;

export function getPushRuntimeEnvironment(): PushRuntimeEnvironment {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return 'expo-go';
  }
  return __DEV__ ? 'development-build' : 'production';
}

export function getEasProjectId(): string | null {
  const configuredProjectId = Constants.expoConfig?.extra?.eas?.projectId;
  const embeddedProjectId = Constants.easConfig?.projectId;
  const projectId =
    typeof configuredProjectId === 'string'
      ? configuredProjectId
      : embeddedProjectId;
  return typeof projectId === 'string' && projectId.trim()
    ? projectId.trim()
    : null;
}

export function getPushAvailabilityReason(): PushAvailabilityReason {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return 'unsupported-platform';
  }
  if (getPushRuntimeEnvironment() === 'expo-go') return 'expo-go';
  if (!Device.isDevice) return 'simulator';
  if (!getEasProjectId()) return 'missing-project-id';
  return 'available';
}

export function isExpoPushToken(value: unknown): value is string {
  return typeof value === 'string' && EXPO_PUSH_TOKEN_PATTERN.test(value);
}

function getLocaleAndTimezone() {
  try {
    const options = Intl.DateTimeFormat().resolvedOptions();
    return {
      locale: options.locale || undefined,
      timezone: options.timeZone || undefined,
    };
  } catch {
    return { locale: undefined, timezone: undefined };
  }
}

export async function getCurrentExpoPushToken(
  devicePushToken?: Notifications.DevicePushToken,
) {
  const projectId = getEasProjectId();
  const availability = getPushAvailabilityReason();
  if (!projectId || availability !== 'available') {
    throw new Error(`PUSH_NOT_AVAILABLE:${availability}`);
  }
  const token = await Notifications.getExpoPushTokenAsync({
    projectId,
    ...(devicePushToken ? { devicePushToken } : {}),
  });
  if (!isExpoPushToken(token.data)) {
    throw new Error('PUSH_TOKEN_INVALID');
  }
  return token.data;
}

export async function registerPushDevice(
  preferences: NotificationPreferences,
  followedEmissionSlugs: string[],
  options: {
    devicePushToken?: Notifications.DevicePushToken;
    skipIfExpoToken?: string;
  } = {},
): Promise<PushRegistration | null> {
  const environment = getPushRuntimeEnvironment();
  const platform = Platform.OS;
  if (
    environment === 'expo-go' ||
    (platform !== 'android' && platform !== 'ios')
  ) {
    throw new Error('PUSH_NOT_AVAILABLE');
  }
  const installation = await getOrCreateInstallationId();
  const expoPushToken = await getCurrentExpoPushToken(options.devicePushToken);
  if (expoPushToken === options.skipIfExpoToken) return null;
  const payload = createPushRegistrationPayload({
    installationId: installation.installationId,
    expoPushToken,
    platform,
    runtimeEnvironment: environment,
    appVersion: Constants.expoConfig?.version,
    device: {
      brand: Device.brand,
      modelName: Device.modelName,
      osName: getPushDeviceOsName(platform),
      osVersion: Device.osVersion,
    },
    ...getLocaleAndTimezone(),
    preferences,
    followedEmissionSlugs,
  });
  await apiPost<void>(PUSH_REGISTRATION_PATH, {
    body: payload,
    debugLabel: 'Push register',
  });
  await completeInstallationIdMigration();
  return payload;
}

export async function updatePushPreferences(
  registration: PushRegistration,
  preferences: PushServerPreferences,
) {
  await apiPatch<void>(PUSH_PREFERENCES_PATH, {
    body: {
      installationId: registration.installationId,
      expoPushToken: registration.expoPushToken,
      preferences,
    },
    debugLabel: 'API',
  });
}

export async function unregisterPushDevice(registration: PushRegistration) {
  await apiDelete<void>(PUSH_UNREGISTER_PATH, {
    body: {
      installationId: registration.installationId,
      expoPushToken: registration.expoPushToken,
    },
    debugLabel: 'API',
  });
}

export const addPushTokenListener = Notifications.addPushTokenListener;
