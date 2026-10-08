import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { roleAtLeast } from '../role.util';

/**
 * Minimum-rank role guard: passes when the user's role is at or above the
 * role given to `@Roles(minimum)` in the hierarchy (see `role.util.ts`).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const minimum = this.reflector.getAllAndOverride<UserRole | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!minimum) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) {
      return false;
    }

    return roleAtLeast(user.role, minimum);
  }
}
