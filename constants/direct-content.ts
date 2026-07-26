export type LiveState = 'live' | 'scheduled' | 'empty';

export type DirectProgram = {
  id: string;
  title: string;
  description: string;
  emission: string;
  date: string;
  time: string;
  location: string;
  accent: string;
  timeLabel: string;
};

export type ReplayItem = {
  id: string;
  title: string;
  emission: string;
  duration: string;
  relativeDate: string;
  accent: string;
};

export const directState: LiveState = 'live';

export const currentLive: DirectProgram = {
  id: 'live-1',
  title: 'Jotaayu Bichri',
  description: 'Un moment d’échange, d’analyse et de présence avec des invités qui font la voix du terrain.',
  emission: 'Jotaayu Bichri',
  date: 'Aujourd’hui',
  time: '19:30',
  location: 'Studio Iba Asta Niang',
  accent: '#0024FF',
  timeLabel: 'Depuis 19:30',
};

export const nextLive: DirectProgram = {
  id: 'live-2',
  title: 'Talaatay Cheikh Ibra',
  description: 'Une émission spéciale pensée pour les grandes conversations de la semaine.',
  emission: 'Talaatay Cheikh Ibra',
  date: 'Demain',
  time: '20:00',
  location: 'Studio Dakar',
  accent: '#FCCD12',
  timeLabel: 'À 20:00',
};

export const replays: ReplayItem[] = [
  {
    id: 'replay-1',
    title: 'Après Ndogou',
    emission: 'Après Ndogou',
    duration: '24:12',
    relativeDate: 'Il y a 2 h',
    accent: '#0024FF',
  },
  {
    id: 'replay-2',
    title: 'Le mot du jour',
    emission: 'Jotaayu Bichri',
    duration: '17:55',
    relativeDate: 'Hier',
    accent: '#FCCD12',
  },
  {
    id: 'replay-3',
    title: 'Focus culture',
    emission: 'Talaatay Cheikh Ibra',
    duration: '12:40',
    relativeDate: 'Il y a 3 jours',
    accent: '#0024FF',
  },
];
