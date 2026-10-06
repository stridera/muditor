import type { ConfigService } from '@nestjs/config';
import { GameAdminService } from './game-admin.service';

const config = {
  get: (key: string) =>
    ({
      FIERYMUD_ADMIN_URL: 'http://mud.test:8080',
      FIERYMUD_ADMIN_TOKEN: 'tok',
    })[key],
} as unknown as ConfigService;

const jsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'ERR',
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  }) as unknown as Response;

const playersBody = {
  count: 2,
  players: [
    {
      name: 'Bob',
      level: 25,
      class: 'Warrior',
      race: 'HUMAN',
      room: { zone_id: 30, id: 45 },
      idle_seconds: 4,
      connected_seconds: 120,
    },
    {
      name: 'Strider',
      level: 104,
      class: null,
      race: 'HUMAN',
      room: null,
      idle_seconds: 0,
      connected_seconds: 9,
    },
  ],
};

describe('GameAdminService.getOnlinePlayers', () => {
  let fetchMock: jest.SpyInstance;
  let nowMock: jest.SpyInstance;
  let clock: number;
  let service: GameAdminService;

  beforeEach(() => {
    clock = 1_000_000;
    nowMock = jest.spyOn(Date, 'now').mockImplementation(() => clock);
    fetchMock = jest.spyOn(globalThis, 'fetch');
    service = new GameAdminService(config);
  });

  afterEach(() => {
    fetchMock.mockRestore();
    nowMock.mockRestore();
  });

  it('maps the game server player list', async () => {
    fetchMock.mockResolvedValue(jsonResponse(playersBody));

    const players = await service.getOnlinePlayers();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://mud.test:8080/api/admin/players'
    );
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer tok');
    expect(players).toHaveLength(2);
    expect(players[0]).toMatchObject({
      name: 'Bob',
      level: 25,
      class: 'Warrior',
      roomZoneId: 30,
      roomId: 45,
      godLevel: 0,
    });
    expect(players[1]).toMatchObject({ class: '', roomId: 0, godLevel: 5 });
  });

  it('serves repeat calls within 5 s from cache, then refetches', async () => {
    fetchMock.mockResolvedValue(jsonResponse(playersBody));

    await service.getOnlinePlayers();
    clock += 4_999;
    await service.getOnlinePlayers();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    clock += 2;
    await service.getOnlinePlayers();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not cache failures', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'no' }, 401));
    await expect(service.getOnlinePlayers()).rejects.toThrow('HTTP 401');

    fetchMock.mockResolvedValueOnce(jsonResponse(playersBody));
    await expect(service.getOnlinePlayers()).resolves.toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejects when the game server is unreachable', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    await expect(service.getOnlinePlayers()).rejects.toThrow(
      'Failed to connect to FieryMUD admin API'
    );
  });
});
