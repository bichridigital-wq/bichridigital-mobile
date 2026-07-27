import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type ReplayEmptyStateProps = {
  canReset: boolean;
  onReset: () => void;
};

export function ReplayEmptyState({ canReset, onReset }: ReplayEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name="videocam-outline" size={28} color={theme.colors.yellow} />
      </View>
      <Text style={styles.title}>Aucun replay trouvé</Text>
      <Text style={styles.description}>Essayez un autre mot-clé ou une autre catégorie.</Text>
      {canReset ? (
        <Pressable
          accessibilityLabel="Effacer la recherche et les filtres"
          accessibilityRole="button"
          onPress={onReset}
          style={styles.button}>
          <Text style={styles.buttonText}>Tout afficher</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 34,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  icon: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(252,205,18,0.12)',
  },
  title: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
});
