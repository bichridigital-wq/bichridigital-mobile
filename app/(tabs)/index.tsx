import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeroCard } from '@/components/home/hero-card';
import { LiveCard } from '@/components/home/live-card';
import { ShowCard } from '@/components/home/show-card';
import { UpcomingProgramCard } from '@/components/home/upcoming-program-card';
import { VideoCard } from '@/components/home/video-card';
import type { Replay } from '@/constants/replays-content';
import { theme } from '@/constants/theme';
import {
  useFeaturedVideos,
  useLatestVideos,
  useLiveBroadcast,
  usePlaylists,
} from '@/hooks/use-youtube';
import {
  adaptHomeHero,
  adaptHomeLive,
  adaptHomeShows,
  adaptHomeVideo,
} from '@/utils/home-content-adapter';
import type { LivePresentation } from '@/utils/live-broadcast-adapter';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    data: liveData,
    loading: liveLoading,
    error: liveError,
    reload: reloadLive,
  } = useLiveBroadcast();
  const {
    data: featuredData,
    loading: featuredLoading,
    error: featuredError,
    reload: reloadFeatured,
  } = useFeaturedVideos();
  const {
    data: latestData,
    loading: latestLoading,
    error: latestError,
    reload: reloadLatest,
  } = useLatestVideos();
  const {
    data: playlistsData,
    loading: playlistsLoading,
    error: playlistsError,
    reload: reloadPlaylists,
  } = usePlaylists();
  const [refreshing, setRefreshing] = useState(false);
  const refreshObservedLoadingRef = useRef(false);
  const liveLoadingRef = useRef(liveLoading);

  useEffect(() => {
    liveLoadingRef.current = liveLoading;
  }, [liveLoading]);

  useFocusEffect(
    useCallback(() => {
      if (!liveLoadingRef.current) {
        liveLoadingRef.current = true;
        reloadLive();
      }
    }, [reloadLive]),
  );

  const anyLoading =
    liveLoading ||
    featuredLoading ||
    latestLoading ||
    playlistsLoading;

  useEffect(() => {
    if (!refreshing) {
      return;
    }

    if (anyLoading) {
      refreshObservedLoadingRef.current = true;
      return;
    }

    if (refreshObservedLoadingRef.current) {
      refreshObservedLoadingRef.current = false;
      setRefreshing(false);
    }
  }, [anyLoading, refreshing]);

  const hero = useMemo(
    () =>
      featuredData?.[0]
        ? adaptHomeHero(featuredData[0])
        : null,
    [featuredData],
  );
  const latestVideos = useMemo(
    () =>
      (latestData ?? [])
        .slice(0, 5)
        .map(adaptHomeVideo),
    [latestData],
  );
  const live = useMemo(
    () => (liveData ? adaptHomeLive(liveData) : null),
    [liveData],
  );
  const popularShows = useMemo(
    () => adaptHomeShows(playlistsData ?? []),
    [playlistsData],
  );

  const openVideo = useCallback((video: Replay) => {
    router.push({
      pathname: '/video/[videoId]',
      params: {
        videoId: video.id,
        title: video.title,
        channelTitle: video.showTitle,
        publishedAt: video.publishedAt,
        duration: video.duration,
      },
    });
  }, []);

  const openLive = useCallback((broadcast: LivePresentation) => {
    router.push({
      pathname: '/video/[videoId]',
      params: {
        videoId: broadcast.videoId,
        title: broadcast.title,
        channelTitle: 'Bichridigital',
        publishedAt: broadcast.relativeLabel,
        duration: broadcast.status === 'live' ? 'En direct' : 'À venir',
      },
    });
  }, []);

  const onRefresh = useCallback(() => {
    if (anyLoading) {
      return;
    }

    refreshObservedLoadingRef.current = false;
    setRefreshing(true);
    reloadLive();
    reloadFeatured();
    reloadLatest();
    reloadPlaylists();
  }, [
    anyLoading,
    reloadFeatured,
    reloadLatest,
    reloadLive,
    reloadPlaylists,
  ]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.brand}>Bichridigital</Text>
          <Text style={styles.subtitle}>Culture, parole et contenus en mouvement</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Recherche bientôt disponible"
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            disabled
            style={styles.iconButton}>
            <Ionicons name="search-outline" size={18} color={theme.colors.text} />
          </Pressable>
          <Pressable
            accessibilityLabel="Notifications bientôt disponibles"
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            disabled
            style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={18} color={theme.colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
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
        <HomeHeroSection
          error={featuredError}
          hero={hero}
          loading={featuredLoading && !hero}
          onOpen={openVideo}
          onRetry={reloadFeatured}
        />

        <HomeLiveSection
          error={liveError}
          live={live}
          loading={liveLoading && !live && !liveError}
          onOpen={openLive}
          onRetry={reloadLive}
        />

        {live?.status === 'upcoming' ? (
          <View style={styles.section}>
            <HomeSectionHeader title="À venir" />
            <UpcomingProgramCard
              dateLabel={live.dateLabel}
              onPress={() => openLive(live)}
              thumbnailUrl={live.thumbnailUrl}
              timeLabel={live.relativeLabel}
              title={live.title}
            />
          </View>
        ) : null}

        <HomeVideosSection
          error={latestError}
          loading={latestLoading && latestVideos.length === 0}
          onOpen={openVideo}
          onRetry={reloadLatest}
          videos={latestVideos}
        />

        <HomeShowsSection
          error={playlistsError}
          loading={playlistsLoading && playlistsData === null}
          onRetry={reloadPlaylists}
          shows={popularShows}
        />

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Bichridigital</Text>
          <Text style={styles.footerText}>Votre histoire, image par image.</Text>
          <Pressable
            accessibilityLabel="Services bientôt disponibles"
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            disabled
            style={styles.footerButton}>
            <Text style={styles.footerButtonText}>Découvrir nos services</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

type HomeHeroSectionProps = {
  hero: Replay | null;
  loading: boolean;
  error: Error | null;
  onOpen: (video: Replay) => void;
  onRetry: () => void;
};

function HomeHeroSection({
  hero,
  loading,
  error,
  onOpen,
  onRetry,
}: HomeHeroSectionProps) {
  return (
    <View style={styles.sectionBlock}>
      {error ? (
        <HomeSectionError
          message="Impossible de charger la vidéo à la une."
          onRetry={onRetry}
        />
      ) : null}
      {hero ? (
        <HeroCard
          accent={hero.coverColor}
          category={hero.showTitle || hero.category}
          duration={hero.duration}
          onPrimaryPress={() => onOpen(hero)}
          onSecondaryPress={() => onOpen(hero)}
          relativeDate={hero.publishedAt}
          thumbnailUrl={hero.thumbnailUrl}
          title={hero.title}
        />
      ) : loading ? (
        <View style={[styles.skeleton, styles.heroSkeleton]} />
      ) : !error ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Aucune vidéo à la une</Text>
          <Text style={styles.emptyText}>La prochaine sélection apparaîtra ici.</Text>
        </View>
      ) : null}
    </View>
  );
}

type HomeLiveSectionProps = {
  live: LivePresentation | null;
  loading: boolean;
  error: Error | null;
  onOpen: (live: LivePresentation) => void;
  onRetry: () => void;
};

function HomeLiveSection({
  live,
  loading,
  error,
  onOpen,
  onRetry,
}: HomeLiveSectionProps) {
  return (
    <View style={styles.section}>
      <HomeSectionHeader
        actionLabel="Voir"
        onAction={() => router.push('/(tabs)/direct')}
        title="En direct"
      />
      {error ? (
        <HomeSectionError
          message="Impossible de vérifier le direct."
          onRetry={onRetry}
        />
      ) : null}
      {live && live.status !== 'offline' ? (
        <LiveCard
          onPress={() => onOpen(live)}
          status={live.status}
          thumbnailUrl={live.thumbnailUrl}
          timeLabel={live.relativeLabel}
          title={live.title}
        />
      ) : loading ? (
        <View style={[styles.skeleton, styles.liveSkeleton]} />
      ) : !error ? (
        <LiveCard
          onPress={() => router.push('/(tabs)/direct')}
          status="offline"
          title="Aucun direct en cours"
        />
      ) : null}
    </View>
  );
}

type HomeVideosSectionProps = {
  videos: Replay[];
  loading: boolean;
  error: Error | null;
  onOpen: (video: Replay) => void;
  onRetry: () => void;
};

function HomeVideosSection({
  videos,
  loading,
  error,
  onOpen,
  onRetry,
}: HomeVideosSectionProps) {
  return (
    <View style={styles.section}>
      <HomeSectionHeader
        actionLabel="Voir tout"
        onAction={() => router.push('/(tabs)/replays')}
        title="Dernières vidéos"
      />
      {error ? (
        <HomeSectionError
          message="Impossible de charger les dernières vidéos."
          onRetry={onRetry}
        />
      ) : null}
      {videos.length > 0 ? (
        <ScrollView
          contentContainerStyle={styles.videoList}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              accent={video.coverColor}
              duration={video.duration}
              onPress={() => onOpen(video)}
              program={video.showTitle}
              relativeTime={video.publishedAt}
              thumbnailUrl={video.thumbnailUrl}
              title={video.title}
            />
          ))}
        </ScrollView>
      ) : loading ? (
        <View style={styles.horizontalSkeletons}>
          <View style={[styles.skeleton, styles.videoSkeleton]} />
          <View style={[styles.skeleton, styles.videoSkeleton]} />
        </View>
      ) : !error ? (
        <Text style={styles.emptyText}>Aucune vidéo récente disponible.</Text>
      ) : null}
    </View>
  );
}

type HomeShowsSectionProps = {
  shows: ReturnType<typeof adaptHomeShows>;
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
};

function HomeShowsSection({
  shows,
  loading,
  error,
  onRetry,
}: HomeShowsSectionProps) {
  return (
    <View style={styles.section}>
      <HomeSectionHeader
        actionLabel="Voir tout"
        onAction={() => router.push('/(tabs)/emissions')}
        title="Émissions populaires"
      />
      {error ? (
        <HomeSectionError
          message="Impossible d’actualiser les playlists."
          onRetry={onRetry}
        />
      ) : null}
      {loading ? (
        <View style={styles.horizontalSkeletons}>
          <View style={[styles.skeleton, styles.showSkeleton]} />
          <View style={[styles.skeleton, styles.showSkeleton]} />
        </View>
      ) : (
        <>
          {shows.usedLocalFallback ? (
            <Text style={styles.fallbackNote}>
              Sélection locale affichée en attendant des playlists reconnues.
            </Text>
          ) : null}
          <ScrollView
            contentContainerStyle={styles.showList}
            horizontal
            showsHorizontalScrollIndicator={false}>
            {shows.shows.map((show) => (
              <ShowCard
                key={show.id}
                accent={show.accent}
                category={show.category}
                onPress={() => router.push('/(tabs)/emissions')}
                subtitle={show.description}
                thumbnailUrl={show.thumbnailUrl}
                title={show.title}
              />
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

type HomeSectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

function HomeSectionHeader({
  title,
  actionLabel,
  onAction,
}: HomeSectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onAction}
          style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function HomeSectionError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorText}>{message}</Text>
      <Pressable
        accessibilityLabel={`Réessayer : ${message}`}
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
        <Text style={styles.retryText}>Réessayer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  brand: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.card,
    opacity: 0.72,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: 120,
  },
  sectionBlock: {
    gap: 10,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionAction: {
    color: theme.colors.yellow,
    fontSize: 13,
    fontWeight: '600',
  },
  videoList: {
    gap: 12,
    paddingRight: 8,
  },
  showList: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 8,
  },
  skeleton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: theme.colors.secondary,
  },
  heroSkeleton: {
    minHeight: 250,
  },
  liveSkeleton: {
    width: '100%',
    height: 180,
  },
  horizontalSkeletons: {
    flexDirection: 'row',
    gap: 12,
    overflow: 'hidden',
  },
  videoSkeleton: {
    width: 180,
    height: 190,
  },
  showSkeleton: {
    width: 170,
    height: 230,
  },
  emptyCard: {
    gap: 6,
    padding: 20,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  fallbackNote: {
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 17,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.2)',
    backgroundColor: theme.colors.secondary,
  },
  errorText: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  retryText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  footerCard: {
    gap: 8,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  footerTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  footerText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  footerButton: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    opacity: 0.6,
  },
  footerButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
