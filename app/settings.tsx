import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandCard } from '@/components/more/brand-card';
import { LegalLinkRow } from '@/components/more/legal-link-row';
import { MoreLinkRow } from '@/components/more/more-link-row';
import { NotificationPreferenceCard } from '@/components/more/notification-preference-card';
import { SocialLinkGrid } from '@/components/more/social-link-grid';
import { NotificationDeviceStatusCard } from '@/components/profile/notification-device-status-card';
import { NotificationDetailPreferences } from '@/components/profile/notification-detail-preferences';
import { ProfileSectionHeader } from '@/components/profile/profile-section-header';
import { usefulLinks } from '@/constants/more-content';
import { theme } from '@/constants/theme';
import { useNotifications } from '@/hooks/use-notifications';
import { useUserLibrary } from '@/hooks/use-user-library';

const usefulLinkIcons = {
  website: 'globe-outline',
  services: 'briefcase-outline',
  contact: 'chatbubble-ellipses-outline',
  youtube: 'logo-youtube',
} as const;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isHydrated, clearAllLibraryData, notificationPreferences, setNotificationPreference } = useUserLibrary();
  const {
    permissionStatus,
    notificationsEnabled,
    isInitializing: isInitializingNotifications,
    isRequestingPermission,
    isSchedulingTest,
    testFeedback,
    lastError: notificationError,
    enablePushNotifications,
    unregisterPushNotifications,
    retryPushRegistration,
    syncPushPreferences,
    openSystemSettings,
    sendTestNotification,
    pushRuntimeEnvironment,
    pushAvailabilityReason,
    pushRegistrationStatus,
    preferenceSyncStatus,
    installationIdStatus,
    installationIdKind,
    hasEasProjectId,
    installationId,
    isPushRegistered,
    isPushOperationPending,
    canAskPermissionAgain,
    pushError,
  } = useNotifications();

  const maskedInstallationId = installationId
    ? `••••••••-••••-••••-••••-${installationId.slice(-12)}`
    : null;

  const confirmPushUnregistration = () => {
    Alert.alert(
      'Désactiver les notifications Push ?',
      'L’appareil sera désinscrit du serveur. Cette action ne révoque pas l’autorisation système et conserve vos choix locaux.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désactiver',
          style: 'destructive',
          onPress: () => {
            void unregisterPushNotifications().then((success) => {
              if (success) {
                Alert.alert('Notifications Push désactivées');
              }
            });
          },
        },
      ],
    );
  };

  const updateNotifications = async (enabled: boolean) => {
    if (!enabled) {
      confirmPushUnregistration();
      return;
    }

    const status = await enablePushNotifications();
    if (status === 'denied') {
      Alert.alert(
        'Notifications désactivées',
        'L’autorisation a été refusée. Vous pouvez l’activer dans les réglages de votre appareil.',
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Ouvrir les réglages', onPress: openSystemSettings },
        ],
      );
    }
  };

  const openExternalUrl = async (url: string) => {
    if (!url) {
      return;
    }
    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      }
    } catch {
      // Official links are optional and must not interrupt settings.
    }
  };

  const confirmClearAll = () => {
    Alert.alert(
      'Effacer mes données locales ?',
      'Vos favoris, votre historique et vos préférences seront supprimés uniquement de cet appareil.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => {
            if (!isPushRegistered) {
              clearAllLibraryData();
              return;
            }
            void unregisterPushNotifications().then((success) => {
              if (success) clearAllLibraryData();
            });
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour au profil"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profil')}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.yellow} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.screenTitle}>Paramètres</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {!isHydrated ? <Text style={styles.loading}>Chargement des paramètres…</Text> : (
          <View style={styles.sections}>
            <View style={styles.section}>
              <ProfileSectionHeader title="Notifications" />
              <NotificationPreferenceCard
                disabled={
                  isInitializingNotifications ||
                  isRequestingPermission ||
                  isPushOperationPending
                }
                enabled={notificationsEnabled}
                onValueChange={(enabled) => {
                  void updateNotifications(enabled);
                }}
              />
              {notificationsEnabled ? (
                <NotificationDetailPreferences
                  onChange={setNotificationPreference}
                  preferences={notificationPreferences}
                />
              ) : null}
              <NotificationDeviceStatusCard
                enabled={notificationsEnabled}
                isInitializing={isInitializingNotifications}
                isSchedulingTest={isSchedulingTest}
                isPushOperationPending={isPushOperationPending}
                lastError={notificationError}
                pushError={pushError}
                canAskPermissionAgain={canAskPermissionAgain}
                onEnablePush={() => {
                  void enablePushNotifications();
                }}
                onOpenSettings={() => {
                  void openSystemSettings();
                }}
                onRetryRegistration={() => {
                  void retryPushRegistration();
                }}
                onRetrySync={() => {
                  void syncPushPreferences();
                }}
                onSendTest={() => {
                  void sendTestNotification();
                }}
                onUnregister={confirmPushUnregistration}
                status={permissionStatus}
                testFeedback={testFeedback}
                pushRuntimeEnvironment={pushRuntimeEnvironment}
                pushAvailabilityReason={pushAvailabilityReason}
                pushRegistrationStatus={pushRegistrationStatus}
                preferenceSyncStatus={preferenceSyncStatus}
                installationIdStatus={installationIdStatus}
                installationIdKind={installationIdKind}
                hasEasProjectId={hasEasProjectId}
                maskedInstallationId={maskedInstallationId}
                isPushRegistered={isPushRegistered}
              />
            </View>

            <View style={styles.divider} />
            <ProfileSectionHeader title="Bichridigital" />
            <BrandCard />

            <View style={styles.section}>
              <ProfileSectionHeader title="Liens officiels" />
              <View style={styles.list}>
                {usefulLinks.map((link) => (
                  <MoreLinkRow
                    icon={usefulLinkIcons[link.id]}
                    key={link.id}
                    onPress={() => openExternalUrl(link.url)}
                    subtitle={link.subtitle}
                    title={link.title}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <ProfileSectionHeader title="Réseaux sociaux" />
              <SocialLinkGrid onOpen={openExternalUrl} />
            </View>

            <View style={styles.section}>
              <ProfileSectionHeader title="Informations légales" />
              <View style={styles.list}>
                <LegalLinkRow
                  title="Mentions légales"
                  url="https://www.bichridigital.com/mentions-legales"
                  onOpen={openExternalUrl}
                />

                <LegalLinkRow
                  title="Politique de confidentialité"
                  url="https://www.bichridigital.com/politique-confidentialite"
                  onOpen={openExternalUrl}
                />
              </View>
            </View>

            <Pressable
              accessibilityLabel="Effacer mes données locales"
              accessibilityRole="button"
              onPress={confirmClearAll}
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.pressed,
              ]}>
              <Ionicons
                color={theme.colors.muted}
                name="trash-outline"
                size={18}
              />
              <Text style={styles.resetText}>Effacer mes données locales</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md },
  backButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: theme.colors.secondary },
  screenTitle: { flex: 1, color: theme.colors.text, fontSize: 24, fontWeight: '900' },
  content: { paddingHorizontal: theme.spacing.lg },
  sections: { gap: theme.spacing.xl },
  section: { gap: 11 },
  list: { gap: 10 },
  loading: { color: theme.colors.muted },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  resetButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: theme.colors.secondary,
  },
  resetText: { color: theme.colors.muted, fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});
