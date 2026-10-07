/** Compact age like "5m", "3h", "2d" for the reports table. */
export function formatAge(createdAt: string | Date, now = Date.now()): string {
  const mins = Math.max(
    0,
    Math.floor((now - new Date(createdAt).getTime()) / 60000)
  );
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
