import { StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';

export function ScheduleLoadingState() {
  return (
    <View accessibilityLabel="Chargement de l'agenda" style={styles.container}>
      <View style={[styles.skeleton, styles.featured]} />
      <View style={[styles.skeleton, styles.row]} />
      <View style={[styles.skeleton, styles.row]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  skeleton: { borderRadius: 18, backgroundColor: theme.colors.secondary },
  featured: { width: '100%', height: 290 },
  row: { width: '100%', height: 86 },
});
