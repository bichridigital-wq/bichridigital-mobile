import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
