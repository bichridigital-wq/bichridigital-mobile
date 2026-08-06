import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { theme } from '@/constants/theme';
import type {
  InstallationIdKind,
  InstallationIdStatus,
} from '@/services/installation-id';
import type {
  NotificationPermissionStatus,
  NotificationTestFeedback,
} from '@/types/notifications';
import type {
  PreferenceSyncStatus,
  PushAvailabilityReason,
  PushRegistrationStatus,
  PushRuntimeEnvironment,
} from '@/types/push-notifications';

const permissionLabels: Record<NotificationPermissionStatus, string> = {
  undetermined: 'Non demandée',
  granted: 'Accordée',
  denied: 'Refusée',
  unavailable: 'Indisponible',
};
const runtimeLabels: Record<PushRuntimeEnvironment, string> = {
  'expo-go': 'Expo Go',
  'development-build': 'Development build',
  production: 'Production',
};
const availabilityLabels: Record<PushAvailabilityReason, string> = {
  available: 'Disponible',
  'expo-go': 'Indisponible dans Expo Go',
  simulator: 'Appareil physique requis',
  'missing-project-id': 'projectId EAS absent',
  'unsupported-platform': 'Plateforme non prise en charge',
};
const registrationLabels: Record<PushRegistrationStatus, string> = {
  initializing: 'Initialisation…',
  unsupported: 'Non pris en charge',
  'expo-go': 'Indisponible dans Expo Go',
  simulator: 'Appareil physique requis',
  'missing-project-id': 'En attente du projectId',
  'permission-undetermined': 'Permission non demandée',
  'permission-denied': 'Permission refusée',
  ready: 'Prêt',
  registering: 'Inscription…',
  registered: 'Inscrit',
  unregistering: 'Désinscription…',
  unregistered: 'Notifications Push désactivées',
  'network-error': 'Erreur réseau',
  'server-error': 'Erreur serveur',
};
const syncLabels: Record<PreferenceSyncStatus, string> = {
  idle: 'En attente',
  synced: 'Synchronisées',
  pending: 'Modification en attente',
  syncing: 'Synchronisation…',
  'network-error': 'Erreur réseau',
  'server-error': 'Erreur serveur',
};
const migrationLabels: Record<InstallationIdKind, string> = {
  uuid: 'UUID sécurisé prêt',
  'legacy-migrated': 'Ancien identifiant migré',
  'invalid-migrated': 'Identifiant invalide remplacé',
};

type Props = {
  enabled: boolean;
  isInitializing: boolean;
  isSchedulingTest: boolean;
  isPushOperationPending: boolean;
  lastError: string | null;
  pushError: string | null;
  onOpenSettings: () => void;
  onSendTest: () => void;
  onEnablePush: () => void;
  onRetryRegistration: () => void;
  onRetrySync: () => void;
  onUnregister: () => void;
  status: NotificationPermissionStatus;
  canAskPermissionAgain: boolean;
  testFeedback: NotificationTestFeedback;
  pushRuntimeEnvironment: PushRuntimeEnvironment;
  pushAvailabilityReason: PushAvailabilityReason;
  pushRegistrationStatus: PushRegistrationStatus;
  preferenceSyncStatus: PreferenceSyncStatus;
  installationIdStatus: InstallationIdStatus | 'initializing' | 'error';
  installationIdKind: InstallationIdKind | null;
  hasEasProjectId: boolean;
  maskedInstallationId: string | null;
  isPushRegistered: boolean;
};

export function NotificationDeviceStatusCard(props: Props) {
  const registrationFailed =
    props.pushRegistrationStatus === 'network-error' ||
    props.pushRegistrationStatus === 'server-error';
  const syncFailed =
    props.preferenceSyncStatus === 'network-error' ||
    props.preferenceSyncStatus === 'server-error';
  return (
    <View style={styles.card}>
      <View style={styles.statusRow}>
        <Ionicons color={theme.colors.yellow} name="phone-portrait-outline" size={20} />
        <View style={styles.content}>
          <Text style={styles.title}>Notifications sur cet appareil</Text>
          <Text style={styles.status}>
            {props.isInitializing ? 'Vérification…' : permissionLabels[props.status]}
          </Text>
        </View>
      </View>
      <View style={styles.pushDetails}>
        <Text style={styles.detail}>Environnement : {runtimeLabels[props.pushRuntimeEnvironment]}</Text>
        <Text style={styles.detail}>Push distant : {availabilityLabels[props.pushAvailabilityReason]}</Text>
        <Text style={styles.detail}>Permission : {permissionLabels[props.status]}</Text>
        <Text style={styles.detail}>Configuration EAS : {props.hasEasProjectId ? 'projectId présent' : 'projectId absent'}</Text>
        <Text style={styles.detail}>
          Installation : {props.installationIdKind ? migrationLabels[props.installationIdKind] : 'Initialisation…'}
          {props.maskedInstallationId ? ` (${props.maskedInstallationId})` : ''}
        </Text>
        <Text style={styles.detail}>
          Migration : {props.installationIdStatus === 'migration-pending' ? 'confirmation serveur en attente' : props.installationIdStatus === 'ready' ? 'terminée' : props.installationIdStatus}
        </Text>
        <Text style={styles.detail}>Inscription serveur : {registrationLabels[props.pushRegistrationStatus]}</Text>
        <Text style={styles.detail}>Préférences : {syncLabels[props.preferenceSyncStatus]}</Text>
      </View>
      {props.pushRuntimeEnvironment === 'expo-go' ? (
        <Text style={styles.warning}>Expo Go ne permet pas le Push distant sur Android. Utilisez une development build.</Text>
      ) : null}
      {props.lastError || props.pushError ? (
        <Text accessibilityRole="alert" style={styles.error}>{props.pushError ?? props.lastError}</Text>
      ) : null}
      {props.testFeedback === 'scheduled' ? (
        <Text accessibilityRole="alert" style={styles.feedback}>Notification locale de test programmée.</Text>
      ) : null}
      <View style={styles.actions}>
        {!props.isPushRegistered ? (
          <ActionButton disabled={props.isPushOperationPending} label="Activer les notifications Push" onPress={props.onEnablePush} primary />
        ) : null}
        {registrationFailed ? (
          <ActionButton disabled={props.isPushOperationPending} label="Réessayer l’inscription" onPress={props.onRetryRegistration} />
        ) : null}
        {syncFailed ? (
          <ActionButton disabled={props.isPushOperationPending} label="Réessayer la synchronisation" onPress={props.onRetrySync} />
        ) : null}
        {props.isPushRegistered ? (
          <ActionButton disabled={props.isPushOperationPending} label="Désactiver les notifications Push" onPress={props.onUnregister} />
        ) : null}
        {props.status === 'denied' && !props.canAskPermissionAgain ? (
          <ActionButton label="Ouvrir les réglages" onPress={props.onOpenSettings} />
        ) : null}
        {props.status === 'granted' && props.enabled ? (
          <ActionButton disabled={props.isSchedulingTest} label={props.isSchedulingTest ? 'Programmation…' : 'Notification locale de test'} onPress={props.onSendTest} />
        ) : null}
      </View>
    </View>
  );
}

function ActionButton({ disabled = false, label, onPress, primary = false }: { disabled?: boolean; label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, primary && styles.primaryButton, pressed && styles.pressed, disabled && styles.disabled]}>
      {disabled ? <ActivityIndicator color={primary ? theme.colors.background : theme.colors.text} size="small" /> : null}
      <Text style={[styles.buttonText, primary && styles.primaryText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, padding: 15, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(252,205,18,0.18)', backgroundColor: theme.colors.secondary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  content: { flex: 1, gap: 3 },
  title: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  status: { color: theme.colors.yellow, fontSize: 11, fontWeight: '700' },
  pushDetails: { gap: 4, padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.035)' },
  detail: { color: theme.colors.muted, fontSize: 10, lineHeight: 15 },
  warning: { color: theme.colors.yellow, fontSize: 11, lineHeight: 16 },
  error: { color: '#FF9B9B', fontSize: 11, lineHeight: 16 },
  feedback: { color: theme.colors.yellow, fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  button: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 13, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  primaryButton: { borderColor: theme.colors.yellow, backgroundColor: theme.colors.yellow },
  buttonText: { color: theme.colors.text, fontSize: 11, fontWeight: '700' },
  primaryText: { color: theme.colors.background, fontWeight: '800' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.6 },
});
