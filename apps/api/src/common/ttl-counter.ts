import type Redis from 'ioredis';

/** Snapshot of a counter: current count and seconds until it expires. */
export interface TtlCounterState {
  count: number;
  ttlSeconds: number;
}

/**
 * Per-key counter with a fixed expiry window. Used for attempt lockouts.
 */
export interface TtlCounter {
  /**
   * Atomically increment the counter and return the new count. The window
   * starts on the first increment (count === 1) and is refreshed when the new
   * count equals `refreshAtCount` (so a lockout runs a full window from the
   * attempt that triggered it).
   */
  incr(
    key: string,
    windowSeconds: number,
    refreshAtCount?: number
  ): Promise<number>;
  /** Current count and remaining TTL; `{ count: 0, ttlSeconds: 0 }` if absent. */
  peek(key: string): Promise<TtlCounterState>;
  /** Delete the counter. */
  reset(key: string): Promise<void>;
}

interface Entry {
  count: number;
  expiresAt: number;
}

/**
 * In-process TTL counter. Single-process only; use RedisTtlCounter when the
 * API is clustered. Node is single-threaded and every method is synchronous
 * under the hood, so increments are atomic.
 */
export class InMemoryTtlCounter implements TtlCounter {
  private readonly entries = new Map<string, Entry>();
  private lastSweep: number;

  constructor(private readonly now: () => number = Date.now) {
    this.lastSweep = now();
  }

  incr(
    key: string,
    windowSeconds: number,
    refreshAtCount?: number
  ): Promise<number> {
    const now = this.now();
    this.sweep(now);
    let entry = this.entries.get(key);
    if (!entry || entry.expiresAt <= now) {
      entry = { count: 0, expiresAt: now + windowSeconds * 1000 };
      this.entries.set(key, entry);
    }
    entry.count += 1;
    if (entry.count === refreshAtCount) {
      entry.expiresAt = now + windowSeconds * 1000;
    }
    return Promise.resolve(entry.count);
  }

  peek(key: string): Promise<TtlCounterState> {
    const now = this.now();
    const entry = this.entries.get(key);
    if (!entry || entry.expiresAt <= now) {
      return Promise.resolve({ count: 0, ttlSeconds: 0 });
    }
    return Promise.resolve({
      count: entry.count,
      ttlSeconds: Math.max(1, Math.ceil((entry.expiresAt - now) / 1000)),
    });
  }

  reset(key: string): Promise<void> {
    this.entries.delete(key);
    return Promise.resolve();
  }

  private sweep(now: number): void {
    if (now - this.lastSweep < 60_000) return;
    this.lastSweep = now;
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt <= now) this.entries.delete(key);
    }
  }
}

/** Redis-backed TTL counter (INCR + EXPIRE), shared across processes. */
export class RedisTtlCounter implements TtlCounter {
  constructor(private readonly redis: Redis) {}

  async incr(
    key: string,
    windowSeconds: number,
    refreshAtCount?: number
  ): Promise<number> {
    const count = await this.redis.incr(key);
    if (count === 1 || count === refreshAtCount) {
      await this.redis.expire(key, windowSeconds);
    }
    return count;
  }

  async peek(key: string): Promise<TtlCounterState> {
    const raw = await this.redis.get(key);
    const count = raw ? parseInt(raw, 10) : 0;
    if (!count) return { count: 0, ttlSeconds: 0 };
    const ttl = await this.redis.ttl(key);
    return { count, ttlSeconds: ttl > 0 ? ttl : 0 };
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

/**
 * Redis when a client is available, otherwise (or when Redis errors) an
 * in-memory counter. Never throws because of a missing/broken Redis, so
 * callers never fail closed on infrastructure.
 */
export class FallbackTtlCounter implements TtlCounter {
  constructor(
    private readonly getRedis: () => Redis | null,
    private readonly memory: TtlCounter = new InMemoryTtlCounter(),
    private readonly onRedisError?: (err: unknown) => void
  ) {}

  private redisCounter(): TtlCounter | null {
    const redis = this.getRedis();
    return redis ? new RedisTtlCounter(redis) : null;
  }

  async incr(
    key: string,
    windowSeconds: number,
    refreshAtCount?: number
  ): Promise<number> {
    const redis = this.redisCounter();
    if (redis) {
      try {
        return await redis.incr(key, windowSeconds, refreshAtCount);
      } catch (err) {
        this.onRedisError?.(err);
      }
    }
    return this.memory.incr(key, windowSeconds, refreshAtCount);
  }

  async peek(key: string): Promise<TtlCounterState> {
    const redis = this.redisCounter();
    if (redis) {
      try {
        return await redis.peek(key);
      } catch (err) {
        this.onRedisError?.(err);
      }
    }
    return this.memory.peek(key);
  }

  async reset(key: string): Promise<void> {
    // Clear both: a counter may have been created in memory while Redis was down.
    await this.memory.reset(key);
    const redis = this.redisCounter();
    if (redis) {
      try {
        await redis.reset(key);
      } catch (err) {
        this.onRedisError?.(err);
      }
    }
  }
}
