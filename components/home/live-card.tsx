import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { theme } from '@/constants/theme';

type LiveCardProps = {
  title: string;
  subtitle: string;
  timeLabel: string;
  accent: string;
  isLive?: boolean;
};

export function LiveCard({ title, subtitle, timeLabel, accent, isLive = true }: LiveCardProps) {
  if (!isLive) {
    return <EmptyState title="Aucun direct prévu" description="Revenez bientôt pour découvrir les prochaines émissions en live." />;
  }

  return (
    <View style={[styles.card, { borderColor: accent }]}> 
      <View style={styles.badge}>
        <Text style={styles.badgeText}>EN DIRECT</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <Text style={styles.time}>{timeLabel}</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: accent }]}
          accessibilityRole="button"
          accessibilityLabel="Rejoindre le direct"
        >
          <Text style={styles.buttonText}>Rejoindre</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(252,205,18,0.16)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  badgeText: {
    color: theme.colors.yellow,
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  time: {
    color: theme.colors.yellow,
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 13,
    fontWeight: '700',
  },
});
