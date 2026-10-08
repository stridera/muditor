/**
 * A character's CharacterItems rows are not all carried: rows with a
 * `corpseId` lie in the character's corpse and only come back to the
 * inventory when looted. The editor shows them apart from worn and carried
 * gear.
 */

export interface CharacterItemLike {
  equippedLocation?: string | null;
  corpseId?: number | null;
  corpse?: { id: number; roomZoneId: number; roomId: number } | null;
}

export interface CorpseItemGroup<T> {
  corpseId: number;
  roomZoneId: number | null;
  roomId: number | null;
  items: T[];
}

export interface SplitCharacterItems<T> {
  equipped: T[];
  inventory: T[];
  corpses: CorpseItemGroup<T>[];
}

export function splitCharacterItems<T extends CharacterItemLike>(
  items: readonly T[] | null | undefined
): SplitCharacterItems<T> {
  const equipped: T[] = [];
  const inventory: T[] = [];
  const byCorpse = new Map<number, CorpseItemGroup<T>>();
  for (const item of items ?? []) {
    if (item.corpseId != null) {
      let group = byCorpse.get(item.corpseId);
      if (!group) {
        group = {
          corpseId: item.corpseId,
          roomZoneId: item.corpse?.roomZoneId ?? null,
          roomId: item.corpse?.roomId ?? null,
          items: [],
        };
        byCorpse.set(item.corpseId, group);
      }
      group.items.push(item);
    } else if (item.equippedLocation) {
      equipped.push(item);
    } else {
      inventory.push(item);
    }
  }
  return { equipped, inventory, corpses: [...byCorpse.values()] };
}
