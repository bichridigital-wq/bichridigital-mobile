import { StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { FeaturePill } from '@/components/ui/feature-pill';
import { SectionCard } from '@/components/ui/section-card';
import { theme } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <AppShell
      title="Accueil"
      subtitle="Le média digital bichri, pensé pour un rendu moderne et rapide."
    >
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>BichriDigital</Text>
        <Text style={styles.heroSubtitle}>
          Un hub moderne pour suivre l’actualité, les émissions et les contenus du moment.
        </Text>
        <View style={styles.pills}>
          <FeaturePill label="Direct" />
          <FeaturePill label="Émissions" />
          <FeaturePill label="Replays" />
        </View>
      </View>

      <SectionCard title="À l’affiche" subtitle="Le fil du moment">
        <Text style={styles.cardText}>
          Découvrez le contenu phare de la journée avec une interface claire, rapide et pensée mobile.
        </Text>
      </SectionCard>

      <SectionCard title="Ce que vous pourrez retrouver" subtitle="Version initiale">
        <Text style={styles.cardText}>
          Accueil, direct, émissions, replays et plus, dans une architecture prête pour évoluer.
        </Text>
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    lineHeight: 22,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  cardText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
});
