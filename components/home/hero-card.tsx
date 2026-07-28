import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RemoteThumbnail } from '@/components/home/remote-thumbnail';
import { theme } from '@/constants/theme';

type HeroCardProps = {
  category: string;
  title: string;
  duration: string;
  relativeDate: string;
  thumbnailUrl?: string;
  accent: string;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
};

export function HeroCard({
  category,
  title,
  duration,
  relativeDate,
  thumbnailUrl,
  accent,
  onPrimaryPress,
  onSecondaryPress,
}: HeroCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: accent }]}>
      <RemoteThumbnail
        fallbackColor={accent}
        style={StyleSheet.absoluteFill}
        uri={thumbnailUrl}
      />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{category}</Text>
        </View>
        <Text numberOfLines={3} style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{duration} · {relativeDate}</Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={`Regarder ${title}`}
            accessibilityRole="button"
            onPress={onPrimaryPress}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>Regarder</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={`Découvrir ${title}`}
            accessibilityRole="button"
            onPress={onSecondaryPress}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Découvrir</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 250,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,11,46,0.56)',
  },
  content: {
    justifyContent: 'flex-end',
    padding: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  badgeText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  meta: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginBottom: 18,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: theme.colors.text,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
