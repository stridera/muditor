export const DEFAULT_CORS_ORIGINS = [
  'https://muditor.utaboshi.com',
  'http://localhost:3000',
];

/** Parse a comma-separated CORS_ORIGINS value into an explicit allowlist. */
export function parseCorsOrigins(raw: string | undefined): string[] {
  const origins = (raw ?? '')
    .split(',')
    .map(o => o.trim())
    .filter(o => o.length > 0 && o !== '*');
  return origins.length > 0 ? origins : DEFAULT_CORS_ORIGINS;
}
