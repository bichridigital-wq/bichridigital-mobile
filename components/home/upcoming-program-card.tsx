import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RemoteThumbnail } from '@/components/home/remote-thumbnail';
import { theme } from '@/constants/theme';

type UpcomingProgramCardProps = {
  title: string;
  timeLabel: string;
  dateLabel: string;
  thumbnailUrl?: string;
  onPress: () => void;
};

export function UpcomingProgramCard({
  title,
  timeLabel,
  dateLabel,
  thumbnailUrl,
  onPress,
}: UpcomingProgramCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Voir ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <RemoteThumbnail
        fallbackColor={theme.colors.card}
        style={styles.thumbnail}
        uri={thumbnailUrl}
      />
      <View style={styles.content}>
        <View style={styles.top}>
          <Text style={styles.date}>{dateLabel}</Text>
          <Text style={styles.time}>{timeLabel}</Text>
        </View>
        <Text numberOfLines={2} style={styles.title}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.yellow,
    backgroundColor: theme.colors.card,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  content: {
    gap: 8,
    padding: 14,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  date: {
    flex: 1,
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
    lineHeight: 21,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.84,
  },
});
