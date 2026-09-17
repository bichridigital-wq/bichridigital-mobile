import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

const actions = [
  { title: 'Direct', subtitle: 'Voir en direct', icon: 'live-tv', route: '/(tabs)/direct' },
  { title: 'Émissions', subtitle: 'Tout le catalogue', icon: 'grid-view', route: '/(tabs)/emissions' },
  { title: 'Replays', subtitle: 'Ne rien manquer', icon: 'replay', route: '/(tabs)/replays' },
  { title: 'Actualités', subtitle: 'Toute l’info Ndiagne', icon: 'newspaper', route: '/emission/entretien-special' },
] as const;

export function HomeQuickActions() {
  return <View style={styles.grid}>{actions.map((action) => (
    <Pressable key={action.title} accessibilityRole="button" accessibilityLabel={`${action.title}, ${action.subtitle}`}
      onPress={() => router.push(action.route)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}>
      <MaterialIcons name={action.icon} size={22} color={theme.colors.yellow} />
      <View style={styles.copy}><Text style={styles.title}>{action.title}</Text><Text style={styles.subtitle}>{action.subtitle}</Text></View>
      <MaterialIcons name="chevron-right" size={17} color="#A7B7E5" />
    </Pressable>
  ))}</View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { flexBasis: '46%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, minHeight: 78, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(107,137,228,0.18)', backgroundColor: theme.colors.secondary },
  copy: { flex: 1 },
  title: { color: 'white', fontWeight: '700', fontSize: 13 },
  subtitle: { color: '#AAB9DC', fontSize: 10, lineHeight: 15, marginTop: 4 },
});
