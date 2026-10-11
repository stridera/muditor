import { UnauthorizedException, UseGuards } from '@nestjs/common';
import {
  Resolver,
  Subscription,
  Query,
  Args,
  Int,
  ObjectType,
  Field,
} from '@nestjs/graphql';
import { UserRole, type Users } from '@muditor/db';
import { filter, type Observable } from 'rxjs';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { hasActiveBan } from '../auth/ban.util';
import { isTokenVersionCurrent } from '../auth/token-version.util';
import { DatabaseService } from '../database/database.service';
import { BridgeService } from './bridge.service';
import {
  ADMIN_EVENT_MIN_ROLE,
  canViewEvent,
  type EventViewer,
} from './game-event-access';
import { GameEvent, GameEventType, GameEventCategory } from './game-event.dto';

/**
 * Convert an RxJS Observable into an AsyncIterableIterator
 * required by GraphQL subscription resolvers.
 */
function toAsyncIterable<T>(
  observable: Observable<T>
): AsyncIterableIterator<T> {
  const pullQueue: Array<{
    resolve: (result: IteratorResult<T>) => void;
    reject: (error: unknown) => void;
  }> = [];
  const pushQueue: T[] = [];
  let done = false;
  let error: unknown = null;

  const subscription = observable.subscribe({
    next(value: T) {
      if (pullQueue.length > 0) {
        pullQueue.shift()!.resolve({ value, done: false });
      } else {
        pushQueue.push(value);
      }
    },
    error(err: unknown) {
      error = err;
      done = true;
      for (const waiter of pullQueue.splice(0)) {
        waiter.reject(err);
      }
    },
    complete() {
      done = true;
      for (const waiter of pullQueue.splice(0)) {
        waiter.resolve({ value: undefined as unknown as T, done: true });
      }
    },
  });

  return {
    next(): Promise<IteratorResult<T>> {
      if (pushQueue.length > 0) {
        return Promise.resolve({ value: pushQueue.shift()!, done: false });
      }
      if (done) {
        if (error) return Promise.reject(error);
        return Promise.resolve({
          value: undefined as unknown as T,
          done: true,
        });
      }
      return new Promise((resolve, reject) => {
        pullQueue.push({ resolve, reject });
      });
    },
    return(): Promise<IteratorResult<T>> {
      subscription.unsubscribe();
      done = true;
      for (const waiter of pullQueue.splice(0)) {
        waiter.resolve({ value: undefined as unknown as T, done: true });
      }
      return Promise.resolve({ value: undefined as unknown as T, done: true });
    },
    throw(err: unknown): Promise<IteratorResult<T>> {
      subscription.unsubscribe();
      done = true;
      return Promise.reject(err);
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}

/**
 * Bridge connection status
 */
@ObjectType({ description: 'Bridge connection status' })
class BridgeStatus {
  @Field()
  connected!: boolean;

  @Field(() => Int)
  subscribedChannels!: number;
}

const REVALIDATE_MS = 60_000;

/**
 * GraphQL resolver for game event subscriptions and queries.
 *
 * Every subscription requires a logged-in, non-banned, non-revoked user
 * (GraphQLJwtAuthGuard) and each delivered event is filtered per subscriber
 * (see game-event-access.ts): the websocket carries private tells and staff
 * alerts, so a guard alone is not enough.
 */
@Resolver()
export class GameEventsResolver {
  constructor(
    private readonly bridgeService: BridgeService,
    private readonly databaseService: DatabaseService
  ) {}

  /** Role, linked characters and clans of the subscriber, for per-event filtering. */
  private async loadViewer(
    user: Pick<Users, 'id' | 'role'>
  ): Promise<EventViewer> {
    const characters = await this.databaseService.characters.findMany({
      where: { userId: user.id },
      select: { name: true, clanMembership: { select: { clanId: true } } },
    });
    return {
      userId: user.id,
      role: user.role,
      characterNames: new Set(characters.map(c => c.name.toLowerCase())),
      clanIds: new Set(
        characters.flatMap(c =>
          c.clanMembership ? [c.clanMembership.clanId] : []
        )
      ),
    };
  }

  /**
   * Stream `source` to one subscriber: each event passes `canViewEvent` for
   * that subscriber only. Every REVALIDATE_MS the subscriber is re-checked
   * (deleted, banned, token revoked, role/characters changed) so a long-lived
   * socket cannot outlive a ban or role change; a failed check ends the stream.
   */
  private async streamFor(
    user: Users & { tokenVersionClaim?: number },
    source: Observable<GameEvent>
  ): Promise<AsyncIterableIterator<GameEvent>> {
    let viewer = await this.loadViewer(user);
    const claim = user.tokenVersionClaim ?? user.tokenVersion ?? 0;
    let revoked = false;

    const timer = setInterval(() => {
      void this.revalidate(user.id, claim).then(
        next => {
          if (next) viewer = next;
          else revoked = true;
        },
        () => {
          revoked = true;
        }
      );
    }, REVALIDATE_MS);
    timer.unref();

    const iterator = toAsyncIterable(
      source.pipe(
        filter(event => {
          if (revoked) throw new UnauthorizedException('Session revoked');
          return canViewEvent(viewer, event);
        })
      )
    );
    const originalReturn = iterator.return!.bind(iterator);
    iterator.return = () => {
      clearInterval(timer);
      return originalReturn();
    };
    return iterator;
  }

  private async revalidate(
    userId: string,
    tokenVersionClaim: number
  ): Promise<EventViewer | null> {
    const row = await this.databaseService.users.findUnique({
      where: { id: userId },
      select: { id: true, role: true, deletedAt: true, tokenVersion: true },
    });
    if (!row || row.deletedAt) return null;
    if (!isTokenVersionCurrent({ tokenVersion: tokenVersionClaim }, row)) {
      return null;
    }
    if (await hasActiveBan(this.databaseService, userId)) return null;
    return this.loadViewer(row);
  }

  /**
   * Query the bridge connection status
   */
  @Query(() => BridgeStatus, {
    description: 'Get the FieryMUD bridge connection status',
  })
  bridgeStatus(): BridgeStatus {
    return this.bridgeService.getStats();
  }

  /**
   * Subscribe to all game events
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to all game events from FieryMUD',
    resolve: (payload: GameEvent) => payload,
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  gameEvents(@CurrentUser() user: Users) {
    return this.streamFor(user, this.bridgeService.getAllEvents());
  }

  /**
   * Subscribe to game events filtered by types
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to specific types of game events',
    resolve: (payload: GameEvent) => payload,
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  gameEventsByTypes(
    @CurrentUser() user: Users,
    @Args('types', { type: () => [GameEventType] }) types: GameEventType[]
  ) {
    return this.streamFor(user, this.bridgeService.getEventsByTypes(types));
  }

  /**
   * Subscribe to game events filtered by category
   */
  @Subscription(() => GameEvent, {
    description:
      'Subscribe to game events by category (player, chat, admin, world)',
    resolve: (payload: GameEvent) => payload,
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  gameEventsByCategory(
    @CurrentUser() user: Users,
    @Args('category', { type: () => GameEventCategory })
    category: GameEventCategory
  ) {
    return this.streamFor(
      user,
      this.bridgeService.getEventsByCategory(category)
    );
  }

  /**
   * Subscribe to chat messages only
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to all chat messages (gossip, shout, say, etc.)',
    resolve: (payload: GameEvent) => payload,
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  chatMessages(@CurrentUser() user: Users) {
    return this.streamFor(
      user,
      this.bridgeService.getEventsByCategory(GameEventCategory.CHAT)
    );
  }

  /**
   * Subscribe to player activity events (login, logout, death, level up)
   */
  @Subscription(() => GameEvent, {
    description:
      'Subscribe to player activity events (login, logout, death, level up)',
    resolve: (payload: GameEvent) => payload,
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  playerActivity(@CurrentUser() user: Users) {
    return this.streamFor(
      user,
      this.bridgeService.getEventsByCategory(GameEventCategory.PLAYER)
    );
  }

  /**
   * Subscribe to admin alerts
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to admin alerts and system events',
    resolve: (payload: GameEvent) => payload,
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(ADMIN_EVENT_MIN_ROLE)
  adminAlerts(@CurrentUser() user: Users) {
    return this.streamFor(
      user,
      this.bridgeService.getEventsByCategory(GameEventCategory.ADMIN)
    );
  }

  /**
   * Subscribe to world events
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to world events (zone loads, resets, boss spawns)',
    resolve: (payload: GameEvent) => payload,
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  worldEvents(@CurrentUser() user: Users) {
    return this.streamFor(
      user,
      this.bridgeService.getEventsByCategory(GameEventCategory.WORLD)
    );
  }

  /**
   * Subscribe to events for a specific player
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to events involving a specific player',
    resolve: (payload: GameEvent) => payload,
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  playerEvents(
    @CurrentUser() user: Users,
    @Args('playerName') playerName: string
  ) {
    return this.streamFor(user, this.bridgeService.getPlayerEvents(playerName));
  }

  /**
   * Subscribe to events for a specific zone
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to events in a specific zone',
    resolve: (payload: GameEvent) => payload,
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.PLAYER)
  zoneEvents(
    @CurrentUser() user: Users,
    @Args('zoneId', { type: () => Int }) zoneId: number
  ) {
    return this.streamFor(user, this.bridgeService.getZoneEvents(zoneId));
  }
}
