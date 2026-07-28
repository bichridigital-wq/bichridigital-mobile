import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RemoteThumbnail } from '@/components/home/remote-thumbnail';
import { theme } from '@/constants/theme';

type ShowCardProps = {
  title: string;
  subtitle: string;
  category: string;
  accent: string;
  thumbnailUrl?: string;
  onPress: () => void;
};

export function ShowCard({
  title,
  subtitle,
  category,
  accent,
  thumbnailUrl,
  onPress,
}: ShowCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Voir l’émission ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: accent },
        pressed && styles.pressed,
      ]}>
      <RemoteThumbnail
        fallbackColor={accent}
        style={styles.visual}
        uri={thumbnailUrl}
      />
      <Text numberOfLines={1} style={styles.title}>{title}</Text>
      <Text numberOfLines={1} style={styles.category}>{category}</Text>
      <Text numberOfLines={2} style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.button}>
        <Text style={styles.buttonText}>Voir</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 170,
    flexShrink: 0,
    gap: 9,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: theme.colors.card,
  },
  visual: {
    height: 90,
    borderRadius: 14,
  },
  title: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  category: {
    color: theme.colors.yellow,
    fontSize: 11,
    fontWeight: '700',
  },
  subtitle: {
    minHeight: 36,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    minHeight: 36,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.84,
  },
});
