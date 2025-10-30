import { Test, TestingModule } from '@nestjs/testing';
import { Race } from '@prisma/client';
import { MobsResolver } from '../mobs.resolver';
import { MobsService } from '../mobs.service';

describe('MobsResolver', () => {
  let resolver: MobsResolver;
  let service: MobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobsResolver,
        {
          provide: MobsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByZone: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<MobsResolver>(MobsResolver);
    service = module.get<MobsService>(MobsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('mob queries', () => {
    it('should return mobs with correct field types', async () => {
      const mockMob = {
        id: 1,
        zoneId: 30,
        keywords: ['test', 'mob'],
        shortDesc: 'A test mob',
        longDesc: 'A longer description',
        description: 'Detailed description',
        mobFlags: [],
        effectFlags: [],
        alignment: 0,
        level: 1,
        armorClass: 10,
        hitRoll: 20,
        hpDice: '1d8+0',
        damageDice: '1d4+0',
        damageType: 'HIT',
        position: 'STANDING',
        stance: 'ALERT',
        gender: 'NEUTRAL',
        race: Race.HUMAN,
        size: 'MEDIUM',
        strength: 13,
        intelligence: 13,
        wisdom: 13,
        dexterity: 13,
        constitution: 13,
        charisma: 13,
        perception: 0,
        concealment: 0,
        lifeForce: 'LIFE',
        composition: 'FLESH',
        wealth: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockMob as any);

      const result = await resolver.findOne(30, 1);

      expect(result).toBeDefined();
      expect(result?.race).toBe(Race.HUMAN);
      expect(result?.hitRoll).toBe(20);
      expect(result?.armorClass).toBe(10);
      expect(result?.damageDice).toBe('1d4+0');
      expect(result?.hpDice).toBe('1d8+0');
    });

    it('should handle null race values', async () => {
      const mockMob = {
        id: 1,
        zoneId: 30,
        keywords: ['test'],
        shortDesc: 'A test mob',
        longDesc: 'Long desc',
        description: 'Description',
        race: null,
        hitRoll: 0,
        armorClass: 0,
        hpDice: '1d8+0',
        damageDice: '1d4+0',
        damageType: 'HIT',
        gender: 'NEUTRAL',
        mobFlags: [],
        effectFlags: [],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockMob as any);

      const result = await resolver.findOne(30, 1);
      expect(result?.race).toBeNull();
    });
  });

  describe('mob creation', () => {
    it('should preserve all stat values during creation', async () => {
      const createData = {
        id: 1,
        zoneId: 30,
        keywords: ['new', 'mob'],
        shortDesc: 'A new mob',
        longDesc: 'Description',
        description: 'Details',
        race: Race.ELF,
        hitRoll: 25,
        armorClass: 5,
        hpDice: '2d8+4',
        damageDice: '2d6+3',
        damageType: 'SLASH',
      };

      const mockCreatedMob = {
        ...createData,
        id: 1,
        zoneId: 30,
        mobFlags: [],
        effectFlags: [],
        alignment: 0,
        level: 1,
        strength: 13,
        intelligence: 13,
        wisdom: 13,
        dexterity: 13,
        constitution: 13,
        charisma: 13,
        perception: 0,
        concealment: 0,
        wealth: 0,
        gender: 'NEUTRAL',
        size: 'MEDIUM',
        lifeForce: 'LIFE',
        composition: 'FLESH',
        position: 'STANDING',
        stance: 'ALERT',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockCreatedMob as any);

      const result = await resolver.createMob(createData as any);

      expect(result.race).toBe(Race.ELF);
      expect(result.hitRoll).toBe(25);
      expect(result.armorClass).toBe(5);
      expect(result.damageDice).toBe('2d6+3');
      expect(result.hpDice).toBe('2d8+4');
    });
  });
});
