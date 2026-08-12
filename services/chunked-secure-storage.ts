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

const manifestKey = (key: string) => `${key}:chunk-manifest`;
const chunkKey = (key: string, generation: string, index: number) =>
  `${key}:chunk:${generation}:${index}`;

function parseManifest(value: string | null): ChunkManifest | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<ChunkManifest>;
    if (
      parsed.version === 1 &&
      typeof parsed.generation === 'string' &&
      parsed.generation.length > 0 &&
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
  key: string,
  manifest: ChunkManifest | null,
) {
  if (!manifest) return;
  await Promise.all(
    Array.from({ length: manifest.chunks }, (_, index) =>
      store.deleteItemAsync(chunkKey(key, manifest.generation, index)),
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
      const manifest = parseManifest(await store.getItemAsync(manifestKey(key)));
      if (!manifest) return store.getItemAsync(key);

      const chunks = await Promise.all(
        Array.from({ length: manifest.chunks }, (_, index) =>
          store.getItemAsync(chunkKey(key, manifest.generation, index)),
        ),
      );
      if (chunks.some((chunk) => chunk === null)) {
        throw new Error('Secure auth storage is incomplete.');
      }
      return chunks.join('');
    },

    async setItem(key: string, value: string): Promise<void> {
      const oldManifest = parseManifest(await store.getItemAsync(manifestKey(key)));
      const generation = createGeneration();
      const chunks = splitUtf8(value);
      const newManifest: ChunkManifest = {
        version: 1,
        generation,
        chunks: chunks.length,
      };

      try {
        await Promise.all(
          chunks.map((chunk, index) =>
            store.setItemAsync(chunkKey(key, generation, index), chunk),
          ),
        );
        await store.setItemAsync(manifestKey(key), JSON.stringify(newManifest));
      } catch (error) {
        await deleteChunks(store, key, newManifest).catch(() => undefined);
        throw error;
      }

      await store.deleteItemAsync(key);
      await deleteChunks(store, key, oldManifest);
    },

    async removeItem(key: string): Promise<void> {
      const manifest = parseManifest(await store.getItemAsync(manifestKey(key)));
      await deleteChunks(store, key, manifest);
      await Promise.all([
        store.deleteItemAsync(manifestKey(key)),
        store.deleteItemAsync(key),
      ]);
    },
  };
}
