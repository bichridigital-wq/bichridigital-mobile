import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import type { ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type RefreshControlProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmissionEmptyState } from '@/components/emissions/emission-empty-state';
import { EmissionEpisodeCard } from '@/components/emissions/emission-episode-card';
import { EmissionErrorState } from '@/components/emissions/emission-error-state';
import { EmissionHero } from '@/components/emissions/emission-hero';
import {
  getEmissionBySlug,
  type EmissionItem,
} from '@/constants/emissions-content';
import { getPlaylistIdForEmission } from '@/constants/emission-playlists';
import type { Replay } from '@/constants/replays-content';
import { theme } from '@/constants/theme';
import { usePlaylistVideos } from '@/hooks/use-youtube';
import { adaptYoutubeVideo } from '@/utils/replay-video-adapter';

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function EmissionScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const emission = getEmissionBySlug(readParam(params.slug).trim());

  if (!emission) {
    return <EmissionNotFound />;
  }

  const playlistId = getPlaylistIdForEmission(emission.slug);

  return playlistId ? (
    <LinkedEmission emission={emission} playlistId={playlistId} />
  ) : (
    <UnlinkedEmission emission={emission} />
  );
}

function LinkedEmission({
  emission,
  playlistId,
}: {
  emission: EmissionItem;
  playlistId: string;
}) {
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = usePlaylistVideos(playlistId);
  const [refreshing, setRefreshing] = useState(false);
  const refreshObservedLoading = useRef(false);

  const episodes = useMemo(
    () =>
      (data ?? []).map((video) => ({
        ...adaptYoutubeVideo(video, false),
        coverColor: emission.coverColor,
      })),
    [data, emission.coverColor],
  );

  useEffect(() => {
    if (!refreshing) {
      return;
    }
    if (loading) {
      refreshObservedLoading.current = true;
    } else if (refreshObservedLoading.current) {
      refreshObservedLoading.current = false;
      setRefreshing(false);
    }
  }, [loading, refreshing]);

  const refresh = useCallback(() => {
    if (loading || refreshing) {
      return;
    }
    refreshObservedLoading.current = false;
    setRefreshing(true);
    reload();
  }, [loading, refreshing, reload]);

  const retry = useCallback(() => {
    if (!loading && !refreshing) {
      reload();
    }
  }, [loading, refreshing, reload]);

  return (
    <EmissionPageFrame
      bottomInset={insets.bottom}
      emission={emission}
      refreshControl={
        <RefreshControl
          colors={[theme.colors.yellow]}
          onRefresh={refresh}
          progressBackgroundColor={theme.colors.secondary}
          refreshing={refreshing}
          tintColor={theme.colors.yellow}
        />
      }
      topInset={insets.top}>
      {error ? <EmissionErrorState onRetry={retry} /> : null}
      {episodes.length > 0 ? (
        <View style={styles.episodeList}>
          {episodes.map((episode) => (
            <EmissionEpisodeCard
              episode={episode}
              key={episode.id}
              onPress={() => openEpisode(episode)}
            />
          ))}
        </View>
      ) : loading ? (
        <EpisodeSkeletons />
      ) : !error ? (
        <EmissionEmptyState message="Aucun épisode disponible pour le moment." />
      ) : null}
    </EmissionPageFrame>
  );
}

function UnlinkedEmission({ emission }: { emission: EmissionItem }) {
  const insets = useSafeAreaInsets();
  const isXamNdiagne = emission.slug === 'xam-ndiagne-jotna';
  const message = isXamNdiagne
    ? 'Cette nouvelle émission consacrée à l’histoire de Ndiagne sera bientôt disponible.'
    : 'Les épisodes de cette émission seront bientôt disponibles dans l’application.';

  return (
    <EmissionPageFrame
      bottomInset={insets.bottom}
      emission={emission}
      topInset={insets.top}>
      <EmissionEmptyState message={message} />
    </EmissionPageFrame>
  );
}

function EmissionPageFrame({
  emission,
  children,
  refreshControl,
  topInset,
  bottomInset,
}: {
  emission: EmissionItem;
  children: ReactNode;
  refreshControl?: ReactElement<RefreshControlProps>;
  topInset: number;
  bottomInset: number;
}) {
  return (
    <View style={[styles.screen, { paddingTop: topInset }]}>
      <PageHeader />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(100, bottomInset + 64) },
        ]}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}>
        <EmissionHero emission={emission} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Derniers épisodes</Text>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

function PageHeader() {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Retour"
        accessibilityRole="button"
        hitSlop={10}
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <Ionicons color={theme.colors.text} name="arrow-back" size={22} />
      </Pressable>
      <Text style={styles.screenTitle}>Émission</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function EmissionNotFound() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        styles.notFoundScreen,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
      ]}>
      <View style={styles.notFoundHeader}>
        <Pressable
          accessibilityLabel="Retour"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Ionicons color={theme.colors.text} name="arrow-back" size={22} />
        </Pressable>
      </View>
      <View style={styles.notFoundCard}>
        <Text style={styles.notFoundTitle}>Émission introuvable</Text>
        <Text style={styles.notFoundText}>
          Cette émission n’existe pas dans le catalogue Bichridigital.
        </Text>
        <Pressable
          accessibilityLabel="Voir toutes les émissions"
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)/emissions')}
          style={({ pressed }) => [
            styles.allEmissionsButton,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.allEmissionsText}>Voir toutes les émissions</Text>
        </Pressable>
      </View>
    </View>
  );
}

function EpisodeSkeletons() {
  return (
    <View style={styles.episodeList}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.skeleton}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonMeta} />
          </View>
        </View>
      ))}
    </View>
  );
}

function openEpisode(episode: Replay) {
  router.push({
    pathname: '/video/[videoId]',
    params: {
      videoId: episode.id,
      title: episode.title,
      channelTitle: episode.showTitle,
      publishedAt: episode.publishedAt,
      duration: episode.duration,
    },
  });
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
  headerSpacer: { width: 44 },
  content: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  section: { gap: 12 },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '800' },
  episodeList: { gap: 12 },
  skeleton: {
    flexDirection: 'row',
    overflow: 'hidden',
    height: 112,
    borderRadius: 18,
    backgroundColor: theme.colors.secondary,
  },
  skeletonImage: { width: 142, backgroundColor: theme.colors.card },
  skeletonContent: { flex: 1, justifyContent: 'center', gap: 14, padding: 12 },
  skeletonTitle: {
    width: '92%',
    height: 14,
    borderRadius: 8,
    backgroundColor: theme.colors.card,
  },
  skeletonMeta: {
    width: '58%',
    height: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.card,
  },
  pressed: { opacity: 0.8 },
  notFoundScreen: { paddingHorizontal: theme.spacing.lg },
  notFoundHeader: { minHeight: 58, justifyContent: 'center' },
  notFoundCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: theme.spacing.lg,
  },
  notFoundTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  notFoundText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  allEmissionsButton: {
    minHeight: 48,
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  allEmissionsText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
});
