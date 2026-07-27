import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeaturedReplayCard } from '@/components/replays/featured-replay-card';
import { ReplayCategoryChip } from '@/components/replays/replay-category-chip';
import { ReplayEmptyState } from '@/components/replays/replay-empty-state';
import { ReplaySearchBar } from '@/components/replays/replay-search-bar';
import { ReplayVideoCard } from '@/components/replays/replay-video-card';
import { replayCategories, replays } from '@/constants/replays-content';
import { theme } from '@/constants/theme';

export default function ReplaysScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<(typeof replayCategories)[number]>('Toutes');

  const normalizedQuery = query.trim().toLocaleLowerCase('fr');
  const filteredReplays = useMemo(
    () =>
      replays.filter((replay) => {
        const matchesCategory = activeCategory === 'Toutes' || replay.category === activeCategory;
        const searchableText = `${replay.title} ${replay.showTitle}`.toLocaleLowerCase('fr');
        return matchesCategory && searchableText.includes(normalizedQuery);
      }),
    [activeCategory, normalizedQuery],
  );

  const featuredReplay = filteredReplays.find((replay) => replay.featured);
  const latestReplays = filteredReplays.filter((replay) => !replay.featured).slice(0, 5);
  const hasActiveFilters = normalizedQuery.length > 0 || activeCategory !== 'Toutes';

  const resetFilters = () => {
    setQuery('');
    setActiveCategory('Toutes');
  };

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

          {filteredReplays.length === 0 ? (
            <ReplayEmptyState canReset={hasActiveFilters} onReset={resetFilters} />
          ) : (
            <>
              {featuredReplay ? (
                <View style={styles.section}>
                  <FeaturedReplayCard replay={featuredReplay} />
                </View>
              ) : null}

              {latestReplays.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Dernières vidéos</Text>
                  <ScrollView
                    horizontal
                    contentContainerStyle={styles.latestList}
                    showsHorizontalScrollIndicator={false}>
                    {latestReplays.map((replay) => (
                      <ReplayVideoCard key={replay.id} replay={replay} />
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tous les replays</Text>
                <View style={styles.grid}>
                  {filteredReplays.map((replay) => (
                    <ReplayVideoCard key={replay.id} compact replay={replay} />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
});
