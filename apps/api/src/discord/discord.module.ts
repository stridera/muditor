import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordService } from './discord.service';
import { DiscordBridgeService } from './discord-bridge.service';
import { BridgeModule } from '../bridge/bridge.module';
import { DatabaseModule } from '../database/database.module';

/**
 * DiscordModule provides two-way Discord integration for FieryMUD.
 *
 * Features:
 * - Discord bot with slash commands (/who, /gossip, /link, /stats)
 * - Account linking between Discord and Muditor
 * - Two-way gossip channel bridging
 * - Admin alerts forwarding
 * - Player activity announcements
 *
 * Configuration (environment variables):
 * - DISCORD_BOT_TOKEN: Discord bot token from Developer Portal
 * - DISCORD_CLIENT_ID: Discord application client ID
 * - DISCORD_GUILD_ID: (optional) Guild ID for instant command registration
 * - REDIS_URL: Redis connection URL for event subscription
 *
 * Database Configuration:
 * - DiscordConfig table stores channel mappings
 * - DiscordLink table stores account links
 *
 * Slash Commands:
 * - /who: List online players
 * - /gossip <message>: Send to in-game gossip (requires linked account)
 * - /link <code>: Link Discord to Muditor account
 * - /stats: Show server statistics
 */
@Module({
  imports: [ConfigModule, BridgeModule, DatabaseModule],
  providers: [DiscordService, DiscordBridgeService],
  exports: [DiscordService, DiscordBridgeService],
})
export class DiscordModule {}
