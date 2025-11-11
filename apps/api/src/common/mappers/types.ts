// Shared mapper source interfaces for database-to-DTO transformations.
// These are intentionally narrower than full Prisma model types to allow
// lightweight raw query results and partial selections.

import {
  Mobs,
  Objects,
  RoomExits,
  RoomExtraDescriptions,
  RoomFlag,
  Sector,
} from '@prisma/client';

// Room source interface used by mapRoom
export interface RoomMapperSource {
  id: number;
  name: string;
  roomDescription: string;
  sector: Sector;
  flags: RoomFlag[];
  zoneId: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  layoutX?: number | null;
  layoutY?: number | null;
  layoutZ?: number | null;
  exits?: RoomExits[];
  roomExtraDescriptions?: RoomExtraDescriptions[];
  deletedAt?: Date | null;
  [key: string]: unknown;
}

// Mob source extension: allow optional aggregate fields (e.g., totalWealth)
// Allow wealth to be optional/null even though Prisma model exposes numeric field via aggregated queries
export type MobMapperSource = Omit<Mobs, 'wealth'> & {
  totalWealth?: number | null;
};

// Object source currently identical to Prisma Objects; reserved for future narrowing/extension.
export type ObjectMapperSource = Objects;

// Utility type guards (optional future usage)
export function isRoomMapperSource(value: unknown): value is RoomMapperSource {
  return (
    !!value &&
    typeof value === 'object' &&
    'id' in value &&
    'name' in value &&
    'roomDescription' in value &&
    'sector' in value &&
    'flags' in value &&
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
