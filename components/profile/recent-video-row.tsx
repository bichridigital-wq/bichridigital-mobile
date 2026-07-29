import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RemoteThumbnail } from '@/components/home/remote-thumbnail';
import { theme } from '@/constants/theme';
import type { RecentlyWatchedVideo } from '@/types/user-library';

export function RecentVideoRow({
  video,
  onOpen,
}: {
  video: RecentlyWatchedVideo;
  onOpen: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`Rouvrir ${video.title}`}
      accessibilityRole="button"
      onPress={onOpen}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <RemoteThumbnail
        fallbackColor={theme.colors.primary}
        style={styles.thumbnail}
        uri={video.thumbnailUrl}
      />
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {video.title}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {video.duration} · {video.channelTitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 88,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: theme.colors.secondary,
  },
  thumbnail: { width: 126, minHeight: 86 },
  content: { flex: 1, justifyContent: 'center', gap: 7, padding: 11 },
  title: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  meta: { color: theme.colors.muted, fontSize: 10 },
  pressed: { opacity: 0.78 },
});
