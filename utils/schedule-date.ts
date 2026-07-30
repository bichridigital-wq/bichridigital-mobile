const DAKAR_TIME_ZONE = 'Africa/Dakar';

function format(
  value: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(value);
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      ...options,
      timeZone: DAKAR_TIME_ZONE,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('fr-FR', {
      ...options,
      timeZone: 'UTC',
    }).format(date);
  }
}

export function formatDakarDate(value: string): string {
  return format(value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatDakarShortDate(value: string): string {
  return format(value, { day: '2-digit', month: 'short' });
}

export function formatDakarTime(value: string): string {
  return format(value, { hour: '2-digit', minute: '2-digit', hour12: false })
    .replace(':', 'h');
}

export function hasScheduleStarted(value: string, now = Date.now()): boolean {
  return new Date(value).getTime() <= now;
}

export function getMillisecondsUntilStart(
  value: string,
  now = Date.now(),
): number {
  return Math.max(0, new Date(value).getTime() - now);
}
