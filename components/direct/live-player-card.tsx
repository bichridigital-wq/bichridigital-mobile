import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { YoutubePlayer, isValidYoutubeVideoId } from '@/components/video/youtube-player';
import { theme } from '@/constants/theme';
import type { LivePresentation } from '@/utils/live-broadcast-adapter';
import { playLightHaptic } from '@/utils/haptics';

type LivePlayerCardProps = {
  presentation: LivePresentation;
};

export function LivePlayerCard({ presentation }: LivePlayerCardProps) {
  const canOpen = isValidYoutubeVideoId(presentation.videoId);

  const openYoutube = async () => {
    if (!canOpen) {
      return;
    }
    playLightHaptic();
    await Linking.openURL(
      `https://www.youtube.com/watch?v=${presentation.videoId}`,
    ).catch(() => undefined);
  };

  return (
    <View style={styles.section}>
      {canOpen ? (
        <View accessibilityLabel="Lecteur du direct Bichridigital">
          <YoutubePlayer videoId={presentation.videoId} />
        </View>
      ) : null}
      <View style={styles.card}>
        <Text numberOfLines={3} style={styles.title}>
          {presentation.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.channel}>Bichridigital</Text>
          <Text style={styles.meta}>{presentation.relativeLabel}</Text>
        </View>
        {presentation.description ? (
          <Text numberOfLines={3} style={styles.description}>
            {presentation.description}
          </Text>
        ) : null}
        <Pressable
          accessibilityLabel="Ouvrir le direct sur YouTube"
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
          <Text style={styles.buttonText}>Ouvrir sur YouTube</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  card: {
    gap: 10,
    padding: theme.spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: theme.colors.secondary,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '800',
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  channel: { color: theme.colors.yellow, fontSize: 13, fontWeight: '800' },
  meta: { color: theme.colors.muted, fontSize: 13 },
  description: { color: theme.colors.muted, fontSize: 13, lineHeight: 20 },
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
