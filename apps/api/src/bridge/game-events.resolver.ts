import {
  Resolver,
  Subscription,
  Query,
  Args,
  Int,
  ObjectType,
  Field,
} from '@nestjs/graphql';
import type { Observable } from 'rxjs';
import { BridgeService } from './bridge.service';
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

/**
 * GraphQL resolver for game event subscriptions and queries
 */
@Resolver()
export class GameEventsResolver {
  constructor(private readonly bridgeService: BridgeService) {}

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
  gameEvents() {
    return toAsyncIterable(this.bridgeService.getAllEvents());
  }

  /**
   * Subscribe to game events filtered by types
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to specific types of game events',
    resolve: (payload: GameEvent) => payload,
  })
  gameEventsByTypes(
    @Args('types', { type: () => [GameEventType] }) types: GameEventType[]
  ) {
    return toAsyncIterable(this.bridgeService.getEventsByTypes(types));
  }

  /**
   * Subscribe to game events filtered by category
   */
  @Subscription(() => GameEvent, {
    description:
      'Subscribe to game events by category (player, chat, admin, world)',
    resolve: (payload: GameEvent) => payload,
  })
  gameEventsByCategory(
    @Args('category', { type: () => GameEventCategory })
    category: GameEventCategory
  ) {
    return toAsyncIterable(this.bridgeService.getEventsByCategory(category));
  }

  /**
   * Subscribe to chat messages only
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to all chat messages (gossip, shout, say, etc.)',
    resolve: (payload: GameEvent) => payload,
  })
  chatMessages() {
    return toAsyncIterable(
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
  playerActivity() {
    return toAsyncIterable(
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
  adminAlerts() {
    return toAsyncIterable(
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
  worldEvents() {
    return toAsyncIterable(
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
  playerEvents(@Args('playerName') playerName: string) {
    return toAsyncIterable(this.bridgeService.getPlayerEvents(playerName));
  }

  /**
   * Subscribe to events for a specific zone
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to events in a specific zone',
    resolve: (payload: GameEvent) => payload,
  })
  zoneEvents(@Args('zoneId', { type: () => Int }) zoneId: number) {
    return toAsyncIterable(this.bridgeService.getZoneEvents(zoneId));
  }
}
