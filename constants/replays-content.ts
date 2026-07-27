export const replayCategories = [
  'Toutes',
  'Actualité',
  'Religion',
  'Culture',
  'Magazine',
  'Santé',
  'Sport',
  'Histoire',
] as const;

export type ReplayCategory = Exclude<(typeof replayCategories)[number], 'Toutes'>;

export type Replay = {
  id: string;
  title: string;
  showTitle: string;
  category: ReplayCategory;
  duration: string;
  publishedAt: string;
  thumbnailUrl?: string;
  coverColor: string;
  featured: boolean;
  status: 'Disponible' | 'En direct';
};

export const replays: Replay[] = [
  {
    id: 'replay-apres-ndogou-001',
    title: 'Les temps forts de la soirée',
    showTitle: 'Après Ndogou',
    category: 'Religion',
    duration: '42:18',
    publishedAt: 'Il y a 2 h',
    coverColor: '#0024FF',
    featured: true,
    status: 'Disponible',
  },
  {
    id: 'replay-jotaayu-bichri-001',
    title: 'Foi, société et transmission',
    showTitle: 'Jotaayu Bichri',
    category: 'Religion',
    duration: '38:42',
    publishedAt: 'Il y a 5 h',
    coverColor: '#FCCD12',
    featured: false,
    status: 'Disponible',
  },
  {
    id: 'replay-talaatay-cheikh-ibra-001',
    title: 'Comprendre les enseignements essentiels',
    showTitle: 'Talaatay Cheikh Ibra',
    category: 'Religion',
    duration: '51:06',
    publishedAt: 'Hier',
    coverColor: '#7B61FF',
    featured: false,
    status: 'Disponible',
  },
  {
    id: 'replay-firi-gent-001',
    title: 'Décryptage des faits qui marquent la semaine',
    showTitle: 'Firi Gent',
    category: 'Religion',
    duration: '29:14',
    publishedAt: 'Hier',
    coverColor: '#00A3FF',
    featured: false,
    status: 'Disponible',
  },
  {
    id: 'replay-li-ci-biir-ndiagne-001',
    title: 'Regards croisés sur notre quotidien',
    showTitle: 'Li Ci Biir Ndiagne',
    category: 'Magazine',
    duration: '35:27',
    publishedAt: 'Il y a 2 j',
    coverColor: '#FF6B35',
    featured: false,
    status: 'Disponible',
  },
  {
    id: 'replay-xamxamu-cosaan-001',
    title: 'Les récits qui façonnent notre héritage',
    showTitle: 'Xamxamu Cosaan',
    category: 'Culture',
    duration: '44:09',
    publishedAt: 'Il y a 3 j',
    coverColor: '#C47A2C',
    featured: false,
    status: 'Disponible',
  },
  {
    id: 'replay-seen-wergu-yaram-001',
    title: 'Prévention et habitudes pour mieux vivre',
    showTitle: 'Seen Wergu-yaram',
    category: 'Santé',
    duration: '26:31',
    publishedAt: 'Il y a 4 j',
    coverColor: '#19B88A',
    featured: false,
    status: 'Disponible',
  },
  {
    id: 'replay-ettu-sport-001',
    title: 'Le débrief complet de la journée',
    showTitle: 'Ëttu Sport',
    category: 'Sport',
    duration: '48:55',
    publishedAt: 'Il y a 5 j',
    coverColor: '#E53935',
    featured: false,
    status: 'Disponible',
  },
  {
    id: 'replay-ettu-jigeen-ni-001',
    title: 'Paroles de femmes, parcours et ambitions',
    showTitle: 'Ëttu Jigeen Ñi',
    category: 'Magazine',
    duration: '39:20',
    publishedAt: 'Il y a 6 j',
    coverColor: '#D94F9D',
    featured: false,
    status: 'Disponible',
  },
  {
    id: 'replay-demb-ak-tay-001',
    title: 'Mémoire collective et enjeux contemporains',
    showTitle: 'Demb ak Tay',
    category: 'Culture',
    duration: '46:12',
    publishedAt: 'Il y a 1 sem.',
    coverColor: '#8D6E63',
    featured: false,
    status: 'Disponible',
  },
  {
    id: 'replay-entretien-special-001',
    title: 'Une conversation sans détour',
    showTitle: 'Entretien Spécial',
    category: 'Actualité',
    duration: '32:47',
    publishedAt: 'Il y a 1 sem.',
    coverColor: '#536DFE',
    featured: false,
    status: 'Disponible',
  },
];
