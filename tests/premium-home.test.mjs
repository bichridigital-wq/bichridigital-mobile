import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const cache = new Map();
function load(path) {
  if (cache.has(path)) return cache.get(path);
  const exports = {};
  cache.set(path, exports);
  const source = readFileSync(new URL(`../${path}.ts`, import.meta.url), 'utf8');
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, require: (name) => load(name.replace('@/', '')), setTimeout, clearTimeout,
  });
  return exports;
}
const { createIntroState } = load('utils/intro-state');
const { buildHomeHeroes, realReplayVideos, videoEditorial } = load('utils/premium-home-content');
const { emissions: programs } = load('constants/emissions-content');
const now = Date.parse('2026-09-17T12:00:00Z');
const video = { id: 'abcdefghijk', title: 'Li Ci Biir Ndiagne', isLive: false, publishedAt: '2026-09-16T12:00:00Z', duration: 'PT20M', thumbnailUrl: '', channelTitle: 'Bichridigital' };
const event = { id: 'event', title: 'Jotaayu Bichri', slug: 'jotaayu-bichri', status: 'scheduled', scheduledStartTime: '2026-09-18T12:00:00Z' };
const broadcast = { id: 'livevideo01', title: 'Li Ci Biir Ndiagne', status: 'live', thumbnailUrl: '', description: '' };
const heroes = (options = {}) => buildHomeHeroes({ programs, live: null, schedule: [], featured: [], now, ...options });

test('intro starts visible on every fresh application session', async () => {
  const firstSession = createIntroState();

  assert.equal(await firstSession.read(), false);
  assert.equal(firstSession.snapshot(), false);

  await firstSession.complete();

  assert.equal(firstSession.snapshot(), true);
  assert.equal(await firstSession.read(), true);

  const newApplicationSession = createIntroState();

  assert.equal(await newApplicationSession.read(), false);
  assert.equal(newApplicationSession.snapshot(), false);
});

test('intro completion remains valid for the current session', async () => {
  const state = createIntroState();

  let notifications = 0;
  const unsubscribe = state.subscribe(() => {
    notifications += 1;
  });

  assert.equal(await state.read(), false);

  await state.complete();

  assert.equal(await state.read(), true);
  assert.equal(state.snapshot(), true);
  assert.equal(notifications, 1);

  await state.complete();

  assert.equal(notifications, 1);

  unsubscribe();
});

test('intro session state is shared until the JS application process restarts', async () => {
  const state = createIntroState();

  const firstRead = state.read();
  const secondRead = state.read();

  assert.equal(await firstRead, false);
  assert.equal(await secondRead, false);

  await state.complete();

  assert.equal(await state.read(), true);
});

test('verified live precedes upcoming, editorial and local fallback', () => {
  const items = heroes({ live: broadcast, schedule: [event], featured: [video] });
  assert.equal(items[0].status, 'live');
  assert.equal(items[0].destination.kind, 'video');
  assert.equal(items[1].status, 'upcoming');
  assert.equal(items[1].destination.slug, 'jotaayu-bichri');
  assert.equal(items[2].id, video.id);
});

test('static local live labels, completed broadcasts and expired agenda never produce live', () => {
  const items = heroes({ live: { ...broadcast, status: 'completed' }, schedule: [{ ...event, scheduledStartTime: '2026-09-16T12:00:00Z' }] });
  assert.equal(items.length, 1);
  assert.equal(items[0].slug, 'li-ci-biir-ndiagne');
  assert.equal(items[0].status, undefined);
  assert.equal(items[0].date, undefined);
});

test('earliest future program wins across agenda and YouTube; unknown program opens Direct', () => {
  const live = { ...broadcast, status: 'upcoming', scheduledStartTime: '2026-09-19T12:00:00Z' };
  assert.equal(heroes({ live, schedule: [event] })[0].id, 'schedule-event');
  assert.equal(heroes({ live: { ...live, scheduledStartTime: '2026-09-18T10:00:00Z' }, schedule: [event] })[0].id, broadcast.id);
  assert.equal(heroes({ schedule: [{ ...event, title: 'Autre programme', slug: 'unknown' }] })[0].destination.kind, 'direct');
});

test('editorial videos precede fallback and resolve official playlist covers', () => {
  const items = heroes({ featured: [{ ...video, title: 'Un épisode', playlistId: 'PLI_MqicDqh-w' }] });
  assert.equal(items[0].slug, 'jotaayu-bichri');
  assert.equal(items[0].destination.videoId, video.id);
});

test('replays exclude mock, live, future and duplicate videos; missing metadata stays absent', () => {
  const videos = realReplayVideos([video, video, { ...video, id: 'mock-video-001' }, { ...video, id: 'abcdefghij2', isLive: true }, { ...video, id: 'abcdefghij3', publishedAt: '2027-01-01' }], now);
  assert.equal(videos.length, 1);
  const item = videoEditorial({ ...video, duration: '', publishedAt: 'invalid' }, programs, now);
  assert.equal(item.date, undefined);
  assert.equal(item.duration, undefined);
  assert.equal(item.status, undefined);
});
