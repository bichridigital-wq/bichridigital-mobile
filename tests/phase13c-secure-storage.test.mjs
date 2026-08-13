import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(
  new URL('../services/chunked-secure-storage.ts', import.meta.url),
  'utf8',
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const {
  AUTH_STORAGE_CHUNK_BYTES,
  SECURE_STORE_KEY_PATTERN,
  createChunkedSecureStorage,
} = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);

function createMemoryStore(initial = {}) {
  const values = new Map(Object.entries(initial));
  const calls = [];
  const record = (operation, key) => {
    assert.match(key, SECURE_STORE_KEY_PATTERN);
    calls.push({ operation, key });
  };
  return {
    values,
    calls,
    store: {
      async getItemAsync(key) { record('get', key); return values.get(key) ?? null; },
      async setItemAsync(key, value) { record('set', key); values.set(key, value); },
      async deleteItemAsync(key) { record('delete', key); values.delete(key); },
    },
  };
}

function createStorage(initial = {}) {
  const memory = createMemoryStore(initial);
  let generation = 0;
  return {
    ...memory,
    storage: createChunkedSecureStorage(
      memory.store,
      () => `generation-${++generation}`,
    ),
  };
}

test('small value can be set, read, and removed', async () => {
  const { storage, values } = createStorage();
  await storage.setItem('auth', 'small');
  assert.equal(await storage.getItem('auth'), 'small');
  await storage.removeItem('auth');
  assert.equal(await storage.getItem('auth'), null);
  assert.equal(values.size, 0);
});

test('long UTF-8 value spans chunks and is reconstructed exactly', async () => {
  const { storage, values } = createStorage();
  const value = `session-${'é🔐'.repeat(AUTH_STORAGE_CHUNK_BYTES)}`;
  await storage.setItem('auth', value);
  assert.equal(await storage.getItem('auth'), value);
  assert.ok([...values.keys()].filter((key) => key.includes('.chunk.')).length > 2);
  await storage.removeItem('auth');
  assert.equal(values.size, 0);
});

test('overwriting long with short removes obsolete chunks', async () => {
  const { storage, values } = createStorage();
  await storage.setItem('auth', 'x'.repeat(AUTH_STORAGE_CHUNK_BYTES * 4));
  await storage.setItem('auth', 'short');
  assert.equal(await storage.getItem('auth'), 'short');
  assert.equal([...values.keys()].some((key) => key.includes('generation-1')), false);
});

test('overwriting short with long restores the new value', async () => {
  const { storage } = createStorage();
  await storage.setItem('auth', 'short');
  const value = 'z'.repeat(AUTH_STORAGE_CHUNK_BYTES * 3);
  await storage.setItem('auth', value);
  assert.equal(await storage.getItem('auth'), value);
});

test('removing a missing value is idempotent', async () => {
  const { storage, values } = createStorage();
  await storage.removeItem('missing');
  await storage.removeItem('missing');
  assert.equal(values.size, 0);
});

test('legacy single-key values remain readable and migrate on next set', async () => {
  const { storage, values } = createStorage({ auth: 'legacy-session' });
  assert.equal(await storage.getItem('auth'), 'legacy-session');
  await storage.setItem('auth', 'new-session');
  assert.equal(values.has('auth'), false);
  assert.equal(await storage.getItem('auth'), 'new-session');
});

test('unsafe Supabase base keys are deterministically encoded without collisions', async () => {
  const { storage, calls, values } = createStorage();
  await storage.setItem('supabase:https://example.test/auth token', 'session');
  await storage.setItem('supabase/https://example.test/auth token', 'other-session');
  assert.equal(await storage.getItem('supabase:https://example.test/auth token'), 'session');
  assert.equal(await storage.getItem('supabase/https://example.test/auth token'), 'other-session');
  assert.ok(calls.every(({ key }) => SECURE_STORE_KEY_PATTERN.test(key)));
  assert.equal(
    new Set([...values.keys()].filter((key) => key.startsWith('encoded.v1.'))).size,
    values.size,
  );
});

test('multiple fragments never use colons in generated SecureStore keys', async () => {
  const { storage, calls } = createStorage();
  await storage.setItem('auth', 'x'.repeat(AUTH_STORAGE_CHUNK_BYTES * 4));
  const generatedKeys = calls.map(({ key }) => key);
  assert.ok(generatedKeys.filter((key) => key.includes('.chunk.')).length > 2);
  assert.ok(generatedKeys.every((key) => !key.includes(':')));
});

test('an invalid generation is rejected before SecureStore receives a key', async () => {
  const memory = createMemoryStore();
  const storage = createChunkedSecureStorage(memory.store, () => '2026-08-13T12:34:56');
  await assert.rejects(storage.setItem('auth', 'session'), /invalid SecureStore key/);
  assert.ok(memory.calls.every(({ key }) => SECURE_STORE_KEY_PATTERN.test(key)));
});
