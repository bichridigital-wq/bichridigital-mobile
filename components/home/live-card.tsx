import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RemoteThumbnail } from '@/components/home/remote-thumbnail';
import { theme } from '@/constants/theme';

type LiveCardProps = {
  status: 'live' | 'upcoming' | 'offline';
  title: string;
  timeLabel?: string;
  thumbnailUrl?: string;
  onPress: () => void;
};

export function LiveCard({
  status,
  title,
  timeLabel,
  thumbnailUrl,
  onPress,
}: LiveCardProps) {
  if (status === 'offline') {
    return (
      <View style={styles.offlineCard}>
        <Text style={styles.title}>Aucun direct en cours</Text>
        <Text style={styles.offlineText}>
          Les prochains directs apparaîtront automatiquement ici.
        </Text>
        <Pressable
          accessibilityLabel="Voir l’onglet Direct"
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Voir l’onglet Direct</Text>
        </Pressable>
      </View>
    );
  }

  const isLive = status === 'live';

  return (
    <View style={styles.card}>
      <RemoteThumbnail
        fallbackColor={theme.colors.card}
        style={styles.thumbnail}
        uri={thumbnailUrl}
      />
      <View style={styles.content}>
        <View style={[styles.badge, isLive ? styles.liveBadge : styles.upcomingBadge]}>
          <Text style={[styles.badgeText, !isLive && styles.upcomingBadgeText]}>
            {isLive ? 'EN DIRECT' : 'À VENIR'}
          </Text>
        </View>
        <Text numberOfLines={2} style={styles.title}>{title}</Text>
        {timeLabel ? <Text style={styles.time}>{timeLabel}</Text> : null}
        <Pressable
          accessibilityLabel={`${isLive ? 'Rejoindre' : 'Voir'} ${title}`}
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>{isLive ? 'Rejoindre' : 'Voir'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  content: {
    gap: 8,
    padding: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  liveBadge: {
    backgroundColor: 'rgba(229,57,53,0.18)',
  },
  upcomingBadge: {
    backgroundColor: theme.colors.yellow,
  },
  badgeText: {
    color: '#FF7673',
    fontSize: 11,
    fontWeight: '800',
  },
  upcomingBadgeText: {
    color: theme.colors.background,
  },
  title: {
    color: theme.colors.text,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
  },
  time: {
    color: theme.colors.yellow,
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginTop: 3,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  offlineCard: {
    gap: 8,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.card,
  },
  offlineText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  pressed: {
    opacity: 0.8,
  },
});
