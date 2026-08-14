const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '';
const fallbackHostedApiBaseUrl = 'https://bachat-ai-powered-expense-tracker-web-app.onrender.com';

function normalizeBaseUrl(url: string): string {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function inferFallbackApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname.toLowerCase();
  if (host === 'mybachat.netlify.app' || host.endsWith('.netlify.app')) {
    return fallbackHostedApiBaseUrl;
  }
  return '';
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = normalizeBaseUrl(rawApiBaseUrl || inferFallbackApiBaseUrl());
  return base ? `${base}${normalizedPath}` : normalizedPath;
}
