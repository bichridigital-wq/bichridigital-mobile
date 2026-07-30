import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getUpcomingSchedule } from '@/services/schedule';
import type { ScheduleEvent } from '@/types/schedule';

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function useSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const requestInFlightRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(() => {
    if (!requestInFlightRef.current) {
      setReloadCount((value) => value + 1);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    requestInFlightRef.current = true;
    if (hasLoadedRef.current) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    getUpcomingSchedule()
      .then((result) => {
        if (mounted) setEvents(result);
      })
      .catch((reason: unknown) => {
        if (mounted) setError(toError(reason));
      })
      .finally(() => {
        requestInFlightRef.current = false;
        hasLoadedRef.current = true;
        if (mounted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [reloadCount]);

  const nextEvent = useMemo(() => events[0] ?? null, [events]);
  return { events, nextEvent, isLoading, isRefreshing, error, refresh };
}
