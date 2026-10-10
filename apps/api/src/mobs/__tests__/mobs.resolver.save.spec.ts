/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- Test file intentionally bypasses exhaustive Prisma model typing.
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { MobsResolver } from '../mobs.resolver';
import { MobsService } from '../mobs.service';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../../auth/guards/minimum-role.guard';
import { ZonePermissionGuard } from '../../auth/guards/zone-permission.guard';

const allowAll = { canActivate: () => true };

// Fields that exist on the API input but are NOT Mobs columns.
const NON_COLUMNS = [
  'hpDice',
  'damageDice',
  'resistanceFire',
  'resistanceCold',
  'resistanceLightning',
  'resistanceAcid',
  'resistancePoison',
];

// The payload mobs/editor/page.tsx handleSave builds.
const editorPayload = {
  keywords: ['goblin', 'scout'],
  name: 'a goblin scout',
  roomDescription: 'A goblin lurks here.',
  examineDescription: 'It looks mean.',
  level: 12,
  role: 'NORMAL',
  resistanceFire: 40,
  resistanceCold: 0,
  resistanceLightning: 0,
  resistanceAcid: 25,
  resistancePoison: 0,
  hpDice: '10d8+50',
  damageDice: '3d6-2',
  damageType: 'HIT',
  race: 'HUMANOID',
};

describe('MobsResolver save payloads', () => {
  let resolver: MobsResolver;
  const service = {
    findOne: jest.fn(),
    findClassById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    assertIdFree: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [MobsResolver, { provide: MobsService, useValue: service }],
    })
      .overrideGuard(OptionalJwtAuthGuard)
      .useValue(allowAll)
      .overrideGuard(GraphQLJwtAuthGuard)
      .useValue(allowAll)
      .overrideGuard(MinimumRoleGuard)
      .useValue(allowAll)
      .overrideGuard(ZonePermissionGuard)
      .useValue(allowAll)
      .compile();
    resolver = module.get(MobsResolver);
    // mapMob needs a plausible row back
    service.update.mockImplementation(async (_z, _i, d) => ({
      ...rowBase(),
      ...d,
    }));
    service.create.mockImplementation(async d => ({ ...rowBase(), ...d }));
  });

  function rowBase() {
    return {
      id: 5,
      zoneId: 30,
      keywords: [],
      name: 'x',
      traits: [],
      behaviors: [],
      professions: [],
      resistances: {},
      hpDiceNum: 0,
      hpDiceSize: 0,
      hpDiceBonus: 0,
      damageDiceNum: 0,
      damageDiceSize: 0,
      damageDiceBonus: 0,
      wealth: 0n,
    };
  }

  describe('updateMob', () => {
    it('sends only real columns to Prisma', async () => {
      service.findOne.mockResolvedValue({
        resistances: { COLD: 20, charm: 0 },
      });
      await resolver.updateMob(30, 5, { ...editorPayload, wealth: 1500 });
      const data = service.update.mock.calls[0][2];
      for (const k of NON_COLUMNS) expect(data).not.toHaveProperty(k);
      expect(data).toMatchObject({
        hpDiceNum: 10,
        hpDiceSize: 8,
        hpDiceBonus: 50,
        damageDiceNum: 3,
        damageDiceSize: 6,
        damageDiceBonus: -2,
        wealth: 1500n,
      });
    });

    it('merges resistances into the stored JSON, keeping unrendered keys', async () => {
      service.findOne.mockResolvedValue({
        resistances: { COLD: 20, charm: 0, sleep: 0 },
      });
      await resolver.updateMob(30, 5, editorPayload);
      const data = service.update.mock.calls[0][2];
      // FIRE/ACID set; COLD (stored) overwritten with 0; untouched 0s for
      // absent keys (LIGHTNING/POISON) stay absent (0 is normal, not immune).
      expect(data.resistances).toEqual({
        COLD: 0,
        FIRE: 40,
        ACID: 25,
        charm: 0,
        sleep: 0,
      });
    });

    it('does not read or write resistances when none are supplied', async () => {
      await resolver.updateMob(30, 5, { name: 'renamed' });
      expect(service.findOne).not.toHaveBeenCalled();
      expect(service.update.mock.calls[0][2]).toEqual({ name: 'renamed' });
    });

    it('rejects malformed dice instead of corrupting the row', async () => {
      await expect(
        resolver.updateMob(30, 5, { hpDice: 'lots' })
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('createMob', () => {
    it('does not pass non-column fields to Prisma', async () => {
      await resolver.createMob({
        ...editorPayload,
        id: 5,
        zoneId: 30,
        wealth: 0,
      });
      const data = service.create.mock.calls[0][0];
      for (const k of NON_COLUMNS) expect(data).not.toHaveProperty(k);
      expect(data.hpDiceNum).toBe(10);
      expect(data.damageDiceBonus).toBe(-2);
      expect(data.resistances).toEqual({ FIRE: 40, ACID: 25 });
      expect(data.wealth).toBe(0n);
      expect(data.zones).toEqual({ connect: { id: 30 } });
    });

    it('rejects an id that is already used in the zone and does not create', async () => {
      service.assertIdFree.mockRejectedValue(new ConflictException('dup'));
      await expect(
        resolver.createMob({ ...editorPayload, id: 5, zoneId: 30 })
      ).rejects.toBeInstanceOf(ConflictException);
      expect(service.assertIdFree).toHaveBeenCalledWith(30, 5);
      expect(service.create).not.toHaveBeenCalled();
    });
  });
});
