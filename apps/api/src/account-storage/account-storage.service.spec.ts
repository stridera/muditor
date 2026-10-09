import { BadRequestException } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service';
import { AccountStorageService } from './account-storage.service';

/**
 * In-memory stand-in for the two tables the wealth flows touch. Reads yield to
 * the event loop (so concurrent callers interleave exactly where a real
 * round-trip would); `updateMany` evaluates its `where` and applies the write
 * in one synchronous step, like a single conditional SQL UPDATE.
 */
function makeDb(characterWealth: bigint, accountWealth: bigint) {
  const state = { characterWealth, accountWealth };
  const tick = () => new Promise<void>(resolve => setImmediate(resolve));
  const tx = {
    characters: {
      updateMany: jest.fn(
        async ({ where, data }: { where: any; data: any }) => {
          await Promise.resolve();
          if (state.characterWealth < where.wealth.gte) return { count: 0 };
          state.characterWealth -= data.wealth.decrement;
          return { count: 1 };
        }
      ),
      update: jest.fn(async ({ data }: { data: any }) => {
        state.characterWealth += data.wealth.increment;
      }),
    },
    users: {
      updateMany: jest.fn(
        async ({ where, data }: { where: any; data: any }) => {
          await Promise.resolve();
          if (state.accountWealth < where.accountWealth.gte)
            return { count: 0 };
          state.accountWealth -= data.accountWealth.decrement;
          return { count: 1 };
        }
      ),
      update: jest.fn(async ({ data }: { data: any }) => {
        state.accountWealth += data.accountWealth.increment;
        return { accountWealth: state.accountWealth };
      }),
      findUniqueOrThrow: jest.fn(async () => ({
        accountWealth: state.accountWealth,
      })),
    },
  };
  const db = {
    characters: {
      findFirst: jest.fn(async () => {
        await tick();
        return { id: 'c1', wealth: state.characterWealth };
      }),
    },
    users: {
      findUnique: jest.fn(async () => {
        await tick();
        return { accountWealth: state.accountWealth };
      }),
    },
    $transaction: jest.fn(async (fn: (t: typeof tx) => Promise<unknown>) => {
      await tick();
      return fn(tx);
    }),
  };
  return { db: db as unknown as DatabaseService, state };
}

describe('AccountStorageService wealth transfers', () => {
  it('lets only one of two concurrent deposits of the full balance succeed', async () => {
    const { db, state } = makeDb(100n, 0n);
    const service = new AccountStorageService(db);
    const results = await Promise.allSettled([
      service.depositWealth('u1', 'c1', 100n),
      service.depositWealth('u1', 'c1', 100n),
    ]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find(r => r.status === 'rejected') as
      | PromiseRejectedResult
      | undefined;
    expect(rejected?.reason).toBeInstanceOf(BadRequestException);
    expect(state).toEqual({ characterWealth: 0n, accountWealth: 100n });
  });

  it('lets only one of many concurrent withdrawals spend the same coins', async () => {
    const { db, state } = makeDb(0n, 100n);
    const service = new AccountStorageService(db);
    const results = await Promise.allSettled(
      Array.from({ length: 5 }, () => service.withdrawWealth('u1', 'c1', 100n))
    );
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    expect(state).toEqual({ characterWealth: 100n, accountWealth: 0n });
  });

  it('still transfers normally when funds suffice', async () => {
    const { db, state } = makeDb(50n, 30n);
    const service = new AccountStorageService(db);
    await expect(service.depositWealth('u1', 'c1', 20n)).resolves.toBe(50n);
    await expect(service.withdrawWealth('u1', 'c1', 10n)).resolves.toBe(40n);
    expect(state).toEqual({ characterWealth: 40n, accountWealth: 40n });
  });
});
