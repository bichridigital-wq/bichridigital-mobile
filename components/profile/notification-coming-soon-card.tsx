import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export function NotificationComingSoonCard() {
  return (
    <View style={styles.card}>
      <Ionicons
        color={theme.colors.yellow}
        name="information-circle-outline"
        size={21}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Notifications bientôt disponibles</Text>
        <Text style={styles.text}>
          Vos choix sont enregistrés sur cet appareil. L’autorisation système
          et l’envoi des notifications seront ajoutés dans une prochaine étape.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(252,205,18,0.18)',
    backgroundColor: theme.colors.secondary,
  },
  content: { flex: 1, gap: 5 },
  title: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  text: { color: theme.colors.muted, fontSize: 11, lineHeight: 17 },
});
