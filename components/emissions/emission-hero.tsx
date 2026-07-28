import { StyleSheet, Text, View } from 'react-native';

import { RemoteThumbnail } from '@/components/home/remote-thumbnail';
import type { EmissionItem } from '@/constants/emissions-content';
import { theme } from '@/constants/theme';

export function EmissionHero({ emission }: { emission: EmissionItem }) {
  const isComingSoon = emission.slug === 'xam-ndiagne-jotna';

  return (
    <View style={styles.card}>
      <RemoteThumbnail
        fallbackColor={emission.coverColor}
        style={styles.banner}
        uri={emission.thumbnailUrl}
      />
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{emission.category}</Text>
          <View
            accessibilityLabel={isComingSoon ? 'Bientôt' : emission.status}
            style={[styles.badge, isComingSoon && styles.comingSoonBadge]}>
            <Text style={[styles.badgeText, isComingSoon && styles.comingSoonText]}>
              {isComingSoon ? 'BIENTÔT' : emission.status}
            </Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.title}>
          {emission.title}
        </Text>
        <Text style={styles.description}>{emission.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  banner: { width: '100%', aspectRatio: 16 / 9 },
  content: { gap: 10, padding: theme.spacing.md },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  category: { color: theme.colors.yellow, fontSize: 13, fontWeight: '800' },
  badge: {
    maxWidth: '58%',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0,36,255,0.28)',
  },
  badgeText: { color: theme.colors.text, fontSize: 10, fontWeight: '800' },
  comingSoonBadge: { backgroundColor: theme.colors.yellow },
  comingSoonText: { color: theme.colors.background },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
});
