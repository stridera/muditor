/**
 * Token versioning: `Users.tokenVersion` is stamped into every JWT as the
 * `tokenVersion` claim and bumped on password change/reset, email change,
 * role change, ban and delete. A token whose claim differs from the user's
 * current version is dead. Tokens minted before the claim existed carry none
 * and count as version 0, so a deploy does not log anybody out.
 */
export function tokenVersionOf(payload: {
  tokenVersion?: number | null;
}): number {
  return payload.tokenVersion ?? 0;
}

export function isTokenVersionCurrent(
  payload: { tokenVersion?: number | null },
  user: { tokenVersion?: number | null }
): boolean {
  return tokenVersionOf(payload) === (user.tokenVersion ?? 0);
}

/** Prisma `data` fragment that invalidates every outstanding token. */
export const BUMP_TOKEN_VERSION = { tokenVersion: { increment: 1 } } as const;
