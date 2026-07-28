import type { Playlist } from '@/types/youtube';

export type EmissionPlaylist = {
  slug: string;
  playlistId: string;
  thumbnailUrl: string;
};

export const emissionPlaylists: readonly EmissionPlaylist[] = [
  {
    slug: 'li-ci-biir-ndiagne',
    playlistId: 'PLWGfB5X4MACM',
    thumbnailUrl: 'https://i.ytimg.com/vi/UBs2aOrBlyc/maxresdefault.jpg',
  },
  {
    slug: 'firi-gent',
    playlistId: 'PLL5m13dgClMs',
    thumbnailUrl: 'https://i.ytimg.com/vi/mjaj0wEzQMQ/maxresdefault.jpg',
  },
];

export function getEmissionPlaylistBySlug(
  slug: string,
): EmissionPlaylist | undefined {
  return emissionPlaylists.find((item) => item.slug === slug);
}

export function getEmissionSlugForPlaylist(
  playlist: Pick<Playlist, 'id'>,
): string | undefined {
  return emissionPlaylists.find((item) => item.playlistId === playlist.id)?.slug;
}
