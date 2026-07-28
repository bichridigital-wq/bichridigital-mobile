import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export function EmissionEmptyState({ message }: { message: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: theme.colors.secondary,
  },
  text: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
