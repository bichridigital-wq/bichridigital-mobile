import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { NotificationPermissionStatus } from '@/types/notifications';

export const NOTIFICATION_CHANNEL_ID = 'bichridigital-general';
export const PROFILE_NOTIFICATION_ROUTE = '/(tabs)/profil';

const TEST_NOTIFICATION_TYPE = 'test';
let isHandlerConfigured = false;

export function configureLocalNotificationHandler() {
  if (isHandlerConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  isHandlerConfigured = true;
}

export async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Notifications Bichridigital',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    enableVibrate: true,
    vibrationPattern: [0, 200, 150, 200],
  });
}

function mapPermission(
  permissions: Notifications.NotificationPermissionsStatus,
): NotificationPermissionStatus {
  if (Platform.OS === 'ios' && permissions.ios) {
    const iosStatus = permissions.ios.status;
    if (
      iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED ||
      iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL ||
      iosStatus === Notifications.IosAuthorizationStatus.EPHEMERAL
    ) {
      return 'granted';
    }
    if (iosStatus === Notifications.IosAuthorizationStatus.DENIED) {
      return 'denied';
    }
    return 'undetermined';
  }

  if (permissions.granted || permissions.status === 'granted') {
    return 'granted';
  }
  if (permissions.status === 'denied') {
    return 'denied';
  }
  return 'undetermined';
}

export async function getLocalNotificationPermission() {
  return mapPermission(await Notifications.getPermissionsAsync());
}

export async function requestLocalNotificationPermission() {
  return mapPermission(await Notifications.requestPermissionsAsync());
}

export async function scheduleLocalTestNotification() {
  await ensureAndroidNotificationChannel();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Bichridigital',
      body: 'Les notifications sont correctement configurées sur cet appareil.',
      sound: 'default',
      data: {
        type: TEST_NOTIFICATION_TYPE,
        route: PROFILE_NOTIFICATION_ROUTE,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      repeats: false,
      channelId: NOTIFICATION_CHANNEL_ID,
    },
  });
}

export function isSafeProfileNotificationResponse(
  response: Notifications.NotificationResponse,
) {
  const data = response.notification.request.content.data;
  return (
    data.type === TEST_NOTIFICATION_TYPE &&
    data.route === PROFILE_NOTIFICATION_ROUTE
  );
}

export function getNotificationResponseKey(
  response: Notifications.NotificationResponse,
) {
  return `${response.notification.request.identifier}:${response.actionIdentifier}`;
}

export const addNotificationResponseListener =
  Notifications.addNotificationResponseReceivedListener;

export const getLastNotificationResponse =
  Notifications.getLastNotificationResponse;
