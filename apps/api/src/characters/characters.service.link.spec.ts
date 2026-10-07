import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type { GameAdminService } from '../bridge/game-admin.service';
import type { DatabaseService } from '../database/database.service';
import type { RacesService } from '../races/races.service';
import type { RoleCalculatorService } from '../users/services/role-calculator.service';
import { CharactersService } from './characters.service';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    disconnect: jest.fn(),
  }));
});

const PLACEHOLDER_ID = 'placeholder-user';
const CALLER_ID = 'real-user';

describe('CharactersService.linkCharacterToUser', () => {
  let db: {
    characters: {
      findFirst: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    users: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };
  let tx: {
    characters: { updateMany: jest.Mock };
    users: { findUnique: jest.Mock; update: jest.Mock };
  };
  let roleCalculator: { updateUserRole: jest.Mock };
  let service: CharactersService;
  let redis: {
    incr: jest.Mock;
    expire: jest.Mock;
    del: jest.Mock;
    get: jest.Mock;
    ttl: jest.Mock;
  };
  let passwordHash: string;

  const owner = (overrides: Record<string, unknown> = {}) => ({
    email: 'venath@legacy.fierymud.local',
    passwordHash: null,
    deletedAt: null,
    googleLink: null,
    ...overrides,
  });

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('gamepass', 4);
  });

  beforeEach(() => {
    tx = {
      characters: { updateMany: jest.fn().mockResolvedValue({ count: 2 }) },
      users: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ email: 'venath@legacy.fierymud.local' }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    db = {
      characters: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'c1',
          name: 'Venath',
          level: 30,
          userId: PLACEHOLDER_ID,
          passwordHash,
        }),
        update: jest.fn().mockResolvedValue({}),
        count: jest.fn().mockResolvedValue(0),
      },
      users: { findUnique: jest.fn().mockResolvedValue(owner()) },
      $transaction: jest.fn(async (fn: (t: typeof tx) => Promise<unknown>) =>
        fn(tx)
      ),
    };
    roleCalculator = { updateUserRole: jest.fn().mockResolvedValue('PLAYER') };
    service = new CharactersService(
      db as unknown as DatabaseService,
      roleCalculator as unknown as RoleCalculatorService,
      { get: jest.fn() } as unknown as ConfigService,
      {} as RacesService,
      {} as GameAdminService
    );
    redis = {
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      del: jest.fn().mockResolvedValue(1),
      get: jest.fn().mockResolvedValue(null),
      ttl: jest.fn().mockResolvedValue(600),
    };
    (service as unknown as { redis: unknown }).redis = redis;
  });

  it('claims every character of a legacy placeholder and soft-deletes it', async () => {
    await service.linkCharacterToUser(CALLER_ID, 'venath', 'gamepass');

    expect(tx.characters.updateMany).toHaveBeenCalledWith({
      where: { userId: PLACEHOLDER_ID },
      data: { userId: CALLER_ID },
    });
    expect(tx.users.update).toHaveBeenCalledTimes(1);
    const arg = tx.users.update.mock.calls[0][0];
    expect(arg.where).toEqual({ id: PLACEHOLDER_ID });
    expect(arg.data.deletedAt).toBeInstanceOf(Date);
    expect(arg.data.passwordHash).toBeNull();
    expect(arg.data.email).toMatch(
      /^venath@legacy\.fierymud\.local\.claimed-\d+$/
    );
    expect(db.characters.update).not.toHaveBeenCalled();
    expect(roleCalculator.updateUserRole).toHaveBeenCalledWith(CALLER_ID, {
      allowRaise: true,
    });
  });

  it('claims a placeholder that has a website password hash set', async () => {
    db.users.findUnique.mockResolvedValue(
      owner({ passwordHash: '$2b$12$abc' })
    );
    await service.linkCharacterToUser(CALLER_ID, 'venath', 'gamepass');

    expect(tx.characters.updateMany).toHaveBeenCalledWith({
      where: { userId: PLACEHOLDER_ID },
      data: { userId: CALLER_ID },
    });
    expect(tx.users.update).toHaveBeenCalledTimes(1);
  });

  it('still links an unowned character with a plain update', async () => {
    db.characters.findFirst.mockResolvedValue({
      id: 'c1',
      name: 'Venath',
      level: 30,
      userId: null,
      passwordHash,
    });
    await service.linkCharacterToUser(CALLER_ID, 'venath', 'gamepass');

    expect(db.$transaction).not.toHaveBeenCalled();
    expect(db.characters.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { userId: CALLER_ID },
    });
  });

  it.each([
    ['a real email', owner({ email: 'someone@example.com' })],
    ['a soft-deleted flag', owner({ deletedAt: new Date() })],
    ['a Google link', owner({ googleLink: { id: 'g1' } })],
    ['a missing owner row', null],
  ])('rejects a character owned by an account with %s', async (_l, row) => {
    db.users.findUnique.mockResolvedValue(row);

    await expect(
      service.linkCharacterToUser(CALLER_ID, 'venath', 'gamepass')
    ).rejects.toThrow('already linked to another account');
    expect(db.$transaction).not.toHaveBeenCalled();
    expect(db.characters.update).not.toHaveBeenCalled();
  });

  it('is an idempotent no-op when the caller already owns the character', async () => {
    db.characters.findFirst.mockResolvedValue({
      id: 'c1',
      name: 'Venath',
      level: 30,
      userId: CALLER_ID,
      passwordHash,
    });

    const result = await service.linkCharacterToUser(
      CALLER_ID,
      'venath',
      'not-even-checked'
    );

    expect(result.alreadyLinked).toBe(true);
    expect(result.message).toBe('Character is already linked to your account');
    expect(result.character.name).toBe('Venath');
    expect(redis.incr).not.toHaveBeenCalled();
    expect(db.users.findUnique).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
    expect(db.characters.update).not.toHaveBeenCalled();
    expect(roleCalculator.updateUserRole).not.toHaveBeenCalled();
  });

  it('still rejects a character owned by a different real account', async () => {
    db.characters.findFirst.mockResolvedValue({
      id: 'c1',
      name: 'Venath',
      level: 30,
      userId: 'someone-else',
      passwordHash,
    });
    db.users.findUnique.mockResolvedValue(
      owner({ email: 'other@example.com' })
    );

    await expect(
      service.linkCharacterToUser(CALLER_ID, 'venath', 'gamepass')
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(db.characters.update).not.toHaveBeenCalled();
  });

  it('rejects a wrong game password without changing anything', async () => {
    await expect(
      service.linkCharacterToUser(CALLER_ID, 'venath', 'wrong')
    ).rejects.toThrow('Invalid character password');

    expect(db.$transaction).not.toHaveBeenCalled();
    expect(tx.characters.updateMany).not.toHaveBeenCalled();
    expect(tx.users.update).not.toHaveBeenCalled();
    expect(db.characters.update).not.toHaveBeenCalled();
    expect(roleCalculator.updateUserRole).not.toHaveBeenCalled();
  });

  it('refuses to claim a placeholder that owns a level 100+ character', async () => {
    db.characters.count.mockResolvedValue(1);

    await expect(
      service.linkCharacterToUser(CALLER_ID, 'venath', 'gamepass')
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(redis.incr).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('refuses to link a level 100+ character', async () => {
    db.characters.findFirst.mockResolvedValue({
      id: 'c1',
      name: 'Venath',
      level: 100,
      userId: null,
      passwordHash,
    });

    await expect(
      service.linkCharacterToUser(CALLER_ID, 'venath', 'gamepass')
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(db.characters.update).not.toHaveBeenCalled();
  });

  it('links without Redis (in-memory lockout), never failing closed', async () => {
    (service as unknown as { redis: unknown }).redis = null;
    db.characters.findFirst.mockResolvedValue({
      id: 'c1',
      name: 'Venath',
      level: 30,
      userId: null,
      passwordHash,
    });

    const result = await service.linkCharacterToUser(
      CALLER_ID,
      'venath',
      'gamepass'
    );

    expect(result.alreadyLinked).toBe(false);
    expect(db.characters.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { userId: CALLER_ID },
    });
  });
});
