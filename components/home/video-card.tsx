import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RemoteThumbnail } from '@/components/home/remote-thumbnail';
import { theme } from '@/constants/theme';

type VideoCardProps = {
  title: string;
  program: string;
  duration: string;
  relativeTime: string;
  accent: string;
  thumbnailUrl?: string;
  onPress: () => void;
};

export function VideoCard({
  title,
  program,
  duration,
  relativeTime,
  accent,
  thumbnailUrl,
  onPress,
}: VideoCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Regarder ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.thumbnail, { backgroundColor: accent }]}>
        <RemoteThumbnail
          fallbackColor={accent}
          style={StyleSheet.absoluteFill}
          uri={thumbnailUrl}
        />
        <Text style={styles.duration}>{duration}</Text>
      </View>
      <Text numberOfLines={2} style={styles.title}>{title}</Text>
      <Text numberOfLines={1} style={styles.program}>{program}</Text>
      <Text numberOfLines={1} style={styles.time}>{relativeTime}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    gap: 8,
  },
  thumbnail: {
    height: 100,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    padding: 10,
    borderRadius: 18,
  },
  duration: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    color: theme.colors.text,
    backgroundColor: 'rgba(2,11,46,0.88)',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    minHeight: 40,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  program: {
    color: theme.colors.yellow,
    fontSize: 12,
    fontWeight: '600',
  },
  time: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.84,
  },
});
