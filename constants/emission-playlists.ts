import type { Playlist } from '@/types/youtube';

export type EmissionPlaylist = {
  slug: string;
  playlistId: string;
  verified: true;
};

// Source unique des correspondances officielles playlist → émission.
// Toute prochaine correspondance vérifiée doit être ajoutée ici uniquement :
// { slug: 'entretien-special', playlistId: '...', verified: true }
export const emissionPlaylists: readonly EmissionPlaylist[] = [
  {
    slug: 'li-ci-biir-ndiagne',
    playlistId: 'PLWGfB5X4MACM',
    verified: true,
  },
  {
    slug: 'firi-gent',
    playlistId: 'PLL5m13dgClMs',
    verified: true,
  },
  {
    slug: 'gattandu-magal',
    playlistId: 'PLESg8ekHPxRg',
    verified: true,
  },
  {
    slug: 'talaatay-cheikh-ibra',
    playlistId: 'PLNDBRIisSGq4',
    verified: true,
  },
  {
    slug: 'jotaayu-bichri',
    playlistId: 'PLI_MqicDqh-w',
    verified: true,
  },
  {
    slug: 'apres-ndogou',
    playlistId: 'PLbXgo335NOTg',
    verified: true,
  },
  {
    slug: 'entretien-special',
    playlistId: 'PLROASFusaa6s',
    verified: true,
  },
];

export function getPlaylistIdForEmission(slug: string): string | null {
  return (
    emissionPlaylists.find(
      (item) => item.verified && item.slug === slug,
    )?.playlistId ?? null
  );
}

export function getEmissionSlugForPlaylist(
  playlist: Pick<Playlist, 'id'>,
): string | undefined {
  return emissionPlaylists.find(
    (item) => item.verified && item.playlistId === playlist.id,
  )?.slug;
}
