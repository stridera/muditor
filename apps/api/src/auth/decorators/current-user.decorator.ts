import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@muditor/db';

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, context: ExecutionContext): User | any => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;
    
    return data ? user?.[data] : user;
  },
);