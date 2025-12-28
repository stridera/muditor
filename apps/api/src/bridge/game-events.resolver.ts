import {
  Resolver,
  Subscription,
  Query,
  Args,
  Int,
  ObjectType,
  Field,
} from '@nestjs/graphql';
import { BridgeService } from './bridge.service';
import { GameEvent, GameEventType, GameEventCategory } from './game-event.dto';

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
  })
  gameEvents() {
    return this.bridgeService.getAllEvents();
  }

  /**
   * Subscribe to game events filtered by types
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to specific types of game events',
  })
  gameEventsByTypes(
    @Args('types', { type: () => [GameEventType] }) types: GameEventType[]
  ) {
    return this.bridgeService.getEventsByTypes(types);
  }

  /**
   * Subscribe to game events filtered by category
   */
  @Subscription(() => GameEvent, {
    description:
      'Subscribe to game events by category (player, chat, admin, world)',
  })
  gameEventsByCategory(
    @Args('category', { type: () => GameEventCategory })
    category: GameEventCategory
  ) {
    return this.bridgeService.getEventsByCategory(category);
  }

  /**
   * Subscribe to chat messages only
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to all chat messages (gossip, shout, say, etc.)',
  })
  chatMessages() {
    return this.bridgeService.getEventsByCategory(GameEventCategory.CHAT);
  }

  /**
   * Subscribe to player activity events (login, logout, death, level up)
   */
  @Subscription(() => GameEvent, {
    description:
      'Subscribe to player activity events (login, logout, death, level up)',
  })
  playerActivity() {
    return this.bridgeService.getEventsByCategory(GameEventCategory.PLAYER);
  }

  /**
   * Subscribe to admin alerts
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to admin alerts and system events',
  })
  adminAlerts() {
    return this.bridgeService.getEventsByCategory(GameEventCategory.ADMIN);
  }

  /**
   * Subscribe to world events
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to world events (zone loads, resets, boss spawns)',
  })
  worldEvents() {
    return this.bridgeService.getEventsByCategory(GameEventCategory.WORLD);
  }

  /**
   * Subscribe to events for a specific player
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to events involving a specific player',
  })
  playerEvents(@Args('playerName') playerName: string) {
    return this.bridgeService.getPlayerEvents(playerName);
  }

  /**
   * Subscribe to events for a specific zone
   */
  @Subscription(() => GameEvent, {
    description: 'Subscribe to events in a specific zone',
  })
  zoneEvents(@Args('zoneId', { type: () => Int }) zoneId: number) {
    return this.bridgeService.getZoneEvents(zoneId);
  }
}
