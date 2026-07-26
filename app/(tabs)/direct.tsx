import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DirectEmptyState } from '@/components/direct/direct-empty-state';
import { LiveDetailsCard } from '@/components/direct/live-details-card';
import { LivePlayerPlaceholder } from '@/components/direct/live-player-placeholder';
import { NextLiveCard } from '@/components/direct/next-live-card';
import { ReplayCard } from '@/components/direct/replay-card';
import { currentLive, directState, nextLive, replays } from '@/constants/direct-content';
import { theme } from '@/constants/theme';

export default function DirectScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Direct</Text>
          <Text style={styles.subtitle}>Suivez les moments forts de Bichridigital.</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Partager" style={styles.shareButton}>
          <Ionicons name="share-outline" size={18} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic">

        {directState === 'live' ? (
          <>
            <LivePlayerPlaceholder
              title={currentLive.title}
              description={currentLive.description}
              timeLabel={currentLive.timeLabel}
              accent={currentLive.accent}
              badgeLabel="EN DIRECT"
            />
            <LiveDetailsCard
              emission={currentLive.emission}
              date={currentLive.date}
              time={currentLive.time}
              location={currentLive.location}
              description={currentLive.description}
            />
          </>
        ) : directState === 'scheduled' ? (
          <>
            <LivePlayerPlaceholder
              title={nextLive.title}
              description={nextLive.description}
              timeLabel={nextLive.timeLabel}
              accent={nextLive.accent}
              badgeLabel="À VENIR"
            />
            <LiveDetailsCard
              emission={nextLive.emission}
              date={nextLive.date}
              time={nextLive.time}
              location={nextLive.location}
              description={nextLive.description}
            />
          </>
        ) : (
          <DirectEmptyState />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prochain direct</Text>
          <NextLiveCard
            title={nextLive.title}
            date={nextLive.date}
            time={nextLive.time}
            emission="Émission culturelle"
            description={nextLive.description}
            accent={nextLive.accent}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À revoir</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.replayList}>
            {replays.map((replay) => (
              <ReplayCard
                key={replay.id}
                title={replay.title}
                emission={replay.emission}
                duration={replay.duration}
                relativeDate={replay.relativeDate}
                accent={replay.accent}
              />
            ))}
          </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    zIndex: 1,
  },
  headerText: {
    flex: 1,
    paddingRight: theme.spacing.sm,
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: 140,
    gap: theme.spacing.lg,
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
});
