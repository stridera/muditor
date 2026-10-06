import 'reflect-metadata';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { GameLoginCodeStatus, UserRole } from '@muditor/db';
import * as bcrypt from 'bcrypt';
import type { CharactersService } from '../characters/characters.service';
import type { DatabaseService } from '../database/database.service';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import {
  MINIMUM_ROLE_KEY,
  MinimumRoleGuard,
} from '../auth/guards/minimum-role.guard';
import { GameLoginResolver } from './game-login.resolver';
import { GameLoginService, normalizeGameLoginCode } from './game-login.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const bcryptMock = bcrypt as unknown as {
  compare: jest.Mock;
  hash: jest.Mock;
};

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'row-1',
    code: 'ABCDEFGH',
    characterName: 'Strider',
    userId: 'user-1',
    clientIp: '10.0.0.5',
    clientPort: 5555,
    tls: false,
    status: GameLoginCodeStatus.PENDING,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 60_000),
    approvedAt: null,
    approvedByUserId: null,
    consumedAt: null,
    ...overrides,
  };
}

describe('GameLoginService', () => {
  let service: GameLoginService;
  let charactersService: {
    getLockoutRemaining: jest.Mock;
    clearFailedAttempts: jest.Mock;
  };
  let db: {
    users: { findUnique: jest.Mock; update: jest.Mock };
    characters: { updateMany: jest.Mock; findMany: jest.Mock };
    gameLoginCode: {
      findUnique: jest.Mock;
      updateMany: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  beforeEach(() => {
    jest.resetAllMocks();
    db = {
      users: { findUnique: jest.fn(), update: jest.fn() },
      characters: { updateMany: jest.fn(), findMany: jest.fn() },
      gameLoginCode: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    charactersService = {
      getLockoutRemaining: jest.fn().mockResolvedValue(0),
      clearFailedAttempts: jest.fn().mockResolvedValue(undefined),
    };
    service = new GameLoginService(
      db as unknown as DatabaseService,
      charactersService as unknown as CharactersService
    );
  });

  describe('setGamePassword', () => {
    it('rejects passwords shorter than 8 characters', async () => {
      await expect(service.setGamePassword('user-1', 'short')).rejects.toThrow(
        BadRequestException
      );
      expect(db.characters.updateMany).not.toHaveBeenCalled();
    });

    it.each(['code', 'CODE', 'Code'])(
      'rejects the reserved word %s',
      async word => {
        await expect(service.setGamePassword('user-1', word)).rejects.toThrow(
          'That word is reserved at the game login prompt'
        );
        expect(db.characters.updateMany).not.toHaveBeenCalled();
      }
    );

    it('rejects a password equal to the website password', async () => {
      db.users.findUnique.mockResolvedValue({
        id: 'user-1',
        passwordHash: 'site-hash',
      });
      bcryptMock.compare.mockResolvedValue(true);
      await expect(
        service.setGamePassword('user-1', 'website-password')
      ).rejects.toThrow('Game password must differ from your website password');
      expect(bcryptMock.compare).toHaveBeenCalledWith(
        'website-password',
        'site-hash'
      );
      expect(db.characters.updateMany).not.toHaveBeenCalled();
    });

    it('stores a bcrypt hash (cost 12) on all of the user characters', async () => {
      db.users.findUnique.mockResolvedValue({
        id: 'user-1',
        passwordHash: 'site-hash',
      });
      bcryptMock.compare.mockResolvedValue(false);
      bcryptMock.hash.mockResolvedValue('$2b$12$hashed');
      db.characters.updateMany.mockResolvedValue({ count: 2 });
      await expect(
        service.setGamePassword('user-1', 'a-different-pass')
      ).resolves.toBe(true);
      expect(bcryptMock.hash).toHaveBeenCalledWith('a-different-pass', 12);
      expect(db.characters.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { passwordHash: '$2b$12$hashed' },
      });
    });

    it('limits the update to one character when characterName is given', async () => {
      db.users.findUnique.mockResolvedValue({
        id: 'user-1',
        passwordHash: 'x',
      });
      bcryptMock.compare.mockResolvedValue(false);
      bcryptMock.hash.mockResolvedValue('$2b$12$hashed');
      db.characters.updateMany.mockResolvedValue({ count: 1 });
      await service.setGamePassword('user-1', 'a-different-pass', 'Strider');
      expect(db.characters.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          name: { equals: 'Strider', mode: 'insensitive' },
        },
        data: { passwordHash: '$2b$12$hashed' },
      });
    });
  });

  describe('gamePasswordStatus', () => {
    it('reports set/legacy per character', async () => {
      db.characters.findMany.mockResolvedValue([
        { name: 'A', passwordHash: '$2b$12$abc' },
        { name: 'B', passwordHash: 'abXYZ12345' },
        { name: 'C', passwordHash: '' },
      ]);
      await expect(service.gamePasswordStatus('user-1')).resolves.toEqual([
        { characterName: 'A', isSet: true, isLegacyHash: false },
        { characterName: 'B', isSet: true, isLegacyHash: true },
        { characterName: 'C', isSet: false, isLegacyHash: false },
      ]);
    });
  });

  describe('approve', () => {
    it('normalises the code before lookup', async () => {
      db.gameLoginCode.findUnique.mockResolvedValue(null);
      await expect(service.approve('abcd-efgh', 'user-1')).rejects.toThrow(
        NotFoundException
      );
      expect(db.gameLoginCode.findUnique).toHaveBeenCalledWith({
        where: { code: 'ABCDEFGH' },
      });
      expect(normalizeGameLoginCode(' ab cd-ef gh ')).toBe('ABCDEFGH');
    });

    it('is not found when the code has no resolved user', async () => {
      db.gameLoginCode.findUnique.mockResolvedValue(makeRow({ userId: null }));
      await expect(service.approve('ABCD-EFGH', 'user-1')).rejects.toThrow(
        NotFoundException
      );
      expect(db.gameLoginCode.updateMany).not.toHaveBeenCalled();
    });

    it("is not found (no leak) for another user's code", async () => {
      db.gameLoginCode.findUnique.mockResolvedValue(
        makeRow({ userId: 'someone-else' })
      );
      await expect(service.approve('ABCD-EFGH', 'user-1')).rejects.toThrow(
        NotFoundException
      );
      expect(db.gameLoginCode.updateMany).not.toHaveBeenCalled();
    });

    it('approves once; a second concurrent approve fails', async () => {
      db.gameLoginCode.findUnique.mockResolvedValue(makeRow());
      db.gameLoginCode.updateMany
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 0 });

      const first = await service.approve('ABCD-EFGH', 'user-1');
      expect(first).toMatchObject({
        code: 'ABCD-EFGH',
        status: GameLoginCodeStatus.APPROVED,
      });
      expect(db.gameLoginCode.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'row-1',
          status: GameLoginCodeStatus.PENDING,
          expiresAt: { gt: expect.any(Date) },
        },
        data: {
          status: GameLoginCodeStatus.APPROVED,
          approvedAt: expect.any(Date),
          approvedByUserId: 'user-1',
        },
      });

      await expect(service.approve('ABCD-EFGH', 'user-1')).rejects.toThrow(
        NotFoundException
      );
    });

    it('rejects an already-approved code on lookup', async () => {
      db.gameLoginCode.findUnique.mockResolvedValue(
        makeRow({ status: GameLoginCodeStatus.APPROVED })
      );
      await expect(service.approve('ABCD-EFGH', 'user-1')).rejects.toThrow(
        NotFoundException
      );
    });

    it('rejects an expired code', async () => {
      db.gameLoginCode.findUnique.mockResolvedValue(
        makeRow({ expiresAt: new Date(Date.now() - 1000) })
      );
      await expect(service.approve('ABCD-EFGH', 'user-1')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('deny / lookup visibility', () => {
    it('deny does not work on a code with null userId', async () => {
      db.gameLoginCode.findUnique.mockResolvedValue(makeRow({ userId: null }));
      await expect(service.deny('ABCD-EFGH', 'user-1')).rejects.toThrow(
        NotFoundException
      );
      expect(db.gameLoginCode.updateMany).not.toHaveBeenCalled();
    });

    it('lookup hides a null-userId code', async () => {
      db.gameLoginCode.findUnique.mockResolvedValue(makeRow({ userId: null }));
      await expect(service.lookup('ABCD-EFGH', 'user-1')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('throttle', () => {
    it('allows 30 calls per minute per user, then returns 429', async () => {
      db.gameLoginCode.findUnique.mockResolvedValue(makeRow());
      for (let i = 0; i < 30; i++) {
        await service.lookup('ABCD-EFGH', 'user-1');
      }
      await expect(service.lookup('ABCD-EFGH', 'user-1')).rejects.toMatchObject(
        {
          status: 429,
        }
      );
      await expect(service.deny('ABCD-EFGH', 'user-1')).rejects.toMatchObject({
        status: 429,
      });
      // other users are unaffected
      db.gameLoginCode.findUnique.mockResolvedValue(
        makeRow({ userId: 'user-2' })
      );
      await expect(
        service.lookup('ABCD-EFGH', 'user-2')
      ).resolves.toBeDefined();
    });

    it('recovers after the window passes', async () => {
      db.gameLoginCode.findUnique.mockResolvedValue(makeRow());
      const realNow = Date.now();
      const spy = jest.spyOn(Date, 'now').mockReturnValue(realNow);
      for (let i = 0; i < 30; i++) await service.lookup('ABCD-EFGH', 'user-1');
      await expect(service.lookup('ABCD-EFGH', 'user-1')).rejects.toMatchObject(
        {
          status: 429,
        }
      );
      spy.mockReturnValue(realNow + 61_000);
      db.gameLoginCode.findUnique.mockResolvedValue(
        makeRow({ expiresAt: new Date(realNow + 600_000) })
      );
      await expect(
        service.lookup('ABCD-EFGH', 'user-1')
      ).resolves.toBeDefined();
      spy.mockRestore();
    });
  });

  describe('account lock', () => {
    it('accountLockStatus is locked only when lockedUntil is in the future', async () => {
      db.characters.findMany.mockResolvedValue([]);
      db.users.findUnique.mockResolvedValue({
        lockedUntil: new Date(Date.now() + 60_000),
        failedLoginAttempts: 5,
      });
      await expect(service.accountLockStatus('user-1')).resolves.toMatchObject({
        locked: true,
        failedLoginAttempts: 5,
      });
      db.users.findUnique.mockResolvedValue({
        lockedUntil: new Date(Date.now() - 60_000),
        failedLoginAttempts: 5,
      });
      await expect(service.accountLockStatus('user-1')).resolves.toMatchObject({
        locked: false,
      });
      db.users.findUnique.mockResolvedValue({
        lockedUntil: null,
        failedLoginAttempts: 0,
      });
      await expect(service.accountLockStatus('user-1')).resolves.toMatchObject({
        locked: false,
        lockedUntil: null,
      });
    });

    it('accountLockStatus lists character-link lockouts with remaining time', async () => {
      db.users.findUnique.mockResolvedValue({
        lockedUntil: null,
        failedLoginAttempts: 0,
      });
      db.characters.findMany.mockResolvedValue([{ name: 'A' }, { name: 'B' }]);
      charactersService.getLockoutRemaining.mockImplementation(
        async (n: string) => (n === 'B' ? 120 : 0)
      );
      const status = await service.accountLockStatus('user-1');
      expect(status.characterLinkLockouts).toEqual([
        { characterName: 'B', remainingSeconds: 120 },
      ]);
    });

    it('clearAccountLock resets both fields and clears redis per character', async () => {
      db.characters.findMany.mockResolvedValue([{ name: 'A' }, { name: 'B' }]);
      db.users.findUnique.mockResolvedValue({
        lockedUntil: null,
        failedLoginAttempts: 0,
      });
      const status = await service.clearAccountLock('user-1', '1.2.3.4');
      expect(db.users.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { lockedUntil: null, failedLoginAttempts: 0 },
      });
      expect(charactersService.clearFailedAttempts).toHaveBeenCalledTimes(2);
      expect(charactersService.clearFailedAttempts).toHaveBeenCalledWith('A');
      expect(charactersService.clearFailedAttempts).toHaveBeenCalledWith('B');
      expect(status.locked).toBe(false);
    });

    it('clearAccountLock is throttled', async () => {
      db.characters.findMany.mockResolvedValue([]);
      db.users.findUnique.mockResolvedValue(null);
      for (let i = 0; i < 30; i++) await service.clearAccountLock('user-1');
      await expect(service.clearAccountLock('user-1')).rejects.toMatchObject({
        status: 429,
      });
    });

    it('lookup reports accountLocked/lockedUntil from the code user', async () => {
      const until = new Date(Date.now() + 60_000);
      db.gameLoginCode.findUnique.mockResolvedValue(makeRow());
      db.users.findUnique.mockResolvedValue({ lockedUntil: until });
      await expect(
        service.lookup('ABCD-EFGH', 'user-1')
      ).resolves.toMatchObject({ accountLocked: true, lockedUntil: until });
    });
  });

  describe('sweep', () => {
    it('expires stale pending codes and deletes old ones', async () => {
      const now = new Date('2026-01-02T00:00:00Z');
      await service.sweep(now);
      expect(db.gameLoginCode.updateMany).toHaveBeenCalledWith({
        where: { status: GameLoginCodeStatus.PENDING, expiresAt: { lt: now } },
        data: { status: GameLoginCodeStatus.EXPIRED },
      });
      expect(db.gameLoginCode.deleteMany).toHaveBeenCalledWith({
        where: { createdAt: { lt: new Date('2026-01-01T00:00:00Z') } },
      });
    });
  });
});

describe('GameLoginResolver guard metadata', () => {
  const proto = GameLoginResolver.prototype as unknown as Record<
    string,
    object
  >;
  const methods = [
    'gameLoginCode',
    'approveGameLogin',
    'denyGameLogin',
    'gamePasswordStatus',
    'setGamePassword',
    'accountLockStatus',
    'clearAccountLock',
  ];

  it.each(methods)('%s requires login and PLAYER role', method => {
    expect(Reflect.getMetadata(GUARDS_METADATA, proto[method]!)).toEqual(
      expect.arrayContaining([GraphQLJwtAuthGuard, MinimumRoleGuard])
    );
    expect(Reflect.getMetadata(MINIMUM_ROLE_KEY, proto[method]!)).toBe(
      UserRole.PLAYER
    );
  });
});
