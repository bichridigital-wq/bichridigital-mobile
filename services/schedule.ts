import { apiGet } from '@/services/api-client';
import type { ScheduleEvent } from '@/types/schedule';
import { parseScheduleResponse } from '@/utils/schedule-adapter';

export type GetUpcomingScheduleOptions = {
  timeoutMs?: number;
};

export async function getUpcomingSchedule(
  options: GetUpcomingScheduleOptions = {},
): Promise<ScheduleEvent[]> {
  const response = await apiGet<unknown>(
    `/schedule/upcoming?fresh=${Date.now()}`,
    {
      timeoutMs: options.timeoutMs,
      headers: { 'Cache-Control': 'no-cache' },
      debugLabel: 'Agenda',
    },
  );
  try {
    const events = parseScheduleResponse(response);
    if (__DEV__) console.info(`[Agenda] ${events.length} événement(s) reçu(s).`);
    return events;
  } catch (error) {
    if (__DEV__) console.warn('[Agenda] Erreur de validation de la réponse.');
    throw error;
  }
}
