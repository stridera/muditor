/**
 * Test Data Fixtures
 * Provides consistent test data for all testing layers
 */

import { Race, MobFlag, RoomFlag } from '@prisma/client';
import { TriggerFlag, ItemType, SectorType, ExitFlag } from '@muditor/types';

export interface TestMobData {
  name: string;
  shortDescription: string;
  longDescription: string;
  race: Race;
  level: number;
  hitPointsMax: number;
  hitPoints: number;
  manaMax: number;
  mana: number;
  movePointsMax: number;
  movePoints: number;
  armorClass: number;
  hitRoll: number;
  damageRoll: string;
  experiencePoints: number;
  gold: number;
  mobFlags: MobFlag[];
  affectedBy: string[];
  zoneId: number;
  roomId: number;
}

export interface TestObjectData {
  name: string;
  shortDescription: string;
  longDescription: string;
  itemType: ItemType;
  weight: number;
  cost: number;
  extraFlags: string[];
  wearFlags: string[];
  weaponType?: string;
  numDamageDice?: number;
  sizeDamageDice?: number;
  damageType?: string;
  hitRollModifier?: number;
  damageRollModifier?: number;
  capacity?: number;
  zoneId: number;
  roomId: number;
}

export interface TestRoomData {
  id: number;
  name: string;
  description: string;
  roomFlags: RoomFlag[];
  sectorType: SectorType;
  zoneId: number;
  exits: Array<{
    direction: string;
    toRoom: number;
    description?: string;
    keywords: string[];
    exitFlags: ExitFlag[];
  }>;
}

export interface TestZoneData {
  id: number;
  name: string;
  resetMode: number;
  lifespan: number;
  resetMessage?: string;
  owners: string[];
  levelRestrictions?: string;
  zoneFlags: string[];
}

export interface TestTriggerData {
  name: string;
  id: number;
  triggerType: number;
  triggerFlags: TriggerFlag[];
  numArgs: number;
  argList: string;
  script: string;
  zoneId: number;
}

export interface TestShopData {
  id: number;
  keeperId: number;
  profitBuy: number;
  profitSell: number;
  buyTypes: ItemType[];
  buyMessage?: string;
  sellMessage?: string;
  noItemMessage?: string;
  zoneId: number;
}

export const TestFixtures = {
  // Basic mob fixtures
  mobs: {
    basicOrc: {
      name: 'a fierce orc warrior',
      shortDescription: 'a fierce orc warrior',
      longDescription:
        'This orc warrior stands ready for battle, his tusks gleaming menacingly.',
      race: 'ORC' as Race,
      level: 15,
      hitPointsMax: 400,
      hitPoints: 400,
      manaMax: 50,
      mana: 50,
      movePointsMax: 150,
      movePoints: 150,
      armorClass: -2,
      hitRoll: 8,
      damageRoll: '2d6+4',
      experiencePoints: 2000,
      gold: 100,
      mobFlags: ['AGGRESSIVE', 'AWARE', 'ISNPC'] as MobFlag[],
      affectedBy: ['DETECT_INVISIBLE'],
      zoneId: 1000,
      roomId: 1001,
    } as TestMobData,

    peacefulElf: {
      name: 'a gentle elven scholar',
      shortDescription: 'a gentle elven scholar',
      longDescription:
        'This wise elf studies ancient tomes with deep concentration.',
      race: 'ELF' as Race,
      level: 25,
      hitPointsMax: 300,
      hitPoints: 300,
      manaMax: 500,
      mana: 500,
      movePointsMax: 200,
      movePoints: 200,
      armorClass: 5,
      hitRoll: 5,
      damageRoll: '1d4+1',
      experiencePoints: 3000,
      gold: 500,
      mobFlags: ['ISNPC', 'MEMORY'] as MobFlag[],
      affectedBy: ['SANCTUARY', 'DETECT_MAGIC'],
      zoneId: 1000,
      roomId: 1002,
    } as TestMobData,

    shopkeeper: {
      name: 'Grim the Weaponsmith',
      shortDescription: 'Grim the weaponsmith',
      longDescription:
        'A burly dwarf with soot-stained hands and keen eyes for quality weapons.',
      race: 'DWARF' as Race,
      level: 30,
      hitPointsMax: 600,
      hitPoints: 600,
      manaMax: 100,
      mana: 100,
      movePointsMax: 100,
      movePoints: 100,
      armorClass: -5,
      hitRoll: 12,
      damageRoll: '3d6+6',
      experiencePoints: 0,
      gold: 10000,
      mobFlags: ['ISNPC', 'SENTINEL', 'PROTECTED'] as MobFlag[],
      affectedBy: [],
      zoneId: 1000,
      roomId: 1003,
    } as TestMobData,
  },

  // Object fixtures
  objects: {
    steelSword: {
      name: 'a steel longsword',
      shortDescription: 'a steel longsword',
      longDescription:
        'This well-balanced steel longsword has a keen edge and sturdy grip.',
      itemType: 'WEAPON' as ItemType,
      weight: 5,
      cost: 200,
      extraFlags: ['TAKE'],
      wearFlags: ['MAINHAND'],
      weaponType: 'SWORD',
      numDamageDice: 2,
      sizeDamageDice: 6,
      damageType: 'SLASH',
      hitRollModifier: 1,
      damageRollModifier: 2,
      zoneId: 1000,
      roomId: 1001,
    } as TestObjectData,

    magicRing: {
      name: 'a ring of protection',
      shortDescription: 'a ring of protection',
      longDescription: 'This simple silver ring pulses with protective magic.',
      itemType: 'WORN' as ItemType,
      weight: 0,
      cost: 1000,
      extraFlags: ['MAGIC', 'GLOW'],
      wearFlags: ['FINGER'],
      zoneId: 1000,
      roomId: 1002,
    } as TestObjectData,

    leatherBag: {
      name: 'a leather traveling bag',
      shortDescription: 'a leather traveling bag',
      longDescription:
        'This well-worn leather bag has many pockets and compartments.',
      itemType: 'CONTAINER' as ItemType,
      weight: 2,
      cost: 50,
      extraFlags: ['TAKE'],
      wearFlags: [],
      capacity: 100,
      zoneId: 1000,
      roomId: 1003,
    } as TestObjectData,

    healingPotion: {
      name: 'a potion of healing',
      shortDescription: 'a potion of healing',
      longDescription:
        'This crystal vial contains a swirling red liquid that glows faintly.',
      itemType: 'POTION' as ItemType,
      weight: 1,
      cost: 150,
      extraFlags: ['MAGIC', 'GLOW'],
      wearFlags: [],
      zoneId: 1000,
      roomId: 1001,
    } as TestObjectData,
  },

  // Room fixtures
  rooms: {
    entranceHall: {
      id: 1001,
      name: 'The Entrance Hall',
      description:
        'You stand in a grand entrance hall with marble columns supporting a vaulted ceiling. Torches line the walls, casting dancing shadows.',
      roomFlags: ['INDOORS'] as RoomFlag[],
      sectorType: 'INSIDE' as SectorType,
      zoneId: 1000,
      exits: [
        {
          direction: 'NORTH',
          toRoom: 1002,
          description: 'A wide archway leads north to a library.',
          keywords: ['archway', 'arch', 'north'],
          exitFlags: [] as ExitFlag[],
        },
        {
          direction: 'EAST',
          toRoom: 1003,
          description: 'A heavy wooden door stands to the east.',
          keywords: ['door', 'wooden', 'east'],
          exitFlags: ['DOOR', 'CLOSED'] as ExitFlag[],
        },
      ],
    } as TestRoomData,

    library: {
      id: 1002,
      name: 'The Ancient Library',
      description:
        'Towering bookshelves reach toward the ceiling, filled with countless tomes of ancient knowledge. Dust motes dance in rays of light filtering through stained glass windows.',
      roomFlags: ['INDOORS', 'NO_MOB', 'PEACEFUL'] as RoomFlag[],
      sectorType: 'INSIDE' as SectorType,
      zoneId: 1000,
      exits: [
        {
          direction: 'SOUTH',
          toRoom: 1001,
          description: 'The entrance hall lies to the south.',
          keywords: ['south', 'hall'],
          exitFlags: [] as ExitFlag[],
        },
      ],
    } as TestRoomData,

    weaponShop: {
      id: 1003,
      name: "Grim's Weapon Shop",
      description:
        'This cluttered shop is filled with weapons of all kinds. Swords, axes, and maces hang from the walls while armor pieces are displayed on mannequins.',
      roomFlags: ['INDOORS', 'NO_ATTACK'] as RoomFlag[],
      sectorType: 'INSIDE' as SectorType,
      zoneId: 1000,
      exits: [
        {
          direction: 'WEST',
          toRoom: 1001,
          description:
            'The entrance hall is through the heavy door to the west.',
          keywords: ['door', 'wooden', 'west'],
          exitFlags: ['DOOR'] as ExitFlag[],
        },
      ],
    } as TestRoomData,
  },

  // Zone fixtures
  zones: {
    testZone: {
      id: 1000,
      name: 'Test Zone - Castle Grounds',
      resetMode: 2,
      lifespan: 20,
      resetMessage: 'You hear the sound of guards changing shifts.',
      owners: ['admin', 'testbuilder'],
      levelRestrictions: 'NONE',
      zoneFlags: ['GRID', 'NO_ATTACK'],
    } as TestZoneData,

    newbieZone: {
      id: 1001,
      name: 'Newbie Training Grounds',
      resetMode: 1,
      lifespan: 15,
      resetMessage: 'New recruits arrive for training.',
      owners: ['admin'],
      levelRestrictions: '1-10',
      zoneFlags: ['NEWBIE_ZONE', 'NO_ATTACK'],
    } as TestZoneData,
  },

  // Trigger fixtures
  triggers: {
    greetingTrigger: {
      name: 'greeting_trigger',
      id: 1001,
      triggerType: 4, // Enter trigger
      triggerFlags: [TriggerFlag.ENTRY],
      numArgs: 100,
      argList: '',
      script: `
        -- Greeting script
        if (ch.level < 5) then
          act("$n looks around nervously.", false, ch, nil, nil, TO_ROOM)
          send_to_char(ch, "Welcome, young adventurer! This is your first time here.")
        end
      `,
      zoneId: 1000,
    } as TestTriggerData,

    deathTrap: {
      name: 'death_trap',
      id: 1002,
      triggerType: 4, // Enter trigger
      triggerFlags: [TriggerFlag.ENTRY],
      numArgs: 100,
      argList: '',
      script: `
        -- Death trap script
        send_to_char(ch, "You step on a hidden pressure plate!")
        act("$n steps on something that clicks ominously.", false, ch, nil, nil, TO_ROOM)
        damage(ch, ch, ch.max_hit, -1)
      `,
      zoneId: 1000,
    } as TestTriggerData,
  },

  // Shop fixtures
  shops: {
    weaponShop: {
      id: 1001,
      keeperId: 1003, // Grim the Weaponsmith
      profitBuy: 1.2,
      profitSell: 0.8,
      buyTypes: ['WEAPON', 'ARMOR'] as ItemType[],
      buyMessage: 'Grim nods approvingly at your weapon.',
      sellMessage: "That's a fine piece of equipment!",
      noItemMessage: "I don't deal in that sort of thing.",
      zoneId: 1000,
    } as TestShopData,
  },

  // Complete test scenarios
  scenarios: {
    basicDungeon: {
      zone: 1000,
      rooms: [1001, 1002, 1003],
      mobs: ['basicOrc', 'peacefulElf', 'shopkeeper'],
      objects: ['steelSword', 'magicRing', 'leatherBag'],
      description: 'A basic dungeon scenario with entrance, library, and shop',
    },

    flagTestScenario: {
      mobFlags: [
        'SPEC',
        'SENTINEL',
        'SCAVENGER',
        'ISNPC',
        'AWARE',
        'AGGRESSIVE',
        'STAY_ZONE',
        'WIMPY',
        'PET',
        'PROTECTED',
        'MEMORY',
        'HELPER',
        'NO_CHARM',
        'NO_SUMMMON',
        'NO_SLEEP',
        'NO_BASH',
        'NO_BLIND',
        'MOUNTABLE',
        'CLONE',
        'AGGRESSIVE_EVIL',
        'AGGRESSIVE_GOOD',
        'AGGRESSIVE_NEUTRAL',
        'NOPOISON',
        'NOSILENCE',
        'NOVICIOUS',
        'NO_CLASS_AI',
        'FAST_TRACK',
        'AQUATIC',
      ] as MobFlag[],
      description: 'Tests all possible mob flags for validation',
    },
  },
};

// Utility functions for test data creation
export const createTestMob = (
  overrides: Partial<TestMobData> = {}
): TestMobData => ({
  ...TestFixtures.mobs.basicOrc,
  ...overrides,
});

export const createTestObject = (
  overrides: Partial<TestObjectData> = {}
): TestObjectData => ({
  ...TestFixtures.objects.steelSword,
  ...overrides,
});

export const createTestRoom = (
  overrides: Partial<TestRoomData> = {}
): TestRoomData => ({
  ...TestFixtures.rooms.entranceHall,
  ...overrides,
});

export const createTestZone = (
  overrides: Partial<TestZoneData> = {}
): TestZoneData => ({
  ...TestFixtures.zones.testZone,
  ...overrides,
});

// Validation helpers for tests
export const validateMobData = (mob: any, expected: TestMobData): boolean => {
  const requiredFields = ['name', 'race', 'level', 'hitPointsMax', 'mobFlags'];
  return (
    requiredFields.every(field => mob[field] !== undefined) &&
    mob.race === expected.race &&
    mob.level === expected.level &&
    Array.isArray(mob.mobFlags)
  );
};

export const validateObjectData = (
  obj: any,
  expected: TestObjectData
): boolean => {
  const requiredFields = ['name', 'itemType', 'weight', 'cost'];
  return (
    requiredFields.every(field => obj[field] !== undefined) &&
    obj.itemType === expected.itemType
  );
};

export const validateRoomData = (
  room: any,
  expected: TestRoomData
): boolean => {
  const requiredFields = ['id', 'name', 'description', 'sectorType'];
  return (
    requiredFields.every(field => room[field] !== undefined) &&
    room.id === expected.id &&
    Array.isArray(room.exits)
  );
};

// Data integrity helpers
export const checkDataIntegrity = {
  mobHasValidStats: (mob: any): boolean => {
    return (
      mob.level > 0 &&
      mob.hitPointsMax > 0 &&
      mob.hitPoints <= mob.hitPointsMax &&
      mob.manaMax >= 0 &&
      mob.mana <= mob.manaMax
    );
  },

  objectHasValidProperties: (obj: any): boolean => {
    return (
      obj.weight >= 0 &&
      obj.cost >= 0 &&
      Array.isArray(obj.extraFlags) &&
      Array.isArray(obj.wearFlags)
    );
  },

  roomHasValidExits: (room: any): boolean => {
    if (!Array.isArray(room.exits)) return false;
    return room.exits.every(
      (exit: any) =>
        exit.direction &&
        typeof exit.toRoom === 'number' &&
        Array.isArray(exit.keywords) &&
        Array.isArray(exit.exitFlags)
    );
  },
};
