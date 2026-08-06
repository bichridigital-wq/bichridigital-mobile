import {
  API_REQUEST_TIMEOUT_MS,
  BICHRIDIGITAL_API_URL,
} from '@/config/api';

export type ApiClientErrorKind = 'configuration' | 'network' | 'server';

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly kind: ApiClientErrorKind,
    readonly status: number | null = null,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

type ApiRequestOptions = {
  timeoutMs?: number;
  headers?: Record<string, string>;
  debugLabel?: string;
  body?: unknown;
};

function buildApiUrl(path: string): string {
  if (!BICHRIDIGITAL_API_URL) {
    throw new ApiClientError(
      "L'URL de l'API Bichridigital n'est pas configurée.",
      'configuration',
    );
  }
  const baseUrl = BICHRIDIGITAL_API_URL.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  try {
    const url = new URL(`${baseUrl}${normalizedPath}`);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error('unsupported protocol');
    }
    return url.toString();
  } catch {
    throw new ApiClientError(
      "L'URL de l'API Bichridigital est invalide.",
      'configuration',
    );
  }
}

async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = buildApiUrl(path);
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? API_REQUEST_TIMEOUT_MS,
  );
  try {
    if (__DEV__ && options.debugLabel) {
      console.info(`[${options.debugLabel}] ${method} ${url}`);
    }
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
    if (__DEV__ && options.debugLabel) {
      console.info(`[${options.debugLabel}] HTTP ${response.status}`);
    }
    if (!response.ok) {
      throw new ApiClientError(
        `L'API Bichridigital a retourné une erreur (${response.status}).`,
        'server',
        response.status,
      );
    }
    if (response.status === 204) return undefined as T;
    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiClientError(
        "La réponse de l'API Bichridigital n'est pas un JSON valide.",
        'server',
        response.status,
      );
    }
  } catch (error: unknown) {
    if (error instanceof ApiClientError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiClientError(
        "L'API Bichridigital n'a pas répondu dans le délai imparti.",
        'network',
      );
    }
    throw new ApiClientError(
      "Impossible de contacter l'API Bichridigital.",
      'network',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiGet = <T>(path: string, options: ApiRequestOptions = {}) =>
  apiRequest<T>('GET', path, options);
export const apiPost = <T>(path: string, options: ApiRequestOptions) =>
  apiRequest<T>('POST', path, options);
export const apiPatch = <T>(path: string, options: ApiRequestOptions) =>
  apiRequest<T>('PATCH', path, options);
export const apiDelete = <T>(path: string, options: ApiRequestOptions) =>
  apiRequest<T>('DELETE', path, options);
