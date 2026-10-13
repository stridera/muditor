/**
 * Exit creation by dragging between room handles. Every side of a room has a
 * visible source handle with an invisible target handle stacked on top of it
 * (RoomNode), so a drag usually starts on a target. The canvas therefore runs
 * in loose connection mode and a handle id is read with or without its
 * `-target` suffix.
 */
import type { Connection } from 'reactflow';

/** Handle id on a room node -> exit direction. */
const HANDLE_DIRECTIONS: Record<string, string> = {
  top: 'NORTH',
  bottom: 'SOUTH',
  left: 'WEST',
  right: 'EAST',
  up: 'UP',
  down: 'DOWN',
};

export function directionForHandle(
  handleId: string | null | undefined
): string | undefined {
  if (!handleId) return undefined;
  return HANDLE_DIRECTIONS[handleId.replace(/-target$/, '')];
}

/** The exit a finished drag asks for, or null when it names no side or room. */
export function exitFromConnection(
  connection: Pick<Connection, 'source' | 'target' | 'sourceHandle'>
): { fromId: number; toId: number; direction: string } | null {
  const direction = directionForHandle(connection.sourceHandle);
  const fromId = parseInt(connection.source ?? '', 10);
  const toId = parseInt(connection.target ?? '', 10);
  if (!direction || Number.isNaN(fromId) || Number.isNaN(toId)) return null;
  return { fromId, toId, direction };
}
