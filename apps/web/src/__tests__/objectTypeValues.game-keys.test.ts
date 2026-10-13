import {
  ARMOR_TYPES,
  DAMAGE_TYPES,
  EMPTY_COMBAT_COLUMNS,
  TYPE_VALUE_FIELDS,
  WEAPON_TYPES,
} from '@/lib/objectTypeValues';

const keys = (type: string) => (TYPE_VALUE_FIELDS[type] ?? []).map(f => f.key);

describe('type value fields cover the keys the game reads', () => {
  it('has the loader keys per type', () => {
    expect(keys('CONTAINER')).toEqual(
      expect.arrayContaining([
        'Capacity',
        'Key',
        'Weight Reduction',
        'Flags',
        'IsCorpse',
      ])
    );
    expect(keys('LIGHT')).toEqual(['Capacity', 'Remaining']);
    expect(keys('FOOD')).toEqual(['Filling', 'Poisoned']);
    expect(keys('DRINKCONTAINER')).toEqual([
      'Liquid',
      'Capacity',
      'Remaining',
      'Poisoned',
    ]);
    expect(keys('FOUNTAIN')).toEqual(keys('DRINKCONTAINER'));
    expect(keys('WAND')).toEqual([
      'Level',
      'Spell',
      'Max_Charges',
      'Charges_Left',
    ]);
    expect(keys('POTION')).toEqual(['Level', 'Spells']);
    expect(keys('SCROLL')).toEqual(['Level', 'Spells', 'Recall Rooms']);
    expect(keys('MONEY')).toEqual(['Platinum', 'Gold', 'Silver', 'Copper']);
    expect(keys('PORTAL')).toEqual(['Destination']);
    expect(keys('BOARD')).toEqual(['Pages']);
    expect(keys('WEAPON')).toEqual(['HitRoll']);
  });

  it('recall rooms is its own field kind', () => {
    const f = TYPE_VALUE_FIELDS.SCROLL!.find(x => x.key === 'Recall Rooms')!;
    expect(f.kind).toBe('recallRooms');
  });

  it('weapon dice and armor are typed columns, not value keys', () => {
    expect(WEAPON_TYPES).toEqual(['WEAPON']);
    expect(ARMOR_TYPES).toEqual(['ARMOR']);
    expect(keys('ARMOR')).toEqual([]);
    expect(EMPTY_COMBAT_COLUMNS).toEqual({
      weaponDiceNum: 0,
      weaponDiceSize: 0,
      weaponDiceBonus: 0,
      weaponDamageType: '',
      weaponElement: '',
      armorPct: 0,
    });
  });

  it('offers every Prisma damage type once', () => {
    expect(DAMAGE_TYPES).toHaveLength(25);
    expect(new Set(DAMAGE_TYPES).size).toBe(25);
    expect(DAMAGE_TYPES).toEqual(
      expect.arrayContaining(['SLASH', 'PIERCE', 'FIRE'])
    );
  });
});
