import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type SectionCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 24,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  header: {
    gap: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 13,
  },
});
