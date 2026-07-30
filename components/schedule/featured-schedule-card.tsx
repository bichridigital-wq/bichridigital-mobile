import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { CountdownValue } from '@/hooks/use-countdown';
import type { ScheduleEventViewModel } from '@/types/schedule';
import { formatDakarDate, formatDakarTime } from '@/utils/schedule-date';

type Props = {
  countdown: CountdownValue;
  event: ScheduleEventViewModel;
  hasReliableAction: boolean;
  onOpen: () => void;
  onRefreshLive: () => void;
};

function countdownLabel(value: CountdownValue): string {
  if (value.isComplete) return 'Horaire prévu atteint';
  if (value.days > 0) {
    return `${value.days} j · ${String(value.hours).padStart(2, '0')} h · ${String(value.minutes).padStart(2, '0')} min`;
  }
  if (value.hours > 0) {
    return `${String(value.hours).padStart(2, '0')} h · ${String(value.minutes).padStart(2, '0')} min · ${String(value.seconds).padStart(2, '0')} s`;
  }
  return `${String(value.minutes).padStart(2, '0')} min · ${String(value.seconds).padStart(2, '0')} s`;
}

export function FeaturedScheduleCard({
  countdown,
  event,
  hasReliableAction,
  onOpen,
  onRefreshLive,
}: Props) {
  const recentlyEnded =
    event.hasStarted &&
    event.scheduledEndTime !== null &&
    new Date(event.scheduledEndTime).getTime() < Date.now();
  const timingLabel = recentlyEnded
    ? 'Événement récemment programmé'
    : countdownLabel(countdown);

  return (
    <View style={styles.card}>
      <View style={styles.visual}>
        {event.thumbnailUrl ? (
          <Image
            accessibilityLabel={`Miniature de ${event.title}`}
            contentFit="cover"
            source={event.thumbnailUrl}
            style={styles.image}
          />
        ) : (
          <View style={styles.fallback}>
            <Ionicons color={theme.colors.yellow} name="calendar-outline" size={46} />
          </View>
        )}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>À VENIR</Text>
        </View>
      </View>
      <View style={styles.content}>
        {event.category ? <Text style={styles.category}>{event.category}</Text> : null}
        <Text numberOfLines={3} style={styles.title}>{event.title}</Text>
        {event.description ? (
          <Text numberOfLines={3} style={styles.description}>{event.description}</Text>
        ) : null}
        <Text style={styles.date}>
          {formatDakarDate(event.scheduledStartTime)}
        </Text>
        <Text
          accessibilityLabel={`${formatDakarTime(event.scheduledStartTime)}, heure de Dakar`}
          style={styles.time}>
          {formatDakarTime(event.scheduledStartTime)} · Heure de Dakar
        </Text>
        {event.location ? (
          <View style={styles.metaRow}>
            <Ionicons color={theme.colors.muted} name="location-outline" size={16} />
            <Text style={styles.meta}>{event.location}</Text>
          </View>
        ) : null}
        <Text accessibilityLabel={`Compte à rebours : ${timingLabel}`} style={styles.countdown}>
          {timingLabel}
        </Text>
        <View style={styles.actions}>
          {hasReliableAction ? (
            <Pressable
              accessibilityLabel={`Ouvrir ${event.title}`}
              accessibilityRole="button"
              onPress={onOpen}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryText}>
                {event.youtubeVideoId ? 'Ouvrir la diffusion' : "Voir l'émission"}
              </Text>
            </Pressable>
          ) : null}
          {event.hasStarted ? (
            <Pressable
              accessibilityLabel="Actualiser le statut du direct"
              accessibilityRole="button"
              onPress={onRefreshLive}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
              <Text style={styles.secondaryText}>Actualiser le direct</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(252,205,18,0.24)', backgroundColor: theme.colors.secondary },
  visual: { aspectRatio: 16 / 9, backgroundColor: theme.colors.card },
  image: { width: '100%', height: '100%' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A1A58' },
  badge: { position: 'absolute', left: 12, top: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: theme.colors.yellow },
  badgeText: { color: theme.colors.background, fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  content: { gap: 8, padding: theme.spacing.md },
  category: { color: theme.colors.yellow, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: 21, lineHeight: 28, fontWeight: '900' },
  description: { color: theme.colors.muted, fontSize: 13, lineHeight: 20 },
  date: { color: theme.colors.text, fontSize: 14, fontWeight: '800', textTransform: 'capitalize' },
  time: { color: theme.colors.muted, fontSize: 13 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { flex: 1, color: theme.colors.muted, fontSize: 13 },
  countdown: { color: theme.colors.yellow, fontSize: 15, fontWeight: '900', fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 4 },
  primaryButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 999, backgroundColor: theme.colors.primary },
  primaryText: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  secondaryButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  secondaryText: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
