import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import type { ConfigService } from '@nestjs/config';
import { UserRole, type Users } from '@muditor/db';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import {
  MINIMUM_ROLE_KEY,
  MinimumRoleGuard,
} from '../auth/guards/minimum-role.guard';
import type { DatabaseService } from '../database/database.service';
import { BridgeService } from './bridge.service';
import { GameEventsResolver } from './game-events.resolver';
import { GameEvent, GameEventType } from './game-event.dto';

const SUBSCRIPTIONS = [
  'gameEvents',
  'gameEventsByTypes',
  'gameEventsByCategory',
  'chatMessages',
  'playerActivity',
  'adminAlerts',
  'worldEvents',
  'playerEvents',
  'zoneEvents',
];

describe('GameEventsResolver subscriptions', () => {
  const proto = GameEventsResolver.prototype as unknown as Record<
    string,
    object
  >;

  it('every @Subscription requires login and the role guard', () => {
    const found = Object.getOwnPropertyNames(proto).filter(
      n =>
        typeof proto[n] === 'function' &&
        Reflect.getMetadata('graphql:resolver_type', proto[n]!) ===
          'Subscription'
    );
    expect(found.sort()).toEqual([...SUBSCRIPTIONS].sort());
    for (const name of found) {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        proto[name]!
      ) as unknown[];
      expect([name, guards]).toEqual([
        name,
        [GraphQLJwtAuthGuard, MinimumRoleGuard],
      ]);
    }
  });

  it('adminAlerts needs a staff role, the rest only a login', () => {
    for (const name of SUBSCRIPTIONS) {
      expect([
        name,
        Reflect.getMetadata(MINIMUM_ROLE_KEY, proto[name]!),
      ]).toEqual([
        name,
        name === 'adminAlerts' ? UserRole.BUILDER : UserRole.PLAYER,
      ]);
    }
  });
});

describe('GameEventsResolver per-subscriber delivery', () => {
  const bridge = new BridgeService({
    get: () => undefined,
  } as unknown as ConfigService);
  const db = {
    characters: { findMany: jest.fn() },
    users: { findUnique: jest.fn() },
    banRecords: { findFirst: jest.fn() },
  };
  const resolver = new GameEventsResolver(
    bridge,
    db as unknown as DatabaseService
  );
  const user = {
    id: 'u1',
    role: UserRole.PLAYER,
    tokenVersion: 0,
  } as unknown as Users;
  const tell = (from: string, to: string): GameEvent => ({
    type: GameEventType.CHAT_TELL,
    timestamp: new Date(),
    message: `${from} -> ${to}`,
    playerName: from,
    targetPlayer: to,
  });

  beforeEach(() => {
    db.characters.findMany.mockResolvedValue([
      { name: 'Alice', clanMembership: null },
    ]);
  });

  it("a non-recipient does not receive another user's tell, the recipient does", async () => {
    const stream = await resolver.gameEvents(user);
    const received: string[] = [];
    const pump = (async () => {
      for (;;) {
        const r = await stream.next();
        if (r.done) return;
        received.push(r.value.message);
      }
    })();

    bridge.publishLocalEvent(tell('Bob', 'Carol')); // not Alice's
    bridge.publishLocalEvent(tell('Carol', 'Alice')); // addressed to Alice
    bridge.publishLocalEvent({
      type: GameEventType.ADMIN_CRASH,
      timestamp: new Date(),
      message: 'boom',
    }); // PLAYER role: no staff alerts
    bridge.publishLocalEvent({
      type: GameEventType.CHAT_GOSSIP,
      timestamp: new Date(),
      message: 'public',
      playerName: 'Bob',
    });
    await new Promise(r => setImmediate(r));
    await stream.return!();
    await pump;

    expect(received).toEqual(['Carol -> Alice', 'public']);
  });
});
