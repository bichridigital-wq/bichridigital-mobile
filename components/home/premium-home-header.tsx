import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/brand/brand-logo';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export function PremiumHomeHeader() {
  const { isAuthenticated, profile } = useAuth();
  const firstName = isAuthenticated ? profile?.displayName?.trim().split(/\s+/)[0] : undefined;
  return (
    <View style={styles.header}>
      <View style={styles.top}>
        <BrandLogo width={102} />
        <View style={styles.actions}>
          <HeaderAction icon="search" label="Rechercher une émission" onPress={() => router.push('/(tabs)/emissions')} />
          <HeaderAction icon="notifications-none" label="Préférences de notifications dans le profil" onPress={() => router.push('/(tabs)/profil')} />
          <HeaderAction icon="person-outline" label="Ouvrir mon profil" onPress={() => router.push('/(tabs)/profil')} />
        </View>
      </View>
      <Text accessibilityRole="header" style={styles.greeting}>Bonjour{firstName ? ` ${firstName}` : ''}<Text style={styles.dot}>.</Text></Text>
      <Text style={styles.subtitle}>Content de vous revoir sur Bichridigital</Text>
    </View>
  );
}

function HeaderAction({ icon, label, onPress }: { icon: React.ComponentProps<typeof MaterialIcons>['name']; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={({ pressed }) => [styles.icon, pressed && { opacity: 0.65 }]}>
    <MaterialIcons name={icon} size={22} color="white" />
  </Pressable>;
}

const styles = StyleSheet.create({
  header: { gap: 6 },
  top: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 6 },
  icon: { width: 44, height: 44, borderRadius: 16, backgroundColor: theme.colors.secondary, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 28, fontWeight: '800', color: 'white', letterSpacing: -0.7 },
  dot: { color: theme.colors.yellow },
  subtitle: { fontSize: 12, lineHeight: 18, color: '#AFBCDB' },
});
