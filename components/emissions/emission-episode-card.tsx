import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RemoteThumbnail } from '@/components/home/remote-thumbnail';
import type { Replay } from '@/constants/replays-content';
import { theme } from '@/constants/theme';

export function EmissionEpisodeCard({
  episode,
  onPress,
}: {
  episode: Replay;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`Lire ${episode.title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <RemoteThumbnail
        fallbackColor={episode.coverColor}
        style={styles.thumbnail}
        uri={episode.thumbnailUrl}
      />
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {episode.title}
        </Text>
        <View style={styles.meta}>
          <Text numberOfLines={1} style={styles.metaText}>
            {episode.duration}
          </Text>
          <View style={styles.dot} />
          <Text numberOfLines={1} style={styles.metaText}>
            {episode.publishedAt}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 112,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: theme.colors.secondary,
  },
  thumbnail: { width: 142, minHeight: 112 },
  content: { flex: 1, justifyContent: 'center', gap: 12, padding: 12 },
  title: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metaText: { flexShrink: 1, color: theme.colors.muted, fontSize: 11 },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: theme.colors.muted,
  },
  pressed: { opacity: 0.82 },
});
