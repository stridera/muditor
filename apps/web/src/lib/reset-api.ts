import {
  AddMobResetEquipmentContentDocument,
  AddMobResetEquipmentDocument,
  AddObjectResetContentDocument,
  CreateMobResetDocument,
  CreateObjectResetDocument,
  DeleteMobResetDocument,
  DeleteMobResetEquipmentContentDocument,
  DeleteMobResetEquipmentDocument,
  DeleteObjectResetContentDocument,
  DeleteObjectResetDocument,
  MobResetsByRoomDocument,
  ObjectResetsByRoomDocument,
  ResetPickerSearchMobsDocument,
  ResetPickerSearchObjectsDocument,
  ResetPickerZoneMobsDocument,
  ResetPickerZoneObjectsDocument,
  RoomExtraDescriptionsDocument,
  UpdateMobResetDocument,
  UpdateMobResetEquipmentContentDocument,
  UpdateMobResetEquipmentDocument,
  UpdateObjectResetContentDocument,
  UpdateObjectResetDocument,
  UpdateRoomExtraDescriptionsDocument,
  type MobResetFullFragment,
  type ObjectResetFullFragment,
  type WearFlag,
} from '@/generated/graphql';
import { authenticatedGraphQLFetch } from '@/lib/authenticated-fetch';

export type MobReset = MobResetFullFragment;
export type MobResetEquipment = MobReset['equipment'][number];
export type ObjectReset = ObjectResetFullFragment;
/** A row inside a container, from either a mob's gear or an object reset */
export type ResetContent =
  | ObjectReset['contents'][number]
  | MobResetEquipment['contents'][number];

/** A mob or object a builder can pick to place. */
export interface PickableEntity {
  id: number;
  zoneId: number;
  name: string;
  type?: string | null;
  level?: number | null;
}

export interface ContentInput {
  objectZoneId: number;
  objectId: number;
  quantity?: number;
  maxInstances?: number;
  parentContentId?: number | null;
  comment?: string | null;
}

export interface ContentPatch {
  quantity?: number;
  maxInstances?: number;
  comment?: string;
}

async function run<T>(
  doc: Parameters<typeof authenticatedGraphQLFetch>[0],
  variables: Record<string, unknown>
): Promise<T> {
  const res = await authenticatedGraphQLFetch(doc, variables);
  return res.data as T;
}

/** Content lists come back flat; this orders them parent-first for display. */
export function nestContents<
  T extends { id: string; parentContentId?: number | null },
>(contents: T[]): Array<{ item: T; depth: number }> {
  const byParent = new Map<number | null, T[]>();
  for (const c of contents) {
    const key = c.parentContentId ?? null;
    byParent.set(key, [...(byParent.get(key) ?? []), c]);
  }
  const out: Array<{ item: T; depth: number }> = [];
  const walk = (parent: number | null, depth: number) => {
    for (const c of byParent.get(parent) ?? []) {
      out.push({ item: c, depth });
      walk(Number(c.id), depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

/** What the API says when a builder lacks a grant, in words a builder can act on. */
export function describeResetError(e: unknown, zoneId?: number): string {
  const message = e instanceof Error ? e.message : String(e);
  if (/forbidden/i.test(message)) {
    return zoneId !== undefined
      ? `You do not have write access to zone ${zoneId}.`
      : 'You do not have write access to this zone.';
  }
  return message || 'Request failed';
}

export async function loadRoomResets(
  roomZoneId: number,
  roomId: number
): Promise<{ mobResets: MobReset[]; objectResets: ObjectReset[] }> {
  const [mobs, objects] = await Promise.all([
    run<{ mobResetsByRoom: MobReset[] }>(MobResetsByRoomDocument, {
      roomZoneId,
      roomId,
    }),
    run<{ objectResetsByRoom: ObjectReset[] }>(ObjectResetsByRoomDocument, {
      roomZoneId,
      roomId,
    }),
  ]);
  return {
    mobResets: mobs.mobResetsByRoom,
    objectResets: objects.objectResetsByRoom,
  };
}

// --- mob resets -----------------------------------------------------------

export async function createMobReset(input: {
  zoneId: number;
  mobZoneId: number;
  mobId: number;
  roomZoneId: number;
  roomId: number;
  maxInstances?: number;
  probability?: number;
  comment?: string;
}): Promise<MobReset> {
  const d = await run<{ createMobReset: MobReset }>(CreateMobResetDocument, {
    data: input,
  });
  return d.createMobReset;
}

export async function updateMobReset(
  id: string,
  patch: {
    maxInstances?: number;
    probability?: number;
    comment?: string;
    roomZoneId?: number;
    roomId?: number;
  }
): Promise<MobReset> {
  const d = await run<{ updateMobReset: MobReset }>(UpdateMobResetDocument, {
    id,
    data: patch,
  });
  return d.updateMobReset;
}

export async function deleteMobReset(id: string): Promise<void> {
  await run(DeleteMobResetDocument, { id });
}

export async function addMobEquipment(
  resetId: string,
  input: {
    objectZoneId: number;
    objectId: number;
    wearLocation?: WearFlag | null;
    maxInstances?: number;
    probability?: number;
    decorative?: boolean;
  }
): Promise<MobReset> {
  const d = await run<{ addMobResetEquipment: MobReset }>(
    AddMobResetEquipmentDocument,
    { resetId, ...input }
  );
  return d.addMobResetEquipment;
}

export async function updateMobEquipment(
  id: string,
  patch: {
    wearLocation?: WearFlag | null;
    maxInstances?: number;
    probability?: number;
    decorative?: boolean;
  }
): Promise<void> {
  await run(UpdateMobResetEquipmentDocument, { id, ...patch });
}

export async function deleteMobEquipment(id: string): Promise<void> {
  await run(DeleteMobResetEquipmentDocument, { id });
}

export async function addMobEquipmentContent(
  equipmentId: string,
  data: ContentInput
): Promise<MobReset> {
  const d = await run<{ addMobResetEquipmentContent: MobReset }>(
    AddMobResetEquipmentContentDocument,
    { equipmentId, data }
  );
  return d.addMobResetEquipmentContent;
}

export async function updateMobEquipmentContent(
  id: string,
  data: ContentPatch
): Promise<void> {
  await run(UpdateMobResetEquipmentContentDocument, { id, data });
}

export async function deleteMobEquipmentContent(id: string): Promise<void> {
  await run(DeleteMobResetEquipmentContentDocument, { id });
}

// --- object resets --------------------------------------------------------

export async function createObjectReset(input: {
  zoneId: number;
  objectZoneId: number;
  objectId: number;
  roomZoneId: number;
  roomId: number;
  maxInstances?: number;
  probability?: number;
  comment?: string;
}): Promise<ObjectReset> {
  const d = await run<{ createObjectReset: ObjectReset }>(
    CreateObjectResetDocument,
    { data: input }
  );
  return d.createObjectReset;
}

export async function updateObjectReset(
  id: string,
  patch: {
    maxInstances?: number;
    probability?: number;
    comment?: string;
    roomZoneId?: number;
    roomId?: number;
  }
): Promise<ObjectReset> {
  const d = await run<{ updateObjectReset: ObjectReset }>(
    UpdateObjectResetDocument,
    { id, data: patch }
  );
  return d.updateObjectReset;
}

export async function deleteObjectReset(id: string): Promise<void> {
  await run(DeleteObjectResetDocument, { id });
}

export async function addObjectContent(
  resetId: string,
  data: ContentInput
): Promise<ObjectReset> {
  const d = await run<{ addObjectResetContent: ObjectReset }>(
    AddObjectResetContentDocument,
    { resetId, data }
  );
  return d.addObjectResetContent;
}

export async function updateObjectContent(
  id: string,
  data: ContentPatch
): Promise<void> {
  await run(UpdateObjectResetContentDocument, { id, data });
}

export async function deleteObjectContent(id: string): Promise<void> {
  await run(DeleteObjectResetContentDocument, { id });
}

// --- pickers --------------------------------------------------------------

export async function listZoneMobs(zoneId: number): Promise<PickableEntity[]> {
  const d = await run<{ mobsByZone: PickableEntity[] }>(
    ResetPickerZoneMobsDocument,
    { zoneId }
  );
  return d.mobsByZone;
}

export async function listZoneObjects(
  zoneId: number
): Promise<PickableEntity[]> {
  const d = await run<{ objectsByZone: PickableEntity[] }>(
    ResetPickerZoneObjectsDocument,
    { zoneId }
  );
  return d.objectsByZone;
}

export async function searchMobs(
  search: string,
  limit = 30
): Promise<PickableEntity[]> {
  const d = await run<{ searchMobs: PickableEntity[] }>(
    ResetPickerSearchMobsDocument,
    { search, limit }
  );
  return d.searchMobs;
}

export async function searchObjects(
  search: string,
  limit = 30
): Promise<PickableEntity[]> {
  const d = await run<{ searchObjects: PickableEntity[] }>(
    ResetPickerSearchObjectsDocument,
    { search, limit }
  );
  return d.searchObjects;
}

// --- room extra descriptions ---------------------------------------------

export interface ExtraDescription {
  keywords: string[];
  description: string;
}

export async function loadRoomExtraDescriptions(
  zoneId: number,
  id: number
): Promise<ExtraDescription[]> {
  const d = await run<{
    room: { extraDescs: Array<{ keywords: string[]; description: string }> };
  }>(RoomExtraDescriptionsDocument, { zoneId, id });
  return d.room.extraDescs.map(e => ({
    keywords: e.keywords,
    description: e.description,
  }));
}

export async function saveRoomExtraDescriptions(
  zoneId: number,
  id: number,
  extraDescs: ExtraDescription[]
): Promise<ExtraDescription[]> {
  const d = await run<{
    updateRoomExtraDescriptions: {
      extraDescs: Array<{ keywords: string[]; description: string }>;
    };
  }>(UpdateRoomExtraDescriptionsDocument, { zoneId, id, extraDescs });
  return d.updateRoomExtraDescriptions.extraDescs.map(e => ({
    keywords: e.keywords,
    description: e.description,
  }));
}
