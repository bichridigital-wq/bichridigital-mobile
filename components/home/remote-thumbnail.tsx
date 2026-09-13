import { Image } from 'expo-image';
import { useState } from 'react';
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
  const [failedUri, setFailedUri] = useState<string | undefined>();

  const hasFailed = Boolean(uri && failedUri === uri);

  return (
    <View style={[styles.container, { backgroundColor: fallbackColor }, style]}>
      {uri && !hasFailed ? (
        <Image
          accessible={false}
          contentFit="cover"
          onError={() => setFailedUri(uri)}
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