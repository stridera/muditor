import type { LoggerService } from '@nestjs/common';
import Redis from 'ioredis';

/** Max delay between reconnect attempts. */
export const REDIS_MAX_BACKOFF_MS = 60_000;
/** Minimum gap between "still unreachable" log lines. */
export const REDIS_LOG_INTERVAL_MS = 10 * 60_000;

interface ConfigReader {
  get(key: string): string | undefined;
}

/**
 * The single source of truth for whether Redis is configured. Returns the URL
 * from `REDIS_URL`, or `null` when it is unset or empty. There is deliberately
 * no default: a deployment without Redis must not try to connect to one.
 */
export function getRedisUrl(config: ConfigReader): string | null {
  const url = config.get('REDIS_URL')?.trim();
  return url ? url : null;
}

/** Exponential backoff (1s, 2s, 4s, ...) capped at REDIS_MAX_BACKOFF_MS. */
export function redisRetryStrategy(times: number): number {
  return Math.min(1000 * 2 ** Math.max(0, times - 1), REDIS_MAX_BACKOFF_MS);
}

/**
 * Collapses a stream of connection errors into: a WARN on the first failure,
 * then at most one WARN per REDIS_LOG_INTERVAL_MS ("still unreachable, N
 * failures"), and one INFO on recovery.
 */
export class RedisLogThrottle {
  private failures = 0;
  private lastLoggedAt = 0;
  private down = false;

  constructor(
    private readonly logger: Pick<LoggerService, 'log' | 'warn'>,
    private readonly label: string,
    private readonly now: () => number = Date.now
  ) {}

  onError(error: unknown): void {
    this.failures += 1;
    const now = this.now();
    const reason = error instanceof Error ? error.message : String(error);
    if (!this.down) {
      this.down = true;
      this.lastLoggedAt = now;
      this.logger.warn(`${this.label} unreachable: ${reason}; will retry`);
    } else if (now - this.lastLoggedAt >= REDIS_LOG_INTERVAL_MS) {
      this.lastLoggedAt = now;
      this.logger.warn(
        `${this.label} still unreachable, ${this.failures} failures (${reason})`
      );
    }
  }

  onReady(): void {
    if (this.down) {
      this.logger.log(
        `${this.label} connection recovered after ${this.failures} failures`
      );
    }
    this.down = false;
    this.failures = 0;
  }
}

export interface RedisClientOptions {
  logger: Pick<LoggerService, 'log' | 'warn'>;
  /** Human label used in log lines, e.g. "Redis (game events)". */
  label: string;
  /**
   * Subscriber clients queue their SUBSCRIBE until connected and never give up
   * on it. Command clients fail fast while disconnected so callers can fall
   * back (in-memory store / fail open) instead of hanging on backoff.
   */
  subscriber?: boolean;
}

/**
 * Create an ioredis client that never emits an unhandled `error` event, backs
 * off exponentially, and logs outages sparingly. Connects immediately.
 */
export function createRedisClient(
  url: string,
  options: RedisClientOptions
): Redis {
  const client = new Redis(url, {
    retryStrategy: redisRetryStrategy,
    ...(options.subscriber
      ? { maxRetriesPerRequest: null }
      : { maxRetriesPerRequest: 1, enableOfflineQueue: false }),
  });
  const throttle = new RedisLogThrottle(options.logger, options.label);
  client.on('error', err => throttle.onError(err));
  client.on('ready', () => throttle.onReady());
  return client;
}
