import { StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';

export function DirectLoadingState() {
  return (
    <View accessibilityLabel="Chargement du direct" style={styles.container}>
      <View style={[styles.skeleton, styles.player]} />
      <View style={[styles.skeleton, styles.line]} />
      <View style={[styles.skeleton, styles.info]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  skeleton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: theme.colors.secondary,
  },
  player: { width: '100%', aspectRatio: 16 / 9 },
  line: { width: '58%', height: 20 },
  info: { width: '100%', height: 90 },
});
