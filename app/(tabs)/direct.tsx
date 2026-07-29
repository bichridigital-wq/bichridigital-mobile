import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DirectEmptyState } from '@/components/direct/direct-empty-state';
import { ReplayCard } from '@/components/direct/replay-card';
import {
  isValidYoutubeVideoId,
  YoutubePlayer,
} from '@/components/video/youtube-player';
import { theme } from '@/constants/theme';
import { useLivePolling } from '@/hooks/use-live-polling';
import { useLatestVideos, useLiveBroadcast } from '@/hooks/use-youtube';
import type { Replay } from '@/constants/replays-content';
import {
  adaptLiveBroadcast,
  type LivePresentation,
} from '@/utils/live-broadcast-adapter';
import { adaptYoutubeVideo } from '@/utils/replay-video-adapter';

function formatLastChecked(date: Date | null): string {
  if (!date) {
    return 'Vérification en cours…';
  }

  return `Dernière vérification à ${date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function DirectScreen() {
  const insets = useSafeAreaInsets();
  const liveQuery = useLiveBroadcast();
  const latestQuery = useLatestVideos();
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const previousLiveLoadingRef = useRef(liveQuery.loading);
  const refreshObservedLoadingRef = useRef(false);
  const retryObservedLoadingRef = useRef(false);

  useLivePolling({
    loading: liveQuery.loading,
    reload: liveQuery.reload,
  });

  useEffect(() => {
    if (previousLiveLoadingRef.current && !liveQuery.loading) {
      setLastCheckedAt(new Date());
    }
    previousLiveLoadingRef.current = liveQuery.loading;
  }, [liveQuery.loading]);

  useEffect(() => {
    if (!refreshing) {
      return;
    }

    if (liveQuery.loading || latestQuery.loading) {
      refreshObservedLoadingRef.current = true;
      return;
    }

    if (refreshObservedLoadingRef.current) {
      refreshObservedLoadingRef.current = false;
      setRefreshing(false);
    }
  }, [latestQuery.loading, liveQuery.loading, refreshing]);

  useEffect(() => {
    if (!retrying) {
      return;
    }

    if (liveQuery.loading) {
      retryObservedLoadingRef.current = true;
      return;
    }

    if (retryObservedLoadingRef.current) {
      retryObservedLoadingRef.current = false;
      setRetrying(false);
    }
  }, [liveQuery.loading, retrying]);

  const presentation = useMemo(
    () => (liveQuery.data ? adaptLiveBroadcast(liveQuery.data) : null),
    [liveQuery.data],
  );
  const latestReplays = useMemo(
    () =>
      (latestQuery.data ?? [])
        .slice(0, 3)
        .map((video) => adaptYoutubeVideo(video, false)),
    [latestQuery.data],
  );
  const showLiveLoading = (liveQuery.loading && lastCheckedAt === null) || retrying;

  const openReplay = useCallback((replay: Replay) => {
    router.push({
      pathname: '/video/[videoId]',
      params: {
        videoId: replay.id,
        title: replay.title,
        channelTitle: replay.showTitle,
        publishedAt: replay.publishedAt,
        duration: replay.duration,
        thumbnailUrl: replay.thumbnailUrl,
      },
    });
  }, []);

  const openBroadcast = useCallback((broadcast: LivePresentation) => {
    if (!isValidYoutubeVideoId(broadcast.videoId)) {
      return;
    }

    router.push({
      pathname: '/video/[videoId]',
      params: {
        videoId: broadcast.videoId,
        title: broadcast.title,
        channelTitle: 'Bichridigital',
        publishedAt: broadcast.relativeLabel,
        duration: broadcast.status === 'live' ? 'En direct' : 'À venir',
        thumbnailUrl: broadcast.thumbnailUrl,
      },
    });
  }, []);

  const onRefresh = useCallback(() => {
    refreshObservedLoadingRef.current = false;
    setRefreshing(true);
    liveQuery.reload();
    latestQuery.reload();
  }, [latestQuery, liveQuery]);

  const retryLive = useCallback(() => {
    retryObservedLoadingRef.current = false;
    setRetrying(true);
    liveQuery.reload();
  }, [liveQuery]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Direct</Text>
        <Text style={styles.subtitle}>Suivez les moments forts de Bichridigital.</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            colors={[theme.colors.yellow]}
            onRefresh={onRefresh}
            progressBackgroundColor={theme.colors.secondary}
            refreshing={refreshing}
            tintColor={theme.colors.yellow}
          />
        }
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        {showLiveLoading ? (
          <DirectLoadingState />
        ) : liveQuery.error ? (
          <DirectErrorState onRetry={retryLive} />
        ) : presentation?.status === 'live' ? (
          <LiveState presentation={presentation} />
        ) : presentation?.status === 'upcoming' ? (
          <UpcomingState
            onOpen={() => openBroadcast(presentation)}
            presentation={presentation}
          />
        ) : (
          <DirectEmptyState
            lastCheckedLabel={formatLastChecked(lastCheckedAt)}
            onRefresh={liveQuery.reload}
          />
        )}

        <ReplaySection
          error={latestQuery.error}
          loading={latestQuery.loading && latestReplays.length === 0}
          onOpen={openReplay}
          onRetry={latestQuery.reload}
          replays={latestReplays}
        />
      </ScrollView>
    </View>
  );
}

function LiveState({ presentation }: { presentation: LivePresentation }) {
  const youtubeUrl = isValidYoutubeVideoId(presentation.videoId)
    ? `https://www.youtube.com/watch?v=${presentation.videoId}`
    : null;

  const shareLive = async () => {
    if (!youtubeUrl) {
      return;
    }

    try {
      await Share.share({
        message: `${presentation.title}\n${youtubeUrl}`,
        url: youtubeUrl,
      });
    } catch {
      // The native share sheet can be dismissed or unavailable.
    }
  };

  const openYoutube = async () => {
    if (!youtubeUrl) {
      return;
    }

    try {
      await Linking.openURL(youtubeUrl);
    } catch {
      // The embedded player remains available if external opening fails.
    }
  };

  return (
    <View style={styles.liveSection}>
      <View style={[styles.badge, styles.liveBadge]}>
        <View style={styles.liveDot} />
        <Text style={styles.liveBadgeText}>EN DIRECT</Text>
      </View>
      <YoutubePlayer videoId={presentation.videoId} />
      <View style={styles.infoCard}>
        <Text numberOfLines={3} style={styles.liveTitle}>{presentation.title}</Text>
        <Text style={styles.relativeText}>{presentation.relativeLabel}</Text>
        <Text numberOfLines={3} style={styles.description}>
          {presentation.description}
        </Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={`Partager ${presentation.title}`}
            accessibilityRole="button"
            disabled={!youtubeUrl}
            onPress={shareLive}
            style={({ pressed }) => [
              styles.primaryButton,
              !youtubeUrl && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <Ionicons color={theme.colors.text} name="share-outline" size={17} />
            <Text style={styles.primaryButtonText}>Partager</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Ouvrir le direct sur YouTube"
            accessibilityRole="link"
            disabled={!youtubeUrl}
            onPress={openYoutube}
            style={({ pressed }) => [
              styles.secondaryButton,
              !youtubeUrl && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <Ionicons color={theme.colors.text} name="logo-youtube" size={17} />
            <Text style={styles.secondaryButtonText}>Ouvrir sur YouTube</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

type UpcomingStateProps = {
  presentation: LivePresentation;
  onOpen: () => void;
};

function UpcomingState({ presentation, onOpen }: UpcomingStateProps) {
  const canOpen = isValidYoutubeVideoId(presentation.videoId);

  return (
    <View style={styles.upcomingCard}>
      <View style={styles.upcomingVisual}>
        {presentation.thumbnailUrl ? (
          <Image
            contentFit="cover"
            source={presentation.thumbnailUrl}
            style={styles.upcomingImage}
          />
        ) : (
          <View style={styles.upcomingPlaceholder}>
            <Ionicons color={theme.colors.yellow} name="radio-outline" size={38} />
          </View>
        )}
        <View style={[styles.badge, styles.upcomingBadge]}>
          <Text style={styles.upcomingBadgeText}>À VENIR</Text>
        </View>
      </View>
      <View style={styles.upcomingContent}>
        <Text numberOfLines={3} style={styles.liveTitle}>{presentation.title}</Text>
        <Text style={styles.relativeText}>{presentation.relativeLabel}</Text>
        <Text style={styles.dateText}>{presentation.dateLabel}</Text>
        <Text numberOfLines={3} style={styles.description}>
          {presentation.description}
        </Text>
        <Pressable
          accessibilityLabel={`Voir la programmation de ${presentation.title}`}
          accessibilityRole="button"
          disabled={!canOpen}
          onPress={onOpen}
          style={({ pressed }) => [
            styles.primaryButton,
            !canOpen && styles.disabled,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.primaryButtonText}>Voir la programmation</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DirectLoadingState() {
  return (
    <View accessibilityLabel="Chargement du direct" style={styles.loadingWrap}>
      <View style={[styles.skeleton, styles.playerSkeleton]} />
      <View style={[styles.skeleton, styles.lineSkeleton]} />
      <View style={[styles.skeleton, styles.cardSkeleton]} />
    </View>
  );
}

function DirectErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorTitle}>Impossible de vérifier le direct.</Text>
      <Pressable
        accessibilityLabel="Réessayer de vérifier le direct"
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
        <Text style={styles.primaryButtonText}>Réessayer</Text>
      </Pressable>
    </View>
  );
}

type ReplaySectionProps = {
  replays: Replay[];
  loading: boolean;
  error: Error | null;
  onOpen: (replay: Replay) => void;
  onRetry: () => void;
};

function ReplaySection({
  replays,
  loading,
  error,
  onOpen,
  onRetry,
}: ReplaySectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>À revoir</Text>
      {loading ? (
        <View style={styles.replayLoadingRow}>
          <View style={[styles.skeleton, styles.replaySkeleton]} />
          <View style={[styles.skeleton, styles.replaySkeleton]} />
        </View>
      ) : replays.length > 0 ? (
        <ScrollView
          contentContainerStyle={styles.replayList}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {replays.map((replay) => (
            <ReplayCard
              key={replay.id}
              accent={replay.coverColor}
              duration={replay.duration}
              emission={replay.showTitle}
              onPress={() => onOpen(replay)}
              relativeDate={replay.publishedAt}
              thumbnailUrl={replay.thumbnailUrl}
              title={replay.title}
            />
          ))}
        </ScrollView>
      ) : error ? (
        <View style={styles.replayError}>
          <Text style={styles.replayErrorText}>
            Impossible de charger les dernières vidéos.
          </Text>
          <Pressable
            accessibilityLabel="Réessayer de charger les dernières vidéos"
            accessibilityRole="button"
            onPress={onRetry}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.secondaryButtonText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.replayErrorText}>Aucune vidéo récente disponible.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: 140,
  },
  liveSection: {
    gap: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  liveBadge: {
    backgroundColor: 'rgba(229,57,53,0.18)',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#E53935',
  },
  liveBadgeText: {
    color: '#FF7673',
    fontSize: 11,
    fontWeight: '900',
  },
  infoCard: {
    gap: 9,
    padding: theme.spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  liveTitle: {
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '800',
  },
  relativeText: {
    color: theme.colors.yellow,
    fontSize: 13,
    fontWeight: '700',
  },
  dateText: {
    color: theme.colors.muted,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
  },
  primaryButton: {
    minHeight: 44,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 17,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 44,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 17,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
  upcomingCard: {
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(252,205,18,0.24)',
    backgroundColor: theme.colors.secondary,
  },
  upcomingVisual: {
    aspectRatio: 16 / 9,
    backgroundColor: theme.colors.card,
  },
  upcomingImage: {
    width: '100%',
    height: '100%',
  },
  upcomingPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: theme.colors.yellow,
  },
  upcomingBadgeText: {
    color: theme.colors.background,
    fontSize: 11,
    fontWeight: '900',
  },
  upcomingContent: {
    gap: 8,
    padding: theme.spacing.md,
  },
  errorCard: {
    alignItems: 'center',
    gap: 14,
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.24)',
    backgroundColor: theme.colors.secondary,
  },
  errorTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingWrap: {
    gap: 12,
  },
  skeleton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: theme.colors.secondary,
  },
  playerSkeleton: {
    width: '100%',
    minHeight: 200,
    aspectRatio: 16 / 9,
  },
  lineSkeleton: {
    width: '62%',
    height: 20,
  },
  cardSkeleton: {
    width: '100%',
    height: 120,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  replayList: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 8,
  },
  replayLoadingRow: {
    flexDirection: 'row',
    gap: 12,
    overflow: 'hidden',
  },
  replaySkeleton: {
    width: 190,
    height: 190,
  },
  replayError: {
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
  },
  replayErrorText: {
    color: theme.colors.muted,
    fontSize: 12,
  },
});
