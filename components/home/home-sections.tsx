import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { getEmissionCoverSource } from '@/constants/emission-covers';
import type { EmissionItem } from '@/constants/emissions-content';
import { theme } from '@/constants/theme';
import type { HomeEditorialItem } from '@/utils/premium-home-content';
import { openHomeDestination } from './home-navigation';
import { EditorialImage } from './premium-hero';

export function HomeSectionHeader({ title, onAll }: { title: string; onAll: () => void }) {
  return <View style={styles.sectionHeader}>
    <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`Voir tout : ${title}`} onPress={onAll} style={styles.all}>
      <Text style={styles.allText}>Voir tout</Text><MaterialIcons name="arrow-forward" size={14} color={theme.colors.yellow} />
    </Pressable>
  </View>;
}

export function HomeQueryNotice({ message, onRetry, loading = false }: { message: string; onRetry?: () => void; loading?: boolean }) {
  return <View style={styles.notice}>
    {loading ? <ActivityIndicator color={theme.colors.yellow} size="small" /> : null}
    <Text accessibilityLiveRegion="polite" style={styles.noticeText}>{message}</Text>
    {onRetry ? <Pressable accessibilityRole="button" accessibilityLabel={`Réessayer : ${message}`} onPress={onRetry} style={styles.retry}>
      <Text style={styles.allText}>Réessayer</Text>
    </Pressable> : null}
  </View>;
}

export function HomeFeaturedSection({ items }: { items: HomeEditorialItem[] }) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale > 1.3;
  return <View style={styles.section}>
    <HomeSectionHeader title="À la une" onAll={() => router.push('/(tabs)/replays')} />
    {items.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Découvrir ${item.title}`}
      onPress={() => openHomeDestination(item.destination)} style={({ pressed }) => [styles.featured, stacked && styles.featuredStacked, pressed && styles.pressed]}>
      <View style={[styles.featuredImage, stacked && styles.featuredImageWide]}><EditorialImage item={item} /></View>
      <View style={styles.featuredCopy}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.featuredTitle}>{item.title}</Text>
        <View style={styles.discover}><Text style={styles.discoverText}>Découvrir</Text><MaterialIcons name="arrow-forward" size={16} color={theme.colors.yellow} /></View>
      </View>
    </Pressable>)}
  </View>;
}

export function HomeProgramsCarousel({ programs }: { programs: EmissionItem[] }) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(188, Math.max(142, width * 0.42));
  return <View style={styles.section}>
    <HomeSectionHeader title="Émissions populaires" onAll={() => router.push('/(tabs)/emissions')} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {programs.map((program) => <Pressable key={program.slug} accessibilityRole="button" accessibilityLabel={`Voir l’émission ${program.title}`}
        onPress={() => router.push({ pathname: '/emission/[slug]', params: { slug: program.slug } })}
        style={({ pressed }) => [styles.program, { width: cardWidth }, pressed && styles.pressed]}>
        <Image accessible={false} source={getEmissionCoverSource(program.slug)} contentFit="cover" style={styles.programImage} />
        <View style={styles.programCopy}><Text style={styles.programTitle}>{program.title}</Text><Text style={styles.category}>{program.category}</Text></View>
      </Pressable>)}
    </ScrollView>
  </View>;
}

export function HomeReplaysCarousel({ items, loading, error, onRetry }: { items: HomeEditorialItem[]; loading: boolean; error: Error | null; onRetry: () => void }) {
  const { width } = useWindowDimensions();
  return <View style={styles.section}>
    <HomeSectionHeader title="Derniers replays" onAll={() => router.push('/(tabs)/replays')} />
    {error ? <HomeQueryNotice message="Les replays n’ont pas pu être actualisés. Vérifiez votre connexion." onRetry={onRetry} /> : null}
    {loading && !items.length ? <HomeQueryNotice loading message="Chargement des replays…" /> : null}
    {!loading && !error && !items.length ? <HomeQueryNotice message="Aucun replay disponible pour le moment." /> : null}
    {items.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {items.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Regarder ${item.title}`}
        onPress={() => openHomeDestination(item.destination)} style={({ pressed }) => [styles.replay, { width: Math.min(290, width * 0.7) }, pressed && styles.pressed]}>
        <View style={styles.replayImage}>
          <EditorialImage item={item} preferThumbnail />
          <View style={styles.play}><MaterialIcons name="play-arrow" size={24} color="white" /></View>
          {item.duration ? <Text style={styles.duration}>{item.duration}</Text> : null}
        </View>
        <Text style={styles.programTitle}>{item.title}</Text>
        {item.date ? <Text style={styles.date}>{item.date}</Text> : null}
      </Pressable>)}
    </ScrollView> : null}
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', columnGap: 10 },
  sectionTitle: { flexShrink: 1, color: 'white', fontSize: 19, fontWeight: '800', letterSpacing: -0.4 },
  all: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5 },
  allText: { color: theme.colors.yellow, fontSize: 11, fontWeight: '700' },
  notice: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, backgroundColor: theme.colors.secondary },
  noticeText: { flex: 1, color: '#B4C1DE', fontSize: 12, lineHeight: 18 },
  retry: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  featured: { flexDirection: 'row', alignItems: 'center', overflow: 'hidden', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', backgroundColor: theme.colors.secondary },
  featuredStacked: { flexDirection: 'column', alignItems: 'stretch' },
  featuredImage: { width: '40%', aspectRatio: 1.2, alignSelf: 'stretch', minHeight: 116 },
  featuredImageWide: { width: '100%', aspectRatio: 16 / 9 },
  featuredCopy: { flex: 1, padding: 14, gap: 8 },
  featuredTitle: { color: 'white', fontSize: 15, lineHeight: 21, fontWeight: '700' },
  category: { color: '#F2D773', fontSize: 10, lineHeight: 16, fontWeight: '600' },
  discover: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  discoverText: { color: '#C5D0EB', fontSize: 11 },
  carousel: { gap: 12, paddingBottom: 4 },
  program: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', backgroundColor: theme.colors.secondary },
  programImage: { width: '100%', aspectRatio: 0.95 },
  programCopy: { padding: 12, gap: 6 },
  programTitle: { color: 'white', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  replay: { gap: 10 },
  replayImage: { aspectRatio: 16 / 9, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.card },
  play: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(2,11,46,0.65)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  duration: { position: 'absolute', right: 8, bottom: 8, padding: 5, borderRadius: 5, backgroundColor: 'rgba(2,11,46,0.9)', color: 'white', fontSize: 10, fontWeight: '600' },
  date: { color: '#ADBDDF', fontSize: 11 },
  pressed: { opacity: 0.75 },
});
