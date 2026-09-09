import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getEmissionCoverSource } from '@/constants/emission-covers';
import { theme } from '@/constants/theme';

type FeaturedShowCardProps = {
  slug: string;
  title: string;
  category: string;
  accent: string;
  onPress: () => void;
};

export function FeaturedShowCard({ slug, title, category, accent, onPress }: FeaturedShowCardProps) {
  const coverSource = getEmissionCoverSource(slug);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir l’émission ${title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: accent },
        pressed && styles.pressed,
      ]}>
      {coverSource !== undefined ? (
        <Image
          accessible={false}
          contentFit="cover"
          source={coverSource}
          style={styles.cover}
          transition={180}
        />
      ) : null}
      <Text style={styles.label}>À la une</Text>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.category}>{category}</Text>
      <View style={styles.button}>
        <Text style={styles.buttonText}>Voir l&apos;émission</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: 'rgba(0,36,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
  },
  label: {
    color: theme.colors.yellow,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  category: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.84,
  },
});
