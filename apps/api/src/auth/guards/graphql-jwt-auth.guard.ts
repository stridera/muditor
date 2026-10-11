import {
  Injectable,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { DatabaseService } from '../../database/database.service';
import { hasActiveBan } from '../ban.util';
import { isTokenVersionCurrent, tokenVersionOf } from '../token-version.util';

@Injectable()
export class GraphQLJwtAuthGuard {
  constructor(
    private jwtService: JwtService,
    private databaseService: DatabaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();

    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify(token);

      // Validate user exists and get user data
      const user = await this.databaseService.users.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          displayName: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          tokenVersion: true,
        },
      });

      // Soft-deleted accounts keep a valid signed token until it expires.
      if (!user || user.deletedAt) {
        throw new UnauthorizedException('Invalid token');
      }

      // Password/email/role change, ban or delete bumps the version and
      // kills every token minted before it.
      if (!isTokenVersionCurrent(payload, user)) {
        throw new UnauthorizedException('Invalid token');
      }

      // Attach user to request for use in resolvers
      if (await hasActiveBan(this.databaseService, user.id)) {
        throw new UnauthorizedException('Account is banned');
      }

      // authAt = last real sign-in (refreshes keep it); lets sensitive
      // mutations demand a recent authentication and caps refresh chains.
      // tokenVersionClaim is the incoming token's version, re-checked by
      // refreshToken against the row it reads.
      req.user = Object.assign(user, {
        authAt: payload.authAt ?? payload.iat,
        tokenVersionClaim: tokenVersionOf(payload),
      });
      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException &&
        error.message === 'Account is banned'
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
