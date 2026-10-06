import { BadRequestException } from '@nestjs/common';
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
    disconnect: jest.fn(),
  }));
});

const PLACEHOLDER_ID = 'placeholder-user';
const CALLER_ID = 'real-user';

describe('CharactersService.linkCharacterToUser', () => {
  let db: {
    characters: { findFirst: jest.Mock; update: jest.Mock };
    users: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };
  let tx: {
    characters: { updateMany: jest.Mock };
    users: { delete: jest.Mock };
  };
  let roleCalculator: { updateUserRole: jest.Mock };
  let service: CharactersService;
  let passwordHash: string;

  const owner = (overrides: Record<string, unknown> = {}) => ({
    email: 'venath@legacy.fierymud.local',
    passwordHash: null,
    googleLink: null,
    ...overrides,
  });

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('gamepass', 4);
  });

  beforeEach(() => {
    tx = {
      characters: { updateMany: jest.fn().mockResolvedValue({ count: 2 }) },
      users: { delete: jest.fn().mockResolvedValue({}) },
    };
    db = {
      characters: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'c1',
          name: 'Venath',
          userId: PLACEHOLDER_ID,
          passwordHash,
        }),
        update: jest.fn().mockResolvedValue({}),
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
  });

  it('claims every character of a legacy placeholder and deletes it', async () => {
    await service.linkCharacterToUser(CALLER_ID, 'venath', 'gamepass');

    expect(tx.characters.updateMany).toHaveBeenCalledWith({
      where: { userId: PLACEHOLDER_ID },
      data: { userId: CALLER_ID },
    });
    expect(tx.users.delete).toHaveBeenCalledWith({
      where: { id: PLACEHOLDER_ID },
    });
    expect(db.characters.update).not.toHaveBeenCalled();
    expect(roleCalculator.updateUserRole).toHaveBeenCalledWith(CALLER_ID, {
      allowRaise: true,
    });
  });

  it('still links an unowned character with a plain update', async () => {
    db.characters.findFirst.mockResolvedValue({
      id: 'c1',
      name: 'Venath',
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
    ['a website password', owner({ passwordHash: '$2b$12$abc' })],
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

  it('rejects when the caller already owns the character', async () => {
    db.characters.findFirst.mockResolvedValue({
      id: 'c1',
      name: 'Venath',
      userId: CALLER_ID,
      passwordHash,
    });

    await expect(
      service.linkCharacterToUser(CALLER_ID, 'venath', 'gamepass')
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(db.users.findUnique).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a wrong game password without changing anything', async () => {
    await expect(
      service.linkCharacterToUser(CALLER_ID, 'venath', 'wrong')
    ).rejects.toThrow('Invalid character password');

    expect(db.$transaction).not.toHaveBeenCalled();
    expect(tx.characters.updateMany).not.toHaveBeenCalled();
    expect(tx.users.delete).not.toHaveBeenCalled();
    expect(db.characters.update).not.toHaveBeenCalled();
    expect(roleCalculator.updateUserRole).not.toHaveBeenCalled();
  });
});
