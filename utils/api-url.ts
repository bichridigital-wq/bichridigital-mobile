const API_PREFIX = '/api';

function normalizePath(path: string): string {
  const normalizedPath = `/${path.replace(/^\/+/, '')}`;
  return normalizedPath === API_PREFIX || normalizedPath.startsWith(`${API_PREFIX}/`)
    ? normalizedPath.slice(API_PREFIX.length) || '/'
    : normalizedPath;
}

export function buildApiUrl(base: string, path: string): string {
  const url = new URL(base);
  const basePath = url.pathname.replace(/\/+$/, '');
  const requestUrl = new URL(`/${path.replace(/^\/+/, '')}`, url.origin);
  const requestPath =
    basePath === API_PREFIX || basePath.endsWith(API_PREFIX)
      ? normalizePath(requestUrl.pathname)
      : requestUrl.pathname;

  url.pathname = `${basePath}${requestPath}`.replace(/\/{2,}/g, '/');
  url.search = requestUrl.search;
  url.hash = '';

  return url.toString();
}
