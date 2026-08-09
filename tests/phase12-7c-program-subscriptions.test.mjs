import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildApiUrl } from '../utils/api-url.ts';
import { enrichFavoriteEmissions, mergeFavoriteEmissionsByProgramIds } from '../utils/followed-emissions.ts';
import { enrichEmissions, parseProgramsResponse } from '../utils/program-catalog.ts';
import { reconcileProgramSubscriptions } from '../utils/program-subscription-reconciliation.ts';
import { getSafeNotificationDestination } from '../utils/push-navigation.ts';

const ID_1 = '123e4567-e89b-42d3-a456-426614174000';
const ID_2 = '223e4567-e89b-42d3-a456-426614174001';
const local = [{ id: 'local', slug: 'jotaayu-bichri', title: 'Jotaayu', description: '', category: 'Religion', day: '', time: '', coverColor: '#000', status: '' }];

test('catalogue valide les programmes et enrichit uniquement par slug exact', () => {
  const programs = parseProgramsResponse({ source: 'programs', data: [
    { id: ID_1, slug: 'jotaayu-bichri', name: 'Jotaayu', category: 'Religion', defaultDescription: null, defaultThumbnailUrl: 'https://example.com/a.jpg', defaultDurationMinutes: 60 },
    { id: 'bad', slug: 'jotaayu-bichri', name: 'Bad', category: 'Religion', defaultDescription: null, defaultThumbnailUrl: null, defaultDurationMinutes: 60 },
  ] });
  assert.equal(programs.length, 1);
  assert.equal(enrichEmissions(local, programs)[0].programId, ID_1);
  assert.equal(enrichEmissions([{ ...local[0], slug: 'absent' }], programs)[0].programId, null);
  assert.equal(enrichEmissions(local, []).length, 1);
});

test('migration locale conserve les anciennes entrées et ajoute le UUID', () => {
  const favorite = { slug: 'jotaayu-bichri', title: 'Jotaayu', category: 'Religion', coverColor: '#000', savedAt: '2026-01-01T00:00:00Z' };
  const catalog = enrichEmissions(local, [{ id: ID_1, slug: 'jotaayu-bichri', name: 'Jotaayu', category: 'Religion', defaultDescription: null, defaultThumbnailUrl: null, defaultDurationMinutes: 60 }]);
  const migrated = enrichFavoriteEmissions([favorite], catalog);
  assert.equal(migrated.length, 1);
  assert.equal(migrated[0].programId, ID_1);
  assert.equal(migrated[0].savedAt, favorite.savedAt);
  assert.equal(mergeFavoriteEmissionsByProgramIds([], [ID_1], catalog).length, 1);
});

test('première réconciliation fait une union sans wipe', () => {
  assert.deepEqual(reconcileProgramSubscriptions([ID_1], [], [ID_1, ID_2], false), {
    mergedProgramIds: [ID_1], followProgramIds: [ID_1], unfollowProgramIds: [],
  });
  const union = reconcileProgramSubscriptions([], [ID_2], [ID_1, ID_2], false);
  assert.deepEqual(union.mergedProgramIds, [ID_2]);
  assert.deepEqual(union.unfollowProgramIds, []);
});

test('après migration, seul le catalogue gérable est rendu autoritaire', () => {
  const plan = reconcileProgramSubscriptions([ID_1], [ID_2], [ID_1, ID_2], true);
  assert.deepEqual(plan.followProgramIds, [ID_1]);
  assert.deepEqual(plan.unfollowProgramIds, [ID_2]);
  assert.deepEqual(reconcileProgramSubscriptions([ID_1], [ID_1], [ID_1], true).followProgramIds, []);
});

test('routes UUID et navigation restent sûres et backward-compatible', async () => {
  assert.equal(buildApiUrl('https://www.bichridigital.com/api', '/push/program-subscriptions'), 'https://www.bichridigital.com/api/push/program-subscriptions');
  assert.doesNotMatch(buildApiUrl('https://www.bichridigital.com/api', '/push/program-subscriptions/list'), /\/api\/api\//);
  assert.ok(getSafeNotificationDestination({ type: 'emission', emissionSlug: 'jotaayu-bichri' }));
  assert.ok(getSafeNotificationDestination({ type: 'emission', emissionSlug: 'jotaayu-bichri', programId: ID_1, scheduleId: ID_2 }));
  assert.equal(getSafeNotificationDestination({ type: 'emission', emissionSlug: 'jotaayu-bichri', programId: 'bad', scheduleId: ID_2 }), null);
  const followSource = await readFile(new URL('../app/emission/[slug].tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(followSource, /requestPermissionsAsync/);
  const serviceSource = await readFile(new URL('../services/program-subscriptions.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(serviceSource, /console\./);
});
