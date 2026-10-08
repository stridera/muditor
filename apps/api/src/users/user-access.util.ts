import { ForbiddenException } from '@nestjs/common';
import type { UserRole } from '@muditor/db';
import { isStaff } from '../auth/role.util';

/**
 * Marks a User object that was handed back to the person it describes by an
 * auth mutation (login, register, Google sign-in). Those run before any JWT
 * exists, so there is no request user to compare against.
 */
export const SELF_AUTHENTICATED = Symbol('selfAuthenticated');

export interface UserViewer {
  id: string;
  role?: UserRole | null;
}

export function markSelfAuthenticated<T extends object>(user: T): T {
  return Object.assign({}, user, { [SELF_AUTHENTICATED]: true });
}

/** True when the viewer is the account itself, or IMMORTAL and above. */
export function canViewUserAccount(
  viewer: UserViewer | null | undefined,
  target: { id: string }
): boolean {
  if (target && (target as Record<symbol, unknown>)[SELF_AUTHENTICATED]) {
    return true;
  }
  if (!viewer) return false;
  return viewer.id === target.id || isStaff(viewer.role);
}

/** Throws unless the viewer is the account itself or staff. */
export function assertCanViewUserAccount(
  viewer: UserViewer | null | undefined,
  targetId: string
): void {
  if (!canViewUserAccount(viewer, { id: targetId })) {
    throw new ForbiddenException('You do not have access to this account');
  }
}
