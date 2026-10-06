import { Injectable, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database/database.service';
import { GraphQLJwtAuthGuard } from './graphql-jwt-auth.guard';

/**
 * Optional authentication for public read endpoints.
 *
 * If a valid Bearer token is present, the user is attached to the request
 * exactly as GraphQLJwtAuthGuard does (including the ban check). If the token
 * is absent, invalid, or the account is banned, the request is still allowed
 * but `req.user` is null, so resolvers/services treat the caller as anonymous.
 */
@Injectable()
export class OptionalJwtAuthGuard extends GraphQLJwtAuthGuard {
  constructor(jwtService: JwtService, databaseService: DatabaseService) {
    super(jwtService, databaseService);
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req } = GqlExecutionContext.create(context).getContext();
    req.user = null;

    try {
      await super.canActivate(context);
    } catch {
      req.user = null;
    }
    return true;
  }
}
