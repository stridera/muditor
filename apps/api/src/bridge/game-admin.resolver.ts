import { UseGuards } from '@nestjs/common';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  Int,
  Float,
} from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import type { Users } from '@prisma/client';
import { GameAdminService } from './game-admin.service';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RateLimitGuard, RateLimit, AdminRateLimits } from './rate-limit.guard';
import { AuditService } from './audit.service';

/**
 * GraphQL type for online player
 */
@ObjectType({ description: 'Information about an online player in FieryMUD' })
class OnlinePlayerType {
  @Field()
  name!: string;

  @Field(() => Int)
  level!: number;

  @Field()
  class!: string;

  @Field()
  race!: string;

  @Field(() => Int)
  roomId!: number;

  @Field(() => Int)
  godLevel!: number;

  @Field()
  isLinkdead!: boolean;
}

/**
 * GraphQL type for server statistics
 */
@ObjectType({ description: 'Server statistics from FieryMUD' })
class ServerStatsType {
  @Field(() => Int)
  uptimeSeconds!: number;

  @Field(() => Int)
  totalConnections!: number;

  @Field(() => Int)
  currentConnections!: number;

  @Field(() => Int)
  peakConnections!: number;

  @Field(() => Int)
  totalCommands!: number;

  @Field(() => Int)
  failedCommands!: number;

  @Field(() => Int)
  totalLogins!: number;

  @Field(() => Int)
  failedLogins!: number;

  @Field(() => Float)
  commandsPerSecond!: number;
}

/**
 * GraphQL type for server info
 */
@ObjectType({ description: 'Server information from FieryMUD' })
class ServerInfoType {
  @Field()
  name!: string;

  @Field(() => Int)
  port!: number;

  @Field(() => Int)
  tlsPort!: number;

  @Field()
  maintenanceMode!: boolean;

  @Field()
  running!: boolean;
}

/**
 * GraphQL type for full server status
 */
@ObjectType({ description: 'Full server status from FieryMUD' })
class ServerStatusType {
  @Field(() => ServerStatsType)
  stats!: ServerStatsType;

  @Field(() => ServerInfoType)
  server!: ServerInfoType;
}

/**
 * GraphQL type for command result
 */
@ObjectType({ description: 'Result of executing a game command' })
class CommandResultType {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => String, { nullable: true })
  executor: string | undefined;

  @Field(() => String, { nullable: true })
  note: string | undefined;
}

/**
 * GraphQL type for kick result
 */
@ObjectType({ description: 'Result of kicking a player' })
class KickResultType {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field()
  reason!: string;
}

/**
 * GraphQL type for broadcast result
 */
@ObjectType({ description: 'Result of broadcasting a message' })
class BroadcastResultType {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => Int)
  recipientCount!: number;
}

/**
 * GraphQL resolver for FieryMUD admin operations
 *
 * Security:
 * - Requires authentication via JWT
 * - Role-based access control (BUILDER, CODER, GOD)
 * - Rate limiting per user per endpoint
 * - Full audit logging of all admin actions
 */
@Resolver()
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard, RateLimitGuard)
export class GameAdminResolver {
  constructor(
    private readonly gameAdminService: GameAdminService,
    private readonly auditService: AuditService
  ) {}

  /**
   * Get list of online players
   * Requires BUILDER role or higher
   * Rate limit: 30 requests per minute
   */
  @Query(() => [OnlinePlayerType], {
    description: 'Get list of online players in FieryMUD',
  })
  @MinimumRole(UserRole.BUILDER)
  @RateLimit(AdminRateLimits.PLAYERS)
  async onlinePlayers(): Promise<OnlinePlayerType[]> {
    return this.gameAdminService.getOnlinePlayers();
  }

  /**
   * Get server statistics and info
   * Requires BUILDER role or higher
   * Rate limit: 30 requests per minute
   */
  @Query(() => ServerStatusType, {
    description: 'Get server statistics and info from FieryMUD',
  })
  @MinimumRole(UserRole.BUILDER)
  @RateLimit(AdminRateLimits.STATS)
  async serverStatus(): Promise<ServerStatusType> {
    return this.gameAdminService.getServerStats();
  }

  /**
   * Check if the game server admin API is reachable
   * Requires authentication only
   */
  @Query(() => Boolean, {
    description: 'Check if FieryMUD admin API is connected',
  })
  async gameServerConnected(): Promise<boolean> {
    return this.gameAdminService.isConnected();
  }

  /**
   * Execute a god command on the game server
   * Requires CODER role or higher
   * Rate limit: 60 commands per minute
   * Audit logged
   */
  @Mutation(() => CommandResultType, {
    description: 'Execute a god command on FieryMUD',
  })
  @MinimumRole(UserRole.CODER)
  @RateLimit(AdminRateLimits.COMMAND)
  async executeGameCommand(
    @CurrentUser() user: Users,
    @Args('command') command: string,
    @Args('executor', { nullable: true }) executor?: string
  ): Promise<CommandResultType> {
    const result = await this.gameAdminService.executeCommand(
      command,
      executor
    );

    // Audit log the command execution
    await this.auditService.logCommand(user.id, command, executor, result);

    return result;
  }

  /**
   * Broadcast a message to all online players
   * Requires CODER role or higher
   * Rate limit: 10 broadcasts per minute
   * Audit logged
   */
  @Mutation(() => BroadcastResultType, {
    description: 'Broadcast a message to all online players',
  })
  @MinimumRole(UserRole.CODER)
  @RateLimit(AdminRateLimits.BROADCAST)
  async broadcastMessage(
    @CurrentUser() user: Users,
    @Args('message') message: string,
    @Args('sender', { nullable: true }) sender?: string
  ): Promise<BroadcastResultType> {
    const result = await this.gameAdminService.broadcastMessage(
      message,
      sender
    );

    // Audit log the broadcast
    await this.auditService.logBroadcast(
      user.id,
      message,
      sender,
      result.recipientCount
    );

    return result;
  }

  /**
   * Kick a player from the game server
   * Requires GOD role
   * Rate limit: 5 kicks per minute
   * Audit logged
   */
  @Mutation(() => KickResultType, {
    description: 'Disconnect a player from FieryMUD',
  })
  @MinimumRole(UserRole.GOD)
  @RateLimit(AdminRateLimits.KICK)
  async kickPlayer(
    @CurrentUser() user: Users,
    @Args('playerName') playerName: string,
    @Args('reason', { nullable: true }) reason?: string
  ): Promise<KickResultType> {
    const result = await this.gameAdminService.kickPlayer(playerName, reason);

    // Audit log the kick
    await this.auditService.logKick(
      user.id,
      playerName,
      reason,
      result.success
    );

    return result;
  }
}
