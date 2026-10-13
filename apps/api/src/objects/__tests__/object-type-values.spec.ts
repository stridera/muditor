import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { DamageType, ObjectType } from '@muditor/db';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { mapObject } from '../../common/mappers/object.mapper';
import { CreateObjectInput, ObjectDto, UpdateObjectInput } from '../object.dto';
import {
  assertValidCombatColumns,
  assertValidObjectValues,
} from '../object-values';
import { ObjectsResolver } from '../objects.resolver';
import { ObjectsService } from '../objects.service';

describe('assertValidObjectValues: shapes the game reads', () => {
  it.each([
    [
      'container',
      {
        Capacity: 50.5,
        'Weight Reduction': 90,
        Flags: ['Closeable', 'Locked'],
        Key: { zone: 3, id: 4 },
        IsCorpse: false,
      },
    ],
    ['light', { Capacity: 240, Remaining: -1 }],
    ['permanent light', { Capacity: -1, Remaining: -1 }],
    ['legacy numeric Spell', { Spell: 0, Direction: 3 }],
    ['food', { Filling: 12, Poisoned: false }],
    [
      'drink',
      { Liquid: 'WINE', Capacity: 10, Remaining: 4, Poisoned: 'false' },
    ],
    ['potion', { Level: 20, Spells: ['BLESS', 'ARMOR'] }],
    ['wand', { Level: 30, Spell: 'BLESS', Max_Charges: 5, Charges_Left: 5 }],
    ['money', { Platinum: 1, Gold: 2, Silver: 3, Copper: 4 }],
    ['portal', { Destination: 3045 }],
    ['board', { Pages: 2 }],
    ['weapon', { HitRoll: 3 }],
    [
      'numeric strings (older rows)',
      { Capacity: '240', Remaining: '10', Filling: '3' },
    ],
    [
      'recall scroll',
      {
        Spells: ['RECALL'],
        'Recall Rooms': {
          default: { zone: 30, id: 22 },
          classes: { sorcerer: { zone: 30, id: 46 } },
        },
      },
    ],
    [
      'keys the game does not read',
      { Character_Message: 'x', 'Trap HitPoints': 4 },
    ],
  ])('accepts %s', (_name, values) => {
    expect(() => assertValidObjectValues(values)).not.toThrow();
  });

  it.each([
    [{ Remaining: -2 }, /values.Remaining/],
    [{ Remaining: 1.5 }, /values.Remaining/],
    [{ Capacity: -2 }, /values.Capacity/],
    [{ Capacity: 'lots' }, /values.Capacity/],
    [{ 'Weight Reduction': 101 }, /Weight Reduction/],
    [{ Filling: -3 }, /values.Filling/],
    [{ Platinum: -1 }, /values.Platinum/],
    [{ Destination: 'home' }, /values.Destination/],
    [{ Pages: -1 }, /values.Pages/],
    [{ Poisoned: 'maybe' }, /values.Poisoned/],
    [{ Flags: ['Closeable', 'Wobbly'] }, /values.Flags/],
    [{ Flags: 'Closeable' }, /values.Flags/],
    [{ Liquid: '' }, /values.Liquid/],
    [{ Liquid: 4 }, /values.Liquid/],
    [{ Spell: true }, /values.Spell/],
    [{ Spells: 'BLESS' }, /values.Spells/],
    [{ Spells: [1] }, /values.Spells/],
    [{ 'Recall Rooms': [] }, /Recall Rooms/],
    [{ 'Recall Rooms': { default: { zone: 30 } } }, /default/],
    [
      { 'Recall Rooms': { classes: { cleric: { zone: -1, id: 2 } } } },
      /classes.cleric/,
    ],
    [{ 'Recall Rooms': { other: {} } }, /only takes/],
  ])('rejects %j', (values, message) => {
    expect(() => assertValidObjectValues(values)).toThrow(BadRequestException);
    expect(() => assertValidObjectValues(values)).toThrow(message);
  });
});

describe('assertValidCombatColumns', () => {
  it('accepts a normal weapon and armor', () => {
    expect(() =>
      assertValidCombatColumns({
        weaponDiceNum: 2,
        weaponDiceSize: 6,
        weaponDiceBonus: -1,
      })
    ).not.toThrow();
    expect(() => assertValidCombatColumns({ armorPct: 40 })).not.toThrow();
    expect(() => assertValidCombatColumns({ armorPct: -18 })).not.toThrow();
    expect(() => assertValidCombatColumns({})).not.toThrow();
  });

  it.each([
    [{ weaponDiceNum: -1 }],
    [{ weaponDiceNum: 1.5 }],
    [{ weaponDiceSize: 5000 }],
    [{ weaponDiceBonus: 1e6 }],
    [{ armorPct: -1001 }],
    [{ armorPct: 1001 }],
    [{ weaponDiceNum: 2, weaponDiceSize: 0 }],
  ])('rejects %j', data => {
    expect(() => assertValidCombatColumns(data)).toThrow(BadRequestException);
  });
});

describe('ObjectsResolver: weapon and armor columns', () => {
  const service = {
    assertIdFree: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
  };
  const resolver = new ObjectsResolver(service as unknown as ObjectsService);
  beforeEach(() => jest.clearAllMocks());

  it('createObject passes dice, damage type and armor to the service', async () => {
    await resolver
      .createObject({
        id: 1,
        zoneId: 23,
        name: 'a sword',
        weaponDiceNum: 2,
        weaponDiceSize: 6,
        weaponDiceBonus: 3,
        weaponDamageType: DamageType.SLASH,
        armorPct: 0,
      } as never)
      .catch(() => undefined);
    const data = service.create.mock.calls[0]![0];
    expect(data).toMatchObject({
      weaponDiceNum: 2,
      weaponDiceSize: 6,
      weaponDiceBonus: 3,
      weaponDamageType: 'SLASH',
      armorPct: 0,
    });
  });

  it('updateObject can set armor, and clear the damage type with null', async () => {
    await resolver
      .updateObject(23, 1, { armorPct: 25, weaponDamageType: null } as never)
      .catch(() => undefined);
    expect(service.update.mock.calls[0]![2]).toMatchObject({
      armorPct: 25,
      weaponDamageType: null,
    });
  });

  it('updateObject sets and clears the weapon element', async () => {
    await resolver
      .updateObject(23, 1, { weaponElement: DamageType.COLD } as never)
      .catch(() => undefined);
    expect(service.update.mock.calls[0]![2]).toMatchObject({
      weaponElement: 'COLD',
    });
    await resolver
      .updateObject(23, 1, { weaponElement: null } as never)
      .catch(() => undefined);
    expect(service.update.mock.calls[1]![2]).toMatchObject({
      weaponElement: null,
    });
  });

  it('rejects nonsense dice before touching the database', async () => {
    await expect(
      resolver.updateObject(23, 1, {
        weaponDiceNum: 3,
        weaponDiceSize: 0,
      } as never)
    ).rejects.toThrow(BadRequestException);
    await expect(
      resolver.createObject({ id: 1, zoneId: 23, armorPct: -4000 } as never)
    ).rejects.toThrow(BadRequestException);
    expect(service.create).not.toHaveBeenCalled();
    expect(service.update).not.toHaveBeenCalled();
  });

  it('rejects a malformed value shape for any type', async () => {
    await expect(
      resolver.updateObject(23, 1, {
        values: { Flags: ['Bogus'] },
      } as never)
    ).rejects.toThrow(/values.Flags/);
    expect(service.update).not.toHaveBeenCalled();
  });
});

describe('object DTO validation', () => {
  it('accepts the combat columns on create and update', async () => {
    const create = plainToInstance(CreateObjectInput, {
      id: 4,
      zoneId: 30,
      keywords: ['sword'],
      name: 'a sword',
      roomDescription: 'A sword lies here.',
      examineDescription: 'A fine blade.',
      type: ObjectType.WEAPON,
      weaponDiceNum: 2,
      weaponDiceSize: 6,
      weaponDiceBonus: 1,
      weaponDamageType: DamageType.PIERCE,
    });
    expect(
      await validate(create, { whitelist: true, forbidNonWhitelisted: true })
    ).toEqual([]);
    const update = plainToInstance(UpdateObjectInput, {
      armorPct: 12,
      weaponDamageType: null,
    });
    expect(
      await validate(update, { whitelist: true, forbidNonWhitelisted: true })
    ).toEqual([]);
  });

  it('rejects an unknown damage type and fractional dice', async () => {
    const bad = plainToInstance(UpdateObjectInput, {
      weaponDamageType: 'LASER',
      weaponElement: 'LASER',
      weaponDiceNum: 1.5,
    });
    const errors = await validate(bad, { whitelist: true });
    expect(errors.map(e => e.property).sort()).toEqual([
      'weaponDamageType',
      'weaponDiceNum',
      'weaponElement',
    ]);
  });
});

describe('mapObject: combat columns', () => {
  it('returns dice, damage type and armor on the DTO', () => {
    const dto: ObjectDto = mapObject({
      id: 4,
      zoneId: 30,
      type: ObjectType.WEAPON,
      keywords: [],
      name: 'a sword',
      plainName: 'a sword',
      roomDescription: '',
      plainRoomDescription: '',
      weight: 1,
      cost: 1,
      timer: 0,
      decomposeTimer: 0,
      level: 1,
      concealment: 0,
      values: {},
      weaponDiceNum: 2,
      weaponDiceSize: 6,
      weaponDiceBonus: 3,
      weaponDamageType: DamageType.SLASH,
      weaponElement: DamageType.COLD,
      armorPct: 0,
      flags: [],
      wearFlags: [],
      createdAt: new Date(0),
      updatedAt: new Date(0),
    } as never);
    expect(dto).toMatchObject({
      weaponDiceNum: 2,
      weaponDiceSize: 6,
      weaponDiceBonus: 3,
      weaponDamageType: 'SLASH',
      weaponElement: 'COLD',
      armorPct: 0,
    });
  });

  it('leaves the damage type off when the column is null', () => {
    const dto = mapObject({
      id: 5,
      zoneId: 30,
      type: ObjectType.ARMOR,
      keywords: [],
      name: 'a cap',
      plainName: 'a cap',
      roomDescription: '',
      plainRoomDescription: '',
      weight: 1,
      cost: 1,
      timer: 0,
      decomposeTimer: 0,
      level: 1,
      concealment: 0,
      values: {},
      weaponDiceNum: 0,
      weaponDiceSize: 0,
      weaponDiceBonus: 0,
      weaponDamageType: null,
      armorPct: 18,
      flags: [],
      wearFlags: [],
      createdAt: new Date(0),
      updatedAt: new Date(0),
    } as never);
    expect(dto.armorPct).toBe(18);
    expect(dto.weaponDamageType).toBeUndefined();
  });
});
