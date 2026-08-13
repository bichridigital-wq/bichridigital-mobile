export type SecureKeyValueStore = {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
};

type ChunkManifest = {
  version: 1;
  generation: string;
  chunks: number;
};

// Conservative payload size chosen to leave room for native storage overhead.
// This is not intended to describe a universal SecureStore platform limit.
export const AUTH_STORAGE_CHUNK_BYTES = 1000;

export const SECURE_STORE_KEY_PATTERN = /^[A-Za-z0-9._-]+$/;

export function isValidSecureStoreKey(key: string): boolean {
  return SECURE_STORE_KEY_PATTERN.test(key);
}

function assertValidSecureStoreKey(key: string): string {
  if (!isValidSecureStoreKey(key)) {
    throw new Error('Generated an invalid SecureStore key.');
  }
  return key;
}

function encodeUnsafeBaseKey(key: string): string {
  const bytes = new TextEncoder().encode(key);
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `encoded.v1.${bytes.byteLength.toString(36)}.${hex}`;
}

function secureBaseKey(key: string): string {
  return assertValidSecureStoreKey(
    isValidSecureStoreKey(key) ? key : encodeUnsafeBaseKey(key),
  );
}

const manifestKey = (baseKey: string) =>
  assertValidSecureStoreKey(`${baseKey}.manifest`);
const chunkKey = (baseKey: string, generation: string, index: number) =>
  assertValidSecureStoreKey(
    `${baseKey}.generation.${assertValidSecureStoreKey(generation)}.chunk.${index}`,
  );

function parseManifest(value: string | null): ChunkManifest | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<ChunkManifest>;
    if (
      parsed.version === 1 &&
      typeof parsed.generation === 'string' &&
      isValidSecureStoreKey(parsed.generation) &&
      Number.isSafeInteger(parsed.chunks) &&
      Number(parsed.chunks) > 0
    ) {
      return parsed as ChunkManifest;
    }
  } catch {
    // An invalid manifest is treated as unavailable storage data.
  }

  return null;
}

function splitUtf8(value: string): string[] {
  if (value.length === 0) return [''];

  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let current = '';
  let currentBytes = 0;

  for (const character of value) {
    const characterBytes = encoder.encode(character).byteLength;
    if (current && currentBytes + characterBytes > AUTH_STORAGE_CHUNK_BYTES) {
      chunks.push(current);
      current = '';
      currentBytes = 0;
    }
    current += character;
    currentBytes += characterBytes;
  }

  if (current) chunks.push(current);
  return chunks;
}

async function deleteChunks(
  store: SecureKeyValueStore,
  baseKey: string,
  manifest: ChunkManifest | null,
) {
  if (!manifest) return;
  await Promise.all(
    Array.from({ length: manifest.chunks }, (_, index) =>
      store.deleteItemAsync(chunkKey(baseKey, manifest.generation, index)),
    ),
  );
}

export function createChunkedSecureStorage(
  store: SecureKeyValueStore,
  createGeneration = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
) {
  return {
    async getItem(key: string): Promise<string | null> {
      const baseKey = secureBaseKey(key);
      const manifest = parseManifest(await store.getItemAsync(manifestKey(baseKey)));
      if (!manifest) return store.getItemAsync(baseKey);

      const chunks = await Promise.all(
        Array.from({ length: manifest.chunks }, (_, index) =>
          store.getItemAsync(chunkKey(baseKey, manifest.generation, index)),
        ),
      );
      if (chunks.some((chunk) => chunk === null)) {
        throw new Error('Secure auth storage is incomplete.');
      }
      return chunks.join('');
    },

    async setItem(key: string, value: string): Promise<void> {
      const baseKey = secureBaseKey(key);
      const oldManifest = parseManifest(await store.getItemAsync(manifestKey(baseKey)));
      const generation = assertValidSecureStoreKey(createGeneration());
      const chunks = splitUtf8(value);
      const newManifest: ChunkManifest = {
        version: 1,
        generation,
        chunks: chunks.length,
      };

      try {
        await Promise.all(
          chunks.map((chunk, index) =>
            store.setItemAsync(chunkKey(baseKey, generation, index), chunk),
          ),
        );
        await store.setItemAsync(manifestKey(baseKey), JSON.stringify(newManifest));
      } catch (error) {
        await deleteChunks(store, baseKey, newManifest).catch(() => undefined);
        throw error;
      }

      await store.deleteItemAsync(baseKey);
      await deleteChunks(store, baseKey, oldManifest);
    },

    async removeItem(key: string): Promise<void> {
      const baseKey = secureBaseKey(key);
      const manifest = parseManifest(await store.getItemAsync(manifestKey(baseKey)));
      await deleteChunks(store, baseKey, manifest);
      await Promise.all([
        store.deleteItemAsync(manifestKey(baseKey)),
        store.deleteItemAsync(baseKey),
      ]);
    },
  };
}
