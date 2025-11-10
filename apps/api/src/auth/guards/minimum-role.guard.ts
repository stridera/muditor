import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { RoleCalculatorService } from '../../users/services/role-calculator.service';

export const MINIMUM_ROLE_KEY = 'minimumRole';

/**
 * Guard that checks if user has minimum required role
 * Used with @MinimumRole decorator
 *
 * Role hierarchy (ascending):
 * PLAYER < IMMORTAL < BUILDER < HEAD_BUILDER < CODER < GOD
 */
@Injectable()
export class MinimumRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleCalculator: RoleCalculatorService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.getAllAndOverride<UserRole>(
      MINIMUM_ROLE_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRole) {
      return true; // No role requirement
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) {
      return false; // No authenticated user
    }

    // Check if user meets minimum role requirement
    return this.roleCalculator.hasMinimumRole(user.role, requiredRole);
  }
}
