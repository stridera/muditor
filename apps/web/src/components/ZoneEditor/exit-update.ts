/**
 * In-place exit editing for the zone editor.
 *
 * Exits used to be edited by deleting the row and recreating it, which dropped
 * every column the client did not resend (flags, defaultState, hitPoints) and
 * left the UI showing an exit that was already gone when the create failed.
 * Now a single updateRoomExit mutation addresses the exit by
 * (room zone, room id, direction), every field is sent, and `null` clears.
 */

export interface ExitLike {
  id: string;
  direction: string;
  toZoneId: number | null;
  toRoomId: number | null;
  description?: string | null;
  flags?: string[];
  defaultState?: string;
  hitPoints?: number | null;
  keywords?: string[];
  keyZoneId?: number | null;
  keyId?: number | null;
}

interface RoomWithExits<E extends ExitLike> {
  id: number;
  zoneId: number;
  exits?: E[];
}

export interface UpdateRoomExitVariables {
  roomZoneId: number;
  roomId: number;
  direction: string;
  toZoneId: number | null;
  toRoomId: number | null;
  description: string | null;
  keywords: string[];
  flags: string[];
  keyZoneId: number | null;
  keyId: number | null;
  defaultState: string;
  hitPoints: number | null;
}

/** `patch` wins when it has the key (even if null/empty); otherwise keep existing. */
function pick<T, K extends keyof T>(
  patch: Partial<T>,
  existing: T,
  key: K
): T[K] {
  return key in patch ? (patch[key] as T[K]) : existing[key];
}

/** Merge a patch over an existing exit (used for the optimistic UI update). */
export function applyExitPatch<E extends ExitLike>(
  existing: E,
  patch: Partial<E>
): E {
  return { ...existing, ...patch };
}

/** Build the full-field mutation input. Nothing is left to server defaults. */
export function buildUpdateRoomExitInput(
  room: { id: number; zoneId: number },
  existing: ExitLike,
  patch: Partial<ExitLike>
): UpdateRoomExitVariables {
  const description = pick(patch, existing, 'description');
  return {
    roomZoneId: room.zoneId,
    roomId: room.id,
    direction: existing.direction,
    toZoneId: pick(patch, existing, 'toZoneId') ?? null,
    toRoomId: pick(patch, existing, 'toRoomId') ?? null,
    description:
      description && description.trim().length > 0 ? description : null,
    keywords: (pick(patch, existing, 'keywords') ?? []).filter(
      k => k.trim().length > 0
    ),
    flags: pick(patch, existing, 'flags') ?? [],
    keyZoneId: pick(patch, existing, 'keyZoneId') ?? null,
    keyId: pick(patch, existing, 'keyId') ?? null,
    defaultState: pick(patch, existing, 'defaultState') ?? 'OPEN',
    hitPoints: pick(patch, existing, 'hitPoints') ?? null,
  };
}

export interface ServerExit {
  id: string;
  direction: string;
  toZoneId?: number | null;
  toRoomId?: number | null;
  description?: string | null;
  keywords?: string[] | null;
  keyZoneId?: number | null;
  keyId?: number | null;
  flags?: string[] | null;
  defaultState?: string | null;
  hitPoints?: number | null;
}

export function exitFromServer(exit: ServerExit): ExitLike {
  return {
    id: exit.id,
    direction: exit.direction,
    toZoneId: exit.toZoneId ?? null,
    toRoomId: exit.toRoomId ?? null,
    description: exit.description ?? null,
    keywords: exit.keywords ?? [],
    keyZoneId: exit.keyZoneId ?? null,
    keyId: exit.keyId ?? null,
    flags: exit.flags ?? [],
    defaultState: exit.defaultState ?? 'OPEN',
    hitPoints: exit.hitPoints ?? null,
  };
}

export interface ExitUpdateResult {
  ok: boolean;
  error?: string;
}

/**
 * Optimistically apply the patch, send one in-place update, then reconcile
 * with the server's row. On failure only this exit is restored to its prior
 * value (the row was never deleted, so the restored state is the truth).
 */
export async function updateExitInPlace<
  E extends ExitLike,
  R extends RoomWithExits<E>,
>(args: {
  room: { id: number; zoneId: number };
  existing: E;
  patch: Partial<E>;
  setRooms: (updater: (rooms: R[]) => R[]) => void;
  send: (
    variables: UpdateRoomExitVariables
  ) => Promise<{ ok: boolean; json: unknown }>;
}): Promise<ExitUpdateResult> {
  const { room, existing, patch, setRooms, send } = args;
  const replaceExit = (next: E) =>
    setRooms(rs =>
      rs.map(r =>
        r.id === room.id && r.zoneId === room.zoneId
          ? {
              ...r,
              exits: (r.exits || []).map(e =>
                e.id === existing.id ? next : e
              ),
            }
          : r
      )
    );

  replaceExit(applyExitPatch(existing, patch));
  try {
    const { ok, json } = await send(
      buildUpdateRoomExitInput(room, existing, patch)
    );
    const body = json as {
      errors?: Array<{ message?: string }>;
      data?: { updateRoomExit?: ServerExit };
    };
    if (!ok || body.errors || !body.data?.updateRoomExit) {
      replaceExit(existing);
      return {
        ok: false,
        error: body.errors?.[0]?.message ?? 'Failed to update exit',
      };
    }
    replaceExit(exitFromServer(body.data.updateRoomExit) as E);
    return { ok: true };
  } catch (e) {
    replaceExit(existing);
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Network error',
    };
  }
}
