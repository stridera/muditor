import type { ConfigService } from '@nestjs/config';
import type { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import { RateLimitGuard } from './rate-limit.guard';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
  }));
});

const makeGuard = () =>
  new RateLimitGuard(
    {} as Reflector,
    {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService
  );

describe('RateLimitGuard redis lifecycle', () => {
  beforeEach(() => {
    (Redis as unknown as jest.Mock).mockClear();
  });

  it('disconnects (not quit) the redis client on module destroy', () => {
    const guard = makeGuard();
    const client = (Redis as unknown as jest.Mock).mock.results[0]!.value;

    guard.onModuleDestroy();

    expect(client.disconnect).toHaveBeenCalledTimes(1);
  });

  it('stops the reconnect loop when the initial connect fails', async () => {
    (Redis as unknown as jest.Mock).mockImplementationOnce(() => ({
      connect: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
      disconnect: jest.fn(),
    }));
    makeGuard();
    const client = (Redis as unknown as jest.Mock).mock.results[0]!.value;

    await new Promise(resolve => setImmediate(resolve));

    expect(client.disconnect).toHaveBeenCalledTimes(1);
  });
});
