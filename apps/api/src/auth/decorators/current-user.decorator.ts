import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Users } from '@muditor/db';

export const CurrentUser = createParamDecorator(
  (
    data: keyof Users | undefined,
    context: ExecutionContext
  ): Users | Users[keyof Users] => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    return data ? user?.[data] : user;
  }
);
