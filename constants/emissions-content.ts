import { getEmissionPlaylistBySlug } from '@/constants/emission-playlists';

export type EmissionCategory =
  | 'Toutes'
  | 'Actualité'
  | 'Religion'
  | 'Culture'
  | 'Magazine'
  | 'Santé'
  | 'Sport'
  | 'Histoire';

export type EmissionItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: Exclude<EmissionCategory, 'Toutes'>;
  day: string;
  time: string;
  coverColor: string;
  status: string;
  playlistId?: string;
  thumbnailUrl?: string;
};

export const categories: EmissionCategory[] = [
  'Toutes',
  'Actualité',
  'Religion',
  'Culture',
  'Magazine',
  'Santé',
  'Sport',
  'Histoire',
];

function getPlaylistFields(slug: string): Pick<
  EmissionItem,
  'playlistId' | 'thumbnailUrl'
> {
  const playlist = getEmissionPlaylistBySlug(slug);
  return playlist
    ? {
        playlistId: playlist.playlistId,
        thumbnailUrl: playlist.thumbnailUrl,
      }
    : {};
}

export const emissions: EmissionItem[] = [
  {
    id: 'emission-1',
    slug: 'li-ci-biir-ndiagne',
    title: 'Li Ci Biir Ndiagne',
    description: 'Une rencontre culturelle autour des voix et des récits du moment.',
    category: 'Magazine',
    day: 'Lundi',
    time: '20:30',
    coverColor: '#0024FF',
    status: 'En direct',
    ...getPlaylistFields('li-ci-biir-ndiagne'),
  },
  {
    id: 'emission-2',
    slug: 'jotaayu-bichri',
    title: 'Jotaayu Bichri',
    description: 'Un espace de débat et d’actualité avec une approche engagée.',
    category: 'Religion',
    day: 'Mardi',
    time: '19:00',
    coverColor: '#FCCD12',
    status: 'À suivre',
  },
  {
    id: 'emission-3',
    slug: 'talaatay-cheikh-ibra',
    title: 'Talaatay Cheikh Ibra',
    description: 'Un programme de réflexion religieuse et spirituelle.',
    category: 'Religion',
    day: 'Mercredi',
    time: '18:45',
    coverColor: '#0024FF',
    status: 'Programmé',
  },
  {
    id: 'emission-4',
    slug: 'firi-gent',
    title: 'Firi Gent',
    description: 'Un magazine vivant centré sur le patrimoine et les tendances.',
    category: 'Religion',
    day: 'Jeudi',
    time: '21:00',
    coverColor: '#0024FF',
    status: 'Nouveau',
    ...getPlaylistFields('firi-gent'),
  },
  {
    id: 'emission-5',
    slug: 'apres-ndogou',
    title: 'Après Ndogou',
    description: 'Le grand rendez-vous de l’actualité et des histoires marquantes.',
    category: 'Religion',
    day: 'Vendredi',
    time: '22:00',
    coverColor: '#FCCD12',
    status: 'En replay',
  },
  {
    id: 'emission-6',
    slug: 'xamxamu-cosaan',
    title: 'Xamxamu Cosaan',
    description: 'Un format culturel qui met en avant les talents et les récits.',
    category: 'Culture',
    day: 'Samedi',
    time: '17:30',
    coverColor: '#0024FF',
    status: 'À venir',
  },
  {
    id: 'emission-7',
    slug: 'seen-wergu-yaram',
    title: 'Seen Wergu-yaram',
    description: 'Le programme santé de référence pour suivre l’actualité du terrain.',
    category: 'Santé',
    day: 'Dimanche',
    time: '15:00',
    coverColor: '#FCCD12',
    status: 'En direct',
  },
  {
    id: 'emission-8',
    slug: 'ettu-sport',
    title: 'Ëttu Sport',
    description: 'Des analyses et des portraits autour du sport local.',
    category: 'Sport',
    day: 'Lundi',
    time: '13:00',
    coverColor: '#0024FF',
    status: 'Programmé',
  },
  {
    id: 'emission-9',
    slug: 'ettu-jigeen-ni',
    title: 'Ëttu Jigeen Ñi',
    description: 'Un espace dédié aux femmes, à leurs parcours et à leurs succès.',
    category: 'Magazine',
    day: 'Mardi',
    time: '16:00',
    coverColor: '#FCCD12',
    status: 'À venir',
  },
  {
    id: 'emission-10',
    slug: 'demb-ak-tay',
    title: 'Demb ak Tay',
    description: 'Un magazine pour les histoires audacieuses et les rencontres marquantes.',
    category: 'Culture',
    day: 'Mercredi',
    time: '22:30',
    coverColor: '#0024FF',
    status: 'En replay',
  },
  {
    id: 'emission-11',
    slug: 'entretien-special',
    title: 'Entretien Spécial',
    description: 'Des échanges approfondis avec des personnalités inspirantes.',
    category: 'Actualité',
    day: 'Jeudi',
    time: '19:30',
    coverColor: '#FCCD12',
    status: 'Nouveau',
  },
  {
    id: 'emission-12',
    slug: 'xam-ndiagne-jotna',
    title: 'Xam Ndiagne Jotna',
    description: 'Émission consacrée à l’histoire, à la mémoire et au patrimoine de Ndiagne.',
    category: 'Histoire',
    day: 'Bientôt',
    time: 'À préciser',
    coverColor: '#FCCD12',
    status: 'Bientôt disponible',
  },
];

export const featuredEmission: EmissionItem = emissions[0];

export function getEmissionBySlug(
  slug: string | undefined,
): EmissionItem | undefined {
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return undefined;
  }

  return emissions.find((emission) => emission.slug === slug);
}
