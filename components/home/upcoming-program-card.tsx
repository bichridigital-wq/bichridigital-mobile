import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type UpcomingProgramCardProps = {
  title: string;
  subtitle: string;
  timeLabel: string;
  dateLabel: string;
  accent: string;
};

export function UpcomingProgramCard({ title, subtitle, timeLabel, dateLabel, accent }: UpcomingProgramCardProps) {
  return (
    <View style={[styles.card, { borderColor: accent }]}> 
      <View style={styles.top}>
        <Text style={styles.date}>{dateLabel}</Text>
        <Text style={styles.time}>{timeLabel}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    minWidth: 180,
    gap: 8,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: theme.colors.muted,
    fontSize: 12,
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
  subtitle: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
