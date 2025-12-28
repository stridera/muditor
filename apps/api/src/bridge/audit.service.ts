import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { randomUUID } from 'crypto';

/**
 * Admin action types for audit logging
 */
export enum AdminActionType {
  EXECUTE_COMMAND = 'ADMIN_EXECUTE_COMMAND',
  BROADCAST_MESSAGE = 'ADMIN_BROADCAST_MESSAGE',
  KICK_PLAYER = 'ADMIN_KICK_PLAYER',
  VIEW_PLAYERS = 'ADMIN_VIEW_PLAYERS',
  VIEW_STATS = 'ADMIN_VIEW_STATS',
  DISCORD_GOSSIP = 'DISCORD_GOSSIP',
  DISCORD_LINK = 'DISCORD_LINK',
}

export interface AuditLogEntry {
  action: AdminActionType;
  entityType: string;
  entityId: string;
  userId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}

/**
 * Service for logging admin actions to the audit trail
 *
 * All administrative actions performed through Muditor are logged
 * for security and compliance purposes.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Log an admin action to the audit trail
   */
  async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      await this.databaseService.auditLogs.create({
        data: {
          id: randomUUID(),
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          userId: entry.userId,
          oldValues: entry.oldValues ?? Prisma.JsonNull,
          newValues: entry.newValues ?? Prisma.JsonNull,
        },
      });

      this.logger.debug(
        `Audit: ${entry.action} by user ${entry.userId} on ${entry.entityType}:${entry.entityId}`
      );
    } catch (error) {
      // Don't fail the operation if audit logging fails
      this.logger.error('Failed to write audit log', error);
    }
  }

  /**
   * Log a game command execution
   */
  async logCommand(
    userId: string,
    command: string,
    executor?: string,
    result?: { success: boolean; message: string }
  ): Promise<void> {
    await this.logAction({
      action: AdminActionType.EXECUTE_COMMAND,
      entityType: 'game_server',
      entityId: 'command',
      userId,
      newValues: {
        command,
        executor,
        success: result?.success,
        message: result?.message,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log a broadcast message
   */
  async logBroadcast(
    userId: string,
    message: string,
    sender?: string,
    recipientCount?: number
  ): Promise<void> {
    await this.logAction({
      action: AdminActionType.BROADCAST_MESSAGE,
      entityType: 'game_server',
      entityId: 'broadcast',
      userId,
      newValues: {
        message,
        sender,
        recipientCount,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log a player kick
   */
  async logKick(
    userId: string,
    playerName: string,
    reason?: string,
    success?: boolean
  ): Promise<void> {
    await this.logAction({
      action: AdminActionType.KICK_PLAYER,
      entityType: 'player',
      entityId: playerName,
      userId,
      newValues: {
        playerName,
        reason,
        success,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log a Discord gossip message
   */
  async logDiscordGossip(
    userId: string,
    discordId: string,
    message: string
  ): Promise<void> {
    await this.logAction({
      action: AdminActionType.DISCORD_GOSSIP,
      entityType: 'discord',
      entityId: discordId,
      userId,
      newValues: {
        message,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log a Discord account link
   */
  async logDiscordLink(
    userId: string,
    discordId: string,
    discordName: string
  ): Promise<void> {
    await this.logAction({
      action: AdminActionType.DISCORD_LINK,
      entityType: 'discord_link',
      entityId: discordId,
      userId,
      newValues: {
        discordId,
        discordName,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Query recent admin actions for a user
   */
  async getRecentActions(
    userId: string,
    limit = 50
  ): Promise<
    Array<{
      id: string;
      action: string;
      entityType: string;
      entityId: string;
      newValues: unknown;
      createdAt: Date;
    }>
  > {
    return this.databaseService.auditLogs.findMany({
      where: {
        userId,
        action: {
          startsWith: 'ADMIN_',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        newValues: true,
        createdAt: true,
      },
    });
  }

  /**
   * Query all admin actions within a time range
   */
  async getActionsByTimeRange(
    startDate: Date,
    endDate: Date,
    actionType?: AdminActionType
  ): Promise<
    Array<{
      id: string;
      action: string;
      entityType: string;
      entityId: string;
      userId: string;
      newValues: unknown;
      createdAt: Date;
    }>
  > {
    return this.databaseService.auditLogs.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        action: actionType
          ? actionType
          : {
              startsWith: 'ADMIN_',
            },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        userId: true,
        newValues: true,
        createdAt: true,
      },
    });
  }
}
