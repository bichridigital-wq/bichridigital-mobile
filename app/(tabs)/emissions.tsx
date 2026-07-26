import { StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { SectionCard } from '@/components/ui/section-card';
import { theme } from '@/constants/theme';

export default function EmissionsScreen() {
  return (
    <AppShell title="Émissions" subtitle="Retrouvez les programmes à découvrir.">
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Programme phare</Text>
        <Text style={styles.panelText}>Une section dédiée à vos émissions, avec un design épuré et modulaire.</Text>
      </View>

      <SectionCard title="Prochains rendez-vous" subtitle="À venir">
        <Text style={styles.cardText}>Le contenu sera ajouté ici au fur et à mesure du développement.</Text>
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: 'rgba(0,36,255,0.16)',
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
