import { StyleSheet, Switch, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type {
  NotificationPreferenceKey,
  NotificationPreferences,
} from '@/types/notification-preferences';

const options: {
  key: NotificationPreferenceKey;
  label: string;
}[] = [
  { key: 'notifyNewVideos', label: 'Nouvelles vidéos' },
  { key: 'notifyLiveStarts', label: 'Début des directs' },
  { key: 'notifyFollowedEmissions', label: 'Émissions suivies' },
];

export function NotificationDetailPreferences({
  preferences,
  onChange,
}: {
  preferences: NotificationPreferences;
  onChange: (key: NotificationPreferenceKey, value: boolean) => void;
}) {
  return (
    <View style={styles.card}>
      {options.map((option, index) => (
        <View
          key={option.key}
          style={[styles.row, index > 0 && styles.dividedRow]}>
          <Text style={styles.label}>{option.label}</Text>
          <Switch
            accessibilityLabel={`Préférence locale : ${option.label}`}
            accessibilityRole="switch"
            accessibilityState={{ checked: preferences[option.key] }}
            onValueChange={(value) => onChange(option.key, value)}
            thumbColor={theme.colors.text}
            trackColor={{ false: '#34405F', true: theme.colors.primary }}
            value={preferences[option.key]}
          />
        </View>
      ))}
      <Text style={styles.note}>
        Ces choix seront utilisés par les prochaines alertes automatiques.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 15,
  },
  dividedRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  label: { flex: 1, color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  note: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    color: theme.colors.muted,
    fontSize: 10,
    lineHeight: 15,
  },
});
