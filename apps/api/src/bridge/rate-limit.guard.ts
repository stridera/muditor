import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Optional key prefix for grouping endpoints */
  keyPrefix?: string;
}

/**
 * Decorator to set rate limit on a resolver method
 *
 * @example
 * @RateLimit({ limit: 60, windowSeconds: 60 }) // 60 requests per minute
 * @RateLimit({ limit: 10, windowSeconds: 60, keyPrefix: 'broadcast' }) // 10 broadcasts per minute
 */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

/**
 * Guard that enforces rate limiting using Redis
 *
 * Uses a sliding window algorithm to track requests per user.
 * Returns 429 Too Many Requests when limit is exceeded.
 *
 * Default limits (per minute):
 * - Commands: 60
 * - Broadcasts: 10
 * - Kicks: 5
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private redis: Redis | null = null;
  private readonly enabled: boolean;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService
  ) {
    const redisUrl =
      this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    this.enabled =
      this.configService.get<string>('RATE_LIMIT_ENABLED') !== 'false';

    if (this.enabled) {
      this.redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 3,
      });
      this.redis.connect().catch(() => {
        // Silently fail - rate limiting will be disabled
        this.redis = null;
      });
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // If Redis is not available, allow the request (fail open)
    if (!this.redis || !this.enabled) {
      return true;
    }

    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()]
    );

    // No rate limit configured, allow the request
    if (!options) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) {
      return true; // Let auth guard handle unauthenticated requests
    }

    const handlerName = context.getHandler().name;
    const keyPrefix = options.keyPrefix ?? handlerName;
    const key = `ratelimit:${keyPrefix}:${user.id}`;

    try {
      const current = await this.redis.incr(key);

      // Set expiry on first request
      if (current === 1) {
        await this.redis.expire(key, options.windowSeconds);
      }

      if (current > options.limit) {
        const ttl = await this.redis.ttl(key);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Rate limit exceeded. Try again in ${ttl} seconds.`,
            error: 'Too Many Requests',
            retryAfter: ttl,
          },
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      return true;
    } catch (error) {
      // If it's our rate limit error, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }
      // Redis error - fail open
      return true;
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

/**
 * Default rate limit configurations for admin operations
 */
export const AdminRateLimits = {
  /** General commands: 60 per minute */
  COMMAND: { limit: 60, windowSeconds: 60, keyPrefix: 'admin:command' },
  /** Broadcasts: 10 per minute */
  BROADCAST: { limit: 10, windowSeconds: 60, keyPrefix: 'admin:broadcast' },
  /** Kicks: 5 per minute */
  KICK: { limit: 5, windowSeconds: 60, keyPrefix: 'admin:kick' },
  /** Stats queries: 30 per minute */
  STATS: { limit: 30, windowSeconds: 60, keyPrefix: 'admin:stats' },
  /** Player list: 30 per minute */
  PLAYERS: { limit: 30, windowSeconds: 60, keyPrefix: 'admin:players' },
} as const;
