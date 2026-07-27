import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type NotificationPreferenceCardProps = {
  enabled: boolean;
  onValueChange: (value: boolean) => void;
};

export function NotificationPreferenceCard({
  enabled,
  onValueChange,
}: NotificationPreferenceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name="notifications-outline" size={21} color={theme.colors.yellow} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.description}>
          Les notifications push seront disponibles prochainement.
        </Text>
        <Text style={styles.localStatus}>
          Préférence locale : {enabled ? 'activée' : 'désactivée'}
        </Text>
      </View>
      <Switch
        accessibilityLabel="Préférence locale pour les futures notifications"
        accessibilityRole="switch"
        accessibilityState={{ checked: enabled }}
        onValueChange={onValueChange}
        thumbColor={theme.colors.text}
        trackColor={{ false: '#34405F', true: theme.colors.primary }}
        value={enabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: 'rgba(252,205,18,0.1)',
  },
  content: {
    minWidth: 0,
    flex: 1,
    gap: 4,
  },
  title: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
  },
  localStatus: {
    color: theme.colors.yellow,
    fontSize: 10,
    fontWeight: '700',
  },
});
