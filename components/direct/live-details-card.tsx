import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type LiveDetailsCardProps = {
  emission: string;
  date: string;
  time: string;
  location: string;
  description: string;
};

export function LiveDetailsCard({ emission, date, time, location, description }: LiveDetailsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Informations du direct</Text>
      <View style={styles.grid}>
        <View style={styles.item}>
          <Text style={styles.label}>Émission</Text>
          <Text style={styles.value}>{emission}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{date}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Heure</Text>
          <Text style={styles.value}>{time}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Lieu</Text>
          <Text style={styles.value}>{location}</Text>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={3}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    minWidth: '45%',
    flexGrow: 1,
    gap: 4,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  value: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
});
