import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '@/constants/theme';

type ReplayCategoryChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function ReplayCategoryChip({ label, active, onPress }: ReplayCategoryChipProps) {
  return (
    <Pressable
      accessibilityLabel={`Filtrer par ${label}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.chip, active && styles.activeChip]}>
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: theme.colors.secondary,
  },
  activeChip: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  activeLabel: {
    color: theme.colors.text,
  },
});
