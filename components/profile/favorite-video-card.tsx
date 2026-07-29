import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RemoteThumbnail } from '@/components/home/remote-thumbnail';
import { theme } from '@/constants/theme';
import type { FavoriteVideo } from '@/types/user-library';

export function FavoriteVideoCard({
  video,
  onOpen,
  onRemove,
}: {
  video: FavoriteVideo;
  onOpen: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityLabel={`Regarder ${video.title}`}
        accessibilityRole="button"
        onPress={onOpen}
        style={({ pressed }) => [styles.openArea, pressed && styles.pressed]}>
        <View style={styles.thumbnail}>
          <RemoteThumbnail
            fallbackColor={theme.colors.primary}
            style={StyleSheet.absoluteFill}
            uri={video.thumbnailUrl}
          />
          <Text style={styles.duration}>{video.duration}</Text>
        </View>
        <Text numberOfLines={2} style={styles.title}>
          {video.title}
        </Text>
      </Pressable>
      <Pressable
        accessibilityLabel={`Retirer ${video.title} des favoris`}
        accessibilityRole="button"
        onPress={onRemove}
        style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
        <Ionicons color={theme.colors.yellow} name="heart" size={16} />
        <Text style={styles.removeText}>Retirer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 190,
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  openArea: { gap: 8, paddingBottom: 8 },
  thumbnail: {
    height: 106,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    padding: 8,
  },
  duration: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    color: theme.colors.text,
    backgroundColor: 'rgba(2,11,46,0.88)',
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    minHeight: 38,
    paddingHorizontal: 11,
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  removeButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  removeText: { color: theme.colors.yellow, fontSize: 11, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});
