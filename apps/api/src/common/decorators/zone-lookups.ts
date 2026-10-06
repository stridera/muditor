import type { ZoneScopeLookup } from './zone-scope.decorator';

/**
 * Surrogate-key -> zone resolvers for mutations that address an entity by its
 * autoincrement id only. Used with `@RequireZoneWrite({ lookup })`.
 */
export const zoneLookups = {
  roomExit: (arg: string): ZoneScopeLookup => ({
    arg,
    resolve: async (db, id) =>
      (
        await db.roomExit.findUnique({
          where: { id },
          select: { roomZoneId: true },
        })
      )?.roomZoneId,
  }),
  mobReset: (arg: string): ZoneScopeLookup => ({
    arg,
    resolve: async (db, id) =>
      (
        await db.mobResets.findUnique({
          where: { id },
          select: { zoneId: true },
        })
      )?.zoneId,
  }),
  mobResetEquipment: (arg: string): ZoneScopeLookup => ({
    arg,
    resolve: async (db, id) =>
      (
        await db.mobResetEquipment.findUnique({
          where: { id },
          select: { mob_resets: { select: { zoneId: true } } },
        })
      )?.mob_resets.zoneId,
  }),
  objectReset: (arg: string): ZoneScopeLookup => ({
    arg,
    resolve: async (db, id) =>
      (
        await db.objectResets.findUnique({
          where: { id },
          select: { zoneId: true },
        })
      )?.zoneId,
  }),
  questDialogue: (arg: string): ZoneScopeLookup => ({
    arg,
    resolve: async (db, id) =>
      (
        await db.questDialogue.findUnique({
          where: { id },
          select: { questZoneId: true },
        })
      )?.questZoneId,
  }),
  questReward: (arg: string): ZoneScopeLookup => ({
    arg,
    resolve: async (db, id) =>
      (
        await db.questRewards.findUnique({
          where: { id },
          select: { questZoneId: true },
        })
      )?.questZoneId,
  }),
  questPrerequisite: (arg: string): ZoneScopeLookup => ({
    arg,
    resolve: async (db, id) =>
      (
        await db.questPrerequisites.findUnique({
          where: { id },
          select: { questZoneId: true },
        })
      )?.questZoneId,
  }),
};
