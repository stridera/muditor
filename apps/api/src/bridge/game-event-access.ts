import { UserRole } from '@muditor/db';
import { roleAtLeast } from '../auth/role.util';
import { GameEvent, GameEventType } from './game-event.dto';

/** Minimum role to see ADMIN_* events; matches the admin queries (onlinePlayers, serverStatus). */
export const ADMIN_EVENT_MIN_ROLE = UserRole.BUILDER;

/** What a subscriber is allowed to see: their role and the characters/clans they own. */
export interface EventViewer {
  userId: string;
  role: UserRole;
  /** Lower-cased names of the characters linked to the user's account. */
  characterNames: ReadonlySet<string>;
  /** Clans the user's linked characters belong to. */
  clanIds: ReadonlySet<number>;
}

/** Channels everyone who is logged in may read. */
const PUBLIC_CHAT: ReadonlySet<GameEventType> = new Set([
  GameEventType.CHAT_GOSSIP,
  GameEventType.CHAT_SHOUT,
  GameEventType.CHAT_OOC,
]);

function owns(viewer: EventViewer, name: string | undefined | null): boolean {
  return !!name && viewer.characterNames.has(name.toLowerCase());
}

/**
 * Per-subscriber visibility of a game event. Fails closed: anything not
 * explicitly allowed here is dropped.
 *
 * - ADMIN_* needs BUILDER+; AUTH_* (login codes) is never streamed.
 * - CHAT_TELL: only the sender's or the recipient's owner.
 * - CHAT_CLAN: owners of a character in the clan named by `metadata.clanId`
 *   (plus the sender's owner). The game server does not publish a clan id
 *   yet, so until it does only the sender's owner sees clan chat.
 * - CHAT_GROUP and other private/room-local chat (say, emote): only the
 *   owner of the sender or target character (the event has no member list).
 * - Public channels, player and world events: any authenticated user.
 */
export function canViewEvent(viewer: EventViewer, event: GameEvent): boolean {
  const type = event.type;

  if (type.startsWith('AUTH_')) return false;
  if (type.startsWith('ADMIN_')) {
    return roleAtLeast(viewer.role, ADMIN_EVENT_MIN_ROLE);
  }

  if (type.startsWith('CHAT_')) {
    if (PUBLIC_CHAT.has(type)) return true;

    if (owns(viewer, event.playerName) || owns(viewer, event.targetPlayer)) {
      return true;
    }
    if (type === GameEventType.CHAT_CLAN) {
      const clanId = event.metadata?.['clanId'];
      return typeof clanId === 'number' && viewer.clanIds.has(clanId);
    }
    return false;
  }

  return true;
}
