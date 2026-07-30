import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { isValidYoutubeVideoId } from '@/components/video/youtube-player';
import { theme } from '@/constants/theme';
import type { CountdownValue } from '@/hooks/use-countdown';
import type { LivePresentation } from '@/utils/live-broadcast-adapter';
import { playLightHaptic } from '@/utils/haptics';

type UpcomingLiveCardProps = {
  countdown: CountdownValue;
  presentation: LivePresentation;
};

function Countdown({ value }: { value: CountdownValue }) {
  const parts = [
    value.days > 0 ? `${value.days} j` : null,
    `${value.hours.toString().padStart(2, '0')} h`,
    `${value.minutes.toString().padStart(2, '0')} min`,
    `${value.seconds.toString().padStart(2, '0')} s`,
  ].filter(Boolean);

  return (
    <Text accessibilityLabel={`Compte à rebours ${parts.join(' ')}`} style={styles.countdown}>
      {parts.join('  ·  ')}
    </Text>
  );
}

export function UpcomingLiveCard({
  countdown,
  presentation,
}: UpcomingLiveCardProps) {
  const canOpen = isValidYoutubeVideoId(presentation.videoId);
  const openYoutube = () => {
    if (!canOpen) {
      return;
    }
    playLightHaptic();
    void Linking.openURL(
      `https://www.youtube.com/watch?v=${presentation.videoId}`,
    ).catch(() => undefined);
  };

  return (
    <View style={styles.card}>
      <View style={styles.visual}>
        {presentation.thumbnailUrl ? (
          <Image
            accessibilityLabel={`Miniature de ${presentation.title}`}
            contentFit="cover"
            source={presentation.thumbnailUrl}
            style={styles.image}
          />
        ) : (
          <Ionicons color={theme.colors.yellow} name="calendar-outline" size={42} />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Prochain direct</Text>
        <Text numberOfLines={3} style={styles.title}>{presentation.title}</Text>
        <Text style={styles.date}>{presentation.dateLabel}</Text>
        <Countdown value={countdown} />
        <Pressable
          accessibilityLabel={`Voir ${presentation.title} sur YouTube`}
          accessibilityRole="link"
          accessibilityState={{ disabled: !canOpen }}
          disabled={!canOpen}
          onPress={openYoutube}
          style={({ pressed }) => [
            styles.button,
            !canOpen && styles.disabled,
            pressed && styles.pressed,
          ]}>
          <Ionicons color={theme.colors.text} name="logo-youtube" size={18} />
          <Text style={styles.buttonText}>Voir sur YouTube</Text>
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
    borderColor: 'rgba(252,205,18,0.25)',
    backgroundColor: theme.colors.secondary,
  },
  visual: {
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
  },
  image: { width: '100%', height: '100%' },
  content: { gap: 9, padding: theme.spacing.md },
  eyebrow: {
    color: theme.colors.yellow,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: { color: theme.colors.text, fontSize: 20, lineHeight: 27, fontWeight: '800' },
  date: { color: theme.colors.muted, fontSize: 13, textTransform: 'capitalize' },
  countdown: {
    color: theme.colors.text,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  button: {
    minHeight: 48,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  buttonText: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
});
