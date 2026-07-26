import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '@/constants/theme';

type LivePlayerPlaceholderProps = {
  title: string;
  description: string;
  timeLabel: string;
  accent: string;
  badgeLabel?: string;
};

export function LivePlayerPlaceholder({ title, description, timeLabel, accent, badgeLabel = 'EN DIRECT' }: LivePlayerPlaceholderProps) {
  return (
    <View style={[styles.card, { borderColor: accent }]}> 
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badgeLabel}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.description} numberOfLines={3}>{description}</Text>
          <Text style={styles.time}>{timeLabel}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Regarder le direct"
            accessibilityHint="Aucune action disponible pour l’instant"
            disabled
            style={[styles.primaryButton, { backgroundColor: accent }]}
          >
            <Text style={styles.primaryButtonText}>Regarder le direct</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Partager"
            accessibilityHint="Aucune action disponible pour l’instant"
            disabled
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Partager</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    gap: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(252,205,18,0.16)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: theme.colors.yellow,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  content: {
    gap: 14,
  },
  textBlock: {
    gap: 6,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  time: {
    color: theme.colors.yellow,
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
