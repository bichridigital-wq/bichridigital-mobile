import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { NightGradient } from '@/components/brand/night-gradient';
import { getEmissionCoverSource } from '@/constants/emission-covers';
import { theme } from '@/constants/theme';
import type { HomeEditorialItem } from '@/utils/premium-home-content';
import { openHomeDestination } from './home-navigation';

export function EditorialImage({ item, preferThumbnail = false }: { item: HomeEditorialItem; preferThumbnail?: boolean }) {
  const [failed, setFailed] = useState<string>();
  const local = item.slug ? getEmissionCoverSource(item.slug) : undefined;
  const remote = item.thumbnailUrl && failed !== item.thumbnailUrl ? item.thumbnailUrl : undefined;
  const source = (preferThumbnail ? remote ?? local : local ?? remote) ?? require('@/assets/images/brand/mosquee-ndiagne.jpg');
  return <Image accessible={false} contentFit="cover" source={source} onError={() => setFailed(item.thumbnailUrl)} style={StyleSheet.absoluteFill} />;
}

export function PremiumHero({ items }: { items: HomeEditorialItem[] }) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const scroll = useRef<ScrollView>(null);
  const { fontScale } = useWindowDimensions();
  if (!items.length) return null;
  return <View style={styles.wrapper} onLayout={(event) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth !== width) {
      setWidth(nextWidth);
      setIndex(0);
      scroll.current?.scrollTo({ x: 0, animated: false });
    }
  }}>
    {width > 0 ? <ScrollView ref={scroll} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={(event) => setIndex(Math.min(items.length - 1, Math.max(0, Math.round(event.nativeEvent.contentOffset.x / width))))}>
      {items.map((item) => <View key={item.id} style={[styles.card, { width, minHeight: width * 0.68 }]}>
        <EditorialImage item={item} />
        <NightGradient />
        <View style={[styles.content, { paddingTop: Math.min(width * 0.25, 100) }]}>
          <View style={styles.labels}>
            <Text style={styles.category}>{item.category}</Text>
            {item.status ? <Text style={[styles.badge, item.status === 'live' && styles.live]}>{item.status === 'live' ? '● EN DIRECT' : 'À VENIR'}</Text> : null}
          </View>
          <Text accessibilityRole="header" style={[styles.title, { fontSize: width < 350 || fontScale > 1.2 ? 23 : 28 }]}>{item.title}</Text>
          {item.status === 'upcoming' && item.date ? <Text style={styles.date}>{item.date}</Text> : null}
          <Pressable accessibilityRole="button" onPress={() => openHomeDestination(item.destination)}
            accessibilityLabel={`${item.status === 'live' ? 'Regarder maintenant' : 'Voir'} : ${item.title}`}
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.75 }]}>
            <MaterialIcons name={item.status === 'upcoming' ? 'arrow-forward' : 'play-arrow'} size={20} color="white" />
            <Text style={styles.buttonText}>{item.destination.kind === 'video' && item.status !== 'upcoming' ? 'Regarder maintenant' : 'Voir l’émission'}</Text>
          </Pressable>
        </View>
      </View>)}
    </ScrollView> : null}
    {items.length > 1 ? <View style={styles.indicators}>{items.map((item, itemIndex) => (
      <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Sélection ${itemIndex + 1} : ${item.title}`}
        accessibilityState={{ selected: itemIndex === index }} onPress={() => { setIndex(itemIndex); scroll.current?.scrollTo({ x: width * itemIndex, animated: false }); }} style={styles.dotTarget}>
        <View style={[styles.dot, itemIndex === index && styles.activeDot]} />
      </Pressable>
    ))}</View> : null}
  </View>;
}

const styles = StyleSheet.create({
  wrapper: { gap: 2 },
  card: { overflow: 'hidden', justifyContent: 'flex-end', borderRadius: 24, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: 'rgba(133,157,224,0.22)' },
  content: { padding: 20, gap: 12 },
  labels: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  category: { color: '#FFF1A8', fontWeight: '700', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  badge: { overflow: 'hidden', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: theme.colors.yellow, color: theme.colors.background, fontSize: 10, fontWeight: '800' },
  live: { backgroundColor: '#B71C34', color: 'white' },
  title: { color: 'white', fontWeight: '800', letterSpacing: -0.7, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 8 },
  date: { color: '#E2E8FA', fontSize: 12 },
  button: { minHeight: 46, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: theme.colors.primary, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 12, flexShrink: 1 },
  indicators: { flexDirection: 'row', justifyContent: 'center' },
  dotTarget: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 9, backgroundColor: '#46557F' },
  activeDot: { width: 22, backgroundColor: theme.colors.yellow },
});
