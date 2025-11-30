/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- Test file intentionally bypasses exhaustive Prisma model typing; we only validate resolver mapping logic.
import { Test, TestingModule } from '@nestjs/testing';
import { DamageType, Race } from '@prisma/client';
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
        name: 'A test mob',
        roomDescription: 'A longer description',
        examineDescription: 'Detailed description',
        role: 'NORMAL',
        mobFlags: [],
        effectFlags: [],
        alignment: 0,
        level: 1,
        armorClass: 10,
        hitRoll: 20,
        move: 0,
        hpDiceNum: 1,
        hpDiceSize: 8,
        hpDiceBonus: 0,
        damageDiceNum: 1,
        damageDiceSize: 4,
        damageDiceBonus: 0,
        damageType: DamageType.HIT,
        position: 'STANDING',
        defaultPosition: 'STANDING',
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
        copper: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
        raceAlign: 0,
        totalWealth: 0,
        averageStats: 13,
        estimatedHp: 0,
        wealth: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null,
        classId: null,
      };

      // Cast to the resolver's expected minimal shape instead of using any
      jest.spyOn(service, 'findOne').mockResolvedValue(
        mockMob as {
          id: number;
          zoneId: number;
          keywords: string[];
          name: string;
          roomDescription: string;
          examineDescription: string;
          race: Race | null;
          hitRoll: number;
          armorClass: number;
          hpDiceNum?: number;
          hpDiceSize?: number;
          hpDiceBonus?: number;
          damageDiceNum?: number;
          damageDiceSize?: number;
          damageDiceBonus?: number;
          damageType: DamageType | string;
        }
      );

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
        name: 'A test mob',
        roomDescription: 'Long desc',
        examineDescription: 'Description',
        race: null,
        role: 'NORMAL',
        hitRoll: 0,
        armorClass: 0,
        hpDiceNum: 1,
        hpDiceSize: 8,
        hpDiceBonus: 0,
        damageDiceNum: 1,
        damageDiceSize: 4,
        damageDiceBonus: 0,
        damageType: DamageType.HIT,
        gender: 'NEUTRAL',
        move: 0,
        alignment: 0,
        level: 1,
        mobFlags: [],
        effectFlags: [],
        strength: 13,
        intelligence: 13,
        wisdom: 13,
        dexterity: 13,
        constitution: 13,
        charisma: 13,
        perception: 0,
        concealment: 0,
        size: 'MEDIUM',
        lifeForce: 'LIFE',
        composition: 'FLESH',
        stance: 'ALERT',
        position: 'STANDING',
        defaultPosition: 'STANDING',
        copper: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
        raceAlign: 0,
        totalWealth: 0,
        averageStats: 13,
        estimatedHp: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null,
        classId: null,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(
        mockMob as {
          id: number;
          zoneId: number;
          keywords: string[];
          name: string;
          roomDescription: string;
          examineDescription: string;
          race: Race | null;
          hitRoll: number;
          armorClass: number;
          hpDice?: string;
          damageDice?: string;
          damageType: DamageType | string;
          mobFlags: unknown[];
          effectFlags: unknown[];
        }
      );

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
        name: 'A new mob',
        roomDescription: 'Description',
        examineDescription: 'Details',
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
        move: 0,
        strength: 13,
        intelligence: 13,
        wisdom: 13,
        dexterity: 13,
        constitution: 13,
        charisma: 13,
        perception: 0,
        concealment: 0,
        copper: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
        raceAlign: 0,
        totalWealth: 0,
        averageStats: 13,
        estimatedHp: 0,
        gender: 'NEUTRAL',
        size: 'MEDIUM',
        lifeForce: 'LIFE',
        composition: 'FLESH',
        position: 'STANDING',
        stance: 'ALERT',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null,
        classId: null,
        hpDiceNum: 2,
        hpDiceSize: 8,
        hpDiceBonus: 4,
        damageDiceNum: 2,
        damageDiceSize: 6,
        damageDiceBonus: 3,
        role: 'NORMAL',
        damageType: DamageType.SLASH,
      };
      jest.spyOn(service, 'create').mockResolvedValue(
        mockCreatedMob as {
          id: number;
          zoneId: number;
          keywords: string[];
          name: string;
          roomDescription: string;
          examineDescription: string;
          race: Race;
          hitRoll: number;
          armorClass: number;
          hpDiceNum: number;
          hpDiceSize: number;
          hpDiceBonus: number;
          damageDiceNum: number;
          damageDiceSize: number;
          damageDiceBonus: number;
          damageType: DamageType | string;
          mobFlags: unknown[];
          effectFlags: unknown[];
          alignment: number;
          level: number;
          strength: number;
          intelligence: number;
          wisdom: number;
          dexterity: number;
          constitution: number;
          charisma: number;
          perception: number;
          concealment: number;
          wealth: number;
          gender: string;
          size: string;
          lifeForce: string;
          composition: string;
          position: string;
          stance: string;
          createdAt: Date;
          updatedAt: Date;
        }
      );

      const result = await resolver.createMob(
        createData as unknown as {
          id: number;
          zoneId: number;
          keywords: string[];
          name: string;
          roomDescription: string;
          examineDescription: string;
          race: Race;
          hitRoll: number;
          armorClass: number;
          hpDice: string;
          damageDice: string;
          damageType: DamageType;
        }
      );

      expect(result.race).toBe(Race.ELF);
      expect(result.hitRoll).toBe(25);
      expect(result.armorClass).toBe(5);
      expect(result.damageDice).toBe('2d6+3');
      expect(result.hpDice).toBe('2d8+4');
    });
  });
});
