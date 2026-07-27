import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { brandInfo } from '@/constants/more-content';
import { theme } from '@/constants/theme';

export function BrandCard() {
  return (
    <View style={styles.card}>
      <View style={styles.glow} />
      <View style={styles.brandRow}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>B</Text>
        </View>
        <View style={styles.brandText}>
          <Text style={styles.name}>{brandInfo.name}</Text>
          <Text style={styles.slogan} numberOfLines={2}>
            {brandInfo.slogan}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{brandInfo.description}</Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={17} color={theme.colors.yellow} />
          <Text style={styles.detailText}>{brandInfo.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="videocam-outline" size={17} color={theme.colors.yellow} />
          <Text style={styles.detailText}>{brandInfo.studio}</Text>
        </View>
        <View style={styles.sinceBadge}>
          <Ionicons name="calendar-outline" size={15} color={theme.colors.background} />
          <Text style={styles.sinceText}>Depuis {brandInfo.activeSince}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    gap: 16,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,36,255,0.45)',
    backgroundColor: theme.colors.secondary,
  },
  glow: {
    position: 'absolute',
    top: -54,
    right: -45,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(0,36,255,0.22)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
  },
  logoText: {
    color: theme.colors.text,
    fontSize: 27,
    fontWeight: '900',
  },
  brandText: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  name: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  slogan: {
    color: theme.colors.yellow,
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  details: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  detailText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  sinceBadge: {
    minHeight: 34,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: theme.colors.yellow,
  },
  sinceText: {
    color: theme.colors.background,
    fontSize: 11,
    fontWeight: '800',
  },
});
