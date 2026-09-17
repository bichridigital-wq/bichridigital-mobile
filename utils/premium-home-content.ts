import type { EmissionItem } from '@/constants/emissions-content';
import { getEmissionSlugForPlaylist } from '@/constants/emission-playlists';
import type { ScheduleEvent } from '@/types/schedule';
import type { LiveBroadcast, Video } from '@/types/youtube';
import { formatPublishedAt, formatYoutubeDuration } from '@/utils/replay-video-adapter';

type Program = EmissionItem & { programId?: string | null };
export type HomeDestination =
  | { kind: 'emission'; slug: string }
  | { kind: 'video'; videoId: string; title: string; channelTitle: string; thumbnailUrl: string; publishedAt?: string; duration?: string }
  | { kind: 'direct' };

export type HomeEditorialItem = {
  id: string;
  title: string;
  category: string;
  slug?: string;
  thumbnailUrl?: string;
  status?: 'live' | 'upcoming';
  date?: string;
  duration?: string;
  destination: HomeDestination;
};

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const validVideoId = (id: string) => /^[a-zA-Z0-9_-]{11}$/.test(id);

function matchProgram(title: string, programs: Program[], playlistId?: string) {
  const slug = playlistId ? getEmissionSlugForPlaylist({ id: playlistId }) : undefined;
  const text = normalize(title);
  return programs.find((program) => program.slug === slug)
    ?? programs.find((program) => text.includes(normalize(program.title)));
}

export function programEditorial(program: Program): HomeEditorialItem {
  return {
    id: `program-${program.slug}`, title: program.title, category: program.category,
    slug: program.slug, destination: { kind: 'emission', slug: program.slug },
    // The local catalogue's static status/day/time are deliberately not live evidence.
  };
}

export function realReplayVideos(videos: Video[] | null, now = Date.now()): Video[] {
  const ids = new Set<string>();
  return (videos ?? []).filter((video) => {
    if (!validVideoId(video.id) || video.isLive || !video.title.trim() || ids.has(video.id)) return false;
    const published = Date.parse(video.publishedAt);
    if (Number.isFinite(published) && published > now) return false;
    ids.add(video.id);
    return true;
  });
}

export function videoEditorial(video: Video, programs: Program[], now = Date.now()): HomeEditorialItem {
  const program = matchProgram(video.title, programs, video.playlistId);
  const date = Number.isFinite(Date.parse(video.publishedAt)) && Date.parse(video.publishedAt) <= now
    ? formatPublishedAt(video.publishedAt, new Date(now)) : undefined;
  const duration = /^PT(?=\d)(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.test(video.duration) && /[1-9]/.test(video.duration)
    ? formatYoutubeDuration(video.duration) : undefined;
  return {
    id: video.id, title: video.title, category: program?.category ?? 'Vidéo', slug: program?.slug,
    thumbnailUrl: video.thumbnailUrl, date, duration,
    destination: { kind: 'video', videoId: video.id, title: video.title, channelTitle: program?.title ?? video.channelTitle,
      thumbnailUrl: video.thumbnailUrl, publishedAt: date, duration },
  };
}

export function buildHomeHeroes({ programs, live, schedule, featured, now = Date.now() }: {
  programs: Program[]; live: LiveBroadcast | null; schedule: ScheduleEvent[]; featured: Video[] | null; now?: number;
}): HomeEditorialItem[] {
  const result: HomeEditorialItem[] = [];
  const broadcastIsPlayable = live && validVideoId(live.id);
  const broadcastProgram = live ? matchProgram(live.title, programs) : undefined;
  const broadcastItem = (broadcast: LiveBroadcast): HomeEditorialItem => ({
    id: broadcast.id, title: broadcast.title, category: broadcastProgram?.category ?? 'Bichridigital',
    slug: broadcastProgram?.slug, thumbnailUrl: broadcast.thumbnailUrl,
    status: broadcast.status === 'live' ? 'live' : 'upcoming',
    destination: { kind: 'video', videoId: broadcast.id, title: broadcast.title, channelTitle: 'Bichridigital', thumbnailUrl: broadcast.thumbnailUrl },
  });
  if (broadcastIsPlayable && live.status === 'live') result.push(broadcastItem(live));

  const upcoming = schedule.filter((event) => event.status === 'scheduled' && Date.parse(event.scheduledStartTime) > now)
    .sort((a, b) => Date.parse(a.scheduledStartTime) - Date.parse(b.scheduledStartTime))[0];
  const broadcastTime = live?.scheduledStartTime ? Date.parse(live.scheduledStartTime) : NaN;
  if (broadcastIsPlayable && live.status === 'upcoming' && broadcastTime > now &&
      (!upcoming || broadcastTime <= Date.parse(upcoming.scheduledStartTime))) {
    result.push({ ...broadcastItem(live), date: formatScheduleTime(live.scheduledStartTime!) });
  } else if (upcoming) {
    const program = programs.find((item) => (upcoming.programId && item.programId === upcoming.programId) || item.slug === upcoming.slug)
      ?? matchProgram(upcoming.title, programs);
    result.push({
      id: `schedule-${upcoming.id}`, title: upcoming.title, category: program?.category ?? upcoming.category ?? 'Programme',
      slug: program?.slug, thumbnailUrl: upcoming.thumbnailUrl ?? undefined, status: 'upcoming', date: formatScheduleTime(upcoming.scheduledStartTime),
      destination: program ? { kind: 'emission', slug: program.slug } : { kind: 'direct' },
    });
  }
  for (const video of realReplayVideos(featured, now).slice(0, 2)) {
    if (!result.some((item) => item.id === video.id)) result.push(videoEditorial(video, programs, now));
  }
  if (!result.length) {
    const fallback = programs.find((program) => program.slug === 'li-ci-biir-ndiagne');
    if (fallback) result.push(programEditorial(fallback));
  }
  return result;
}

function formatScheduleTime(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
