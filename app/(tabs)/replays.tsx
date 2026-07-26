import { StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { SectionCard } from '@/components/ui/section-card';
import { theme } from '@/constants/theme';

export default function ReplaysScreen() {
  return (
    <AppShell title="Replays" subtitle="Consultez les contenus déjà diffusés.">
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Archivage rapide</Text>
        <Text style={styles.panelText}>Cette section permet de regrouper les replays avec une présentation lisible et moderne.</Text>
      </View>

      <SectionCard title="Derniers contenus" subtitle="Historique">
        <Text style={styles.cardText}>Le catalogue de replays sera enrichi dans les prochaines étapes.</Text>
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: 'rgba(252,205,18,0.16)',
    borderRadius: 20,
    padding: theme.spacing.lg,
    gap: 6,
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  panelText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 21,
  },
  cardText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
});
