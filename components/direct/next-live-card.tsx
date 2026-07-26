import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '@/constants/theme';

type NextLiveCardProps = {
  title: string;
  date: string;
  time: string;
  emission: string;
  description: string;
  accent: string;
};

export function NextLiveCard({ title, date, time, emission, description, accent }: NextLiveCardProps) {
  return (
    <View style={[styles.card, { borderColor: accent }]}> 
      <View style={styles.header}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.emission} numberOfLines={1}>{emission}</Text>
      <Text style={styles.description} numberOfLines={2}>{description}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Voir"
        accessibilityHint="Aucune action disponible pour l’instant"
        disabled
        style={styles.button}
      >
        <Text style={styles.buttonText}>Voir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  time: {
    color: theme.colors.yellow,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  emission: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  description: {
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
    marginTop: 4,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
});
