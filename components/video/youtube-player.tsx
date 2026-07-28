import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { theme } from '@/constants/theme';

const PLAYER_ORIGIN = 'https://www.bichridigital.com';
const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const ALLOWED_WEBVIEW_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'googlevideo.com',
]);

export function isValidYoutubeVideoId(videoId: string): boolean {
  return YOUTUBE_VIDEO_ID_PATTERN.test(videoId);
}

function buildYoutubeEmbedUrl(videoId: string): string | null {
  if (!isValidYoutubeVideoId(videoId)) {
    return null;
  }

  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
  embedUrl.search = new URLSearchParams({
    playsinline: '1',
    controls: '1',
    autoplay: '0',
    origin: PLAYER_ORIGIN,
  }).toString();

  return embedUrl.toString();
}

function isAllowedWebViewUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase();

    return (
      url.protocol === 'https:' &&
      (ALLOWED_WEBVIEW_HOSTS.has(hostname) || hostname.endsWith('.googlevideo.com'))
    );
  } catch {
    return false;
  }
}

type YoutubePlayerProps = {
  videoId: string;
};

export function YoutubePlayer({ videoId }: YoutubePlayerProps) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const embedUrl = buildYoutubeEmbedUrl(videoId);
  const allowNavigation = useCallback(
    (request: WebViewNavigation) => isAllowedWebViewUrl(request.url),
    [],
  );

  const retry = () => {
    setFailed(false);
    setLoading(true);
    setRetryCount((currentCount) => currentCount + 1);
  };

  if (!embedUrl || failed) {
    return (
      <View style={[styles.playerFrame, styles.centered]}>
        <Text style={styles.errorText}>Impossible de charger cette vidéo.</Text>
        {embedUrl ? (
          <Pressable
            accessibilityLabel="Réessayer de charger la vidéo"
            accessibilityRole="button"
            onPress={retry}
            style={styles.retryButton}>
            <Text style={styles.retryText}>Réessayer</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.playerFrame}>
      <WebView
        key={retryCount}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        javaScriptEnabled
        mediaPlaybackRequiresUserAction
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
        onHttpError={() => {
          setLoading(false);
          setFailed(true);
        }}
        onLoadEnd={() => setLoading(false)}
        onLoadStart={() => setLoading(true)}
        onShouldStartLoadWithRequest={allowNavigation}
        originWhitelist={['https://*']}
        source={{
          uri: embedUrl,
          headers: {
            Referer: `${PLAYER_ORIGIN}/`,
          },
        }}
        style={styles.webView}
      />
      {loading ? (
        <View pointerEvents="none" style={[styles.loadingOverlay, styles.centered]}>
          <ActivityIndicator color={theme.colors.yellow} size="large" />
          <Text style={styles.loadingText}>Chargement de la vidéo…</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  playerFrame: {
    width: '100%',
    minHeight: 200,
    aspectRatio: 16 / 9,
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.secondary,
  },
  webView: { flex: 1, backgroundColor: theme.colors.secondary },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    gap: 10,
    backgroundColor: theme.colors.secondary,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: theme.spacing.lg,
  },
  loadingText: { color: theme.colors.muted, fontSize: 12 },
  errorText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  retryText: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
});
