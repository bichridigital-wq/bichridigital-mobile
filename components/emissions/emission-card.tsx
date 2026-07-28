import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type EmissionCardProps = {
  title: string;
  category: string;
  accent: string;
  highlighted?: boolean;
  status?: string;
  onPress: () => void;
};

export function EmissionCard({ title, category, accent, highlighted = false, status, onPress }: EmissionCardProps) {
  const isUpcoming = status?.toLowerCase().includes('bientôt');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir l’émission ${title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        highlighted && styles.highlightedCard,
        { borderColor: accent },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {isUpcoming ? (
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingText}>BIENTÔT</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.category}>{category}</Text>
      </View>
      <Text style={styles.viewText}>Voir</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
  },
  highlightedCard: {
    backgroundColor: 'rgba(0,36,255,0.16)',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  category: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  upcomingBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: theme.colors.yellow,
  },
  upcomingText: {
    color: theme.colors.background,
    fontSize: 10,
    fontWeight: '800',
  },
  viewText: {
    color: theme.colors.yellow,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
});
