import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type RemoteThumbnailProps = {
  uri?: string;
  fallbackColor: string;
  style?: StyleProp<ViewStyle>;
};

export function RemoteThumbnail({
  uri,
  fallbackColor,
  style,
}: RemoteThumbnailProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  return (
    <View style={[styles.container, { backgroundColor: fallbackColor }, style]}>
      {uri && !failed ? (
        <Image
          accessible={false}
          contentFit="cover"
          onError={() => setFailed(true)}
          source={uri}
          style={StyleSheet.absoluteFill}
          transition={180}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
