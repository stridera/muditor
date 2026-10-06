import { EventEmitter } from 'events';
import Redis from 'ioredis';
import {
  REDIS_LOG_INTERVAL_MS,
  REDIS_MAX_BACKOFF_MS,
  RedisLogThrottle,
  createRedisClient,
  getRedisUrl,
  redisRetryStrategy,
} from './redis';

jest.mock('ioredis', () => jest.fn());

const cfg = (value: string | undefined) => ({ get: () => value });
const makeLogger = () => ({ log: jest.fn(), warn: jest.fn() });

describe('getRedisUrl', () => {
  it('returns null when REDIS_URL is unset, empty or blank', () => {
    expect(getRedisUrl(cfg(undefined))).toBeNull();
    expect(getRedisUrl(cfg(''))).toBeNull();
    expect(getRedisUrl(cfg('   '))).toBeNull();
  });

  it('returns the URL when set', () => {
    expect(getRedisUrl(cfg('redis://r:6379'))).toBe('redis://r:6379');
  });
});

describe('redisRetryStrategy', () => {
  it('backs off exponentially and caps at 60s', () => {
    expect(redisRetryStrategy(1)).toBe(1000);
    expect(redisRetryStrategy(2)).toBe(2000);
    expect(redisRetryStrategy(4)).toBe(8000);
    expect(redisRetryStrategy(10)).toBe(REDIS_MAX_BACKOFF_MS);
    expect(redisRetryStrategy(1000)).toBe(REDIS_MAX_BACKOFF_MS);
  });
});

describe('RedisLogThrottle', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('warns once for many errors within 10 minutes', () => {
    const logger = makeLogger();
    const throttle = new RedisLogThrottle(logger, 'Redis');
    for (let i = 0; i < 500; i++) {
      throttle.onError(new Error('connect ECONNREFUSED'));
      jest.advanceTimersByTime(1000);
    }
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it('logs "still unreachable, N failures" once per 10 minutes', () => {
    const logger = makeLogger();
    const throttle = new RedisLogThrottle(logger, 'Redis');
    throttle.onError(new Error('x'));
    for (let i = 0; i < 59; i++) {
      jest.advanceTimersByTime(REDIS_LOG_INTERVAL_MS / 60);
      throttle.onError(new Error('x'));
    }
    expect(logger.warn).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(REDIS_LOG_INTERVAL_MS / 60);
    throttle.onError(new Error('x'));
    expect(logger.warn).toHaveBeenCalledTimes(2);
    expect(logger.warn.mock.calls[1][0]).toMatch(
      /still unreachable, 61 failures/
    );
  });

  it('logs recovery once at info and re-arms the warning', () => {
    const logger = makeLogger();
    const throttle = new RedisLogThrottle(logger, 'Redis');
    throttle.onReady();
    expect(logger.log).not.toHaveBeenCalled();
    throttle.onError(new Error('x'));
    throttle.onReady();
    throttle.onReady();
    expect(logger.log).toHaveBeenCalledTimes(1);
    throttle.onError(new Error('x'));
    expect(logger.warn).toHaveBeenCalledTimes(2);
  });
});

describe('createRedisClient', () => {
  it('attaches an error listener so errors are never unhandled', () => {
    const emitter = new EventEmitter();
    (Redis as unknown as jest.Mock).mockImplementation(() => emitter);
    const logger = makeLogger();

    createRedisClient('redis://r:6379', { logger, label: 'Redis' });

    expect(emitter.listenerCount('error')).toBeGreaterThan(0);
    // EventEmitter throws on an unhandled 'error'; this must not.
    expect(() =>
      emitter.emit('error', new Error('ECONNREFUSED'))
    ).not.toThrow();
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it('passes the capped backoff strategy; subscribers keep their queue', () => {
    (Redis as unknown as jest.Mock).mockImplementation(
      () => new EventEmitter()
    );
    const logger = makeLogger();

    createRedisClient('redis://r', { logger, label: 'a' });
    createRedisClient('redis://r', { logger, label: 'b', subscriber: true });

    const [, cmdOpts] = (Redis as unknown as jest.Mock).mock.calls.at(-2)!;
    const [, subOpts] = (Redis as unknown as jest.Mock).mock.calls.at(-1)!;
    expect(cmdOpts.retryStrategy).toBe(redisRetryStrategy);
    expect(cmdOpts.enableOfflineQueue).toBe(false);
    expect(subOpts.retryStrategy).toBe(redisRetryStrategy);
    expect(subOpts.maxRetriesPerRequest).toBeNull();
  });
});
