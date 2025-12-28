import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
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

type RedisChannel = (typeof REDIS_CHANNELS)[number];

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

  async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379'
    );

    try {
      this.subscriber = new Redis(redisUrl, {
        retryStrategy: times => {
          const delay = Math.min(times * 1000, 30000);
          this.logger.warn(
            `Redis connection retry #${times}, next attempt in ${delay}ms`
          );
          return delay;
        },
        lazyConnect: true,
      });

      this.subscriber.on('message', this.handleMessage.bind(this));
      this.subscriber.on('connect', () => {
        this.isConnected = true;
        this.logger.log('Connected to Redis for game event subscription');
      });
      this.subscriber.on('error', error => {
        this.logger.error('Redis subscriber error:', error.message);
      });
      this.subscriber.on('close', () => {
        this.isConnected = false;
        this.logger.warn('Redis connection closed');
      });

      await this.subscriber.connect();
      await this.subscriber.subscribe(...REDIS_CHANNELS);
      this.logger.log(`Subscribed to channels: ${REDIS_CHANNELS.join(', ')}`);
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      // Don't throw - allow the service to start without Redis
      // It will retry connection automatically
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.subscriber) {
      await this.subscriber.unsubscribe(...REDIS_CHANNELS);
      await this.subscriber.quit();
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
        playerName: rawEvent.player_name,
        zoneId: rawEvent.zone_id,
        roomVnum: rawEvent.room_vnum,
        targetPlayer: rawEvent.target_player,
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
