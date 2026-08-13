import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';
import { useProgramCatalog } from '@/hooks/use-program-catalog';
import { useUserLibrary } from '@/hooks/use-user-library';
import { followAccountProgram, reconcileAccountProgramSubscriptions, unfollowAccountProgram } from '@/services/account-program-subscriptions';
import { completeAccountProgramMutation, enqueueAccountProgramMutation, loadAccountProgramSyncOutbox, markAccountProgramSyncSuccessful } from '@/services/account-program-sync-storage';
import { linkAccountDevice, registerAccountDeviceUnlinkHandler, unlinkAccountDevice } from '@/services/account-device-link';
import type { LibraryEmissionInput } from '@/types/user-library';
import { getReconcileLocalProgramIds, getSafeServerMergeIds } from '@/utils/account-program-reconciliation';
import { UUID_PATTERN } from '@/utils/followed-emissions';

export type AccountProgramSyncStatus = 'idle' | 'syncing' | 'synced' | 'pending';
type Value = {
  status: AccountProgramSyncStatus;
  toggleEmissionFollow(emission: LibraryEmissionInput): void;
  removeFollowedEmission(slug: string): void;
  retry(): Promise<void>;
};
const Context = createContext<Value | null>(null);

export function AccountProgramSyncProvider({ children }: { children: ReactNode }) {
  const { session, isRestoring, isAuthenticated } = useAuth();
  const { getExistingDeviceProof } = useNotifications();
  const { emissions: catalog, isLoaded: catalogLoaded, isOfflineFallback } = useProgramCatalog();
  const library = useUserLibrary();
  const [status, setStatus] = useState<AccountProgramSyncStatus>('idle');
  const statusRef = useRef(status);
  const operationRef = useRef<Promise<void> | null>(null);
  const mutationQueueRef = useRef(Promise.resolve());
  const syncedSessionRef = useRef<string | null>(null);
  const followedRef = useRef(library.followedEmissions);

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { followedRef.current = library.followedEmissions; }, [library.followedEmissions]);

  const runSync = useCallback(() => {
    const accessToken = session?.access_token;
    if (!accessToken || isRestoring || !library.isHydrated || !catalogLoaded || isOfflineFallback) return Promise.resolve();
    if (operationRef.current) return operationRef.current;
    setStatus('syncing');
    const operation = (async () => {
      let outbox = await loadAccountProgramSyncOutbox();
      for (const programId of outbox.pendingUnfollowIds) {
        await unfollowAccountProgram(accessToken, programId);
        outbox = await completeAccountProgramMutation(programId, 'unfollow');
      }
      for (const programId of outbox.pendingFollowIds) {
        await followAccountProgram(accessToken, programId);
        outbox = await completeAccountProgramMutation(programId, 'follow');
      }
      const proof = getExistingDeviceProof();
      let linkedProof = null;
      if (proof) {
        try {
          await linkAccountDevice(accessToken, proof);
          linkedProof = proof;
        }
        catch { /* Device linking never blocks account/local reconciliation. */ }
      }
      const localIds = getReconcileLocalProgramIds(followedRef.current, outbox.pendingUnfollowIds);
      const serverIds = await reconcileAccountProgramSubscriptions(accessToken, localIds, linkedProof);
      library.mergeFollowedProgramIds(getSafeServerMergeIds(serverIds, outbox.pendingUnfollowIds), catalog);
      await markAccountProgramSyncSuccessful();
      syncedSessionRef.current = session.user.id;
      setStatus('synced');
    })().catch(() => setStatus('pending')).finally(() => { operationRef.current = null; });
    operationRef.current = operation;
    return operation;
  }, [catalog, catalogLoaded, getExistingDeviceProof, isOfflineFallback, isRestoring, library.isHydrated, library.mergeFollowedProgramIds, session]);

  useEffect(() => {
    if (!isAuthenticated || !session) {
      syncedSessionRef.current = null;
      setStatus('idle');
    } else if (syncedSessionRef.current !== session.user.id) {
      void runSync();
    }
  }, [isAuthenticated, runSync, session]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active' && statusRef.current === 'pending') void runSync();
    });
    return () => subscription.remove();
  }, [runSync]);

  useEffect(() => registerAccountDeviceUnlinkHandler(async (accessToken) => {
    const proof = getExistingDeviceProof();
    if (proof) await unlinkAccountDevice(accessToken, proof);
  }), [getExistingDeviceProof]);

  const syncMutation = useCallback((programId: string, intent: 'follow' | 'unfollow') => {
    const accessToken = session?.access_token;
    if (!accessToken || !UUID_PATTERN.test(programId)) return;
    setStatus('syncing');
    mutationQueueRef.current = mutationQueueRef.current.catch(() => undefined)
      .then(() => enqueueAccountProgramMutation(programId, intent))
      .then(() => intent === 'follow' ? followAccountProgram(accessToken, programId) : unfollowAccountProgram(accessToken, programId))
      .then(() => completeAccountProgramMutation(programId, intent))
      .then(() => setStatus('synced'))
      .catch(() => setStatus('pending'));
  }, [session?.access_token]);

  const toggleEmissionFollow = useCallback((emission: LibraryEmissionInput) => {
    const wasFollowed = library.isEmissionFollowed(emission.slug);
    library.toggleEmissionFollow(emission);
    if (isAuthenticated && emission.programId && UUID_PATTERN.test(emission.programId)) {
      syncMutation(emission.programId, wasFollowed ? 'unfollow' : 'follow');
    }
  }, [isAuthenticated, library.isEmissionFollowed, library.toggleEmissionFollow, syncMutation]);

  const removeFollowedEmission = useCallback((slug: string) => {
    const item = followedRef.current.find((emission) => emission.slug === slug);
    library.removeFollowedEmission(slug);
    if (isAuthenticated && item?.programId && UUID_PATTERN.test(item.programId)) syncMutation(item.programId, 'unfollow');
  }, [isAuthenticated, library.removeFollowedEmission, syncMutation]);

  const value = useMemo<Value>(() => ({ status, toggleEmissionFollow, removeFollowedEmission, retry: runSync }), [removeFollowedEmission, runSync, status, toggleEmissionFollow]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAccountProgramSync() {
  const value = useContext(Context);
  if (!value) throw new Error('useAccountProgramSync must be used within AccountProgramSyncProvider.');
  return value;
}
