import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Users } from '@prisma/client';

export const CurrentUser = createParamDecorator(
  (data: keyof Users | undefined, context: ExecutionContext): Users | any => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;
    
    return data ? user?.[data] : user;
  },
);