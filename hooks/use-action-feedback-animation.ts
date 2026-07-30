import { useCallback } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function useActionFeedbackAnimation() {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animate = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.12, { duration: 90 }),
      withTiming(1, { duration: 110 }),
    );
  }, [scale]);

  return { animate, animatedStyle };
}
