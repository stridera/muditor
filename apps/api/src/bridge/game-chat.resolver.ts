import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import type { Users } from '@muditor/db';
import { GameAdminService } from './game-admin.service';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RateLimitGuard, RateLimit, AdminRateLimits } from './rate-limit.guard';
import { AuditService } from './audit.service';
import { DatabaseService } from '../database/database.service';
import { RoleCalculatorService } from '../users/services/role-calculator.service';
import { CommandResultType } from './game-admin.resolver';

/** Channels available to all players */
const PLAYER_CHANNELS = ['gossip'] as const;
/** Additional channels requiring GOD role */
const GOD_CHANNELS = ['wiznet'] as const;
const ALL_CHANNELS = [...PLAYER_CHANNELS, ...GOD_CHANNELS] as const;
type ChatChannel = (typeof ALL_CHANNELS)[number];

/**
 * GraphQL resolver for player-facing game chat
 *
 * Allows authenticated users to send in-game chat messages
 * as one of their linked characters.
 */
@Resolver()
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard, RateLimitGuard)
export class GameChatResolver {
  constructor(
    private readonly gameAdminService: GameAdminService,
    private readonly auditService: AuditService,
    private readonly databaseService: DatabaseService,
    private readonly roleCalculator: RoleCalculatorService
  ) {}

  /**
   * Send a chat message in-game as a linked character
   * Requires PLAYER role or higher
   * Rate limit: 30 messages per minute
   */
  @Mutation(() => CommandResultType, {
    description: 'Send a chat message in-game as a linked character',
  })
  @MinimumRole(UserRole.PLAYER)
  @RateLimit(AdminRateLimits.CHAT)
  async sendGameChat(
    @CurrentUser() user: Users,
    @Args('characterName') characterName: string,
    @Args('channel') channel: string,
    @Args('message') message: string
  ): Promise<CommandResultType> {
    // Validate channel exists
    if (!ALL_CHANNELS.includes(channel as ChatChannel)) {
      const available = this.roleCalculator.hasMinimumRole(
        user.role,
        UserRole.IMMORTAL
      )
        ? ALL_CHANNELS
        : PLAYER_CHANNELS;
      return {
        success: false,
        message: `Invalid channel '${channel}'. Allowed: ${available.join(', ')}`,
        executor: undefined,
        note: undefined,
      };
    }

    // Check immortal-only channels (IMMORTAL+, i.e. level 100+)
    if (
      (GOD_CHANNELS as readonly string[]).includes(channel) &&
      !this.roleCalculator.hasMinimumRole(user.role, UserRole.IMMORTAL)
    ) {
      return {
        success: false,
        message: `Channel '${channel}' requires Immortal status (level 100+)`,
        executor: undefined,
        note: undefined,
      };
    }

    // Verify user owns the character
    const character = await this.databaseService.characters.findUnique({
      where: { name: characterName },
      select: { userId: true },
    });

    if (!character) {
      return {
        success: false,
        message: `Character '${characterName}' not found`,
        executor: undefined,
        note: undefined,
      };
    }

    if (character.userId !== user.id) {
      return {
        success: false,
        message: `Character '${characterName}' is not linked to your account`,
        executor: undefined,
        note: undefined,
      };
    }

    // Execute the chat command via the game server
    const result = await this.gameAdminService.executeCommand(
      `${channel} ${message}`,
      characterName
    );

    // Audit log the chat message
    await this.auditService.logChat(user.id, characterName, channel, message);

    return result;
  }
}
