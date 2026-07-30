import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type LiveStatusBadgeProps = {
  status: 'live' | 'upcoming' | 'offline';
};

const labels = {
  live: 'EN DIRECT',
  upcoming: 'À VENIR',
  offline: 'HORS LIGNE',
} as const;

export function LiveStatusBadge({ status }: LiveStatusBadgeProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status !== 'live') {
      opacity.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, status]);

  return (
    <View
      accessibilityLabel={labels[status]}
      style={[styles.badge, styles[status]]}>
      {status === 'live' ? (
        <Animated.View style={[styles.liveDot, { opacity }]} />
      ) : (
        <Ionicons
          color={status === 'upcoming' ? theme.colors.yellow : theme.colors.muted}
          name={status === 'upcoming' ? 'calendar-outline' : 'radio-outline'}
          size={14}
        />
      )}
      <Text style={[styles.label, status === 'live' && styles.liveLabel]}>
        {labels[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 32,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: 1,
  },
  live: {
    backgroundColor: 'rgba(229,57,53,0.14)',
    borderColor: 'rgba(255,118,115,0.35)',
  },
  upcoming: {
    backgroundColor: 'rgba(252,205,18,0.1)',
    borderColor: 'rgba(252,205,18,0.3)',
  },
  offline: {
    backgroundColor: 'rgba(154,167,201,0.08)',
    borderColor: 'rgba(154,167,201,0.2)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E53935',
  },
  label: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveLabel: {
    color: '#FF8B88',
  },
});
