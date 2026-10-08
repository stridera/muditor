import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@muditor/db';

export const ROLES_KEY = 'roles';

/**
 * Require at least `minimum` in the role hierarchy
 * (PLAYER < IMMORTAL < BUILDER < HEAD_BUILDER < CODER < IMPLEMENTOR).
 * Enforced by `RolesGuard`; never list individual roles.
 */
export const Roles = (minimum: UserRole) => SetMetadata(ROLES_KEY, minimum);
