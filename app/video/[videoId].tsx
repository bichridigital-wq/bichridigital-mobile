import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { YoutubePlayer, isValidYoutubeVideoId } from '@/components/video/youtube-player';
import { theme } from '@/constants/theme';
import { useActionFeedbackAnimation } from '@/hooks/use-action-feedback-animation';
import { useUserLibrary } from '@/hooks/use-user-library';
import { playAddHaptic, playRemoveHaptic } from '@/utils/haptics';

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function VideoScreen() {
  const insets = useSafeAreaInsets();
  const [externalOpenFailed, setExternalOpenFailed] = useState(false);
  const { animate, animatedStyle } = useActionFeedbackAnimation();
  const {
    addRecentlyWatched,
    isHydrated,
    isVideoFavorite,
    toggleVideoFavorite,
  } = useUserLibrary();
  const params = useLocalSearchParams<{
    videoId?: string | string[];
    title?: string | string[];
    channelTitle?: string | string[];
    publishedAt?: string | string[];
    duration?: string | string[];
    thumbnailUrl?: string | string[];
  }>();

  const videoId = readParam(params.videoId).trim();
  const title = readParam(params.title).trim() || 'Vidéo Bichridigital';
  const channelTitle = readParam(params.channelTitle).trim() || 'Bichridigital';
  const publishedAt = readParam(params.publishedAt).trim() || 'Date indisponible';
  const duration = readParam(params.duration).trim() || 'Durée indisponible';
  const thumbnailUrl = readParam(params.thumbnailUrl).trim() || undefined;
  const canOpenYoutube = isValidYoutubeVideoId(videoId);
  const isFavorite = canOpenYoutube && isVideoFavorite(videoId);
  const libraryVideo = useMemo(
    () => ({
      videoId,
      title,
      thumbnailUrl,
      channelTitle,
      publishedAt,
      duration,
    }),
    [channelTitle, duration, publishedAt, thumbnailUrl, title, videoId],
  );

  useEffect(() => {
    if (isHydrated && canOpenYoutube) {
      addRecentlyWatched(libraryVideo);
    }
  }, [
    addRecentlyWatched,
    canOpenYoutube,
    isHydrated,
    libraryVideo,
  ]);

  const openOnYoutube = async () => {
    if (canOpenYoutube) {
      try {
        setExternalOpenFailed(false);
        await Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
      } catch {
        setExternalOpenFailed(true);
      }
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Retour aux replays"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.back()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" color={theme.colors.text} size={22} />
        </Pressable>
        <Text style={styles.screenTitle}>Lecture</Text>
        <Animated.View style={animatedStyle}>
          <Pressable
            accessibilityLabel={
              isFavorite
                ? 'Retirer cette vidéo des favoris'
                : 'Ajouter cette vidéo aux favoris'
            }
            accessibilityRole="button"
            accessibilityState={{ disabled: !isHydrated || !canOpenYoutube }}
            disabled={!isHydrated || !canOpenYoutube}
            onPress={() => {
              animate();
              if (isFavorite) {
                playRemoveHaptic();
              } else {
                playAddHaptic();
              }
              toggleVideoFavorite(libraryVideo);
            }}
            style={({ pressed }) => [
              styles.favoriteButton,
              (!isHydrated || !canOpenYoutube) && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}>
            <Ionicons
              color={isFavorite ? theme.colors.yellow : theme.colors.text}
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={21}
            />
          </Pressable>
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}>
        <YoutubePlayer videoId={videoId} />

        <View style={styles.detailsCard}>
          <Text ellipsizeMode="tail" numberOfLines={3} style={styles.videoTitle}>
            {title}
          </Text>
          <Text ellipsizeMode="tail" numberOfLines={2} style={styles.channelTitle}>
            {channelTitle}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{duration}</Text>
            <View style={styles.dot} />
            <Text style={styles.metaText}>{publishedAt}</Text>
          </View>

          <Pressable
            accessibilityLabel={`Ouvrir ${title} sur YouTube`}
            accessibilityRole="link"
            accessibilityState={{ disabled: !canOpenYoutube }}
            disabled={!canOpenYoutube}
            onPress={openOnYoutube}
            style={({ pressed }) => [
              styles.youtubeButton,
              !canOpenYoutube && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}>
            <Ionicons name="logo-youtube" color={theme.colors.text} size={18} />
            <Text style={styles.youtubeButtonText}>Ouvrir sur YouTube</Text>
          </Pressable>
          {externalOpenFailed ? (
            <Text accessibilityRole="alert" style={styles.externalError}>
              Impossible d’ouvrir YouTube pour le moment.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: theme.colors.secondary,
  },
  screenTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '800' },
  favoriteButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: theme.colors.secondary,
  },
  content: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  detailsCard: {
    gap: 10,
    padding: theme.spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  videoTitle: {
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '800',
  },
  channelTitle: { color: theme.colors.yellow, fontSize: 13, fontWeight: '700' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaText: { color: theme.colors.muted, fontSize: 12 },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: theme.colors.muted,
  },
  youtubeButton: {
    minHeight: 48,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  disabledButton: { opacity: 0.45 },
  pressedButton: { opacity: 0.8 },
  youtubeButtonText: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  externalError: { color: theme.colors.muted, fontSize: 12 },
});
