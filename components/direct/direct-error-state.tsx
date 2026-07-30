import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export function DirectErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View accessibilityRole="alert" style={styles.card}>
      <Ionicons color={theme.colors.yellow} name="cloud-offline-outline" size={32} />
      <Text style={styles.title}>Impossible de vérifier le direct</Text>
      <Text style={styles.message}>Vérifiez votre connexion puis réessayez.</Text>
      <Pressable
        accessibilityLabel="Réessayer de vérifier le direct"
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
    gap: 10,
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(252,205,18,0.24)',
    backgroundColor: theme.colors.secondary,
  },
  title: { color: theme.colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  message: { color: theme.colors.muted, fontSize: 13, textAlign: 'center' },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    marginTop: 5,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  buttonText: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
