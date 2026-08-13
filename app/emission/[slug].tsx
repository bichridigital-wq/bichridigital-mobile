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
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmissionEmptyState } from '@/components/emissions/emission-empty-state';
import { EmissionEpisodeCard } from '@/components/emissions/emission-episode-card';
import { EmissionErrorState } from '@/components/emissions/emission-error-state';
import { EmissionHero } from '@/components/emissions/emission-hero';
import { getPlaylistIdForEmission } from '@/constants/emission-playlists';
import type { Replay } from '@/constants/replays-content';
import { theme } from '@/constants/theme';
import { useActionFeedbackAnimation } from '@/hooks/use-action-feedback-animation';
import { usePlaylistVideos } from '@/hooks/use-youtube';
import { useUserLibrary } from '@/hooks/use-user-library';
import { useProgramCatalog } from '@/hooks/use-program-catalog';
import { useNotifications } from '@/hooks/use-notifications';
import { useAccountProgramSync } from '@/hooks/use-account-program-sync';
import type { EnrichedEmission } from '@/types/program';
import { adaptYoutubeVideo } from '@/utils/replay-video-adapter';
import { playAddHaptic, playRemoveHaptic } from '@/utils/haptics';

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function EmissionScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const { getEmissionBySlug } = useProgramCatalog();
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
  emission: EnrichedEmission;
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
      hasVerifiedPlaylist
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

function UnlinkedEmission({ emission }: { emission: EnrichedEmission }) {
  const insets = useSafeAreaInsets();
  const isXamNdiagne = emission.slug === 'xam-ndiagne-jotna';
  const message = isXamNdiagne
    ? 'Cette nouvelle émission consacrée à l’histoire de Ndiagne sera bientôt disponible.'
    : 'Les épisodes de cette émission seront bientôt disponibles dans l’application.';

  return (
    <EmissionPageFrame
      bottomInset={insets.bottom}
      emission={emission}
      hasVerifiedPlaylist={false}
      topInset={insets.top}>
      <EmissionEmptyState message={message} />
    </EmissionPageFrame>
  );
}

function EmissionPageFrame({
  emission,
  children,
  refreshControl,
  hasVerifiedPlaylist,
  topInset,
  bottomInset,
}: {
  emission: EnrichedEmission;
  children: ReactNode;
  refreshControl?: ReactElement<RefreshControlProps>;
  hasVerifiedPlaylist: boolean;
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
        <EmissionHero
          emission={emission}
          hasVerifiedPlaylist={hasVerifiedPlaylist}
        />
        <EmissionFollowControl emission={emission} />
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

function EmissionFollowControl({ emission }: { emission: EnrichedEmission }) {
  const {
    isEmissionFollowed,
    isHydrated,
  } = useUserLibrary();
  const { toggleEmissionFollow } = useAccountProgramSync();
  const { programSubscriptionSyncStatus } = useNotifications();
  const { animate, animatedStyle } = useActionFeedbackAnimation();
  const isFollowed = isEmissionFollowed(emission.slug);

  return (
    <View style={styles.followCard}>
      <Animated.View style={animatedStyle}>
        <Pressable
          accessibilityLabel={
            isFollowed
              ? `Ne plus suivre l’émission ${emission.title}`
              : `Suivre l’émission ${emission.title}`
          }
          accessibilityRole="button"
          accessibilityState={{ disabled: !isHydrated }}
          disabled={!isHydrated}
          onPress={() => {
            animate();
            if (isFollowed) {
              playRemoveHaptic();
            } else {
              playAddHaptic();
            }
            toggleEmissionFollow({
              slug: emission.slug,
              title: emission.title,
              category: emission.category,
              coverColor: emission.coverColor,
              programId: emission.programId,
            });
          }}
          style={({ pressed }) => [
            styles.followButton,
            isFollowed && styles.followedButton,
            !isHydrated && styles.disabled,
            pressed && styles.pressed,
          ]}>
          <Ionicons
            color={isFollowed ? theme.colors.background : theme.colors.text}
            name={isFollowed ? 'notifications' : 'notifications-outline'}
            size={19}
          />
          <Text
            style={[
              styles.followButtonText,
              isFollowed && styles.followedButtonText,
            ]}>
            {isFollowed ? 'Émission suivie' : 'Suivre l’émission'}
          </Text>
        </Pressable>
      </Animated.View>
      <Text style={styles.followInfo}>
        Le suivi permettra de recevoir les nouveautés de cette émission lorsque
        les notifications seront activées.
      </Text>
      {programSubscriptionSyncStatus === 'pending' || programSubscriptionSyncStatus === 'syncing' ? (
        <Text style={styles.followInfo}>Synchronisation en coursâ€¦</Text>
      ) : programSubscriptionSyncStatus === 'network-error' || programSubscriptionSyncStatus === 'server-error' ? (
        <Text style={styles.followInfo}>Suivi conservé sur cet appareil — synchronisation en attente.</Text>
      ) : null}
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
      thumbnailUrl: episode.thumbnailUrl,
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
  disabled: { opacity: 0.45 },
  content: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  section: { gap: 12 },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '800' },
  followCard: {
    gap: 9,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  followButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  followedButton: { backgroundColor: theme.colors.yellow },
  followButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  followedButtonText: { color: theme.colors.background },
  followInfo: {
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
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
