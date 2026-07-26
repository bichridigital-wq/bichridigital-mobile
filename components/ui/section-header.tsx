import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
};

export function SectionHeader({ title, actionLabel }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? <Text style={styles.action}>{actionLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  action: {
    color: theme.colors.yellow,
    fontSize: 13,
    fontWeight: '600',
  },
});
