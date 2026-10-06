import type { ConfigService } from '@nestjs/config';
import type { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import { RateLimitGuard } from './rate-limit.guard';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    disconnect: jest.fn(),
  }));
});

const makeGuard = (env: Record<string, string | undefined> = {}) =>
  new RateLimitGuard(
    {} as Reflector,
    { get: jest.fn((key: string) => env[key]) } as unknown as ConfigService
  );

describe('RateLimitGuard redis lifecycle', () => {
  beforeEach(() => {
    (Redis as unknown as jest.Mock).mockClear();
  });

  it('constructs no client without REDIS_URL and fails open', async () => {
    const guard = makeGuard();
    expect(Redis).not.toHaveBeenCalled();
    await expect(guard.canActivate({} as never)).resolves.toBe(true);
    expect(() => guard.onModuleDestroy()).not.toThrow();
  });

  it('constructs no client when REDIS_URL is empty', () => {
    makeGuard({ REDIS_URL: '' });
    expect(Redis).not.toHaveBeenCalled();
  });

  it('disconnects (not quit) the redis client on module destroy', () => {
    const guard = makeGuard({ REDIS_URL: 'redis://example:6379' });
    const client = (Redis as unknown as jest.Mock).mock.results[0]!.value;

    guard.onModuleDestroy();

    expect(client.disconnect).toHaveBeenCalledTimes(1);
  });
});
