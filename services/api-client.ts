import {
  API_REQUEST_TIMEOUT_MS,
  BICHRIDIGITAL_API_URL,
} from '@/config/api';
import { buildApiUrl } from '@/utils/api-url';
import { parseApiError } from '@/utils/api-error';

export type ApiClientErrorKind = 'configuration' | 'network' | 'server';

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly kind: ApiClientErrorKind,
    readonly status: number | null = null,
    readonly code: string | null = null,
    readonly fields: string[] = [],
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

function getApiUrl(path: string): string {
  if (!BICHRIDIGITAL_API_URL) {
    throw new ApiClientError(
      "L'URL de l'API Bichridigital n'est pas configurée.",
      'configuration',
    );
  }
  try {
    const url = new URL(buildApiUrl(BICHRIDIGITAL_API_URL, path));
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
  const url = getApiUrl(path);
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
    if (!response.ok) {
      const parsed = parseApiError(await response.json().catch(() => null));
      if (__DEV__ && options.debugLabel) {
        const code = parsed.code ? ` — ${parsed.code}` : '';
        const fields = parsed.fields.length
          ? ` — fields: ${parsed.fields.join(', ')}`
          : '';
        console.info(
          `[${options.debugLabel}] HTTP ${response.status}${code}${fields}`,
        );
      }
      throw new ApiClientError(
        parsed.message ??
          `L'API Bichridigital a retourné une erreur (${response.status}).`,
        'server',
        response.status,
        parsed.code,
        parsed.fields,
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
