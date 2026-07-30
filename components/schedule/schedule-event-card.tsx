import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { ScheduleEventViewModel } from '@/types/schedule';
import { formatDakarShortDate, formatDakarTime } from '@/utils/schedule-date';

type Props = {
  event: ScheduleEventViewModel;
  hasReliableAction: boolean;
  onOpen: () => void;
};

export function ScheduleEventCard({ event, hasReliableAction, onOpen }: Props) {
  const content = (
    <>
      <View style={styles.dateBlock}>
        <Text style={styles.date}>{formatDakarShortDate(event.scheduledStartTime)}</Text>
        <Text style={styles.time}>{formatDakarTime(event.scheduledStartTime)}</Text>
      </View>
      <View style={styles.content}>
        {event.category ? <Text style={styles.category}>{event.category}</Text> : null}
        <Text numberOfLines={2} style={styles.title}>{event.title}</Text>
        {event.location ? <Text numberOfLines={1} style={styles.meta}>{event.location}</Text> : null}
      </View>
      {hasReliableAction ? (
        <Ionicons color={theme.colors.yellow} name="chevron-forward" size={20} />
      ) : null}
    </>
  );

  return hasReliableAction ? (
    <Pressable
      accessibilityLabel={`Ouvrir ${event.title}, ${formatDakarShortDate(event.scheduledStartTime)} à ${formatDakarTime(event.scheduledStartTime)}, heure de Dakar`}
      accessibilityRole="button"
      onPress={onOpen}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {content}
    </Pressable>
  ) : (
    <View
      accessibilityLabel={`${event.title}, ${formatDakarShortDate(event.scheduledStartTime)} à ${formatDakarTime(event.scheduledStartTime)}, heure de Dakar`}
      style={styles.card}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 86, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: theme.colors.secondary },
  dateBlock: { width: 58, alignItems: 'center', gap: 4, paddingVertical: 8, borderRadius: 12, backgroundColor: theme.colors.card },
  date: { color: theme.colors.yellow, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  time: { color: theme.colors.text, fontSize: 12, fontWeight: '800' },
  content: { flex: 1, gap: 4 },
  category: { color: theme.colors.muted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: 14, lineHeight: 19, fontWeight: '800' },
  meta: { color: theme.colors.muted, fontSize: 11 },
  pressed: { opacity: 0.8 },
});
