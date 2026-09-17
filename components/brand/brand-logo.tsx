import { Image } from 'expo-image';
import { View } from 'react-native';

// Crop only the transparent padding in the supplied, unmodified brand asset.
export function BrandLogo({ width = 100 }: { width?: number }) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Bichridigital Agency"
      style={{ width, height: width * 0.47, overflow: 'hidden' }}>
      <Image accessible={false} source={require('@/assets/images/brand/bichridigital-agency.png')}
        contentFit="contain" style={{ position: 'absolute', width: width * 1.6, height: width * 1.6, left: -width * 0.3, top: -width * 0.62 }} />
    </View>
  );
}
