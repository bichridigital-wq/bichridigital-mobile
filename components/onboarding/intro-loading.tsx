import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';

export function IntroLoading() {
  return <View style={styles.screen}><ActivityIndicator accessibilityLabel="Ouverture de Bichridigital" color={theme.colors.yellow} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
});
