import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '@/constants/theme';

type HeroCardProps = {
  category: string;
  title: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  accent: string;
};

export function HeroCard({ category, title, description, ctaPrimary, ctaSecondary, accent }: HeroCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: accent }]}> 
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{category}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.description} numberOfLines={4}>{description}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          accessibilityRole="button"
          accessibilityLabel={ctaPrimary}
        >
          <Text style={styles.primaryButtonText}>{ctaPrimary}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          accessibilityRole="button"
          accessibilityLabel={ctaSecondary}
        >
          <Text style={styles.secondaryButtonText}>{ctaSecondary}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    minHeight: 250,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: theme.colors.text,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
