import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

const LIVE_POLL_INTERVAL_MS = 60_000;

type UseLivePollingOptions = {
  loading: boolean;
  reload: () => void;
};

export function useLivePolling({ loading, reload }: UseLivePollingOptions): void {
  const [focused, setFocused] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const requestInFlightRef = useRef(loading);

  useEffect(() => {
    requestInFlightRef.current = loading;
  }, [loading]);

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
    const intervalId = setInterval(reloadIfIdle, LIVE_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [appState, focused, reloadIfIdle]);
}
