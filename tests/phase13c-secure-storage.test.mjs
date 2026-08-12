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
const { AUTH_STORAGE_CHUNK_BYTES, createChunkedSecureStorage } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);

function createMemoryStore(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    store: {
      async getItemAsync(key) { return values.get(key) ?? null; },
      async setItemAsync(key, value) { values.set(key, value); },
      async deleteItemAsync(key) { values.delete(key); },
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
  assert.ok([...values.keys()].filter((key) => key.includes(':chunk:')).length > 2);
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
