import {
  Injectable,
  type OnModuleInit,
  type OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type Redis from 'ioredis';
import { createRedisClient, getRedisUrl } from '../common/redis';
import { Subject, Observable, filter } from 'rxjs';
import {
  GameEvent,
  GameEventType,
  GameEventCategory,
  getEventCategory,
} from './game-event.dto';

/**
 * Redis channels for game events (must match FieryMUD's event_types.hpp)
 */
const REDIS_CHANNELS = [
  'fierymud:events:player',
  'fierymud:events:chat',
  'fierymud:events:admin',
  'fierymud:events:world',
] as const;

/**
 * BridgeService subscribes to Redis pub/sub channels and emits game events
 * for GraphQL subscriptions.
 */
@Injectable()
export class BridgeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BridgeService.name);
  private subscriber: Redis | null = null;
  private readonly eventSubject = new Subject<GameEvent>();
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const redisUrl = getRedisUrl(this.configService);
    if (!redisUrl) {
      this.logger.log('Redis not configured — game event bridge disabled');
      return;
    }

    const subscriber = createRedisClient(redisUrl, {
      logger: this.logger,
      label: 'Redis (game events)',
      subscriber: true,
    });
    this.subscriber = subscriber;

    subscriber.on('message', this.handleMessage.bind(this));
    subscriber.on('ready', () => {
      this.isConnected = true;
      this.logger.log('Connected to Redis for game event subscription');
    });
    subscriber.on('close', () => {
      this.isConnected = false;
    });

    // Queued until connected and re-issued by ioredis after a reconnect; must
    // not block application startup while Redis is down.
    subscriber.subscribe(...REDIS_CHANNELS).then(
      () =>
        this.logger.log(`Subscribed to channels: ${REDIS_CHANNELS.join(', ')}`),
      (error: unknown) =>
        this.logger.warn(
          `Failed to subscribe to game event channels: ${error instanceof Error ? error.message : String(error)}`
        )
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.subscriber) {
      // disconnect(), not quit(): quit waits for a reply from a server that may
      // be unreachable, and would also leave the reconnect loop running.
      this.subscriber.disconnect();
      this.subscriber = null;
    }
    this.eventSubject.complete();
  }

  /**
   * Handle incoming Redis messages and convert to GameEvent
   */
  private handleMessage(channel: string, message: string): void {
    try {
      const rawEvent = JSON.parse(message);

      const event: GameEvent = {
        type: this.parseEventType(rawEvent.type),
        timestamp: new Date(rawEvent.timestamp),
        message: rawEvent.message || '',
        playerName: rawEvent.playerName ?? rawEvent.player_name,
        zoneId: rawEvent.zoneId ?? rawEvent.zone_id,
        roomId: rawEvent.roomId ?? rawEvent.room_vnum ?? rawEvent.room_id,
        targetPlayer: rawEvent.metadata?.target ?? rawEvent.target_player,
        metadata: rawEvent.metadata,
      };

      this.logger.debug(
        `Received event: ${event.type} from ${event.playerName || 'system'}`
      );
      this.eventSubject.next(event);
    } catch (error) {
      this.logger.error(
        `Failed to parse event from channel ${channel}:`,
        error
      );
    }
  }

  /**
   * Parse event type string from FieryMUD to enum
   */
  private parseEventType(typeString: string): GameEventType {
    const normalized = typeString.toUpperCase().replace(/::/g, '_');
    if (Object.values(GameEventType).includes(normalized as GameEventType)) {
      return normalized as GameEventType;
    }
    this.logger.warn(
      `Unknown event type: ${typeString}, defaulting to ADMIN_WARNING`
    );
    return GameEventType.ADMIN_WARNING;
  }

  /**
   * Publish a local event (not from Redis) into the event stream.
   * Used when the API itself detects something that should trigger
   * a GraphQL subscription (e.g. DB-only changes from the game server).
   */
  publishLocalEvent(event: GameEvent): void {
    this.eventSubject.next(event);
  }

  /**
   * Get an observable of all game events
   */
  getAllEvents(): Observable<GameEvent> {
    return this.eventSubject.asObservable();
  }

  /**
   * Get an observable of game events filtered by types
   */
  getEventsByTypes(types: GameEventType[]): Observable<GameEvent> {
    return this.eventSubject.pipe(filter(event => types.includes(event.type)));
  }

  /**
   * Get an observable of game events filtered by category
   */
  getEventsByCategory(category: GameEventCategory): Observable<GameEvent> {
    return this.eventSubject.pipe(
      filter(event => getEventCategory(event.type) === category)
    );
  }

  /**
   * Get an observable of game events filtered by categories
   */
  getEventsByCategories(
    categories: GameEventCategory[]
  ): Observable<GameEvent> {
    return this.eventSubject.pipe(
      filter(event => categories.includes(getEventCategory(event.type)))
    );
  }

  /**
   * Get an observable of player-specific events
   */
  getPlayerEvents(playerName: string): Observable<GameEvent> {
    return this.eventSubject.pipe(
      filter(
        event =>
          event.playerName === playerName || event.targetPlayer === playerName
      )
    );
  }

  /**
   * Get an observable of events for a specific zone
   */
  getZoneEvents(zoneId: number): Observable<GameEvent> {
    return this.eventSubject.pipe(filter(event => event.zoneId === zoneId));
  }

  /**
   * Check if the service is connected to Redis
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get statistics about event processing
   */
  getStats(): { connected: boolean; subscribedChannels: number } {
    return {
      connected: this.isConnected,
      subscribedChannels: REDIS_CHANNELS.length,
    };
  }
}
