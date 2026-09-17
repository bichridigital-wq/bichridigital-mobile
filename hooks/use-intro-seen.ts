import { useEffect, useSyncExternalStore } from 'react';

import { introState } from '@/services/intro-storage';

export function useIntroSeen() {
  const seen = useSyncExternalStore(introState.subscribe, introState.snapshot, () => null);
  useEffect(() => {
    void introState.read();
  }, []);
  return seen;
}
