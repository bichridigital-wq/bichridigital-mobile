import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export function ProfileSummary({
  favoriteVideoCount,
  followedEmissionCount,
  recentCount,
}: {
  favoriteVideoCount: number;
  followedEmissionCount: number;
  recentCount: number;
}) {
  const items = [
    { label: 'Vidéos favorites', value: favoriteVideoCount },
    { label: 'Émissions suivies', value: followedEmissionCount },
    { label: 'Vidéos récentes', value: recentCount },
  ];

  return (
    <View accessibilityLabel="Résumé de votre espace" style={styles.card}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
  },
  value: { color: theme.colors.yellow, fontSize: 22, fontWeight: '900' },
  label: {
    color: theme.colors.muted,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
});
