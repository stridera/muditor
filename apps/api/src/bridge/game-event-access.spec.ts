import { UserRole } from '@muditor/db';
import { canViewEvent, type EventViewer } from './game-event-access';
import { GameEvent, GameEventType } from './game-event.dto';

const viewer = (over: Partial<EventViewer> = {}): EventViewer => ({
  userId: 'u1',
  role: UserRole.PLAYER,
  characterNames: new Set(['alice']),
  clanIds: new Set([7]),
  ...over,
});

const ev = (type: GameEventType, over: Partial<GameEvent> = {}): GameEvent => ({
  type,
  timestamp: new Date(),
  message: 'hi',
  ...over,
});

describe('canViewEvent', () => {
  it("a non-recipient does not receive another user's tell", () => {
    const tell = ev(GameEventType.CHAT_TELL, {
      playerName: 'Bob',
      targetPlayer: 'Carol',
    });
    expect(canViewEvent(viewer(), tell)).toBe(false);
    // not even staff
    expect(canViewEvent(viewer({ role: UserRole.IMPLEMENTOR }), tell)).toBe(
      false
    );
  });

  it('the recipient (and sender) of a tell receive it, case-insensitively', () => {
    const toAlice = ev(GameEventType.CHAT_TELL, {
      playerName: 'Bob',
      targetPlayer: 'ALICE',
    });
    expect(canViewEvent(viewer(), toAlice)).toBe(true);
    const fromAlice = ev(GameEventType.CHAT_TELL, {
      playerName: 'Alice',
      targetPlayer: 'Bob',
    });
    expect(canViewEvent(viewer(), fromAlice)).toBe(true);
  });

  it('a user with no linked characters gets no tells', () => {
    const none = viewer({ characterNames: new Set() });
    expect(
      canViewEvent(
        none,
        ev(GameEventType.CHAT_TELL, { playerName: 'Bob', targetPlayer: 'Al' })
      )
    ).toBe(false);
  });

  it('clan chat only reaches members of that clan', () => {
    const clan = ev(GameEventType.CHAT_CLAN, {
      playerName: 'Bob',
      metadata: { clanId: 7 },
    });
    expect(canViewEvent(viewer(), clan)).toBe(true);
    expect(canViewEvent(viewer({ clanIds: new Set([8]) }), clan)).toBe(false);
    expect(
      canViewEvent(viewer(), ev(GameEventType.CHAT_CLAN, { playerName: 'Bob' }))
    ).toBe(false);
  });

  it('group chat is only visible to the owner of the sender or target', () => {
    const g = ev(GameEventType.CHAT_GROUP, { playerName: 'Bob' });
    expect(canViewEvent(viewer(), g)).toBe(false);
    expect(
      canViewEvent(
        viewer(),
        ev(GameEventType.CHAT_GROUP, { playerName: 'Alice' })
      )
    ).toBe(true);
  });

  it('ADMIN_* needs a staff role; AUTH_* is never streamed', () => {
    const admin = ev(GameEventType.ADMIN_CRASH);
    expect(canViewEvent(viewer(), admin)).toBe(false);
    expect(canViewEvent(viewer({ role: UserRole.IMMORTAL }), admin)).toBe(
      false
    );
    expect(canViewEvent(viewer({ role: UserRole.BUILDER }), admin)).toBe(true);
    expect(
      canViewEvent(
        viewer({ role: UserRole.IMPLEMENTOR }),
        ev(GameEventType.AUTH_LOGIN_REQUEST)
      )
    ).toBe(false);
  });

  it('public channels and world/player events reach any logged-in user', () => {
    for (const t of [
      GameEventType.CHAT_GOSSIP,
      GameEventType.CHAT_SHOUT,
      GameEventType.PLAYER_LOGIN,
      GameEventType.ZONE_RESET,
    ]) {
      expect(canViewEvent(viewer(), ev(t, { playerName: 'Bob' }))).toBe(true);
    }
  });
});
