import { emissions, type EmissionItem } from '@/constants/emissions-content';
import type { Replay } from '@/constants/replays-content';
import type { LiveBroadcast, Playlist, Video } from '@/types/youtube';
import {
  adaptLiveBroadcast,
  type LivePresentation,
} from '@/utils/live-broadcast-adapter';
import { adaptYoutubeVideo } from '@/utils/replay-video-adapter';

export type HomeShow = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  accent: string;
  thumbnailUrl?: string;
  playlistId?: string;
};

export type HomeShowsResult = {
  shows: HomeShow[];
  usedLocalFallback: boolean;
};

const PLAYLIST_ID_TO_EMISSION_SLUG: Record<string, string> = {
  PLWGfB5X4MACM: 'li-ci-biir-ndiagne',
  PLL5m13dgClMs: 'firi-gent',
};

const PLAYLIST_TITLE_TO_EMISSION_SLUG: Record<string, string> = {
  'li ci biir ndiagne': 'li-ci-biir-ndiagne',
  'fi gent': 'firi-gent',
};

function normalizeTitle(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function toHomeShow(emission: EmissionItem, playlist?: Playlist): HomeShow {
  return {
    id: emission.id,
    title: emission.title,
    description: emission.description,
    category: emission.category,
    status: emission.status,
    accent: emission.coverColor,
    thumbnailUrl: playlist?.thumbnailUrl.trim() || undefined,
    playlistId: playlist?.id,
  };
}

export function adaptHomeHero(video: Video): Replay {
  return adaptYoutubeVideo(video, true);
}

export function adaptHomeVideo(video: Video): Replay {
  return adaptYoutubeVideo(video, false);
}

export function adaptHomeLive(broadcast: LiveBroadcast): LivePresentation {
  return adaptLiveBroadcast(broadcast);
}

export function adaptHomeShows(playlists: Playlist[]): HomeShowsResult {
  const emissionsBySlug = new Map(emissions.map((emission) => [emission.slug, emission]));
  const matchedEmissionIds = new Set<string>();
  const matchedShows: HomeShow[] = [];

  for (const playlist of playlists) {
    const slug =
      PLAYLIST_ID_TO_EMISSION_SLUG[playlist.id] ??
      PLAYLIST_TITLE_TO_EMISSION_SLUG[normalizeTitle(playlist.title)];
    const emission = slug ? emissionsBySlug.get(slug) : undefined;

    if (!emission || matchedEmissionIds.has(emission.id)) {
      continue;
    }

    matchedEmissionIds.add(emission.id);
    matchedShows.push(toHomeShow(emission, playlist));

    if (matchedShows.length === 5) {
      break;
    }
  }

  if (matchedShows.length > 0) {
    return {
      shows: matchedShows,
      usedLocalFallback: false,
    };
  }

  return {
    shows: emissions.slice(0, 5).map((emission) => toHomeShow(emission)),
    usedLocalFallback: true,
  };
}
