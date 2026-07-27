import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryPill } from '@/components/emissions/category-pill';
import { EmissionCard } from '@/components/emissions/emission-card';
import { EmptySearchState } from '@/components/emissions/empty-search-state';
import { FeaturedShowCard } from '@/components/emissions/featured-show-card';
import { ShowSearchBar } from '@/components/emissions/show-search-bar';
import { categories, emissions, featuredEmission } from '@/constants/emissions-content';
import { theme } from '@/constants/theme';

export default function EmissionsScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('Toutes');
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const filteredEmissions = useMemo(() => {
    return emissions.filter((item) => {
      const matchesCategory = activeCategory === 'Toutes' || item.category === activeCategory;
      const matchesQuery = item.title.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, normalizedQuery]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Émissions</Text>
            <Text style={styles.subtitle}>Découvrez les programmes et les archives de Bichridigital.</Text>
          </View>
        </View>

        <View style={styles.content}>
          <ShowSearchBar value={query} onChangeText={setQuery} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
            {categories.map((category) => (
              <CategoryPill
                key={category}
                label={category}
                active={activeCategory === category}
                onPress={() => setActiveCategory(category)}
              />
            ))}
          </ScrollView>

          <FeaturedShowCard title={featuredEmission.title} category={featuredEmission.category} accent={featuredEmission.coverColor} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Toutes les émissions</Text>
            {filteredEmissions.length > 0 ? (
              <View style={styles.list}>
                {filteredEmissions.map((item) => (
                  <EmissionCard
                    key={item.id}
                    title={item.title}
                    category={item.category}
                    accent={item.coverColor}
                    highlighted={item.id === featuredEmission.id}
                    status={item.status}
                  />
                ))}
              </View>
            ) : (
              <EmptySearchState />
            )}
          </View>
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
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  headerText: {
    gap: 4,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  pills: {
    gap: 8,
    paddingRight: 8,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
});
