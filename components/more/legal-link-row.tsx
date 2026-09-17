import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type LegalLinkRowProps = {
  title: string;
  url: string;
  onOpen: (url: string) => void;
};

export function LegalLinkRow({
  title,
  url,
  onOpen,
}: LegalLinkRowProps) {
  return (
    <Pressable
      accessibilityLabel={`Consulter ${title}`}
      accessibilityRole="link"
      onPress={() => onOpen(url)}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.pressed,
      ]}>
      <View style={styles.icon}>
        <Ionicons
          name="document-text-outline"
          size={19}
          color={theme.colors.yellow}
        />
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.action}>
        <Text style={styles.actionText}>Consulter</Text>
        <Ionicons
          name="chevron-forward"
          size={17}
          color={theme.colors.yellow}
        />
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
  },
  pressed: {
    opacity: 0.72,
  },
  icon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: 'rgba(252,205,18,0.08)',
  },
  title: {
    minWidth: 0,
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionText: {
    color: theme.colors.yellow,
    fontSize: 10,
    fontWeight: '700',
  },
});