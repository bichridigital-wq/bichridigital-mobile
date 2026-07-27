import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export function EmptySearchState() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aucune émission trouvée</Text>
      <Text style={styles.subtitle}>Essayez un autre terme ou changez de filtre.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.card,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  title: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
});
