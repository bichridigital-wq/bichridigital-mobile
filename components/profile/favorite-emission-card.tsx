import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { FavoriteEmission } from '@/types/user-library';

export function FavoriteEmissionCard({
  emission,
  onOpen,
  onRemove,
}: {
  emission: FavoriteEmission;
  onOpen: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={[styles.card, { borderColor: emission.coverColor }]}>
      <Pressable
        accessibilityLabel={`Ouvrir l’émission ${emission.title}`}
        accessibilityRole="button"
        onPress={onOpen}
        style={({ pressed }) => [styles.openArea, pressed && styles.pressed]}>
        <View style={[styles.visual, { backgroundColor: emission.coverColor }]}>
          <Ionicons color={theme.colors.text} name="play-circle" size={32} />
        </View>
        <Text numberOfLines={2} style={styles.title}>
          {emission.title}
        </Text>
        <Text numberOfLines={1} style={styles.category}>
          {emission.category}
        </Text>
      </Pressable>
      <Pressable
        accessibilityLabel={`Retirer l’émission ${emission.title} des favoris`}
        accessibilityRole="button"
        onPress={onRemove}
        style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
        <Ionicons color={theme.colors.yellow} name="heart" size={16} />
        <Text style={styles.removeText}>Retirer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 174,
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: theme.colors.secondary,
  },
  openArea: { gap: 7, paddingBottom: 9 },
  visual: {
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    minHeight: 38,
    paddingHorizontal: 11,
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  category: {
    paddingHorizontal: 11,
    color: theme.colors.muted,
    fontSize: 11,
  },
  removeButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  removeText: { color: theme.colors.yellow, fontSize: 11, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});
