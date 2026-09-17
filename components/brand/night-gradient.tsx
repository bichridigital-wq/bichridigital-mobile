import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

// Decorative SVG only: expo-image already supports SVG on iOS, Android and web.
// This avoids adding a native dependency just to render a gradient.
const gradients = {
  hero: '<stop stop-color="#020B2E" stop-opacity="0.03"/><stop offset=".35" stop-color="#020B2E" stop-opacity=".2"/><stop offset="1" stop-color="#020B2E" stop-opacity=".98"/>',
  intro: '<stop stop-color="#020B2E"/><stop offset=".28" stop-color="#020B2E" stop-opacity=".3"/><stop offset=".6" stop-color="#1E40AF" stop-opacity=".35"/><stop offset="1" stop-color="#020B2E"/>',
};
const sources = Object.fromEntries(Object.entries(gradients).map(([key, stops]) => [key, {
  uri: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="64"><defs><linearGradient id="g" x2="0" y2="1">${stops}</linearGradient></defs><rect width="16" height="64" fill="url(#g)"/></svg>`)}`,
}]));

export function NightGradient({ variant = 'hero' }: { variant?: keyof typeof gradients }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image accessible={false} source={sources[variant]} contentFit="fill" style={StyleSheet.absoluteFill} />
    </View>
  );
}
