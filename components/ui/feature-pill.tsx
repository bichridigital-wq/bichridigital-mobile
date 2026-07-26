import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type FeaturePillProps = {
  label: string;
  icon?: ReactNode;
};

export function FeaturePill({ label, icon }: FeaturePillProps) {
  return (
    <View style={styles.container}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
