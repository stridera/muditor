import { FallbackTtlCounter, InMemoryTtlCounter } from './ttl-counter';

describe('InMemoryTtlCounter', () => {
  let now: number;
  let counter: InMemoryTtlCounter;

  beforeEach(() => {
    now = 1_000_000;
    counter = new InMemoryTtlCounter(() => now);
  });

  it('counts per key and reports remaining TTL', async () => {
    expect(await counter.incr('a', 900, 5)).toBe(1);
    expect(await counter.incr('a', 900, 5)).toBe(2);
    expect(await counter.incr('b', 900, 5)).toBe(1);
    expect(await counter.peek('a')).toEqual({ count: 2, ttlSeconds: 900 });
    now += 100_000;
    expect((await counter.peek('a')).ttlSeconds).toBe(800);
  });

  it('locks after N attempts and refreshes the window at the threshold', async () => {
    for (let i = 0; i < 4; i++) await counter.incr('a', 900, 5);
    now += 600_000;
    expect(await counter.incr('a', 900, 5)).toBe(5);
    // threshold hit: full window again
    expect((await counter.peek('a')).ttlSeconds).toBe(900);
  });

  it('expires after the window and starts over', async () => {
    await counter.incr('a', 900, 5);
    await counter.incr('a', 900, 5);
    now += 900_000;
    expect(await counter.peek('a')).toEqual({ count: 0, ttlSeconds: 0 });
    expect(await counter.incr('a', 900, 5)).toBe(1);
  });

  it('reset clears the counter', async () => {
    await counter.incr('a', 900);
    await counter.reset('a');
    expect(await counter.peek('a')).toEqual({ count: 0, ttlSeconds: 0 });
    expect(await counter.incr('a', 900)).toBe(1);
  });

  it('is atomic across concurrent increments', async () => {
    const counts = await Promise.all(
      Array.from({ length: 10 }, () => counter.incr('a', 900))
    );
    expect(counts).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

describe('FallbackTtlCounter', () => {
  it('uses memory when there is no Redis', async () => {
    const c = new FallbackTtlCounter(() => null);
    expect(await c.incr('k', 60)).toBe(1);
    expect(await c.incr('k', 60)).toBe(2);
    await c.reset('k');
    expect((await c.peek('k')).count).toBe(0);
  });

  it('uses Redis when present and falls back on Redis errors', async () => {
    const redis = {
      incr: jest.fn().mockResolvedValue(7),
      expire: jest.fn().mockResolvedValue(1),
      get: jest.fn(),
      ttl: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
    };
    const onError = jest.fn();
    const c = new FallbackTtlCounter(
      () => redis as never,
      new InMemoryTtlCounter(),
      onError
    );
    expect(await c.incr('k', 60)).toBe(7);
    redis.incr.mockRejectedValue(new Error('down'));
    expect(await c.incr('k', 60)).toBe(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
