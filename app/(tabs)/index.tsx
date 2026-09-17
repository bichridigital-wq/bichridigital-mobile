import { Redirect } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeQuickActions } from '@/components/home/home-quick-actions';
import { HomeFeaturedSection, HomeProgramsCarousel, HomeQueryNotice, HomeReplaysCarousel } from '@/components/home/home-sections';
import { PremiumHero } from '@/components/home/premium-hero';
import { PremiumHomeHeader } from '@/components/home/premium-home-header';
import { IntroLoading } from '@/components/onboarding/intro-loading';
import { getEmissionCoverSource } from '@/constants/emission-covers';
import { theme } from '@/constants/theme';
import { useIntroSeen } from '@/hooks/use-intro-seen';
import { useLivePolling } from '@/hooks/use-live-polling';
import { useProgramCatalog } from '@/hooks/use-program-catalog';
import { useSchedule } from '@/hooks/use-schedule';
import { useFeaturedVideos, useLatestVideos, useLiveBroadcast, usePlaylists } from '@/hooks/use-youtube';
import { buildHomeHeroes, programEditorial, realReplayVideos, videoEditorial } from '@/utils/premium-home-content';

export default function HomeRoute() {
  const seen = useIntroSeen();
  if (seen === null) return <IntroLoading />;
  if (!seen) return <Redirect href="/intro" />;
  return <HomeScreen />;
}

function HomeScreen() {
  const insets = useSafeAreaInsets();
  const catalog = useProgramCatalog();
  const live = useLiveBroadcast();
  const featured = useFeaturedVideos();
  const latest = useLatestVideos();
  const playlists = usePlaylists();
  const schedule = useSchedule();
  useLivePolling({ loading: live.loading, refreshing: live.refreshing, reload: live.reload, intervalMs: 60_000 });
  useLivePolling({ loading: schedule.isLoading, refreshing: schedule.isRefreshing, reload: schedule.refresh, intervalMs: 60_000 });

  const programs = catalog.emissions.filter((program) => getEmissionCoverSource(program.slug) !== undefined);
  const heroes = buildHomeHeroes({
    programs: catalog.emissions,
    live: live.error ? null : live.data,
    schedule: schedule.error ? [] : schedule.events,
    featured: featured.data,
  });
  const selection = realReplayVideos(featured.data).slice(0, 2).map((video) => videoEditorial(video, catalog.emissions));
  // Fill only with real catalogue entries, never simulated videos or dates.
  for (const program of programs) {
    if (selection.length >= 2) break;
    if (!selection.some((item) => item.slug === program.slug)) selection.push(programEditorial(program));
  }
  const replays = realReplayVideos(latest.data)
    .sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0))
    .slice(0, 8).map((video) => videoEditorial(video, catalog.emissions));
  const refreshing = live.refreshing || featured.refreshing || latest.refreshing || playlists.refreshing || schedule.isRefreshing;
  const refresh = () => { live.reload(); featured.reload(); latest.reload(); playlists.reload(); schedule.refresh(); };

  return <View style={[styles.screen, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.yellow} colors={[theme.colors.yellow]} progressBackgroundColor={theme.colors.secondary} />}>
      <View style={styles.content}>
        <PremiumHomeHeader />
        <View style={styles.heroSection}>
          <Text style={styles.eyebrow}>LA TÉLÉ AUTREMENT</Text>
          <PremiumHero key={heroes.map((item) => item.id).join('|')} items={heroes} />
          {live.loading || schedule.isLoading ? <HomeQueryNotice loading message="Actualisation du direct et du programme…" /> : null}
          {live.error ? <HomeQueryNotice message="Le direct n’a pas pu être vérifié. Vérifiez votre connexion." onRetry={live.reload} /> : null}
          {schedule.error ? <HomeQueryNotice message="Le prochain programme est momentanément indisponible." onRetry={schedule.refresh} /> : null}
          {!live.loading && !live.error && live.data?.status !== 'live' ? <Text style={styles.offline}>Aucun direct en cours · Retrouvez nos émissions à tout moment.</Text> : null}
        </View>
        <HomeQuickActions />
        {featured.error ? <HomeQueryNotice message="La sélection n’a pas pu être actualisée." onRetry={featured.reload} /> : null}
        {featured.loading ? <HomeQueryNotice loading message="Chargement de la sélection…" /> : null}
        <HomeFeaturedSection items={selection} />
        <HomeProgramsCarousel programs={programs} />
        {catalog.isOfflineFallback || playlists.error ? <HomeQueryNotice message="Vos émissions restent disponibles. Le catalogue n’a pas pu être actualisé." onRetry={playlists.error ? playlists.reload : undefined} /> : null}
        <HomeReplaysCarousel items={replays} loading={latest.loading} error={latest.error} onRetry={latest.reload} />
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerTitle}>Notre territoire. Vos histoires.</Text>
          <Text style={styles.footerText}>NDIAGNE · CONNECTÉ AU MONDE</Text>
        </View>
      </View>
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', gap: 24 },
  heroSection: { gap: 12 },
  eyebrow: { color: theme.colors.yellow, fontSize: 9, letterSpacing: 2.4, fontWeight: '700' },
  offline: { color: '#9EACCD', fontSize: 11, lineHeight: 17 },
  footer: { gap: 10, alignItems: 'center', paddingVertical: 20 },
  footerLine: { width: 32, height: 2, backgroundColor: theme.colors.yellow, marginBottom: 4 },
  footerTitle: { color: '#D2DCF3', textAlign: 'center', fontSize: 14, fontWeight: '700' },
  footerText: { color: '#98A9D0', textAlign: 'center', fontSize: 9, letterSpacing: 2 },
});
