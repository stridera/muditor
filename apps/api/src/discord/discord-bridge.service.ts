import {
  Injectable,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { DiscordService } from './discord.service';
import { DatabaseService } from '../database/database.service';

/**
 * Service that bridges Redis game events to Discord
 *
 * Subscribes to FieryMUD event channels and forwards relevant
 * events to configured Discord channels.
 */
@Injectable()
export class DiscordBridgeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DiscordBridgeService.name);
  private subscriber: Redis | null = null;
  private readonly redisUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly discordService: DiscordService,
    private readonly databaseService: DatabaseService
  ) {
    this.redisUrl =
      this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
  }

  async onModuleInit() {
    try {
      await this.connectToRedis();
      await this.subscribeToChannels();
      this.logger.log('Discord bridge connected to Redis event stream');
    } catch (error) {
      this.logger.error('Failed to initialize Discord bridge', error);
    }
  }

  async onModuleDestroy() {
    if (this.subscriber) {
      this.logger.log('Disconnecting Discord bridge from Redis...');
      await this.subscriber.quit();
      this.subscriber = null;
    }
  }

  private async connectToRedis() {
    this.subscriber = new Redis(this.redisUrl, {
      retryStrategy: times => {
        if (times > 10) {
          this.logger.error('Redis connection failed after 10 retries');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
      lazyConnect: true,
    });

    this.subscriber.on('error', error => {
      this.logger.error('Redis subscriber error', error);
    });

    this.subscriber.on('reconnecting', () => {
      this.logger.warn('Redis subscriber reconnecting...');
    });

    await this.subscriber.connect();
  }

  private async subscribeToChannels() {
    if (!this.subscriber) return;

    const channels = [
      'fierymud:events:chat',
      'fierymud:events:player',
      'fierymud:events:admin',
    ];

    await this.subscriber.subscribe(...channels);
    this.logger.log(`Discord bridge subscribed to: ${channels.join(', ')}`);

    this.subscriber.on('message', async (channel: string, message: string) => {
      try {
        await this.handleEvent(channel, message);
      } catch (error) {
        this.logger.error(`Error handling event from ${channel}`, error);
      }
    });
  }

  private async handleEvent(channel: string, rawMessage: string) {
    let event: GameEvent;

    try {
      event = JSON.parse(rawMessage) as GameEvent;
    } catch {
      this.logger.warn(`Invalid JSON from ${channel}: ${rawMessage}`);
      return;
    }

    switch (channel) {
      case 'fierymud:events:chat':
        await this.handleChatEvent(event);
        break;
      case 'fierymud:events:player':
        await this.handlePlayerEvent(event);
        break;
      case 'fierymud:events:admin':
        await this.handleAdminEvent(event);
        break;
    }
  }

  private async handleChatEvent(event: GameEvent) {
    // Only forward gossip messages to Discord
    if (event.type !== 'CHAT_GOSSIP') return;

    // Don't echo back messages from Discord
    if (event.message?.startsWith('[Discord]')) return;

    await this.discordService.sendGossipToDiscord(
      event.playerName ?? 'Unknown',
      event.message ?? ''
    );
  }

  private async handlePlayerEvent(event: GameEvent) {
    const config = await this.databaseService.discordConfig.findFirst();
    if (!config?.announcementChannelId) return;

    const playerName = event.playerName ?? 'Unknown';
    let announcement: string | null = null;

    switch (event.type) {
      case 'PLAYER_LOGIN':
        announcement = `**${playerName}** has entered the realm.`;
        break;
      case 'PLAYER_LOGOUT':
        announcement = `**${playerName}** has left the realm.`;
        break;
      case 'PLAYER_DEATH':
        announcement = `**${playerName}** has been slain!`;
        break;
      case 'PLAYER_LEVEL_UP': {
        const newLevel = event.metadata?.newLevel;
        announcement = `**${playerName}** has reached level ${newLevel}!`;
        break;
      }
    }

    if (announcement) {
      await this.discordService.sendToChannel(
        config.announcementChannelId,
        announcement
      );
    }
  }

  private async handleAdminEvent(event: GameEvent) {
    const severity = event.metadata?.severity as string | undefined;

    // Only forward warnings and critical alerts
    if (severity === 'info') return;

    const prefix = severity === 'critical' ? '@here ' : '';
    await this.discordService.sendAdminAlert(`${prefix}${event.message ?? ''}`);
  }
}

/**
 * Event type matching C++ EventPublisher::to_json() output:
 * { type, timestamp, message, playerName?, zoneId?, roomId?, metadata? }
 */
interface GameEvent {
  type: string;
  timestamp: number;
  message?: string;
  playerName?: string;
  zoneId?: number;
  roomId?: string;
  metadata?: Record<string, unknown>;
}
