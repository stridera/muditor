import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { ConfigService } from '@nestjs/config';
import { Race } from '@muditor/db';
import type { GameAdminService } from '../bridge/game-admin.service';
import type { DatabaseService } from '../database/database.service';
import type { RacesService } from '../races/races.service';
import type { RoleCalculatorService } from '../users/services/role-calculator.service';
import type {
  CreateCharacterInput,
  UpdateCharacterInput,
} from './character.input';
import { CharactersService } from './characters.service';
import { issueStatRoll } from './stat-roll';

process.env.JWT_SECRET = 'test-secret-for-stat-rolls';

jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn() }));

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    disconnect: jest.fn(),
  }));
});

// Rolled values for user-1; createInput() assigns them in roll order.
const ROLL: [number, number, number, number, number, number, number] = [
  15, 12, 9, 14, 11, 16, 8,
];
type InputOverrides = {
  [K in keyof CreateCharacterInput]?: CreateCharacterInput[K] | undefined;
};
const createInput = (overrides: InputOverrides = {}): CreateCharacterInput => {
  const input: CreateCharacterInput = {
    name: 'Newbie',
    level: 1,
    alignment: 0,
    strength: ROLL[0],
    intelligence: ROLL[1],
    wisdom: ROLL[2],
    dexterity: ROLL[3],
    constitution: ROLL[4],
    charisma: ROLL[5],
    luck: ROLL[6],
    gender: 'neutral',
    race: Race.ELF,
    classId: 7,
    statRollToken: issueStatRoll('user-1', ROLL).token,
  };
  // An explicit undefined override removes the field (e.g. no roll token).
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined)
      delete (input as unknown as Record<string, unknown>)[key];
    else (input as unknown as Record<string, unknown>)[key] = value;
  }
  return input;
};

// Races row with the schema-default caps (76); override to lower specific ones.
const raceRow = (caps: Record<string, number> = {}) => ({
  playable: true,
  maxStrength: 76,
  maxDexterity: 76,
  maxIntelligence: 76,
  maxWisdom: 76,
  maxConstitution: 76,
  maxCharisma: 76,
  ...caps,
});

describe('CharactersService race/class handling', () => {
  let db: {
    characters: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    characterClass: { findUnique: jest.Mock };
  };
  let racesService: { findOne: jest.Mock };
  let gameAdmin: { getOnlinePlayers: jest.Mock };
  let service: CharactersService;

  beforeEach(() => {
    db = {
      characters: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'c1' }),
        update: jest.fn().mockResolvedValue({ id: 'c1' }),
      },
      characterClass: {
        findUnique: jest.fn().mockResolvedValue({ id: 7 }),
      },
    };
    racesService = {
      findOne: jest.fn().mockResolvedValue(raceRow()),
    };
    gameAdmin = { getOnlinePlayers: jest.fn().mockResolvedValue([]) };
    service = new CharactersService(
      db as unknown as DatabaseService,
      {} as RoleCalculatorService,
      { get: jest.fn() } as unknown as ConfigService,
      racesService as unknown as RacesService,
      gameAdmin as unknown as GameAdminService
    );
  });

  describe('createCharacter', () => {
    it('passes race and a classId connect (not raceId) to prisma', async () => {
      db.characters.findUnique.mockResolvedValue(null);
      await service.createCharacter(createInput(), 'user-1');

      expect(db.characters.create).toHaveBeenCalledTimes(1);
      const { data } = db.characters.create.mock.calls[0][0];
      expect(data.race).toBe(Race.ELF);
      expect(data.characterClass).toEqual({ connect: { id: 7 } });
      expect(data.users).toEqual({ connect: { id: 'user-1' } });
      expect(data).not.toHaveProperty('raceId');
      expect(data).not.toHaveProperty('classId');
    });

    describe('stat roll + assign', () => {
      beforeEach(() => db.characters.findUnique.mockResolvedValue(null));

      it('rejects arbitrary stats from a player without a roll token', async () => {
        await expect(
          service.createCharacter(
            createInput({
              statRollToken: undefined,
              strength: 18,
              intelligence: 18,
              wisdom: 18,
              dexterity: 18,
              constitution: 18,
              charisma: 18,
              luck: 18,
            }),
            'user-1'
          )
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(db.characters.create).not.toHaveBeenCalled();
      });

      it('rejects stats that are not a permutation of the issued roll', async () => {
        await expect(
          service.createCharacter(createInput({ strength: 18 }), 'user-1')
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(db.characters.create).not.toHaveBeenCalled();
      });

      it('rejects a roll token issued to another user', async () => {
        await expect(
          service.createCharacter(createInput(), 'someone-else')
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(db.characters.create).not.toHaveBeenCalled();
      });

      it('rejects a tampered roll token', async () => {
        const token = issueStatRoll(
          'user-1',
          [18, 18, 18, 18, 18, 18, 18]
        ).token;
        const forged = `${token.split('.')[0]}.${'A'.repeat(43)}`;
        await expect(
          service.createCharacter(
            createInput({
              statRollToken: forged,
              strength: 18,
              intelligence: 18,
              wisdom: 18,
              dexterity: 18,
              constitution: 18,
              charisma: 18,
              luck: 18,
            }),
            'user-1'
          )
        ).rejects.toBeInstanceOf(BadRequestException);
      });

      it('accepts any assignment (permutation) of the issued roll', async () => {
        const swapped = createInput({
          strength: ROLL[6],
          luck: ROLL[0],
          intelligence: ROLL[5],
          charisma: ROLL[1],
        });
        await service.createCharacter(swapped, 'user-1');
        const { data } = db.characters.create.mock.calls[0][0];
        expect(data).toMatchObject({
          strength: 8,
          luck: 15,
          intelligence: 16,
          charisma: 12,
        });
      });

      it('clamps a stat above the race cap, as the game does at creation', async () => {
        // Brute-style race: INT capped at 12. Player puts the rolled 16 there.
        racesService.findOne.mockResolvedValue(
          raceRow({ maxIntelligence: 12 })
        );
        await service.createCharacter(
          createInput({ intelligence: ROLL[5], charisma: ROLL[1] }),
          'user-1'
        );
        const { data } = db.characters.create.mock.calls[0][0];
        expect(data.intelligence).toBe(12);
        expect(data.charisma).toBe(12);
        // Uncapped stats keep their rolled values.
        expect(data.strength).toBe(ROLL[0]);
      });

      it('leaves stats alone for races whose caps are not lowered', async () => {
        await service.createCharacter(createInput(), 'user-1');
        const { data } = db.characters.create.mock.calls[0][0];
        expect(data).toMatchObject({
          strength: ROLL[0],
          intelligence: ROLL[1],
          wisdom: ROLL[2],
          dexterity: ROLL[3],
          constitution: ROLL[4],
          charisma: ROLL[5],
          luck: ROLL[6],
        });
      });

      it('still rejects a non-permutation before looking at race caps', async () => {
        racesService.findOne.mockResolvedValue(raceRow({ maxStrength: 10 }));
        await expect(
          service.createCharacter(createInput({ strength: 18 }), 'user-1')
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(db.characters.create).not.toHaveBeenCalled();
      });

      it('lets staff exceed race caps', async () => {
        racesService.findOne.mockResolvedValue(raceRow({ maxStrength: 10 }));
        await service.createCharacter(
          createInput({ statRollToken: undefined, strength: 25 }),
          'user-1',
          { isStaff: true }
        );
        const { data } = db.characters.create.mock.calls[0][0];
        expect(data.strength).toBe(25);
      });

      it('lets staff set stats directly without a roll', async () => {
        await service.createCharacter(
          createInput({
            statRollToken: undefined,
            strength: 25,
            intelligence: 25,
          }),
          'user-1',
          { isStaff: true }
        );
        const { data } = db.characters.create.mock.calls[0][0];
        expect(data).toMatchObject({ strength: 25, intelligence: 25 });
      });
    });

    it('rejects an unknown classId without creating anything', async () => {
      db.characters.findUnique.mockResolvedValue(null);
      db.characterClass.findUnique.mockResolvedValue(null);

      await expect(
        service.createCharacter(createInput({ classId: 9999 }), 'user-1')
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(db.characters.create).not.toHaveBeenCalled();
    });
  });

  describe('playable race enforcement', () => {
    beforeEach(() => {
      db.characters.findUnique.mockResolvedValue(null);
      racesService.findOne.mockResolvedValue({ playable: false });
    });

    it('rejects a non-playable race for non-staff create', async () => {
      await expect(
        service.createCharacter(
          createInput({ race: Race.DRAGON_FIRE }),
          'user-1'
        )
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(racesService.findOne).toHaveBeenCalledWith(Race.DRAGON_FIRE);
      expect(db.characters.create).not.toHaveBeenCalled();
    });

    it('rejects an unknown race for non-staff create', async () => {
      racesService.findOne.mockRejectedValue(new NotFoundException());
      await expect(
        service.createCharacter(createInput(), 'user-1')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('allows staff to create with a non-playable race', async () => {
      await service.createCharacter(
        createInput({ race: Race.DRAGON_FIRE }),
        'user-1',
        { isStaff: true }
      );
      expect(racesService.findOne).not.toHaveBeenCalled();
      expect(db.characters.create).toHaveBeenCalledTimes(1);
    });

    it('rejects a non-playable race on update for non-staff', async () => {
      db.characters.findUnique.mockResolvedValue({ id: 'c1', name: 'Old' });
      await expect(
        service.updateCharacter('c1', {
          race: Race.DRAGON_FIRE,
        } as UpdateCharacterInput)
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(db.characters.update).not.toHaveBeenCalled();
    });

    it('allows staff to update to a non-playable race', async () => {
      db.characters.findUnique.mockResolvedValue({ id: 'c1', name: 'Old' });
      await service.updateCharacter(
        'c1',
        { race: Race.DRAGON_FIRE } as UpdateCharacterInput,
        { isStaff: true }
      );
      expect(db.characters.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateCharacter', () => {
    beforeEach(() => {
      db.characters.findUnique.mockResolvedValue({ id: 'c1', name: 'Old' });
    });

    it('maps race and classId onto the prisma update', async () => {
      await service.updateCharacter('c1', {
        race: Race.DWARF,
        classId: 7,
      } as UpdateCharacterInput);

      const { data } = db.characters.update.mock.calls[0][0];
      expect(data).toEqual({
        race: Race.DWARF,
        characterClass: { connect: { id: 7 } },
      });
    });

    it('rejects an unknown classId on update', async () => {
      db.characterClass.findUnique.mockResolvedValue(null);
      await expect(
        service.updateCharacter('c1', {
          classId: 9999,
        } as UpdateCharacterInput)
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(db.characters.update).not.toHaveBeenCalled();
    });

    it('maps GraphQL field names to prisma columns', async () => {
      await service.updateCharacter('c1', {
        movement: 50,
        currentRoom: 12,
      } as UpdateCharacterInput);
      const { data } = db.characters.update.mock.calls[0][0];
      expect(data).toEqual({ stamina: 50, currentRoomId: 12 });
    });
  });

  describe('getOnlineCharacters', () => {
    const livePlayer = (name: string) => ({
      name,
      level: 10,
      class: 'Warrior',
      race: 'HUMAN',
      roomId: 1,
      roomZoneId: 30,
      godLevel: 0,
      isLinkdead: false,
    });
    const row = (id: string, name: string) => ({
      id,
      name,
      level: 10,
      lastLogin: null,
      race: 'HUMAN',
      characterClass: { plainName: 'Warrior' },
      users: { id: `u-${id}`, displayName: name, role: 'PLAYER' },
    });

    it('maps the game server session list onto character rows', async () => {
      gameAdmin.getOnlinePlayers.mockResolvedValue([
        livePlayer('Bob'),
        livePlayer('alice'),
      ]);
      db.characters.findMany.mockResolvedValue([
        row('c1', 'Alice'),
        row('c2', 'Bob'),
      ]);

      const result = await service.getOnlineCharacters();

      expect(result.map(c => c.name)).toEqual(['Alice', 'Bob']);
      expect(result[0]).toMatchObject({
        id: 'c1',
        level: 10,
        race: 'HUMAN',
        class: 'Warrior',
      });
      const { where } = db.characters.findMany.mock.calls[0][0];
      expect(where.OR).toEqual([
        { name: { equals: 'Bob', mode: 'insensitive' } },
        { name: { equals: 'alice', mode: 'insensitive' } },
      ]);
      expect(where).not.toHaveProperty('userId');
    });

    it('restricts to one account when userId is given', async () => {
      gameAdmin.getOnlinePlayers.mockResolvedValue([livePlayer('Bob')]);
      await service.getOnlineCharacters('user-1');
      const { where } = db.characters.findMany.mock.calls[0][0];
      expect(where.userId).toBe('user-1');
    });

    it('returns [] when nobody is logged in, without querying the DB', async () => {
      await expect(service.getOnlineCharacters()).resolves.toEqual([]);
      expect(db.characters.findMany).not.toHaveBeenCalled();
    });

    it('returns [] (never recent logins) when the game server is unreachable', async () => {
      gameAdmin.getOnlinePlayers.mockRejectedValue(
        new Error('Failed to connect to FieryMUD admin API')
      );
      const warn = jest
        .spyOn(
          (service as unknown as { logger: { warn: () => void } }).logger,
          'warn'
        )
        .mockImplementation(() => undefined);

      await expect(service.getOnlineCharacters()).resolves.toEqual([]);
      expect(db.characters.findMany).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyCharacterPasswordForLink', () => {
    let redis: {
      incr: jest.Mock;
      expire: jest.Mock;
      del: jest.Mock;
      get: jest.Mock;
      ttl: jest.Mock;
    };
    const unlinked = (overrides: Record<string, unknown> = {}) => ({
      id: 'c1',
      name: 'Newbie',
      level: 20,
      userId: null,
      passwordHash: '$2b$hash',
      ...overrides,
    });
    const compare = bcrypt.compare as unknown as jest.Mock;

    beforeEach(() => {
      redis = {
        incr: jest.fn().mockResolvedValue(1),
        expire: jest.fn().mockResolvedValue(1),
        del: jest.fn().mockResolvedValue(1),
        get: jest.fn().mockResolvedValue(null),
        ttl: jest.fn().mockResolvedValue(600),
      };
      (service as unknown as { redis: unknown }).redis = redis;
      (db.characters as unknown as { findFirst: jest.Mock }).findFirst = jest
        .fn()
        .mockResolvedValue(unlinked());
      compare.mockReset();
    });

    const findFirst = () =>
      (db.characters as unknown as { findFirst: jest.Mock }).findFirst;

    it('refuses level 100+ characters before any password check', async () => {
      findFirst().mockResolvedValue(unlinked({ level: 100 }));
      await expect(
        service.verifyCharacterPasswordForLink('Newbie', 'pw')
      ).rejects.toThrow(ForbiddenException);
      expect(redis.incr).not.toHaveBeenCalled();
      expect(compare).not.toHaveBeenCalled();
    });

    describe('without Redis (in-memory store)', () => {
      beforeEach(() => {
        (service as unknown as { redis: unknown }).redis = null;
      });

      it('still verifies the password', async () => {
        compare.mockResolvedValue(true);
        const result = await service.verifyCharacterPasswordForLink(
          'Newbie',
          'pw'
        );
        expect(result.character.name).toBe('Newbie');
        expect(compare).toHaveBeenCalledTimes(1);
      });

      it('counts wrong attempts, then locks out without comparing', async () => {
        compare.mockResolvedValue(false);
        for (const remaining of [4, 3, 2, 1]) {
          await expect(
            service.verifyCharacterPasswordForLink('Newbie', 'bad')
          ).rejects.toThrow(
            `Invalid character password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
          );
        }
        // 5th wrong attempt reaches the limit
        const fifth = await service
          .verifyCharacterPasswordForLink('Newbie', 'bad')
          .catch((e: unknown) => e);
        expect((fifth as HttpException).getStatus()).toBe(429);
        expect(compare).toHaveBeenCalledTimes(5);

        // Further attempts, even with the right password, are locked
        compare.mockResolvedValue(true);
        const locked = await service
          .verifyCharacterPasswordForLink('newbie', 'pw')
          .catch((e: unknown) => e);
        expect((locked as HttpException).getStatus()).toBe(429);
        expect(compare).toHaveBeenCalledTimes(5);
        expect(await service.getLockoutRemaining('NEWBIE')).toBeGreaterThan(0);

        // Clearing (success path / admin unlock) unlocks
        await service.clearFailedAttempts('Newbie');
        expect(await service.getLockoutRemaining('Newbie')).toBe(0);
        await expect(
          service.verifyCharacterPasswordForLink('Newbie', 'pw')
        ).resolves.toBeDefined();
      });

      it('a successful verify resets the counter', async () => {
        compare.mockResolvedValue(false);
        await service
          .verifyCharacterPasswordForLink('Newbie', 'bad')
          .catch(() => undefined);
        compare.mockResolvedValue(true);
        await service.verifyCharacterPasswordForLink('Newbie', 'pw');
        compare.mockResolvedValue(false);
        await expect(
          service.verifyCharacterPasswordForLink('Newbie', 'bad')
        ).rejects.toThrow('4 attempts remaining');
      });
    });

    it('falls back to the in-memory store when Redis errors', async () => {
      redis.incr.mockRejectedValue(new Error('boom'));
      compare.mockResolvedValue(false);
      await expect(
        service.verifyCharacterPasswordForLink('Newbie', 'bad')
      ).rejects.toThrow('Invalid character password. 4 attempts remaining.');
    });

    it('counts the attempt with INCR before comparing, then resets on success', async () => {
      compare.mockResolvedValue(true);
      const order: string[] = [];
      redis.incr.mockImplementation(async () => (order.push('incr'), 1));
      compare.mockImplementation(async () => (order.push('compare'), true));
      await service.verifyCharacterPasswordForLink('Newbie', 'pw');
      expect(order).toEqual(['incr', 'compare']);
      expect(redis.expire).toHaveBeenCalledWith('charlink:lockout:newbie', 900);
      expect(redis.del).toHaveBeenCalledWith('charlink:lockout:newbie');
    });

    it('rejects over the limit as locked without comparing', async () => {
      redis.incr.mockResolvedValue(6);
      redis.get.mockResolvedValue('6');
      const err = await service
        .verifyCharacterPasswordForLink('Newbie', 'pw')
        .catch((e: unknown) => e);
      expect(err).toBeInstanceOf(HttpException);
      expect((err as HttpException).getStatus()).toBe(429);
      expect(compare).not.toHaveBeenCalled();
    });

    it('a wrong password keeps the counter and reports attempts remaining', async () => {
      redis.incr.mockResolvedValue(2);
      compare.mockResolvedValue(false);
      await expect(
        service.verifyCharacterPasswordForLink('Newbie', 'bad')
      ).rejects.toThrow('Invalid character password. 3 attempts remaining.');
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('the limit-reaching wrong attempt reports locked (429)', async () => {
      redis.incr.mockResolvedValue(5);
      compare.mockResolvedValue(false);
      const err = await service
        .verifyCharacterPasswordForLink('Newbie', 'bad')
        .catch((e: unknown) => e);
      expect((err as HttpException).getStatus()).toBe(429);
    });
  });
});
