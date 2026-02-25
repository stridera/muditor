import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@nestjs/common';
import { LoginRequestStatus } from '@muditor/db';
import { DatabaseService } from '../database/database.service';
import { BridgeService } from '../bridge/bridge.service';
import { GameEventType } from '../bridge/game-event.dto';

@Injectable()
export class LoginRequestsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LoginRequestsService.name);
  /** IDs of requests we've already pushed to the subscription */
  private readonly notifiedIds = new Set<string>();
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly db: DatabaseService,
    private readonly bridgeService: BridgeService
  ) {}

  onModuleInit() {
    // Poll DB every 2 seconds for new login requests created by the game server.
    // The C++ server writes directly to the DB without publishing a Redis event,
    // so we detect new rows here and push them to the GraphQL subscription.
    this.pollTimer = setInterval(() => this.checkForNewRequests(), 2000);
    this.logger.log('Login request DB watcher started (2s interval)');
  }

  onModuleDestroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async checkForNewRequests() {
    try {
      const pending = await this.db.loginRequests.findMany({
        where: {
          status: LoginRequestStatus.PENDING,
          expiresAt: { gt: new Date() },
        },
      });

      for (const request of pending) {
        if (this.notifiedIds.has(request.id)) continue;

        this.notifiedIds.add(request.id);
        this.logger.log(
          `New login request detected: ${request.id} for user ${request.userId}`
        );

        this.bridgeService.publishLocalEvent({
          type: GameEventType.AUTH_LOGIN_REQUEST,
          timestamp: request.createdAt,
          message: `Login request from ${request.ipAddress || 'unknown'}`,
          metadata: {
            id: request.id,
            userId: request.userId,
            status: request.status,
            ipAddress: request.ipAddress,
            expiresAt: request.expiresAt.toISOString(),
            createdAt: request.createdAt.toISOString(),
          },
        });
      }

      // Clean up old IDs to prevent unbounded growth
      if (this.notifiedIds.size > 100) {
        const pendingIds = new Set(pending.map(r => r.id));
        for (const id of this.notifiedIds) {
          if (!pendingIds.has(id)) {
            this.notifiedIds.delete(id);
          }
        }
      }
    } catch (err) {
      // Don't log every poll failure — just debug level
      this.logger.debug(`Login request poll error: ${err}`);
    }
  }

  /**
   * Get pending login requests for a user.
   * Auto-expires requests that have passed their expiresAt time.
   */
  async getPendingRequests(userId: string) {
    // Expire old requests first
    await this.db.loginRequests.updateMany({
      where: {
        userId,
        status: LoginRequestStatus.PENDING,
        expiresAt: { lt: new Date() },
      },
      data: {
        status: LoginRequestStatus.EXPIRED,
        resolvedAt: new Date(),
      },
    });

    return this.db.loginRequests.findMany({
      where: {
        userId,
        status: LoginRequestStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Approve a pending login request.
   * Validates ownership, status, and expiry.
   */
  async approveRequest(requestId: string, userId: string) {
    const request = await this.db.loginRequests.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Login request not found');
    }

    if (request.userId !== userId) {
      throw new ForbiddenException('Not your login request');
    }

    if (request.status !== LoginRequestStatus.PENDING) {
      throw new ForbiddenException('Request is no longer pending');
    }

    if (request.expiresAt < new Date()) {
      // Auto-expire it
      await this.db.loginRequests.update({
        where: { id: requestId },
        data: {
          status: LoginRequestStatus.EXPIRED,
          resolvedAt: new Date(),
        },
      });
      throw new ForbiddenException('Request has expired');
    }

    const updated = await this.db.loginRequests.update({
      where: { id: requestId },
      data: {
        status: LoginRequestStatus.APPROVED,
        resolvedAt: new Date(),
      },
    });

    this.logger.log(`Login request ${requestId} approved by user ${userId}`);
    return updated;
  }

  /**
   * Deny a pending login request.
   * Validates ownership and status.
   */
  async denyRequest(requestId: string, userId: string) {
    const request = await this.db.loginRequests.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Login request not found');
    }

    if (request.userId !== userId) {
      throw new ForbiddenException('Not your login request');
    }

    if (request.status !== LoginRequestStatus.PENDING) {
      throw new ForbiddenException('Request is no longer pending');
    }

    const updated = await this.db.loginRequests.update({
      where: { id: requestId },
      data: {
        status: LoginRequestStatus.DENIED,
        resolvedAt: new Date(),
      },
    });

    this.logger.log(`Login request ${requestId} denied by user ${userId}`);
    return updated;
  }
}
