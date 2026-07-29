import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeaturedReplayCard } from '@/components/replays/featured-replay-card';
import { ReplayCategoryChip } from '@/components/replays/replay-category-chip';
import { ReplayEmptyState } from '@/components/replays/replay-empty-state';
import { ReplaySearchBar } from '@/components/replays/replay-search-bar';
import { ReplayVideoCard } from '@/components/replays/replay-video-card';
import {
  replayCategories,
} from '@/constants/replays-content';
import type { Replay } from '@/constants/replays-content';
import { theme } from '@/constants/theme';
import { useFeaturedVideos, useLatestVideos } from '@/hooks/use-youtube';
import { adaptYoutubeVideo } from '@/utils/replay-video-adapter';

export default function ReplaysScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<(typeof replayCategories)[number]>('Toutes');
  const featuredQuery = useFeaturedVideos();
  const latestQuery = useLatestVideos();

  const normalizedQuery = query.trim().toLocaleLowerCase('fr');
  const featuredReplay = useMemo(
    () =>
      featuredQuery.data?.[0]
        ? adaptYoutubeVideo(featuredQuery.data[0], true)
        : null,
    [featuredQuery.data],
  );
  const latestReplays = useMemo(
    () => (latestQuery.data ?? []).map((video) => adaptYoutubeVideo(video, false)),
    [latestQuery.data],
  );
  const filteredReplays = useMemo(
    () =>
      latestReplays.filter((replay) => {
        const matchesCategory = activeCategory === 'Toutes' || replay.category === activeCategory;
        const searchableText = `${replay.title} ${replay.showTitle}`.toLocaleLowerCase('fr');
        return matchesCategory && searchableText.includes(normalizedQuery);
      }),
    [activeCategory, latestReplays, normalizedQuery],
  );

  const visibleFeaturedReplay =
    featuredReplay &&
    (activeCategory === 'Toutes' || featuredReplay.category === activeCategory) &&
    `${featuredReplay.title} ${featuredReplay.showTitle}`
      .toLocaleLowerCase('fr')
      .includes(normalizedQuery)
      ? featuredReplay
      : null;
  const visibleLatestReplays = filteredReplays.slice(0, 5);
  const hasActiveFilters = normalizedQuery.length > 0 || activeCategory !== 'Toutes';
  const loading = featuredQuery.loading || latestQuery.loading;
  const error = featuredQuery.error ?? latestQuery.error;

  const reload = () => {
    featuredQuery.reload();
    latestQuery.reload();
  };

  const resetFilters = () => {
    setQuery('');
    setActiveCategory('Toutes');
  };

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

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Replays</Text>
          <Text style={styles.subtitle}>Retrouvez les émissions et les moments forts de Bichridigital.</Text>
        </View>

        <View style={styles.content}>
          <ReplaySearchBar value={query} onChangeText={setQuery} onClear={() => setQuery('')} />

          <ScrollView
            horizontal
            contentContainerStyle={styles.categories}
            showsHorizontalScrollIndicator={false}>
            {replayCategories.map((category) => (
              <ReplayCategoryChip
                key={category}
                active={activeCategory === category}
                label={category}
                onPress={() => setActiveCategory(category)}
              />
            ))}
          </ScrollView>

          {loading ? (
            <ReplayLoadingState />
          ) : error ? (
            <ReplayErrorState onRetry={reload} />
          ) : filteredReplays.length === 0 ? (
            <ReplayEmptyState canReset={hasActiveFilters} onReset={resetFilters} />
          ) : (
            <>
              {visibleFeaturedReplay ? (
                <View style={styles.section}>
                  <FeaturedReplayCard
                    onPress={() => openReplay(visibleFeaturedReplay)}
                    replay={visibleFeaturedReplay}
                  />
                </View>
              ) : null}

              {visibleLatestReplays.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Dernières vidéos</Text>
                  <ScrollView
                    horizontal
                    contentContainerStyle={styles.latestList}
                    showsHorizontalScrollIndicator={false}>
                    {visibleLatestReplays.map((replay) => (
                      <ReplayVideoCard
                        key={replay.id}
                        onPress={() => openReplay(replay)}
                        replay={replay}
                      />
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tous les replays</Text>
                <View style={styles.grid}>
                  {filteredReplays.map((replay) => (
                    <ReplayVideoCard
                      key={replay.id}
                      compact
                      onPress={() => openReplay(replay)}
                      replay={replay}
                    />
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function ReplayLoadingState() {
  return (
    <View accessibilityLabel="Chargement des replays" style={styles.loadingContainer}>
      <View style={[styles.skeleton, styles.featuredSkeleton]} />
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonRow}>
        <View style={[styles.skeleton, styles.videoSkeleton]} />
        <View style={[styles.skeleton, styles.videoSkeleton]} />
      </View>
    </View>
  );
}

type ReplayErrorStateProps = {
  onRetry: () => void;
};

function ReplayErrorState({ onRetry }: ReplayErrorStateProps) {
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorTitle}>Impossible de charger les replays.</Text>
      <Pressable
        accessibilityLabel="Réessayer de charger les replays"
        accessibilityRole="button"
        onPress={onRetry}
        style={styles.retryButton}>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    gap: 4,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  screenTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  content: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  categories: {
    gap: 8,
    paddingRight: 8,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  latestList: {
    gap: 12,
    paddingRight: 8,
  },
  loadingContainer: {
    gap: 12,
  },
  skeleton: {
    borderRadius: 18,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  featuredSkeleton: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  skeletonTitle: {
    width: 140,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.secondary,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 12,
    overflow: 'hidden',
  },
  videoSkeleton: {
    width: 224,
    height: 190,
  },
  errorCard: {
    alignItems: 'center',
    gap: 14,
    padding: 22,
    borderRadius: 18,
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
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  retryText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
});
