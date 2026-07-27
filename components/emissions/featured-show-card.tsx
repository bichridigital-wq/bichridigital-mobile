import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '@/constants/theme';

type FeaturedShowCardProps = {
  title: string;
  category: string;
  accent: string;
  onPress?: () => void;
};

export function FeaturedShowCard({ title, category, accent, onPress }: FeaturedShowCardProps) {
  const isInteractive = Boolean(onPress);

  return (
    <View style={[styles.card, { borderColor: accent }]}>
      <Text style={styles.label}>À la une</Text>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.category}>{category}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Voir ${title}`}
        accessibilityState={{ disabled: !isInteractive }}
        disabled={!isInteractive}
        onPress={onPress}
        style={[styles.button, !isInteractive && styles.disabledButton]}
      >
        <Text style={styles.buttonText}>Voir l&apos;émission</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: 'rgba(0,36,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  label: {
    color: theme.colors.yellow,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  category: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
