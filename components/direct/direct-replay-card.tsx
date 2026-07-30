import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Replay } from '@/constants/replays-content';
import { theme } from '@/constants/theme';

type DirectReplayCardProps = {
  onPress: () => void;
  replay: Replay;
};

export function DirectReplayCard({ onPress, replay }: DirectReplayCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Regarder le replay ${replay.title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.visual, { backgroundColor: replay.coverColor }]}>
        {replay.thumbnailUrl ? (
          <Image
            accessibilityLabel={`Miniature de ${replay.title}`}
            contentFit="cover"
            source={replay.thumbnailUrl}
            style={styles.image}
          />
        ) : null}
        <View style={styles.duration}>
          <Text style={styles.durationText}>{replay.duration}</Text>
        </View>
      </View>
      <Text numberOfLines={2} style={styles.title}>{replay.title}</Text>
      <Text numberOfLines={1} style={styles.channel}>{replay.showTitle}</Text>
      <Text style={styles.date}>{replay.publishedAt}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 210,
    flexShrink: 0,
    gap: 7,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  visual: { height: 108, overflow: 'hidden', borderRadius: 13 },
  image: { width: '100%', height: '100%' },
  duration: {
    position: 'absolute',
    right: 7,
    bottom: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: 'rgba(2,11,46,0.88)',
  },
  durationText: { color: theme.colors.text, fontSize: 10, fontWeight: '800' },
  title: { minHeight: 38, color: theme.colors.text, fontSize: 14, lineHeight: 19, fontWeight: '800' },
  channel: { color: theme.colors.muted, fontSize: 12 },
  date: { color: theme.colors.yellow, fontSize: 11, fontWeight: '700' },
  pressed: { opacity: 0.82 },
});
