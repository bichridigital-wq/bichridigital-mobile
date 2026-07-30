import type {
  ScheduleEvent,
  ScheduleEventViewModel,
  ScheduleResponse,
} from '@/types/schedule';

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_UTC_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

function optionalString(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' ? value : undefined;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function adaptEvent(value: unknown): ScheduleEvent | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const id = typeof row.id === 'string' ? row.id.trim() : '';
  const title = typeof row.title === 'string' ? row.title.trim() : '';
  const scheduledStartTime =
    typeof row.scheduledStartTime === 'string' ? row.scheduledStartTime : '';
  const startTime = new Date(scheduledStartTime).getTime();
  const slug = optionalString(row.slug);
  const youtubeVideoId = optionalString(row.youtubeVideoId);
  const thumbnailUrl = optionalString(row.thumbnailUrl);

  if (
    !id ||
    !title ||
    !scheduledStartTime ||
    !ISO_UTC_PATTERN.test(scheduledStartTime) ||
    !Number.isFinite(startTime) ||
    row.status !== 'scheduled' ||
    slug === undefined ||
    (slug !== null && !SLUG_PATTERN.test(slug)) ||
    youtubeVideoId === undefined ||
    (youtubeVideoId !== null && !VIDEO_ID_PATTERN.test(youtubeVideoId)) ||
    thumbnailUrl === undefined ||
    (thumbnailUrl !== null && !isHttpUrl(thumbnailUrl))
  ) {
    return null;
  }

  const description = optionalString(row.description);
  const category = optionalString(row.category);
  const scheduledEndTime = optionalString(row.scheduledEndTime);
  const location = optionalString(row.location);
  if (
    description === undefined ||
    category === undefined ||
    scheduledEndTime === undefined ||
    location === undefined ||
    (scheduledEndTime !== null &&
      (!ISO_UTC_PATTERN.test(scheduledEndTime) ||
        !Number.isFinite(new Date(scheduledEndTime).getTime())))
  ) {
    return null;
  }

  return {
    id,
    title,
    slug,
    description,
    category,
    scheduledStartTime,
    scheduledEndTime,
    status: 'scheduled',
    youtubeVideoId,
    thumbnailUrl,
    location,
  };
}

export function parseScheduleResponse(value: unknown): ScheduleEvent[] {
  if (!value || typeof value !== 'object') {
    throw new Error("La réponse de l'agenda est invalide.");
  }
  const response = value as Record<string, unknown>;
  if (response.source !== 'schedule' || !Array.isArray(response.data)) {
    throw new Error("La réponse de l'agenda est invalide.");
  }

  const seenIds = new Set<string>();
  const events: ScheduleEvent[] = [];
  for (const item of response.data) {
    const event = adaptEvent(item);
    if (event && !seenIds.has(event.id)) {
      seenIds.add(event.id);
      events.push(event);
    }
  }
  return events;
}

export function toScheduleViewModel(
  event: ScheduleEvent,
  now = Date.now(),
): ScheduleEventViewModel {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug ?? null,
    description: event.description ?? null,
    category: event.category ?? null,
    scheduledStartTime: event.scheduledStartTime,
    scheduledEndTime: event.scheduledEndTime ?? null,
    youtubeVideoId: event.youtubeVideoId ?? null,
    thumbnailUrl: event.thumbnailUrl ?? null,
    location: event.location ?? null,
    hasStarted: new Date(event.scheduledStartTime).getTime() <= now,
  };
}

export function isScheduleResponse(
  value: unknown,
): value is ScheduleResponse {
  try {
    parseScheduleResponse(value);
    return true;
  } catch {
    return false;
  }
}
