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
  NotificationPermissionStatus,
  NotificationTestFeedback,
} from '@/types/notifications';

const statusLabels: Record<NotificationPermissionStatus, string> = {
  undetermined: 'Autorisation non demandée',
  granted: 'Autorisation système accordée',
  denied: 'Autorisation refusée',
  unavailable: 'Notifications indisponibles',
};

type Props = {
  enabled: boolean;
  isInitializing: boolean;
  isSchedulingTest: boolean;
  lastError: string | null;
  onOpenSettings: () => void;
  onSendTest: () => void;
  status: NotificationPermissionStatus;
  testFeedback: NotificationTestFeedback;
};

export function NotificationDeviceStatusCard({
  enabled,
  isInitializing,
  isSchedulingTest,
  lastError,
  onOpenSettings,
  onSendTest,
  status,
  testFeedback,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.statusRow}>
        <Ionicons
          color={status === 'granted' ? theme.colors.yellow : theme.colors.muted}
          name="phone-portrait-outline"
          size={20}
        />
        <View style={styles.content}>
          <Text style={styles.title}>Notifications sur cet appareil</Text>
          <Text style={styles.status}>
            {isInitializing ? 'Vérification…' : statusLabels[status]}
          </Text>
        </View>
      </View>
      <Text style={styles.text}>
        Cette étape active les notifications locales sur cet appareil. Les
        alertes automatiques lors d’un direct ou d’une nouvelle vidéo seront
        ajoutées avec le service de notifications distant.
      </Text>
      {lastError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {lastError}
        </Text>
      ) : null}
      {testFeedback === 'scheduled' ? (
        <Text accessibilityRole="alert" style={styles.feedback}>
          Notification de test programmée.
        </Text>
      ) : null}
      <View style={styles.actions}>
        {status === 'granted' && enabled ? (
          <Pressable
            accessibilityLabel="Envoyer une notification locale de test"
            accessibilityRole="button"
            accessibilityState={{
              busy: isSchedulingTest,
              disabled: isSchedulingTest,
            }}
            disabled={isSchedulingTest}
            onPress={onSendTest}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              isSchedulingTest && styles.disabled,
            ]}>
            {isSchedulingTest ? (
              <ActivityIndicator color={theme.colors.background} size="small" />
            ) : (
              <Ionicons
                color={theme.colors.background}
                name="send-outline"
                size={16}
              />
            )}
            <Text style={styles.primaryText}>
              {isSchedulingTest
                ? 'Programmation…'
                : 'Envoyer une notification de test'}
            </Text>
          </Pressable>
        ) : null}
        {status === 'denied' ? (
          <Pressable
            accessibilityRole="button"
            onPress={onOpenSettings}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.secondaryText}>Ouvrir les réglages</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(252,205,18,0.18)',
    backgroundColor: theme.colors.secondary,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  content: { flex: 1, gap: 3 },
  title: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  status: { color: theme.colors.yellow, fontSize: 11, fontWeight: '700' },
  text: { color: theme.colors.muted, fontSize: 11, lineHeight: 17 },
  error: { color: '#FF9B9B', fontSize: 11, lineHeight: 16 },
  feedback: { color: theme.colors.yellow, fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  primaryButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 15,
    borderRadius: 13,
    backgroundColor: theme.colors.yellow,
  },
  primaryText: {
    color: theme.colors.background,
    fontSize: 11,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  secondaryText: { color: theme.colors.text, fontSize: 11, fontWeight: '700' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.6 },
});
