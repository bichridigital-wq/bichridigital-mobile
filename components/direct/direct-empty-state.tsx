import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type DirectEmptyStateProps = {
  lastCheckedLabel: string;
  onRefresh: () => void;
};

export function DirectEmptyState({
  lastCheckedLabel,
  onRefresh,
}: DirectEmptyStateProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>📺</Text>
      </View>
      <Text style={styles.title}>Aucun direct en cours</Text>
      <Text style={styles.message}>
        Les prochains directs de Bichridigital apparaîtront automatiquement ici.
      </Text>
      <Pressable
        accessibilityLabel="Actualiser le direct"
        accessibilityRole="button"
        onPress={onRefresh}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>Actualiser</Text>
      </Pressable>
      <Text style={styles.lastChecked}>{lastCheckedLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 10,
    padding: 24,
    borderRadius: 24,
    backgroundColor: theme.colors.card,
  },
  iconWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  lastChecked: {
    color: theme.colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
});
