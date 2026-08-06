export type SafeNotificationDestination =
  | { pathname: '/(tabs)/profil' }
  | { pathname: '/(tabs)/direct' }
  | { pathname: '/emission/[slug]'; params: { slug: string } }
  | { pathname: '/video/[videoId]'; params: { videoId: string } };

const EMISSION_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function getSafeNotificationDestination(
  data: Record<string, unknown>,
): SafeNotificationDestination | null {
  if (data.type === 'test' && data.route === '/(tabs)/profil') {
    return { pathname: '/(tabs)/profil' };
  }
  if (data.type === 'profile') return { pathname: '/(tabs)/profil' };
  if (data.type === 'live') return { pathname: '/(tabs)/direct' };
  if (
    data.type === 'emission' &&
    typeof data.emissionSlug === 'string' &&
    EMISSION_SLUG_PATTERN.test(data.emissionSlug)
  ) {
    return { pathname: '/emission/[slug]', params: { slug: data.emissionSlug } };
  }
  if (
    data.type === 'video' &&
    typeof data.videoId === 'string' &&
    YOUTUBE_VIDEO_ID_PATTERN.test(data.videoId)
  ) {
    return { pathname: '/video/[videoId]', params: { videoId: data.videoId } };
  }
  return null;
}
