import { BadRequestException, NotFoundException } from '@nestjs/common';
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

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
  }));
});

const createInput = (
  overrides: Partial<CreateCharacterInput> = {}
): CreateCharacterInput => ({
  name: 'Newbie',
  level: 1,
  alignment: 0,
  strength: 13,
  intelligence: 13,
  wisdom: 13,
  dexterity: 13,
  constitution: 13,
  charisma: 13,
  luck: 13,
  gender: 'neutral',
  race: Race.ELF,
  classId: 7,
  ...overrides,
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
      findOne: jest.fn().mockResolvedValue({ playable: true }),
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
});
