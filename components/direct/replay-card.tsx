import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type ReplayCardProps = {
  title: string;
  emission: string;
  duration: string;
  relativeDate: string;
  accent: string;
  thumbnailUrl?: string;
  onPress: () => void;
};

export function ReplayCard({
  title,
  emission,
  duration,
  relativeDate,
  accent,
  thumbnailUrl,
  onPress,
}: ReplayCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Regarder ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: accent },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.visual, { backgroundColor: accent }]}>
        {thumbnailUrl ? (
          <Image contentFit="cover" source={thumbnailUrl} style={styles.image} />
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.emission} numberOfLines={1}>{emission}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>{duration}</Text>
        <Text style={styles.metaText}>•</Text>
        <Text style={styles.metaText}>{relativeDate}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 190,
    flexShrink: 0,
    gap: 8,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: theme.colors.card,
  },
  visual: {
    height: 96,
    overflow: 'hidden',
    borderRadius: 14,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pressed: {
    opacity: 0.84,
  },
  title: {
    minHeight: 36,
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  emission: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: theme.colors.yellow,
    fontSize: 11,
    fontWeight: '600',
  },
});
