import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { theme } from '@/constants/theme';

type CategoryPillProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function CategoryPill({ label, active = false, onPress }: CategoryPillProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.pill, active && styles.activePill]}
    >
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  activePill: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  label: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  activeLabel: {
    color: theme.colors.text,
  },
});
