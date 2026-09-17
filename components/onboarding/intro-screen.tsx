import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, Animated, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/brand/brand-logo';
import { NightGradient } from '@/components/brand/night-gradient';
import { usefulLinks } from '@/constants/more-content';
import { theme } from '@/constants/theme';
import { playLightHaptic } from '@/utils/haptics';

const worlds = [
  { label: 'Actualités', icon: 'newspaper' },
  { label: 'Émissions', icon: 'live-tv' },
  { label: 'Culture', icon: 'auto-awesome' },
  { label: 'Notre communauté', icon: 'groups' },
] as const;

export function IntroScreen({ onEnter }: { onEnter: () => Promise<void> }) {
  const insets = useSafeAreaInsets();
  const [scale] = useState(() => new Animated.Value(1));
  const [reduceMotion, setReduceMotion] = useState(true);
  const entering = useRef(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (active) setReduceMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription.remove(); scale.stopAnimation(); };
  }, [scale]);
  const animatePress = (pressed: boolean) => {
    Animated.timing(scale, { toValue: pressed && !reduceMotion ? 0.98 : 1, duration: reduceMotion ? 0 : 110, useNativeDriver: true }).start();
  };
  const enter = async () => {
    if (entering.current) return;
    entering.current = true;
    setBusy(true);
    playLightHaptic();
    try { await onEnter(); } finally { entering.current = false; setBusy(false); }
  };
  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[
        styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, paddingLeft: insets.left + 24, paddingRight: insets.right + 24 },
      ]}>
        <View style={styles.content}>
          <Text style={styles.eyebrow}>NDIAGNE · NOS GENS · NOS VALEURS</Text>
          <View style={styles.logo}><BrandLogo width={220} /></View>
          <Text style={styles.tagline}>LA TÉLÉ AUTREMENT</Text>
          <Text style={styles.description}>Toute l’actualité de Ndiagne{ '\n' }et vos émissions préférées</Text>

          <View style={styles.scene}>
            <Image accessible accessibilityLabel="La mosquée de Ndiagne" contentFit="cover"
              source={require('@/assets/images/brand/mosquee-ndiagne.jpg')} style={StyleSheet.absoluteFill} />
            <View pointerEvents="none" style={styles.blueOverlay} />
            <NightGradient variant="intro" />
            <View pointerEvents="none" style={styles.arcBlue} />
            <View pointerEvents="none" style={styles.arcGold} />
            <View pointerEvents="none" style={styles.pattern} />
            <View style={styles.location}>
              <View style={styles.locationLine} />
              <Text style={styles.locationText}>NDIAGNE{ '\n' }CONNECTÉ{ '\n' }AU MONDE</Text>
            </View>
          </View>

          <View style={styles.worlds}>
            {worlds.map((world) => (
              <View key={world.label} style={styles.world}>
                <View style={styles.worldIcon}><MaterialIcons name={world.icon} size={22} color={theme.colors.yellow} /></View>
                <Text style={styles.worldText}>{world.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.statement}>
            <Text accessibilityRole="header" style={styles.statementText}>Notre territoire.</Text>
            <Text style={[styles.statementText, styles.statementAccent]}>Vos histoires. En grand.</Text>
          </View>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable accessibilityRole="button" accessibilityState={{ busy, disabled: busy }} disabled={busy}
              onPress={() => void enter()} onPressIn={() => void animatePress(true)} onPressOut={() => void animatePress(false)}
              style={styles.enter}>
              <Text style={styles.enterText}>{busy ? 'Bienvenue…' : 'Entrer dans l’application'}</Text>
              <MaterialIcons name="arrow-forward" size={22} color="white" />
            </Pressable>
          </Animated.View>
          <Pressable accessibilityRole="link" onPress={() => {
            void Linking.openURL(usefulLinks[0].url).catch(() => Alert.alert('Lien indisponible', 'Veuillez réessayer plus tard.'));
          }} style={({ pressed }) => [styles.discover, pressed && { opacity: 0.7 }]}>
            <Text style={styles.discoverText}>Découvrir Bichridigital</Text>
            <MaterialIcons name="north-east" size={15} color={theme.colors.yellow} />
          </Pressable>
          <Text style={styles.footer}>MÉDIA · PARTAGE · DÉVELOPPEMENT</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  eyebrow: { color: '#BDC8E5', textAlign: 'center', fontSize: 10, letterSpacing: 2, fontWeight: '600' },
  logo: { alignItems: 'center', marginTop: 20, marginBottom: 8 },
  tagline: { color: theme.colors.yellow, textAlign: 'center', fontSize: 11, letterSpacing: 3, fontWeight: '700' },
  description: { color: '#E2E8FA', textAlign: 'center', fontSize: 15, lineHeight: 23, marginTop: 16 },
  scene: { width: '100%', aspectRatio: 1.7, marginTop: 16, overflow: 'hidden', borderRadius: 24 },
  blueOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(2,11,46,0.28)' },
  arcBlue: { position: 'absolute', width: '120%', height: '160%', left: '-10%', top: '8%', borderRadius: 999, borderWidth: 2, borderColor: 'rgba(61,100,255,0.6)', transform: [{ rotate: '-18deg' }] },
  arcGold: { position: 'absolute', width: '130%', height: '170%', left: '-15%', top: '20%', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(252,205,18,0.5)', transform: [{ rotate: '18deg' }] },
  pattern: { position: 'absolute', width: 72, height: 72, right: -24, top: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', transform: [{ rotate: '45deg' }] },
  location: { position: 'absolute', bottom: 16, left: 18, flexDirection: 'row', gap: 10, alignItems: 'center' },
  locationLine: { width: 2, height: 32, backgroundColor: theme.colors.yellow },
  locationText: { color: 'white', fontSize: 9, lineHeight: 13, letterSpacing: 2, fontWeight: '700' },
  worlds: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
  world: { flexGrow: 1, flexBasis: 65, alignItems: 'center', gap: 8 },
  worldIcon: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(252,205,18,0.16)', backgroundColor: '#0B1740', alignItems: 'center', justifyContent: 'center' },
  worldText: { color: '#D6DFF4', textAlign: 'center', fontSize: 11, lineHeight: 16 },
  statement: { marginTop: 24, marginBottom: 22 },
  statementText: { color: 'white', textAlign: 'center', fontSize: 25, lineHeight: 33, fontWeight: '800', letterSpacing: -0.6 },
  statementAccent: { color: theme.colors.yellow },
  enter: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 16, borderRadius: 20, backgroundColor: theme.colors.primary, borderWidth: 1, borderColor: 'rgba(252,205,18,0.5)', boxShadow: '0 4px 22px rgba(0,36,255,0.28)' },
  enterText: { flexShrink: 1, color: 'white', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  discover: { minHeight: 48, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  discoverText: { flexShrink: 1, color: '#D6DFF4', textAlign: 'center', fontSize: 12 },
  footer: { marginTop: 6, color: '#9AA7C9', fontSize: 9, letterSpacing: 1.6, textAlign: 'center' },
});
