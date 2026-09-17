import { router } from 'expo-router';

import type { HomeDestination } from '@/utils/premium-home-content';

export function openHomeDestination(destination: HomeDestination) {
  if (destination.kind === 'emission') {
    router.push({ pathname: '/emission/[slug]', params: { slug: destination.slug } });
  } else if (destination.kind === 'video') {
    const { kind: _kind, ...params } = destination;
    router.push({ pathname: '/video/[videoId]', params });
  } else {
    router.push('/(tabs)/direct');
  }
}
