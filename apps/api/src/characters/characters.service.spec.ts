import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Race } from '@muditor/db';
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
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    characterClass: { findUnique: jest.Mock };
  };
  let racesService: { findOne: jest.Mock };
  let service: CharactersService;

  beforeEach(() => {
    db = {
      characters: {
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
    service = new CharactersService(
      db as unknown as DatabaseService,
      {} as RoleCalculatorService,
      { get: jest.fn() } as unknown as ConfigService,
      racesService as unknown as RacesService
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
});
