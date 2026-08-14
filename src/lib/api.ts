const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '';

function normalizeBaseUrl(url: string): string {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = normalizeBaseUrl(rawApiBaseUrl);
  return base ? `${base}${normalizedPath}` : normalizedPath;
}
