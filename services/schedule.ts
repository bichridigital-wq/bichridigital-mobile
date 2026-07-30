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
    '/schedule/upcoming',
    options.timeoutMs,
  );
  return parseScheduleResponse(response);
}
