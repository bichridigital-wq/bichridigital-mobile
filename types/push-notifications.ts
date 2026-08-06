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
  | 'initializing'
  | 'unsupported'
  | 'expo-go'
  | 'simulator'
  | 'missing-project-id'
  | 'permission-undetermined'
  | 'permission-denied'
  | 'ready'
  | 'registering'
  | 'registered'
  | 'unregistering'
  | 'unregistered'
  | 'network-error'
  | 'server-error';
export type PreferenceSyncStatus =
  | 'idle'
  | 'synced'
  | 'pending'
  | 'syncing'
  | 'network-error'
  | 'server-error';

export type PushServerPreferences = NotificationPreferences & {
  followedEmissionSlugs: string[];
};

export type PushRegistrationPayload = {
  installationId: string;
  expoPushToken: string;
  platform: 'android' | 'ios';
  runtimeEnvironment: Exclude<PushRuntimeEnvironment, 'expo-go'>;
  appVersion: string | null;
  device: {
    brand: string | null;
    modelName: string | null;
    osName: string | null;
    osVersion: string | null;
  };
  locale: string | null;
  timezone: string | null;
  preferences: PushServerPreferences;
};

export type PushRegistration = PushRegistrationPayload;
