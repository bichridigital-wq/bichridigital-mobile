export type MockProgram = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  timeLabel: string;
  dateLabel: string;
  accent: string;
  imageTone: string;
};

export type MockVideo = {
  id: string;
  title: string;
  program: string;
  duration: string;
  relativeTime: string;
  accent: string;
};

export const featuredHero = {
  category: 'Émission à suivre',
  title: 'Li Ci Biir Ndiagne',
  description:
    'Une émission immersive où l’actualité, les opinions et les talents se croisent avec une énergie forte et moderne.',
  ctaPrimary: 'Regarder',
  ctaSecondary: 'Découvrir',
  accent: '#0024FF',
};

export const liveProgram = {
  id: 'live-1',
  title: 'Jotaayu Bichri',
  subtitle: 'Direct en cours',
  timeLabel: '19:30 • En direct',
  accent: '#FCCD12',
};

export const upcomingPrograms: MockProgram[] = [
  {
    id: 'upcoming-1',
    title: 'Talaatay Cheikh Ibra',
    subtitle: 'Émission spéciale',
    category: 'À venir',
    description: 'Une conversation riche, moderne et marquée par une forte identité culturelle.',
    timeLabel: '20:00',
    dateLabel: 'Demain',
    accent: '#0024FF',
    imageTone: '#0A163F',
  },
  {
    id: 'upcoming-2',
    title: 'Firi Gent',
    subtitle: 'Programme du soir',
    category: 'À venir',
    description: 'Un espace de débat et d’analyse pensé pour une audience très connectée.',
    timeLabel: '21:00',
    dateLabel: 'Jeudi',
    accent: '#FCCD12',
    imageTone: '#101D4E',
  },
  {
    id: 'upcoming-3',
    title: 'Ëttu Sport',
    subtitle: 'Actualités sportives',
    category: 'À venir',
    description: 'Le sport, le rythme et les faits marquants de la semaine.',
    timeLabel: '22:15',
    dateLabel: 'Vendredi',
    accent: '#0024FF',
    imageTone: '#0E1A3F',
  },
];

export const recentVideos: MockVideo[] = [
  {
    id: 'video-1',
    title: 'Après Ndogou : l’interview du moment',
    program: 'Après Ndogou',
    duration: '24:12',
    relativeTime: 'Il y a 2 h',
    accent: '#0024FF',
  },
  {
    id: 'video-2',
    title: 'Jotaayu Bichri : les meilleurs moments',
    program: 'Jotaayu Bichri',
    duration: '18:40',
    relativeTime: 'Il y a 5 h',
    accent: '#FCCD12',
  },
  {
    id: 'video-3',
    title: 'Talaatay Cheikh Ibra : l’émission complète',
    program: 'Talaatay Cheikh Ibra',
    duration: '31:05',
    relativeTime: 'Hier',
    accent: '#0024FF',
  },
];

export const popularShows: MockProgram[] = [
  {
    id: 'show-1',
    title: 'Li Ci Biir Ndiagne',
    subtitle: 'Émission phare',
    category: 'Programme',
    description: 'Un rendez-vous incontournable pour l’actualité et les débats.',
    timeLabel: 'Chaque soir',
    dateLabel: 'Populaire',
    accent: '#0024FF',
    imageTone: '#0C1841',
  },
  {
    id: 'show-2',
    title: 'Firi Gent',
    subtitle: 'Analyse et culture',
    category: 'Programme',
    description: 'Des conversations fortes, humaines et engagées.',
    timeLabel: 'Chaque jeudi',
    dateLabel: 'Populaire',
    accent: '#FCCD12',
    imageTone: '#111C4A',
  },
  {
    id: 'show-3',
    title: 'Ëttu Sport',
    subtitle: 'Sport et émotions',
    category: 'Programme',
    description: 'Des temps forts sportifs et des analyses de qualité.',
    timeLabel: 'Chaque vendredi',
    dateLabel: 'Populaire',
    accent: '#0024FF',
    imageTone: '#0D163E',
  },
];
