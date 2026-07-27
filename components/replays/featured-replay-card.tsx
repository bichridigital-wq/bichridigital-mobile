import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Replay } from '@/constants/replays-content';
import { theme } from '@/constants/theme';

type FeaturedReplayCardProps = {
  replay: Replay;
};

export function FeaturedReplayCard({ replay }: FeaturedReplayCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.cover, { backgroundColor: replay.coverColor }]}>
        {replay.thumbnailUrl ? (
          <Image
            accessible={false}
            contentFit="cover"
            source={replay.thumbnailUrl}
            style={styles.coverImage}
          />
        ) : null}
        <View style={styles.coverShade} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>À LA UNE</Text>
        </View>
        <View style={styles.playMark}>
          <Ionicons name="play" size={26} color={theme.colors.text} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {replay.title}
        </Text>
        <Text style={styles.showTitle} numberOfLines={2} ellipsizeMode="tail">
          {replay.showTitle}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{replay.duration}</Text>
          <View style={styles.dot} />
          <Text style={styles.meta}>{replay.publishedAt}</Text>
        </View>
        <Pressable
          accessibilityLabel={`Lecture de ${replay.title} bientôt disponible`}
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          disabled
          style={styles.watchButton}>
          <Ionicons name="time-outline" size={16} color={theme.colors.muted} />
          <Text style={styles.watchText}>Lecture bientôt disponible</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: theme.colors.secondary,
  },
  cover: {
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,11,46,0.28)',
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.yellow,
  },
  badgeText: {
    color: theme.colors.background,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  playMark: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(2,11,46,0.7)',
  },
  content: {
    minWidth: 0,
    gap: 6,
    padding: 16,
  },
  title: {
    minHeight: 50,
    flexShrink: 1,
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
  },
  showTitle: {
    flexShrink: 1,
    color: theme.colors.yellow,
    fontSize: 13,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: theme.colors.muted,
  },
  watchButton: {
    minHeight: 44,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 6,
    paddingHorizontal: 17,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(154,167,201,0.22)',
    backgroundColor: 'rgba(154,167,201,0.1)',
  },
  watchText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
});
