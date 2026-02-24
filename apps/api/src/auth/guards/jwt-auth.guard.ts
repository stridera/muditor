import { Injectable, type ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- AuthGuard base class defines handleRequest with `any` parameters
  handleRequest(err: any, user: any, info: any) {
    void info;
    if (err || !user) {
      throw err || new Error('Unauthorized');
    }
    return user;
  }
}
