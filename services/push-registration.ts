import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { apiPost } from '@/services/api-client';
import { getInstallationId } from '@/services/installation-id';
import type { NotificationPreferences } from '@/types/notification-preferences';
import type {
  PushAvailabilityReason,
  PushRegistrationPayload,
  PushRuntimeEnvironment,
} from '@/types/push-notifications';

export const PUSH_REGISTRATION_PATH = '/api/push/register';

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
  if (getPushRuntimeEnvironment() === 'expo-go') {
    return 'expo-go';
  }
  if (!Device.isDevice) {
    return 'simulator';
  }
  if (!getEasProjectId()) {
    return 'missing-project-id';
  }
  return 'available';
}

export async function createPushRegistrationPayload(
  preferences: NotificationPreferences,
): Promise<PushRegistrationPayload> {
  const projectId = getEasProjectId();
  const availability = getPushAvailabilityReason();
  if (!projectId || availability !== 'available') {
    throw new Error(`PUSH_NOT_AVAILABLE:${availability}`);
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  const platform = Platform.OS;
  if (platform !== 'android' && platform !== 'ios') {
    throw new Error('PUSH_NOT_AVAILABLE:unsupported-platform');
  }

  return {
    installationId: await getInstallationId(),
    expoPushToken: token.data,
    platform,
    runtimeEnvironment: getPushRuntimeEnvironment(),
    appVersion: Constants.expoConfig?.version ?? null,
    device: {
      brand: Device.brand,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
    },
    preferences,
  };
}

export async function registerPushInstallation(
  preferences: NotificationPreferences,
) {
  const payload = await createPushRegistrationPayload(preferences);
  await apiPost<void>(PUSH_REGISTRATION_PATH, {
    body: payload,
    debugLabel: 'push-registration',
  });
  return payload;
}

export async function syncPushPreferences(
  registration: PushRegistrationPayload,
  preferences: NotificationPreferences,
) {
  const payload = { ...registration, preferences };
  await apiPost<void>(PUSH_REGISTRATION_PATH, {
    body: payload,
    debugLabel: 'push-preferences',
  });
  return payload;
}
