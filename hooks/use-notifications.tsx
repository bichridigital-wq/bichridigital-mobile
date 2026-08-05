import { router } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Linking } from 'react-native';

import { useUserLibrary } from '@/hooks/use-user-library';
import {
  addNotificationResponseListener,
  configureLocalNotificationHandler,
  ensureAndroidNotificationChannel,
  getLastNotificationResponse,
  getLocalNotificationPermission,
  getNotificationResponseKey,
  isSafeProfileNotificationResponse,
  requestLocalNotificationPermission,
  scheduleLocalTestNotification,
} from '@/services/local-notifications';
import { getInstallationId } from '@/services/installation-id';
import {
  getEasProjectId,
  getPushAvailabilityReason,
  getPushRuntimeEnvironment,
  registerPushInstallation,
  syncPushPreferences,
} from '@/services/push-registration';
import type {
  NotificationPermissionStatus,
  NotificationTestFeedback,
} from '@/types/notifications';
import type {
  PushAvailabilityReason,
  PushRegistrationPayload,
  PushRegistrationStatus,
  PushRuntimeEnvironment,
} from '@/types/push-notifications';

type NotificationContextValue = {
  isInitialized: boolean;
  permissionStatus: NotificationPermissionStatus;
  isPermissionGranted: boolean;
  isPermissionDenied: boolean;
  notificationsEnabled: boolean;
  isInitializing: boolean;
  isRequestingPermission: boolean;
  isSchedulingTest: boolean;
  testFeedback: NotificationTestFeedback;
  lastError: string | null;
  pushRuntimeEnvironment: PushRuntimeEnvironment;
  pushAvailabilityReason: PushAvailabilityReason;
  pushRegistrationStatus: PushRegistrationStatus;
  hasEasProjectId: boolean;
  installationId: string | null;
  hasExpoPushToken: boolean;
  enableNotifications: () => Promise<NotificationPermissionStatus>;
  disableNotifications: () => void;
  refreshPermissionStatus: () => Promise<NotificationPermissionStatus>;
  openSystemSettings: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const {
    isHydrated,
    notificationsEnabled,
    notificationPreferences,
    setNotificationsEnabled,
  } = useUserLibrary();
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>('undetermined');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isSchedulingTest, setIsSchedulingTest] = useState(false);
  const [testFeedback, setTestFeedback] =
    useState<NotificationTestFeedback>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [pushRegistrationStatus, setPushRegistrationStatus] =
    useState<PushRegistrationStatus>('idle');
  const [pushRegistration, setPushRegistration] =
    useState<PushRegistrationPayload | null>(null);
  const [installationId, setInstallationId] = useState<string | null>(null);
  const refreshRef = useRef<Promise<NotificationPermissionStatus> | null>(null);
  const requestRef = useRef<Promise<NotificationPermissionStatus> | null>(null);
  const handledResponsesRef = useRef(new Set<string>());
  const registrationRef = useRef<Promise<void> | null>(null);
  const syncedPreferencesRef = useRef<string | null>(null);
  const pushRuntimeEnvironment = getPushRuntimeEnvironment();
  const pushAvailabilityReason = getPushAvailabilityReason();
  const hasEasProjectId = getEasProjectId() !== null;

  const registerForPush = useCallback(() => {
    if (registrationRef.current) {
      return registrationRef.current;
    }
    if (getPushAvailabilityReason() !== 'available') {
      setPushRegistrationStatus('not-available');
      return Promise.resolve();
    }

    setPushRegistrationStatus('registering');
    const operation = registerPushInstallation(notificationPreferences)
      .then((registration) => {
        setPushRegistration(registration);
        setInstallationId(registration.installationId);
        syncedPreferencesRef.current = JSON.stringify(registration.preferences);
        setPushRegistrationStatus('registered');
      })
      .catch(() => {
        setPushRegistrationStatus('error');
      })
      .finally(() => {
        registrationRef.current = null;
      });
    registrationRef.current = operation;
    return operation;
  }, [notificationPreferences]);

  const refreshPermissionStatus = useCallback(() => {
    if (refreshRef.current) {
      return refreshRef.current;
    }
    const operation = getLocalNotificationPermission()
      .then((status) => {
        setPermissionStatus(status);
        setLastError(null);
        return status;
      })
      .catch(() => {
        setPermissionStatus('unavailable');
        setLastError(
          'Le statut des notifications n’a pas pu être vérifié sur cet appareil.',
        );
        return 'unavailable' as const;
      })
      .finally(() => {
        refreshRef.current = null;
      });
    refreshRef.current = operation;
    return operation;
  }, []);

  useEffect(() => {
    configureLocalNotificationHandler();
    let mounted = true;

    Promise.all([
      ensureAndroidNotificationChannel(),
      refreshPermissionStatus(),
      getInstallationId().then((id) => {
        if (mounted) {
          setInstallationId(id);
        }
      }),
    ])
      .catch(() => {
        if (mounted) {
          setLastError(
            'Les notifications locales ne sont pas disponibles sur cet appareil.',
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setIsInitializing(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [refreshPermissionStatus]);

  useEffect(() => {
    if (
      isHydrated &&
      notificationsEnabled &&
      permissionStatus !== 'undetermined' &&
      permissionStatus !== 'granted'
    ) {
      setNotificationsEnabled(false);
    }
  }, [
    isHydrated,
    notificationsEnabled,
    permissionStatus,
    setNotificationsEnabled,
  ]);

  useEffect(() => {
    const openSafeResponse = (
      response: ReturnType<typeof getLastNotificationResponse>,
    ) => {
      if (!response || !isSafeProfileNotificationResponse(response)) {
        return;
      }
      const key = getNotificationResponseKey(response);
      if (handledResponsesRef.current.has(key)) {
        return;
      }
      handledResponsesRef.current.add(key);
      router.push('/(tabs)/profil');
    };

    openSafeResponse(getLastNotificationResponse());
    const responseSubscription = addNotificationResponseListener(openSafeResponse);
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshPermissionStatus();
      }
    });

    return () => {
      responseSubscription.remove();
      appStateSubscription.remove();
    };
  }, [refreshPermissionStatus]);

  const enableNotifications = useCallback(() => {
    if (requestRef.current) {
      return requestRef.current;
    }
    setIsRequestingPermission(true);
    setTestFeedback(null);
    const operation = getLocalNotificationPermission()
      .then((status) =>
        status === 'undetermined'
          ? requestLocalNotificationPermission()
          : status,
      )
      .then((status) => {
        setPermissionStatus(status);
        setNotificationsEnabled(status === 'granted');
        setLastError(null);
        if (status === 'granted') {
          void registerForPush();
        }
        return status;
      })
      .catch(() => {
        setPermissionStatus('unavailable');
        setNotificationsEnabled(false);
        setLastError(
          'La demande d’autorisation n’a pas pu être affichée sur cet appareil.',
        );
        return 'unavailable' as const;
      })
      .finally(() => {
        requestRef.current = null;
        setIsRequestingPermission(false);
      });
    requestRef.current = operation;
    return operation;
  }, [registerForPush, setNotificationsEnabled]);

  const disableNotifications = useCallback(() => {
    setNotificationsEnabled(false);
    setTestFeedback(null);
  }, [setNotificationsEnabled]);

  useEffect(() => {
    if (
      isHydrated &&
      !isInitializing &&
      notificationsEnabled &&
      permissionStatus === 'granted' &&
      !pushRegistration
    ) {
      void registerForPush();
    }
  }, [
    isHydrated,
    isInitializing,
    notificationsEnabled,
    permissionStatus,
    pushRegistration,
    registerForPush,
  ]);

  useEffect(() => {
    if (!pushRegistration || !notificationsEnabled) {
      return;
    }

    const serializedPreferences = JSON.stringify(notificationPreferences);
    if (syncedPreferencesRef.current === serializedPreferences) {
      return;
    }

    setPushRegistrationStatus('syncing');
    void syncPushPreferences(pushRegistration, notificationPreferences)
      .then(() => {
        syncedPreferencesRef.current = serializedPreferences;
        setPushRegistrationStatus('registered');
      })
      .catch(() => {
        setPushRegistrationStatus('error');
      });
  }, [notificationPreferences, notificationsEnabled, pushRegistration]);

  const openSystemSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch {
      setLastError('Les réglages système n’ont pas pu être ouverts.');
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    if (
      isSchedulingTest ||
      permissionStatus !== 'granted' ||
      !notificationsEnabled
    ) {
      return;
    }
    setIsSchedulingTest(true);
    setTestFeedback(null);
    try {
      await scheduleLocalTestNotification();
      setTestFeedback('scheduled');
      setLastError(null);
    } catch {
      setTestFeedback('error');
      setLastError('La notification de test n’a pas pu être programmée.');
    } finally {
      setIsSchedulingTest(false);
    }
  }, [isSchedulingTest, notificationsEnabled, permissionStatus]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      isInitialized: !isInitializing,
      permissionStatus,
      isPermissionGranted: permissionStatus === 'granted',
      isPermissionDenied: permissionStatus === 'denied',
      notificationsEnabled,
      isInitializing,
      isRequestingPermission,
      isSchedulingTest,
      testFeedback,
      lastError,
      pushRuntimeEnvironment,
      pushAvailabilityReason,
      pushRegistrationStatus,
      hasEasProjectId,
      installationId,
      hasExpoPushToken: Boolean(pushRegistration?.expoPushToken),
      enableNotifications,
      disableNotifications,
      refreshPermissionStatus,
      openSystemSettings,
      sendTestNotification,
    }),
    [
      disableNotifications,
      enableNotifications,
      isInitializing,
      isRequestingPermission,
      isSchedulingTest,
      installationId,
      lastError,
      pushAvailabilityReason,
      pushRegistration,
      pushRegistrationStatus,
      pushRuntimeEnvironment,
      hasEasProjectId,
      notificationsEnabled,
      openSystemSettings,
      permissionStatus,
      refreshPermissionStatus,
      sendTestNotification,
      testFeedback,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider.');
  }
  return context;
}
