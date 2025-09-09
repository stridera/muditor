import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { MIN_GOD_LEVEL_KEY } from '../decorators/god-level.decorator';

@Injectable()
export class GodLevelGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredGodLevel = this.reflector.getAllAndOverride<number>(
      MIN_GOD_LEVEL_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (requiredGodLevel === undefined) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) {
      return false;
    }

    // Convert user role to equivalent god level
    const roleToLevel: Record<UserRole, number> = {
      [UserRole.PLAYER]: 0,
      [UserRole.IMMORTAL]: 100, // Max Character level 100
      [UserRole.BUILDER]: 102, // Max Character level 101/102
      [UserRole.CODER]: 103, // Level 103
      [UserRole.GOD]: 105, // >104
    };

    const userLevel = roleToLevel[user.role] || 0;
    return userLevel >= requiredGodLevel;
  }
}
