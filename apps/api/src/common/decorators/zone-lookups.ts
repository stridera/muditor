import type { DatabaseService } from '../../database/database.service';
import type { ZoneScopeLookup } from './zone-scope.decorator';

/**
 * Dialogue trees have no zone column; they belong to the zone(s) of the quest
 * dialogues that use them. Returns the zone only when every user of the tree
 * is in the same one. Unused or cross-zone trees resolve to null, which denies
 * zone-grant builders (IMPLEMENTOR/CODER/HEAD_BUILDER still bypass).
 */
async function dialogueTreeZone(
  db: DatabaseService,
  treeId: number
): Promise<number | null> {
  const links = await db.questDialogue.findMany({
    where: { dialogueTreeId: treeId },
    select: { questZoneId: true },
  });
  const zones = new Set(links.map(l => l.questZoneId));
  return zones.size === 1 ? ([...zones][0] ?? null) : null;
}

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
  dialogueTree: (arg: string): ZoneScopeLookup => ({
    arg,
    resolve: dialogueTreeZone,
  }),
  dialogueNode: (arg: string): ZoneScopeLookup => ({
    arg,
    resolve: async (db, id) => {
      const node = await db.dialogueNodes.findUnique({
        where: { id },
        select: { dialogueTreeId: true },
      });
      return node ? dialogueTreeZone(db, node.dialogueTreeId) : null;
    },
  }),
  dialogueResponse: (arg: string): ZoneScopeLookup => ({
    arg,
    resolve: async (db, id) => {
      const response = await db.dialogueResponses.findUnique({
        where: { id },
        select: { node: { select: { dialogueTreeId: true } } },
      });
      return response
        ? dialogueTreeZone(db, response.node.dialogueTreeId)
        : null;
    },
  }),
};
