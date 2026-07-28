import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Replay } from '@/constants/replays-content';
import { theme } from '@/constants/theme';

type ReplayVideoCardProps = {
  replay: Replay;
  compact?: boolean;
  onPress: () => void;
};

export function ReplayVideoCard({ replay, compact = false, onPress }: ReplayVideoCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Regarder ${replay.title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact ? styles.compactCard : styles.horizontalCard,
        pressed && styles.pressedCard,
      ]}>
      <View style={[styles.thumbnail, { backgroundColor: replay.coverColor }]}>
        {replay.thumbnailUrl ? (
          <Image
            accessible={false}
            contentFit="cover"
            source={replay.thumbnailUrl}
            style={styles.thumbnailImage}
          />
        ) : null}
        <View style={styles.thumbnailShade} />
        <View style={styles.playIcon}>
          <Ionicons name="play" size={14} color={theme.colors.text} />
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.duration}>{replay.duration}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {replay.title}
        </Text>
        <Text style={styles.showTitle} numberOfLines={2} ellipsizeMode="tail">
          {replay.showTitle}
        </Text>
        {compact ? <Text style={styles.category}>{replay.category}</Text> : null}
        <Text style={styles.date}>{replay.publishedAt}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  horizontalCard: {
    width: 224,
  },
  compactCard: {
    width: '48.5%',
  },
  pressedCard: {
    opacity: 0.84,
  },
  thumbnail: {
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,11,46,0.22)',
  },
  thumbnailImage: {
    ...StyleSheet.absoluteFillObject,
  },
  playIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(2,11,46,0.66)',
  },
  durationBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(2,11,46,0.88)',
  },
  duration: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    minWidth: 0,
    gap: 4,
    padding: 11,
  },
  title: {
    minHeight: 36,
    flexShrink: 1,
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  showTitle: {
    minHeight: 30,
    flexShrink: 1,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  category: {
    color: theme.colors.yellow,
    fontSize: 10,
    fontWeight: '700',
  },
  date: {
    color: theme.colors.muted,
    fontSize: 10,
  },
});
