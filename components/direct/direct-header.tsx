import { StyleSheet, Text, View } from 'react-native';

import { LiveStatusBadge } from '@/components/direct/live-status-badge';
import { theme } from '@/constants/theme';

type DirectHeaderProps = {
  status: 'loading' | 'error' | 'live' | 'upcoming' | 'offline';
};

const subtitles = {
  loading: 'Vérification de la diffusion en cours…',
  error: 'Le statut du direct est temporairement indisponible.',
  live: 'Suivez la diffusion en cours depuis Bichridigital.',
  upcoming: 'Le prochain direct commencera bientôt.',
  offline: 'Aucune diffusion en direct pour le moment.',
} as const;

export function DirectHeader({ status }: DirectHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        <Text style={styles.title}>Bichridigital en direct</Text>
        <Text style={styles.subtitle}>{subtitles[status]}</Text>
      </View>
      {status === 'live' || status === 'upcoming' || status === 'offline' ? (
        <LiveStatusBadge status={status} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 12,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  copy: { gap: 5 },
  title: {
    color: theme.colors.text,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
