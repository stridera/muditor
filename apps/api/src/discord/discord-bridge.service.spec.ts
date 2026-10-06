import type { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';
import Redis from 'ioredis';
import type { DatabaseService } from '../database/database.service';
import { DiscordBridgeService } from './discord-bridge.service';
import type { DiscordService } from './discord.service';

jest.mock('ioredis', () => jest.fn());

const make = (env: Record<string, string | undefined>) =>
  new DiscordBridgeService(
    { get: (key: string) => env[key] } as unknown as ConfigService,
    {} as DiscordService,
    {} as DatabaseService
  );

describe('DiscordBridgeService redis', () => {
  beforeEach(() => (Redis as unknown as jest.Mock).mockReset());

  it('constructs no client without REDIS_URL', () => {
    const service = make({});
    const log = jest
      .spyOn(
        (service as unknown as { logger: { log: (m: string) => void } }).logger,
        'log'
      )
      .mockImplementation();

    service.onModuleInit();
    service.onModuleDestroy();

    expect(Redis).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0]![0]).toMatch(/Discord bridge disabled/);
  });

  it('connects with an error listener and disconnects on destroy', () => {
    const client = Object.assign(new EventEmitter(), {
      subscribe: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn(),
    });
    (Redis as unknown as jest.Mock).mockImplementation(() => client);
    const service = make({ REDIS_URL: 'redis://r:6379' });
    jest
      .spyOn(
        (service as unknown as { logger: { log: (m: string) => void } }).logger,
        'log'
      )
      .mockImplementation();

    service.onModuleInit();
    expect(client.listenerCount('error')).toBeGreaterThan(0);

    service.onModuleDestroy();
    expect(client.disconnect).toHaveBeenCalledTimes(1);
  });
});
