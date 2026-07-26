import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeroCard } from '@/components/home/hero-card';
import { LiveCard } from '@/components/home/live-card';
import { ShowCard } from '@/components/home/show-card';
import { UpcomingProgramCard } from '@/components/home/upcoming-program-card';
import { VideoCard } from '@/components/home/video-card';
import { SectionHeader } from '@/components/ui/section-header';
import { featuredHero, liveProgram, popularShows, recentVideos, upcomingPrograms } from '@/constants/mock-content';
import { theme } from '@/constants/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.brand}>Bichridigital</Text>
          <Text style={styles.subtitle}>Culture, parole et contenus en mouvement</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Rechercher">
            <Ionicons name="search-outline" size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <HeroCard
          category={featuredHero.category}
          title={featuredHero.title}
          description={featuredHero.description}
          ctaPrimary={featuredHero.ctaPrimary}
          ctaSecondary={featuredHero.ctaSecondary}
          accent={featuredHero.accent}
        />

        <View style={styles.section}>
          <SectionHeader title="En direct" actionLabel="Voir" />
          <LiveCard
            title={liveProgram.title}
            subtitle={liveProgram.subtitle}
            timeLabel={liveProgram.timeLabel}
            accent={liveProgram.accent}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Ã€ venir" actionLabel="Tout voir" />
          <View style={styles.horizontalList}>
            {upcomingPrograms.map((program) => (
              <UpcomingProgramCard
                key={program.id}
                title={program.title}
                subtitle={program.subtitle}
                timeLabel={program.timeLabel}
                dateLabel={program.dateLabel}
                accent={program.accent}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="DerniÃ¨res vidÃ©os" actionLabel="Voir tout" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.videoList}>
            {recentVideos.map((video) => (
              <VideoCard
                key={video.id}
                title={video.title}
                program={video.program}
                duration={video.duration}
                relativeTime={video.relativeTime}
                accent={video.accent}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Ã‰missions populaires" actionLabel="Voir tout" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.showList}>
            {popularShows.map((show) => (
              <ShowCard
                key={show.id}
                title={show.title}
                subtitle={show.subtitle}
                accent={show.accent}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Bichridigital</Text>
          <Text style={styles.footerText}>Votre histoire, image par image.</Text>
          <TouchableOpacity style={styles.footerButton} accessibilityRole="button" accessibilityLabel="DÃ©couvrir nos services">
            <Text style={styles.footerButtonText}>DÃ©couvrir nos services</Text>
          </TouchableOpacity>
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
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: 120,
    gap: theme.spacing.lg,
  },
  section: {
    gap: 10,
  },
  horizontalList: {
    flexDirection: 'row',
    gap: 12,
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
  footerCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 8,
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
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 4,
  },
  footerButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
