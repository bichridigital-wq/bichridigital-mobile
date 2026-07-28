import type { LiveBroadcast } from '@/types/youtube';

export type LivePresentation = {
  videoId: string;
  title: string;
  description: string;
  status: 'live' | 'upcoming' | 'offline';
  scheduledStartTime: string;
  actualStartTime?: string;
  dateLabel: string;
  relativeLabel: string;
  thumbnailUrl: string;
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

function parseDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getCalendarDayDifference(date: Date, now: Date): number {
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((dateDay - nowDay) / (24 * 60 * 60 * 1000));
}

function formatUpcomingRelative(date: Date | null, now: Date): string {
  if (!date) {
    return 'Horaire à confirmer';
  }

  const time = timeFormatter.format(date);
  const dayDifference = getCalendarDayDifference(date, now);

  if (dayDifference === 0) {
    return `Aujourd’hui à ${time}`;
  }

  if (dayDifference === 1) {
    return `Demain à ${time}`;
  }

  if (dayDifference > 1 && dayDifference < 7) {
    return `Dans ${dayDifference} jours`;
  }

  return dateFormatter.format(date);
}

function formatLiveRelative(date: Date | null, now: Date): string {
  if (!date) {
    return 'En cours';
  }

  const time = timeFormatter.format(date);
  const dayDifference = getCalendarDayDifference(date, now);

  if (dayDifference === 0) {
    return `Depuis ${time}`;
  }

  if (dayDifference === -1) {
    return `Depuis hier à ${time}`;
  }

  return `Depuis le ${dateFormatter.format(date)}`;
}

export function adaptLiveBroadcast(
  broadcast: LiveBroadcast,
  now = new Date(),
): LivePresentation {
  const scheduledDate = parseDate(broadcast.scheduledStartTime);
  const actualDate = parseDate(broadcast.actualStartTime);
  const status = broadcast.status === 'completed' ? 'offline' : broadcast.status;
  const referenceDate = status === 'live' ? actualDate ?? scheduledDate : scheduledDate;

  return {
    videoId: broadcast.id,
    title: broadcast.title.trim() || 'Direct Bichridigital',
    description:
      broadcast.description.trim() ||
      'Suivez le direct de Bichridigital.',
    status,
    scheduledStartTime: broadcast.scheduledStartTime,
    actualStartTime: broadcast.actualStartTime,
    dateLabel: referenceDate
      ? dateFormatter.format(referenceDate)
      : 'Date à confirmer',
    relativeLabel:
      status === 'live'
        ? formatLiveRelative(referenceDate, now)
        : status === 'upcoming'
          ? formatUpcomingRelative(referenceDate, now)
          : 'Direct terminé',
    thumbnailUrl: broadcast.thumbnailUrl.trim(),
  };
}
