import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '@/constants/theme';

type ShowCardProps = {
  title: string;
  subtitle: string;
  accent: string;
};

export function ShowCard({ title, subtitle, accent }: ShowCardProps) {
  return (
    <View style={[styles.card, { borderColor: accent }]}> 
      <View style={[styles.visual, { backgroundColor: accent }]} />
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
      <TouchableOpacity style={styles.button} accessibilityRole="button" accessibilityLabel={`Voir ${title}`}>
        <Text style={styles.buttonText}>Voir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: 20,
    padding: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    gap: 10,
  },
  visual: {
    borderRadius: 14,
    height: 84,
  },
  title: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
});
