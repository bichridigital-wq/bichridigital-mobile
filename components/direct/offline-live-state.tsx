import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type OfflineLiveStateProps = {
  notificationsActive: boolean;
  onOpenProfile: () => void;
  onOpenReplays: () => void;
  onRefresh: () => void;
};

export function OfflineLiveState({
  notificationsActive,
  onOpenProfile,
  onOpenReplays,
  onRefresh,
}: OfflineLiveStateProps) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons color={theme.colors.muted} name="tv-outline" size={30} />
      </View>
      <Text style={styles.title}>Aucun direct en cours</Text>
      <Text style={styles.message}>
        Retrouvez les dernières émissions de Bichridigital en attendant la
        prochaine diffusion.
      </Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel="Actualiser le direct"
          accessibilityRole="button"
          onPress={onRefresh}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Ionicons color={theme.colors.text} name="refresh" size={18} />
          <Text style={styles.primaryText}>Actualiser</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Voir les replays"
          accessibilityRole="button"
          onPress={onOpenReplays}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>Voir les replays</Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityLabel={
          notificationsActive
            ? 'Notifications actives sur cet appareil'
            : 'Ouvrir le Profil pour gérer les notifications'
        }
        accessibilityRole={notificationsActive ? 'text' : 'button'}
        disabled={notificationsActive}
        onPress={onOpenProfile}
        style={styles.notice}>
        <Ionicons
          color={notificationsActive ? theme.colors.yellow : theme.colors.muted}
          name={notificationsActive ? 'notifications' : 'notifications-outline'}
          size={17}
        />
        <Text style={styles.noticeText}>
          {notificationsActive
            ? 'Les notifications sont activées sur cet appareil.'
            : 'Activez les notifications depuis Profil pour préparer les futures alertes de direct.'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  icon: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: 'rgba(154,167,201,0.1)',
  },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  message: { color: theme.colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  primaryButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  primaryText: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  secondaryButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  secondaryText: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  notice: {
    width: '100%',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 4,
    padding: 12,
    borderRadius: 14,
    backgroundColor: theme.colors.card,
  },
  noticeText: { flex: 1, color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.8 },
});
