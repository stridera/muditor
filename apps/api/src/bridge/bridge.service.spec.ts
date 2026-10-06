import type { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';
import Redis from 'ioredis';
import { BridgeService } from './bridge.service';

jest.mock('ioredis', () => jest.fn());

const config = (env: Record<string, string | undefined>) =>
  ({ get: (key: string) => env[key] }) as unknown as ConfigService;

describe('BridgeService redis', () => {
  beforeEach(() => (Redis as unknown as jest.Mock).mockReset());

  it('constructs no client without REDIS_URL', () => {
    const service = new BridgeService(config({}));
    const log = jest
      .spyOn(
        (service as unknown as { logger: { log: (m: string) => void } }).logger,
        'log'
      )
      .mockImplementation();

    service.onModuleInit();

    expect(Redis).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0]![0]).toMatch(/Redis not configured/);
    expect(service.getConnectionStatus()).toBe(false);
    expect(() => service.onModuleDestroy()).not.toThrow();
  });

  it('subscribes and disconnects on destroy when REDIS_URL is set', async () => {
    const client = Object.assign(new EventEmitter(), {
      subscribe: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn(),
    });
    (Redis as unknown as jest.Mock).mockImplementation(() => client);
    const service = new BridgeService(config({ REDIS_URL: 'redis://r:6379' }));

    service.onModuleInit();
    expect(client.subscribe).toHaveBeenCalledTimes(1);
    expect(client.listenerCount('error')).toBeGreaterThan(0);

    await service.onModuleDestroy();
    expect(client.disconnect).toHaveBeenCalledTimes(1);
  });
});
