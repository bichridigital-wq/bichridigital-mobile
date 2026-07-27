import type { LiveBroadcast, Playlist, Video } from '@/types/youtube';

const mockPlaylists: Playlist[] = [
  {
    id: 'mock-playlist-religion-001',
    title: 'Religion',
    description: 'Sélection locale simulée autour des émissions religieuses.',
    thumbnailUrl: '',
    itemCount: 2,
  },
  {
    id: 'mock-playlist-magazine-001',
    title: 'Magazine',
    description: 'Sélection locale simulée des magazines Bichridigital.',
    thumbnailUrl: '',
    itemCount: 2,
  },
  {
    id: 'mock-playlist-culture-001',
    title: 'Culture',
    description: 'Sélection locale simulée consacrée à la culture.',
    thumbnailUrl: '',
    itemCount: 1,
  },
];

const mockVideos: Video[] = [
  {
    id: 'mock-video-featured-001',
    title: 'Les temps forts de la semaine',
    description: 'Vidéo vedette simulée pour préparer la future intégration YouTube.',
    thumbnailUrl: '',
    publishedAt: '2026-07-26T18:00:00.000Z',
    duration: 'PT42M18S',
    channelTitle: 'Bichridigital',
    playlistId: 'mock-playlist-magazine-001',
    isLive: false,
  },
  {
    id: 'mock-video-featured-002',
    title: 'Foi, société et transmission',
    description: 'Épisode simulé de Jotaayu Bichri.',
    thumbnailUrl: '',
    publishedAt: '2026-07-25T19:00:00.000Z',
    duration: 'PT38M42S',
    channelTitle: 'Bichridigital',
    playlistId: 'mock-playlist-religion-001',
    isLive: false,
  },
  {
    id: 'mock-video-latest-001',
    title: 'Comprendre les enseignements essentiels',
    description: 'Épisode simulé de Talaatay Cheikh Ibra.',
    thumbnailUrl: '',
    publishedAt: '2026-07-24T19:00:00.000Z',
    duration: 'PT51M6S',
    channelTitle: 'Bichridigital',
    playlistId: 'mock-playlist-religion-001',
    isLive: false,
  },
  {
    id: 'mock-video-latest-002',
    title: 'Regards croisés sur notre quotidien',
    description: 'Épisode simulé de Li Ci Biir Ndiagne.',
    thumbnailUrl: '',
    publishedAt: '2026-07-23T17:30:00.000Z',
    duration: 'PT35M27S',
    channelTitle: 'Bichridigital',
    playlistId: 'mock-playlist-magazine-001',
    isLive: false,
  },
  {
    id: 'mock-video-latest-003',
    title: 'Les récits qui façonnent notre héritage',
    description: 'Épisode simulé de Xamxamu Cosaan.',
    thumbnailUrl: '',
    publishedAt: '2026-07-22T18:15:00.000Z',
    duration: 'PT44M9S',
    channelTitle: 'Bichridigital',
    playlistId: 'mock-playlist-culture-001',
    isLive: false,
  },
];

const mockLiveBroadcast: LiveBroadcast = {
  id: 'mock-live-upcoming-001',
  title: 'Prochain direct Bichridigital',
  description: 'Diffusion simulée pour préparer le futur état du direct.',
  thumbnailUrl: '',
  scheduledStartTime: '2026-07-30T20:00:00.000Z',
  status: 'upcoming',
};

export function getFeaturedVideos(): Promise<Video[]> {
  return Promise.resolve(mockVideos.slice(0, 2));
}

export function getLatestVideos(): Promise<Video[]> {
  return Promise.resolve([...mockVideos]);
}

export function getPlaylists(): Promise<Playlist[]> {
  return Promise.resolve([...mockPlaylists]);
}

export function getLiveBroadcast(): Promise<LiveBroadcast | null> {
  return Promise.resolve(mockLiveBroadcast);
}

export function getPlaylistVideos(playlistId: string): Promise<Video[]> {
  return Promise.resolve(mockVideos.filter((video) => video.playlistId === playlistId));
}
