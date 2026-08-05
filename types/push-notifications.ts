import type { NotificationPreferences } from '@/types/notification-preferences';

export type PushRuntimeEnvironment =
  | 'expo-go'
  | 'development-build'
  | 'production';

export type PushAvailabilityReason =
  | 'available'
  | 'expo-go'
  | 'simulator'
  | 'missing-project-id'
  | 'unsupported-platform';

export type PushRegistrationStatus =
  | 'idle'
  | 'not-available'
  | 'registering'
  | 'registered'
  | 'syncing'
  | 'error';

export type PushRegistrationPayload = {
  installationId: string;
  expoPushToken: string;
  platform: 'android' | 'ios';
  runtimeEnvironment: PushRuntimeEnvironment;
  appVersion: string | null;
  device: {
    brand: string | null;
    modelName: string | null;
    osName: string | null;
    osVersion: string | null;
  };
  preferences: NotificationPreferences;
};

