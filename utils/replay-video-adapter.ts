import type { Replay, ReplayCategory } from '@/constants/replays-content';
import type { Video } from '@/types/youtube';

type PlaylistMetadata = {
  showTitle: string;
  category: ReplayCategory;
  coverColor: string;
};

const defaultMetadata: PlaylistMetadata = {
  showTitle: '',
  category: 'Actualité',
  coverColor: '#0024FF',
};

const playlistMetadata: Record<string, PlaylistMetadata> = {
  'mock-playlist-religion-001': {
    showTitle: 'Jotaayu Bichri',
    category: 'Religion',
    coverColor: '#FCCD12',
  },
  'mock-playlist-magazine-001': {
    showTitle: 'Après Ndogou',
    category: 'Magazine',
    coverColor: '#0024FF',
  },
  'mock-playlist-culture-001': {
    showTitle: 'Xamxamu Cosaan',
    category: 'Culture',
    coverColor: '#C47A2C',
  },
};

export function formatYoutubeDuration(duration: string): string {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);

  if (!match) {
    return 'Durée indisponible';
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  if (hours > 0) {
    return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  }

  if (minutes > 0) {
    return `${minutes} min`;
  }

  return `${seconds} s`;
}

export function formatPublishedAt(publishedAt: string, now = new Date()): string {
  const publishedDate = new Date(publishedAt);

  if (Number.isNaN(publishedDate.getTime())) {
    return 'Date inconnue';
  }

  const elapsedMilliseconds = Math.max(0, now.getTime() - publishedDate.getTime());
  const elapsedHours = Math.floor(elapsedMilliseconds / (60 * 60 * 1000));
  const elapsedDays = Math.floor(elapsedMilliseconds / (24 * 60 * 60 * 1000));

  if (elapsedHours < 1) {
    return "Aujourd'hui";
  }

  if (elapsedHours < 24) {
    return `Il y a ${elapsedHours} h`;
  }

  if (elapsedDays === 1) {
    return 'Hier';
  }

  if (elapsedDays < 7) {
    return `Il y a ${elapsedDays} jours`;
  }

  const elapsedWeeks = Math.floor(elapsedDays / 7);
  return elapsedWeeks === 1
    ? 'Il y a 1 semaine'
    : `Il y a ${elapsedWeeks} semaines`;
}

export function getPlaylistMetadata(playlistId?: string): PlaylistMetadata {
  return playlistId ? playlistMetadata[playlistId] ?? defaultMetadata : defaultMetadata;
}

export function adaptYoutubeVideo(video: Video, featured: boolean): Replay {
  const metadata = getPlaylistMetadata(video.playlistId);

  return {
    id: video.id,
    title: video.title,
    showTitle: metadata.showTitle || video.channelTitle.trim() || 'Bichridigital',
    category: metadata.category,
    duration: formatYoutubeDuration(video.duration),
    publishedAt: formatPublishedAt(video.publishedAt),
    thumbnailUrl: video.thumbnailUrl.trim(),
    coverColor: metadata.coverColor,
    featured,
    status: video.isLive ? 'En direct' : 'Disponible',
  };
}
