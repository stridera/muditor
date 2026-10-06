/**
 * Single source of truth for the web app's role hierarchy.
 * Mirrors the Prisma `UserRole` enum (ascending privilege) and
 * apps/api/src/auth/role.util.ts.
 */
export const USER_ROLES = [
  'PLAYER',
  'IMMORTAL',
  'BUILDER',
  'HEAD_BUILDER',
  'CODER',
  'IMPLEMENTOR',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Rank of a role (0 = PLAYER). Unknown / missing roles return -1. */
export function roleRank(role: string | null | undefined): number {
  if (!role) return -1;
  return (USER_ROLES as readonly string[]).indexOf(role);
}

/** True when `role` is at or above `minimum` in the role hierarchy. */
export function roleAtLeast(
  role: string | null | undefined,
  minimum: UserRole
): boolean {
  const rank = roleRank(role);
  return rank >= 0 && rank >= roleRank(minimum);
}

/**
 * Character level used when a staff account posts to in-game boards.
 * PLAYER posts as level 1; staff roles map onto the immortal level ladder.
 */
const ROLE_POSTER_LEVEL: Record<UserRole, number> = {
  PLAYER: 1,
  IMMORTAL: 100,
  BUILDER: 102,
  HEAD_BUILDER: 103,
  CODER: 104,
  IMPLEMENTOR: 105,
};

export function rolePosterLevel(role: string | null | undefined): number {
  return ROLE_POSTER_LEVEL[role as UserRole] ?? 1;
}
