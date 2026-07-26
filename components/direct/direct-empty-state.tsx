import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '@/constants/theme';

type DirectEmptyStateProps = {
  title?: string;
  message?: string;
  buttonLabel?: string;
};

export function DirectEmptyState({
  title = 'Aucun direct pour le moment',
  message = 'Revenez bientôt pour découvrir les prochaines émissions en direct.',
  buttonLabel = 'Voir les émissions',
}: DirectEmptyStateProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>📺</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
        accessibilityHint="Aucune action disponible pour l’instant"
        disabled
        style={styles.button}
      >
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
