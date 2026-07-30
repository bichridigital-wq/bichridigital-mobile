import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

const MIN_POLL_INTERVAL_MS = 60_000;

type UseLivePollingOptions = {
  loading: boolean;
  refreshing?: boolean;
  intervalMs: number;
  reload: () => void;
};

export function useLivePolling({
  loading,
  refreshing = false,
  intervalMs,
  reload,
}: UseLivePollingOptions): boolean {
  const [focused, setFocused] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const requestInFlightRef = useRef(loading);

  useEffect(() => {
    requestInFlightRef.current = loading || refreshing;
  }, [loading, refreshing]);

  const reloadIfIdle = useCallback(() => {
    if (requestInFlightRef.current) {
      return;
    }

    requestInFlightRef.current = true;
    reload();
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);

      return () => {
        setFocused(false);
      };
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!focused || appState !== 'active') {
      return;
    }

    reloadIfIdle();
    const safeIntervalMs = Math.max(MIN_POLL_INTERVAL_MS, intervalMs);
    const intervalId = setInterval(reloadIfIdle, safeIntervalMs);

    return () => clearInterval(intervalId);
  }, [appState, focused, intervalMs, reloadIfIdle]);

  return focused && appState === 'active';
}
