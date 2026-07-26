import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type ReplayCardProps = {
  title: string;
  emission: string;
  duration: string;
  relativeDate: string;
  accent: string;
};

export function ReplayCard({ title, emission, duration, relativeDate, accent }: ReplayCardProps) {
  return (
    <View style={[styles.card, { borderColor: accent }]}> 
      <View style={[styles.visual, { backgroundColor: accent }]} />
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.emission} numberOfLines={1}>{emission}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>{duration}</Text>
        <Text style={styles.metaText}>•</Text>
        <Text style={styles.metaText}>{relativeDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 170,
    flexShrink: 0,
    borderRadius: 18,
    padding: 10,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    gap: 8,
  },
  visual: {
    borderRadius: 14,
    height: 84,
  },
  title: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  emission: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  meta: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  metaText: {
    color: theme.colors.yellow,
    fontSize: 11,
    fontWeight: '600',
  },
});
