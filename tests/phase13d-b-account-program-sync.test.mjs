import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { getReconcileLocalProgramIds, getSafeServerMergeIds, parseAccountProgramIds, parseAccountProgramSyncOutbox } from '../utils/account-program-reconciliation.ts';

const P1 = '91000000-0000-4000-8000-000000000001';
const P2 = '91000000-0000-4000-8000-000000000002';
const emission = (slug, programId) => ({ slug, programId, title: slug, category: 'TV', coverColor: '#000', savedAt: '2026-08-13T00:00:00Z' });

test('local P1 et serveur P2 produisent une union sans remplacement', () => {
  assert.deepEqual(getReconcileLocalProgramIds([emission('p1', P1)], []), [P1]);
  assert.deepEqual(getSafeServerMergeIds(parseAccountProgramIds({ programIds: [P2, P1] }), []), [P1, P2]);
});

test('serveur vide et erreur réseau ne prescrivent aucune suppression locale', () => {
  assert.deepEqual(getSafeServerMergeIds([], []), []);
  assert.deepEqual(getReconcileLocalProgramIds([emission('p1', P1), emission('p2', P2)], []), [P1, P2]);
});

test('slug historique sans UUID est conservé localement mais non envoyé', () => {
  assert.deepEqual(getReconcileLocalProgramIds([emission('historique', null), emission('p1', P1)], []), [P1]);
});

test('tombstone unfollow empêche la réintroduction par reconcile', () => {
  assert.deepEqual(getReconcileLocalProgramIds([emission('p1', P1)], [P1]), []);
  assert.deepEqual(getSafeServerMergeIds([P1, P2], [P1]), [P2]);
});

test('outbox filtre, déduplique et oppose follow/unfollow', () => {
  assert.deepEqual(parseAccountProgramSyncOutbox({
    pendingFollowIds: [P1, P1, 'invalid'], pendingUnfollowIds: [P2], lastSuccessfulSyncAt: null,
  }), { pendingFollowIds: [P1], pendingUnfollowIds: [P2], lastSuccessfulSyncAt: null });
});

test('service utilise JWT, routes compte et preuve device optionnelle', async () => {
  const service = await readFile(new URL('../services/account-program-subscriptions.ts', import.meta.url), 'utf8');
  assert.match(service, /Authorization: `Bearer \$\{accessToken\}`/);
  assert.match(service, /\/me\/program-subscriptions/);
  assert.match(service, /body: \{ localProgramIds, \.\.\.\(proof \?\? \{\}\) \}/);
  assert.doesNotMatch(service, /console\.(log|info).*accessToken/);
});

test('orchestration link facultatif, reconcile indépendant et retry foreground', async () => {
  const hook = await readFile(new URL('../hooks/use-account-program-sync.tsx', import.meta.url), 'utf8');
  assert.match(hook, /if \(proof\)[\s\S]+linkAccountDevice/);
  assert.match(hook, /catch \{ \/\* Device linking never blocks account\/local reconciliation/);
  assert.match(hook, /reconcileAccountProgramSubscriptions\(accessToken, localIds, linkedProof\)/);
  assert.match(hook, /next === 'active' && statusRef\.current === 'pending'/);
  assert.match(hook, /operationRef\.current/);
  assert.match(hook, /mutationQueueRef\.current/);
});

test('logout tente unlink avant signOut sans bloquer la déconnexion', async () => {
  const auth = await readFile(new URL('../hooks/use-auth.tsx', import.meta.url), 'utf8');
  const link = await readFile(new URL('../services/account-device-link.ts', import.meta.url), 'utf8');
  assert.ok(auth.indexOf('unlinkAccountDeviceBeforeSignOut') < auth.indexOf('supabase.auth.signOut()'));
  assert.match(link, /try[\s\S]+beforeSignOut[\s\S]+catch/);
});

test('aucune permission Push automatique n’est ajoutée au flux compte', async () => {
  const hook = await readFile(new URL('../hooks/use-account-program-sync.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(hook, /requestPermissionsAsync|requestNotificationPermission|registerPushDevice|getCurrentExpoPushToken/);
});

test('sync appareil historique reste réservée au mode invité connecté=false', async () => {
  const notifications = await readFile(new URL('../hooks/use-notifications.tsx', import.meta.url), 'utf8');
  assert.match(notifications, /if \(isAuthenticated\) return Promise\.resolve\(\)/);
});
