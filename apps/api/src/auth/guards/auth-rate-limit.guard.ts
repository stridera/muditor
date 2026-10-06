import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import {
  RATE_LIMIT_KEY,
  type RateLimitOptions,
} from '../../bridge/rate-limit.guard';

/** Default budget for unauthenticated auth endpoints: 10 attempts / minute / IP. */
export const AUTH_RATE_LIMIT: RateLimitOptions = {
  limit: 10,
  windowSeconds: 60,
};

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Per-IP rate limiter for unauthenticated endpoints (login, register, password reset).
 *
 * Reuses the `@RateLimit()` decorator metadata from bridge/rate-limit.guard.ts but,
 * unlike that guard (per-user, Redis, fails open), this one keys on client IP and
 * uses an in-process fixed-window counter so it works without Redis and fails
 * closed. The API runs as a single PM2 process; if it is ever clustered, move the
 * store to Redis.
 *
 * Client IP comes from `req.ip`; main.ts sets `trust proxy` for loopback so that
 * requests via Caddy resolve to the real client address.
 */
@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();
  private lastSweep = Date.now();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // E2E suites log in dozens of times from one IP. CI sets this; it is
    // ignored in production so the limiter can never be disabled there.
    if (
      process.env.AUTH_RATE_LIMIT_DISABLED === '1' &&
      process.env.NODE_ENV !== 'production'
    ) {
      return true;
    }

    const options =
      this.reflector.getAllAndOverride<RateLimitOptions | undefined>(
        RATE_LIMIT_KEY,
        [context.getHandler(), context.getClass()]
      ) ?? AUTH_RATE_LIMIT;

    const { req } = GqlExecutionContext.create(context).getContext<{
      req?: { ip?: string; socket?: { remoteAddress?: string } };
    }>();
    const ip = req?.ip ?? req?.socket?.remoteAddress ?? 'unknown';
    const prefix = options.keyPrefix ?? context.getHandler().name;
    const key = `${prefix}:${ip}`;

    const now = Date.now();
    this.sweep(now);

    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + options.windowSeconds * 1000 };
      this.buckets.set(key, bucket);
    }
    bucket.count += 1;

    if (bucket.count > options.limit) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many attempts. Try again in ${retryAfter} seconds.`,
          error: 'Too Many Requests',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    return true;
  }

  private sweep(now: number): void {
    if (now - this.lastSweep < 60_000) return;
    this.lastSweep = now;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}
