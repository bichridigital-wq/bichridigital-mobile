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
import { ApiClientError } from '@/services/api-client';
import {
  getOrCreateInstallationId,
  type InstallationIdInspection,
  type InstallationIdKind,
  type InstallationIdStatus,
} from '@/services/installation-id';
import {
  addNotificationResponseListener,
  configureLocalNotificationHandler,
  ensureAndroidNotificationChannel,
  getLastNotificationResponse,
  getNotificationPermissionSnapshot,
  getNotificationResponseKey,
  getSafeNotificationResponseDestination,
  requestNotificationPermissionSnapshot,
  scheduleLocalTestNotification,
} from '@/services/local-notifications';
import {
  addPushTokenListener,
  getEasProjectId,
  getPushAvailabilityReason,
  getPushRuntimeEnvironment,
  registerPushDevice,
  unregisterPushDevice,
  updatePushPreferences,
} from '@/services/push-registration';
import type {
  NotificationPermissionStatus,
  NotificationTestFeedback,
} from '@/types/notifications';
import type {
  PreferenceSyncStatus,
  PushAvailabilityReason,
  PushRegistration,
  PushRegistrationStatus,
  PushRuntimeEnvironment,
} from '@/types/push-notifications';
import {
  createPushPreferences,
  serializePushPreferences,
  shouldSyncPushPreferences,
} from '@/utils/push-preferences';

const PREFERENCE_SYNC_DEBOUNCE_MS = 600;

type NotificationContextValue = {
  isInitialized: boolean;
  permissionStatus: NotificationPermissionStatus;
  canAskPermissionAgain: boolean;
  isPermissionGranted: boolean;
  isPermissionDenied: boolean;
  notificationsEnabled: boolean;
  isInitializing: boolean;
  isRequestingPermission: boolean;
  isSchedulingTest: boolean;
  testFeedback: NotificationTestFeedback;
  lastError: string | null;
  pushError: string | null;
  pushRuntimeEnvironment: PushRuntimeEnvironment;
  pushAvailabilityReason: PushAvailabilityReason;
  pushRegistrationStatus: PushRegistrationStatus;
  preferenceSyncStatus: PreferenceSyncStatus;
  installationIdStatus: InstallationIdStatus | 'initializing' | 'error';
  installationIdKind: InstallationIdKind | null;
  hasEasProjectId: boolean;
  installationId: string | null;
  hasExpoPushToken: boolean;
  isPushRegistered: boolean;
  isPushOperationPending: boolean;
  enableNotifications: () => Promise<NotificationPermissionStatus>;
  enablePushNotifications: () => Promise<NotificationPermissionStatus>;
  unregisterPushNotifications: () => Promise<boolean>;
  retryPushRegistration: () => Promise<void>;
  syncPushPreferences: () => Promise<void>;
  clearPushError: () => void;
  refreshPermissionStatus: () => Promise<NotificationPermissionStatus>;
  openSystemSettings: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

function getFailureStatus(error: unknown): 'network-error' | 'server-error' {
  return error instanceof ApiClientError && error.kind === 'server'
    ? 'server-error'
    : 'network-error';
}

function getSafePushError(error: unknown) {
  if (error instanceof ApiClientError) return error.message;
  return 'Le service Push est momentanément indisponible. Vous pouvez réessayer.';
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const {
    isHydrated,
    notificationsEnabled,
    notificationPreferences,
    followedEmissions,
    setNotificationsEnabled,
  } = useUserLibrary();
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>('undetermined');
  const [canAskPermissionAgain, setCanAskPermissionAgain] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isSchedulingTest, setIsSchedulingTest] = useState(false);
  const [testFeedback, setTestFeedback] =
    useState<NotificationTestFeedback>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushRegistrationStatus, setPushRegistrationStatus] =
    useState<PushRegistrationStatus>('initializing');
  const [preferenceSyncStatus, setPreferenceSyncStatus] =
    useState<PreferenceSyncStatus>('idle');
  const [pushRegistration, setPushRegistration] =
    useState<PushRegistration | null>(null);
  const [installation, setInstallation] =
    useState<InstallationIdInspection | null>(null);
  const [installationIdStatus, setInstallationIdStatus] =
    useState<InstallationIdStatus | 'initializing' | 'error'>('initializing');

  const refreshRef = useRef<Promise<NotificationPermissionStatus> | null>(null);
  const permissionRequestRef =
    useRef<Promise<NotificationPermissionStatus> | null>(null);
  const registrationOperationRef = useRef<Promise<void> | null>(null);
  const preferenceOperationRef = useRef<Promise<void> | null>(null);
  const unregisterOperationRef = useRef<Promise<boolean> | null>(null);
  const preferenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handledResponsesRef = useRef(new Set<string>());
  const startupRegistrationAttemptedRef = useRef(false);
  const mountedRef = useRef(true);
  const registrationRef = useRef<PushRegistration | null>(null);
  const permissionStatusRef = useRef(permissionStatus);
  const notificationsEnabledRef = useRef(notificationsEnabled);
  const confirmedPreferencesRef = useRef<string | null>(null);
  const pushPreferences = useMemo(
    () =>
      createPushPreferences(
        notificationPreferences,
        followedEmissions.map((emission) => emission.slug),
      ),
    [followedEmissions, notificationPreferences],
  );
  const pushPreferencesRef = useRef(pushPreferences);
  const pushRuntimeEnvironment = getPushRuntimeEnvironment();
  const pushAvailabilityReason = getPushAvailabilityReason();
  const hasEasProjectId = getEasProjectId() !== null;

  useEffect(() => {
    registrationRef.current = pushRegistration;
    permissionStatusRef.current = permissionStatus;
    notificationsEnabledRef.current = notificationsEnabled;
    pushPreferencesRef.current = pushPreferences;
  }, [notificationsEnabled, permissionStatus, pushPreferences, pushRegistration]);

  const refreshPermissionStatus = useCallback(() => {
    if (refreshRef.current) return refreshRef.current;
    const operation = getNotificationPermissionSnapshot()
      .then((permission) => {
        if (mountedRef.current) {
          setPermissionStatus(permission.status);
          setCanAskPermissionAgain(permission.canAskAgain);
          setLastError(null);
        }
        return permission.status;
      })
      .catch(() => {
        if (mountedRef.current) {
          setPermissionStatus('unavailable');
          setLastError(
            'Le statut des notifications n’a pas pu être vérifié sur cet appareil.',
          );
        }
        return 'unavailable' as const;
      })
      .finally(() => {
        refreshRef.current = null;
      });
    refreshRef.current = operation;
    return operation;
  }, []);

  const runRegistration = useCallback(
    (
      devicePushToken?: NonNullable<
        Parameters<typeof registerPushDevice>[2]
      >['devicePushToken'],
    ) => {
      if (registrationOperationRef.current) return registrationOperationRef.current;
      const availability = getPushAvailabilityReason();
      if (availability !== 'available') {
        setPushRegistrationStatus(
          availability === 'unsupported-platform'
            ? 'unsupported'
            : availability,
        );
        return Promise.resolve();
      }
      if (permissionStatusRef.current !== 'granted') {
        setPushRegistrationStatus(
          permissionStatusRef.current === 'denied'
            ? 'permission-denied'
            : 'permission-undetermined',
        );
        return Promise.resolve();
      }

      setPushRegistrationStatus('registering');
      setPushError(null);
      const currentRegistration = registrationRef.current;
      const operation = registerPushDevice(
        pushPreferencesRef.current,
        pushPreferencesRef.current.followedEmissionSlugs,
        {
          ...(devicePushToken ? { devicePushToken } : {}),
          ...(devicePushToken && currentRegistration
            ? { skipIfExpoToken: currentRegistration.expoPushToken }
            : {}),
        },
      )
        .then((registration) => {
          if (!mountedRef.current) return;
          if (!registration) {
            setPushRegistrationStatus('registered');
            return;
          }
          registrationRef.current = registration;
          setPushRegistration(registration);
          confirmedPreferencesRef.current = serializePushPreferences(
            registration.preferences,
          );
          setPreferenceSyncStatus('synced');
          setPushRegistrationStatus('registered');
          setInstallationIdStatus('ready');
        })
        .catch((error) => {
          if (!mountedRef.current) return;
          setPushRegistrationStatus(getFailureStatus(error));
          setPushError(getSafePushError(error));
        })
        .finally(() => {
          registrationOperationRef.current = null;
        });
      registrationOperationRef.current = operation;
      return operation;
    },
    [],
  );

  const performPreferenceSync = useCallback(() => {
    if (preferenceOperationRef.current) return preferenceOperationRef.current;
    const registration = registrationRef.current;
    if (!registration || !notificationsEnabledRef.current) {
      return Promise.resolve();
    }
    const preferences = pushPreferencesRef.current;
    const serialized = serializePushPreferences(preferences);
    if (!shouldSyncPushPreferences(confirmedPreferencesRef.current, preferences)) {
      setPreferenceSyncStatus('synced');
      return Promise.resolve();
    }

    setPreferenceSyncStatus('syncing');
    setPushError(null);
    const operation = updatePushPreferences(registration, preferences)
      .then(() => {
        if (!mountedRef.current) return;
        confirmedPreferencesRef.current = serialized;
        setPreferenceSyncStatus('synced');
      })
      .catch((error) => {
        if (!mountedRef.current) return;
        setPreferenceSyncStatus(getFailureStatus(error));
        setPushError(getSafePushError(error));
      })
      .finally(() => {
        preferenceOperationRef.current = null;
        if (
          mountedRef.current &&
          registrationRef.current &&
          notificationsEnabledRef.current &&
          shouldSyncPushPreferences(
            confirmedPreferencesRef.current,
            pushPreferencesRef.current,
          )
        ) {
          setPreferenceSyncStatus('pending');
          if (preferenceTimerRef.current) {
            clearTimeout(preferenceTimerRef.current);
          }
          preferenceTimerRef.current = setTimeout(() => {
            preferenceTimerRef.current = null;
            void performPreferenceSync();
          }, PREFERENCE_SYNC_DEBOUNCE_MS);
        }
      });
    preferenceOperationRef.current = operation;
    return operation;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    configureLocalNotificationHandler();
    let active = true;
    Promise.all([
      refreshPermissionStatus(),
      getOrCreateInstallationId().then((value) => {
        if (active) {
          setInstallation(value);
          setInstallationIdStatus(value.status);
        }
      }),
    ])
      .catch(() => {
        if (active) setInstallationIdStatus('error');
      })
      .finally(() => {
        if (active) setIsInitializing(false);
      });
    return () => {
      active = false;
      mountedRef.current = false;
    };
  }, [refreshPermissionStatus]);

  useEffect(() => {
    const openSafeResponse = (
      response: ReturnType<typeof getLastNotificationResponse>,
    ) => {
      if (!response) return;
      const destination = getSafeNotificationResponseDestination(response);
      if (!destination) return;
      const key = getNotificationResponseKey(response);
      if (handledResponsesRef.current.has(key)) return;
      handledResponsesRef.current.add(key);
      router.push(destination);
    };
    openSafeResponse(getLastNotificationResponse());
    const responseSubscription = addNotificationResponseListener(openSafeResponse);
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshPermissionStatus();
    });
    return () => {
      responseSubscription.remove();
      appStateSubscription.remove();
    };
  }, [refreshPermissionStatus]);

  useEffect(() => {
    const subscription = addPushTokenListener((nativeToken) => {
      if (
        notificationsEnabledRef.current &&
        permissionStatusRef.current === 'granted' &&
        getPushAvailabilityReason() === 'available'
      ) {
        void runRegistration(nativeToken);
      }
    });
    return () => subscription.remove();
  }, [runRegistration]);

  useEffect(() => {
    if (
      !isHydrated ||
      isInitializing ||
      startupRegistrationAttemptedRef.current ||
      !notificationsEnabled ||
      permissionStatus !== 'granted'
    ) {
      return;
    }
    startupRegistrationAttemptedRef.current = true;
    void runRegistration();
  }, [
    isHydrated,
    isInitializing,
    notificationsEnabled,
    permissionStatus,
    runRegistration,
  ]);

  useEffect(() => {
    if (isInitializing || pushRegistrationStatus !== 'initializing') return;
    if (pushAvailabilityReason !== 'available') {
      setPushRegistrationStatus(
        pushAvailabilityReason === 'unsupported-platform'
          ? 'unsupported'
          : pushAvailabilityReason,
      );
    } else if (permissionStatus === 'denied') {
      setPushRegistrationStatus('permission-denied');
    } else if (permissionStatus !== 'granted') {
      setPushRegistrationStatus('permission-undetermined');
    } else {
      setPushRegistrationStatus(notificationsEnabled ? 'ready' : 'unregistered');
    }
  }, [
    isInitializing,
    notificationsEnabled,
    permissionStatus,
    pushAvailabilityReason,
    pushRegistrationStatus,
  ]);

  useEffect(() => {
    if (!pushRegistration || !notificationsEnabled) return;
    if (!shouldSyncPushPreferences(confirmedPreferencesRef.current, pushPreferences)) return;
    setPreferenceSyncStatus('pending');
    if (preferenceTimerRef.current) clearTimeout(preferenceTimerRef.current);
    preferenceTimerRef.current = setTimeout(() => {
      preferenceTimerRef.current = null;
      void performPreferenceSync();
    }, PREFERENCE_SYNC_DEBOUNCE_MS);
    return () => {
      if (preferenceTimerRef.current) {
        clearTimeout(preferenceTimerRef.current);
        preferenceTimerRef.current = null;
      }
    };
  }, [notificationsEnabled, performPreferenceSync, pushPreferences, pushRegistration]);

  const enablePushNotifications = useCallback(() => {
    if (permissionRequestRef.current) return permissionRequestRef.current;
    setIsRequestingPermission(true);
    setPushError(null);
    const operation = (async () => {
      const availability = getPushAvailabilityReason();
      if (availability !== 'available') {
        setPushRegistrationStatus(
          availability === 'unsupported-platform'
            ? 'unsupported'
            : availability,
        );
        return permissionStatusRef.current;
      }
      await ensureAndroidNotificationChannel();
      let permission = await getNotificationPermissionSnapshot();
      if (permission.status === 'undetermined') {
        permission = await requestNotificationPermissionSnapshot();
      }
      setPermissionStatus(permission.status);
      setCanAskPermissionAgain(permission.canAskAgain);
      permissionStatusRef.current = permission.status;
      if (permission.status !== 'granted') {
        setPushRegistrationStatus(
          permission.status === 'denied'
            ? 'permission-denied'
            : 'permission-undetermined',
        );
        return permission.status;
      }
      await runRegistration();
      if (registrationRef.current) setNotificationsEnabled(true);
      return permission.status;
    })()
      .catch((error) => {
        setPushError(getSafePushError(error));
        return 'unavailable' as const;
      })
      .finally(() => {
        permissionRequestRef.current = null;
        setIsRequestingPermission(false);
      });
    permissionRequestRef.current = operation;
    return operation;
  }, [runRegistration, setNotificationsEnabled]);

  const unregisterPushNotifications = useCallback(() => {
    if (unregisterOperationRef.current) return unregisterOperationRef.current;
    const registration = registrationRef.current;
    if (!registration) {
      setPushError(
        'La désinscription serveur ne peut pas être confirmée sans token Push. Réessayez dans un environnement compatible.',
      );
      return Promise.resolve(false);
    }
    setPushRegistrationStatus('unregistering');
    setPushError(null);
    const operation = unregisterPushDevice(registration)
      .then(() => {
        if (!mountedRef.current) return false;
        registrationRef.current = null;
        confirmedPreferencesRef.current = null;
        setPushRegistration(null);
        setPreferenceSyncStatus('idle');
        setPushRegistrationStatus('unregistered');
        setNotificationsEnabled(false);
        return true;
      })
      .catch((error) => {
        if (mountedRef.current) {
          setPushRegistrationStatus(getFailureStatus(error));
          setPushError(getSafePushError(error));
        }
        return false;
      })
      .finally(() => {
        unregisterOperationRef.current = null;
      });
    unregisterOperationRef.current = operation;
    return operation;
  }, [setNotificationsEnabled]);

  const sendTestNotification = useCallback(async () => {
    if (
      isSchedulingTest ||
      permissionStatus !== 'granted' ||
      !notificationsEnabled
    ) return;
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

  const openSystemSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch {
      setLastError('Les réglages système n’ont pas pu être ouverts.');
    }
  }, []);

  const isPushOperationPending =
    pushRegistrationStatus === 'registering' ||
    pushRegistrationStatus === 'unregistering' ||
    preferenceSyncStatus === 'syncing';
  const value = useMemo<NotificationContextValue>(
    () => ({
      isInitialized: !isInitializing,
      permissionStatus,
      canAskPermissionAgain,
      isPermissionGranted: permissionStatus === 'granted',
      isPermissionDenied: permissionStatus === 'denied',
      notificationsEnabled,
      isInitializing,
      isRequestingPermission,
      isSchedulingTest,
      testFeedback,
      lastError,
      pushError,
      pushRuntimeEnvironment,
      pushAvailabilityReason,
      pushRegistrationStatus,
      preferenceSyncStatus,
      installationIdStatus,
      installationIdKind: installation?.kind ?? null,
      hasEasProjectId,
      installationId: installation?.installationId ?? null,
      hasExpoPushToken: Boolean(pushRegistration?.expoPushToken),
      isPushRegistered: Boolean(pushRegistration),
      isPushOperationPending,
      enableNotifications: enablePushNotifications,
      enablePushNotifications,
      unregisterPushNotifications,
      retryPushRegistration: runRegistration,
      syncPushPreferences: performPreferenceSync,
      clearPushError: () => setPushError(null),
      refreshPermissionStatus,
      openSystemSettings,
      sendTestNotification,
    }),
    [
      canAskPermissionAgain,
      enablePushNotifications,
      hasEasProjectId,
      installation,
      installationIdStatus,
      isInitializing,
      isPushOperationPending,
      isRequestingPermission,
      isSchedulingTest,
      lastError,
      notificationsEnabled,
      openSystemSettings,
      performPreferenceSync,
      permissionStatus,
      preferenceSyncStatus,
      pushAvailabilityReason,
      pushError,
      pushRegistration,
      pushRegistrationStatus,
      pushRuntimeEnvironment,
      refreshPermissionStatus,
      runRegistration,
      sendTestNotification,
      testFeedback,
      unregisterPushNotifications,
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
