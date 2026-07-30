import {
  API_REQUEST_TIMEOUT_MS,
  BICHRIDIGITAL_API_URL,
} from '@/config/api';

class ApiClientError extends Error {}

type ApiGetOptions = {
  timeoutMs?: number;
  headers?: Record<string, string>;
  debugLabel?: string;
};

function buildApiUrl(path: string): string {
  if (!BICHRIDIGITAL_API_URL) {
    throw new ApiClientError(
      "L'URL de l'API Bichridigital n'est pas configurée. Définissez EXPO_PUBLIC_BICHRIDIGITAL_API_URL.",
    );
  }

  const baseUrl = BICHRIDIGITAL_API_URL.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  try {
    const url = new URL(`${baseUrl}${normalizedPath}`);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new ApiClientError('Protocole non pris en charge.');
    }

    return url.toString();
  } catch (error: unknown) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new ApiClientError("L'URL de l'API Bichridigital est invalide.");
  }
}

export async function apiGet<T>(
  path: string,
  options: ApiGetOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? API_REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const url = buildApiUrl(path);

  try {
    if (__DEV__ && options.debugLabel) {
      console.info(`[${options.debugLabel}] GET ${url}`);
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });
    if (__DEV__ && options.debugLabel) {
      console.info(`[${options.debugLabel}] HTTP ${response.status}`);
    }

    if (!response.ok) {
      throw new ApiClientError(
        `L'API Bichridigital a retourné une erreur (${response.status}).`,
      );
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiClientError(
        "La réponse de l'API Bichridigital n'est pas un JSON valide.",
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("L'API Bichridigital n'a pas répondu dans le délai imparti.");
    }

    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new Error("Impossible de contacter l'API Bichridigital.");
  } finally {
    clearTimeout(timeoutId);
  }
}
