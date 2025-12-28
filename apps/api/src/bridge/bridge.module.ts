import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { DatabaseModule } from '../database/database.module';
import { BridgeService } from './bridge.service';
import { GameEventsResolver } from './game-events.resolver';
import { GameAdminService } from './game-admin.service';
import { GameAdminResolver } from './game-admin.resolver';
import { RateLimitGuard } from './rate-limit.guard';
import { AuditService } from './audit.service';

/**
 * BridgeModule provides real-time game event streaming and admin control for FieryMUD.
 *
 * Features:
 * - Redis pub/sub subscription to game events
 * - GraphQL subscriptions for real-time updates
 * - Event filtering by type, category, player, and zone
 * - Admin API for remote game server management
 *
 * Configuration:
 * - REDIS_URL: Redis connection URL (default: redis://localhost:6379)
 * - FIERYMUD_ADMIN_URL: Admin API URL (default: http://localhost:8080)
 * - FIERYMUD_ADMIN_TOKEN: Bearer token for admin API authentication
 *
 * GraphQL Subscriptions:
 * - gameEvents: All game events
 * - chatMessages: Chat channel messages
 * - playerActivity: Login, logout, death, level up
 * - adminAlerts: System alerts and warnings
 * - worldEvents: Zone loads, resets, boss spawns
 * - playerEvents(playerName): Events for a specific player
 * - zoneEvents(zoneId): Events in a specific zone
 *
 * GraphQL Queries (Admin):
 * - onlinePlayers: List online players (BUILDER+)
 * - serverStatus: Server stats and info (BUILDER+)
 * - gameServerConnected: Check API connectivity
 *
 * GraphQL Mutations (Admin):
 * - executeGameCommand: Run god command (CODER+)
 * - broadcastMessage: Send to all players (CODER+)
 * - kickPlayer: Disconnect player (GOD)
 */
@Module({
  imports: [
    ConfigModule,
    AuthModule,
    forwardRef(() => UsersModule),
    DatabaseModule,
  ],
  providers: [
    BridgeService,
    GameEventsResolver,
    GameAdminService,
    GameAdminResolver,
    RateLimitGuard,
    AuditService,
  ],
  exports: [BridgeService, GameAdminService, AuditService],
})
export class BridgeModule {}
