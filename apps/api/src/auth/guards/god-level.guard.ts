import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { MIN_GOD_LEVEL_KEY } from '../decorators/god-level.decorator';

@Injectable()
export class GodLevelGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredGodLevel = this.reflector.getAllAndOverride<number>(MIN_GOD_LEVEL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredGodLevel === undefined) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) {
      return false;
    }

    return user.godLevel >= requiredGodLevel;
  }
}