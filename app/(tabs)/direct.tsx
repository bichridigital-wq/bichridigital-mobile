import { StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { SectionCard } from '@/components/ui/section-card';
import { theme } from '@/constants/theme';

export default function DirectScreen() {
  return (
    <AppShell title="Direct" subtitle="Suivez les temps forts en direct.">
      <View style={styles.liveBadge}>
        <Text style={styles.liveText}>En ligne maintenant</Text>
      </View>

      <SectionCard title="Programme du moment" subtitle="Diffusion continue">
        <Text style={styles.cardText}>
          Une vue dédiée au direct avec un espace prêt à accueillir vos contenus et votre identité de marque.
        </Text>
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  liveBadge: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  liveText: {
    color: theme.colors.yellow,
    fontWeight: '700',
  },
  cardText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
});
