// Shared mapper source interfaces for database-to-DTO transformations.
// These are intentionally narrower than full Prisma model types to allow
// lightweight raw query results and partial selections.

import {
  type Effect,
  ExitState,
  MagicAffinity,
  type Mobs,
  type MobDefaultEffects,
  type Objects,
  type ObjectEffects,
  type ObjectResistance,
  type ConsumableEffect,
  PositionMechanic,
  type RoomExit as PrismaRoomExit,
  type RoomExtraDescriptions,
  Sector,
} from '@prisma/client';

// Room source interface used by mapRoom
export interface RoomMapperSource {
  id: number;
  name: string;
  roomDescription: string;
  sector: Sector;
  zoneId: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  layoutX?: number | null;
  layoutY?: number | null;
  layoutZ?: number | null;
  baseLightLevel?: number;
  capacity?: number;
  magicAffinity?: MagicAffinity | null;
  requiredMechanic?: PositionMechanic | null;
  entryRestriction?: string | null;
  isPeaceful?: boolean;
  allowsMagic?: boolean;
  allowsRecall?: boolean;
  allowsSummon?: boolean;
  allowsTeleport?: boolean;
  isDeathTrap?: boolean;
  exits?: (PrismaRoomExit & {
    defaultState?: ExitState;
    hitPoints?: number | null;
  })[];
  roomExtraDescriptions?: RoomExtraDescriptions[];
  deletedAt?: Date | null;
  [key: string]: unknown;
}

// Mob source extension: allow optional aggregate fields (e.g., totalWealth)
// Allow wealth to be optional/null even though Prisma model exposes numeric field via aggregated queries
export type MobMapperSource = Omit<Mobs, 'wealth'> & {
  totalWealth?: number | null;
  defaultEffects?: (MobDefaultEffects & { effect: Effect })[];
};

// Object source with optional effect relations (populated by findOne, absent from findAll)
export type ObjectMapperSource = Objects & {
  grantedEffects?: (ObjectEffects & { effect: Effect })[];
  objectResistances?: ObjectResistance[];
  consumableEffects?: (ConsumableEffect & { effect: Effect })[];
};

// Utility type guards (optional future usage)
export function isRoomMapperSource(value: unknown): value is RoomMapperSource {
  return (
    !!value &&
    typeof value === 'object' &&
    'id' in value &&
    'name' in value &&
    'roomDescription' in value &&
    'sector' in value &&
    'zoneId' in value
  );
}

export function isMobMapperSource(value: unknown): value is MobMapperSource {
  return (
    !!value && typeof value === 'object' && 'id' in value && 'zoneId' in value
  );
}

export function isObjectMapperSource(
  value: unknown
): value is ObjectMapperSource {
  return (
    !!value && typeof value === 'object' && 'id' in value && 'zoneId' in value
  );
}
