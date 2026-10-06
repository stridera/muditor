import { authenticatedFetch } from '@/lib/authenticated-fetch';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Fetch helper for the zone editor. Resolves relative URLs (e.g. "/graphql")
 * against the API base and delegates to the shared authenticated fetch so the
 * `Authorization: Bearer <token>` header (the only credential the API accepts)
 * is attached the same way as everywhere else in the app.
 */
export function zoneEditorFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  return authenticatedFetch(fullUrl, init);
}
