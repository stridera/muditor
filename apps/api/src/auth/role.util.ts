import { UserRole } from '@muditor/db';

const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.PLAYER]: 0,
  [UserRole.IMMORTAL]: 1,
  [UserRole.BUILDER]: 2,
  [UserRole.HEAD_BUILDER]: 3,
  [UserRole.CODER]: 4,
  [UserRole.IMPLEMENTOR]: 5,
};

/** Numeric rank of a role; unknown or missing roles rank below PLAYER. */
export function roleRank(role: UserRole | null | undefined): number {
  if (!role) return -1;
  return ROLE_RANK[role] ?? -1;
}

/** True when `role` is at or above `minimum` in the role hierarchy. */
export function roleAtLeast(
  role: UserRole | null | undefined,
  minimum: UserRole
): boolean {
  if (!role) return false;
  return (ROLE_RANK[role] ?? -1) >= ROLE_RANK[minimum];
}

/** IMMORTAL and above. */
export function isStaff(role: UserRole | null | undefined): boolean {
  return roleAtLeast(role, UserRole.IMMORTAL);
}
