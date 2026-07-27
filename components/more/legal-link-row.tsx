import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type LegalLinkRowProps = {
  title: string;
};

export function LegalLinkRow({ title }: LegalLinkRowProps) {
  return (
    <Pressable
      accessibilityLabel={`${title}. Bientôt disponible`}
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      disabled
      style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name="document-text-outline" size={19} color={theme.colors.muted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Bientôt disponible</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: theme.colors.secondary,
    opacity: 0.72,
  },
  icon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: 'rgba(154,167,201,0.08)',
  },
  title: {
    minWidth: 0,
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(154,167,201,0.1)',
  },
  badgeText: {
    color: theme.colors.muted,
    fontSize: 9,
    fontWeight: '700',
  },
});
