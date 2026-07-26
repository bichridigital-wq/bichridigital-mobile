import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type VideoCardProps = {
  title: string;
  program: string;
  duration: string;
  relativeTime: string;
  accent: string;
};

export function VideoCard({ title, program, duration, relativeTime, accent }: VideoCardProps) {
  return (
    <View style={styles.card}> 
      <View style={[styles.thumbnail, { backgroundColor: accent }]}> 
        <Text style={styles.duration}>{duration}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.program} numberOfLines={1}>{program}</Text>
      <Text style={styles.time} numberOfLines={1}>{relativeTime}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    gap: 8,
  },
  thumbnail: {
    borderRadius: 18,
    height: 100,
    justifyContent: 'flex-end',
    padding: 10,
  },
  duration: {
    alignSelf: 'flex-start',
    color: theme.colors.background,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  program: {
    color: theme.colors.yellow,
    fontSize: 12,
    fontWeight: '600',
  },
  time: {
    color: theme.colors.muted,
    fontSize: 12,
  },
});
