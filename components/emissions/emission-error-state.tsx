import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export function EmissionErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View accessibilityRole="alert" style={styles.card}>
      <Text style={styles.text}>Impossible de charger les épisodes.</Text>
      <Pressable
        accessibilityLabel="Réessayer le chargement des épisodes"
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>Réessayer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 12,
    padding: theme.spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.24)',
    backgroundColor: theme.colors.secondary,
  },
  text: { color: theme.colors.muted, fontSize: 13, textAlign: 'center' },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  buttonText: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
