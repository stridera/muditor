import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, type Prisma } from '@muditor/db';
import * as crypto from 'crypto';
import { AuthService } from '../auth/auth.service';
import { roleAtLeast } from '../auth/role.util';
import { DatabaseService } from '../database/database.service';
import type {
  AdminUserAccount,
  PasswordResetLink,
} from './entities/admin-user.entity';
import { RoleCalculatorService } from './services/role-calculator.service';

const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.PLAYER]: 0,
  [UserRole.IMMORTAL]: 1,
  [UserRole.BUILDER]: 2,
  [UserRole.HEAD_BUILDER]: 3,
  [UserRole.CODER]: 4,
  [UserRole.IMPLEMENTOR]: 5,
};

const userInclude = {
  googleLink: { select: { id: true } },
  characters: {
    select: { id: true, name: true, level: true },
    orderBy: { name: 'asc' },
  },
  banRecords: {
    where: { active: true },
    select: { id: true, expiresAt: true },
  },
} satisfies Prisma.UsersInclude;

type UserRow = Prisma.UsersGetPayload<{ include: typeof userInclude }>;

/**
 * Admin user management. Authorization is layered: the resolver restricts the
 * minimum role, and this service enforces the rank rules against the acting
 * user's CURRENT role from the database (never a possibly stale JWT claim).
 */
@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly roleCalculator: RoleCalculatorService,
    private readonly authService: AuthService
  ) {}

  async listUsers(): Promise<AdminUserAccount[]> {
    const rows = await this.db.users.findMany({
      include: userInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => this.toAdminUser(r));
  }

  /**
   * IMPLEMENTOR may set any role on users below IMPLEMENTOR (or demote
   * themselves). CODER may only set roles strictly below CODER, and only on
   * users currently below CODER. The last IMPLEMENTOR can
   * never be demoted (by anyone, including themselves).
   */
  async setUserRole(
    actorId: string,
    userId: string,
    role: UserRole
  ): Promise<AdminUserAccount> {
    const actor = await this.requireActor(actorId);
    const target = await this.requireUser(userId);

    if (actor.role === UserRole.IMPLEMENTOR && actorId !== userId) {
      // IMPLEMENTORs may set any role on lower ranks, never on one another.
      if (target.role === UserRole.IMPLEMENTOR) {
        throw new ForbiddenException(
          'You can only manage users with a role below your own'
        );
      }
    } else if (actor.role !== UserRole.IMPLEMENTOR) {
      if (!roleAtLeast(actor.role, UserRole.CODER)) {
        throw new ForbiddenException('Insufficient role');
      }
      if (
        ROLE_RANK[role] >= ROLE_RANK[actor.role] ||
        ROLE_RANK[target.role] >= ROLE_RANK[actor.role]
      ) {
        throw new ForbiddenException(
          'You can only manage roles below your own'
        );
      }
    }

    if (
      target.role === UserRole.IMPLEMENTOR &&
      role !== UserRole.IMPLEMENTOR &&
      (await this.countActiveImplementors()) <= 1
    ) {
      throw new BadRequestException('Cannot demote the last IMPLEMENTOR');
    }

    if (target.role !== role) {
      await this.db.users.update({ where: { id: userId }, data: { role } });
      await this.audit(actorId, 'ADMIN_SET_USER_ROLE', userId, {
        oldValues: { role: target.role },
        newValues: { role },
      });
    }
    return this.getAdminUser(userId);
  }

  async setUserDeleted(
    actorId: string,
    userId: string,
    deleted: boolean,
    reason?: string
  ): Promise<AdminUserAccount> {
    const actor = await this.requireActor(actorId);
    const target = await this.requireUser(userId);
    // Self-delete gets its own error below; every other target must be outranked.
    if (actorId !== userId) this.assertMayManage(actor, target);

    if (deleted) {
      const trimmed = reason?.trim();
      if (!trimmed) {
        throw new BadRequestException('A reason is required to delete a user');
      }
      if (actorId === userId) {
        throw new BadRequestException('You cannot delete yourself');
      }
      if (
        target.role === UserRole.IMPLEMENTOR &&
        (await this.countActiveImplementors()) <= 1
      ) {
        throw new BadRequestException('Cannot delete the last IMPLEMENTOR');
      }
      await this.db.users.update({
        where: { id: userId },
        data: { deletedAt: new Date(), deletionReason: trimmed },
      });
      await this.audit(actorId, 'ADMIN_DELETE_USER', userId, {
        newValues: { reason: trimmed },
      });
    } else {
      await this.db.users.update({
        where: { id: userId },
        data: { deletedAt: null, deletionReason: null },
      });
      await this.audit(actorId, 'ADMIN_RESTORE_USER', userId, {
        oldValues: { reason: target.deletionReason },
      });
    }
    return this.getAdminUser(userId);
  }

  /**
   * Admin variant of unlink: clears Characters.user_id of any user's
   * character, then recalculates that user's role (lowering only).
   */
  async unlinkCharacter(
    actorId: string,
    characterId: string
  ): Promise<AdminUserAccount> {
    const actor = await this.requireActor(actorId);
    const character = await this.db.characters.findUnique({
      where: { id: characterId },
      select: { id: true, name: true, userId: true },
    });
    if (!character) {
      throw new NotFoundException(`Character ${characterId} not found`);
    }
    if (!character.userId) {
      throw new BadRequestException(
        `Character '${character.name}' is not linked to any user`
      );
    }
    const ownerId = character.userId;
    const owner = await this.requireUser(ownerId);
    this.assertMayManage(actor, owner);

    await this.db.characters.update({
      where: { id: characterId },
      data: { userId: null },
    });
    // Never promotes: allowRaise is intentionally not set.
    await this.roleCalculator.updateUserRole(ownerId);
    await this.audit(actorId, 'ADMIN_UNLINK_CHARACTER', ownerId, {
      oldValues: { characterId, characterName: character.name },
    });
    return this.getAdminUser(ownerId);
  }

  async createPasswordResetLink(
    actorId: string,
    userId: string
  ): Promise<PasswordResetLink> {
    const actor = await this.requireActor(actorId);
    const target = await this.requireUser(userId);
    // A reset link is account takeover; same rank rule as every other action.
    this.assertMayManage(actor, target);
    if (target.deletedAt) {
      throw new BadRequestException('Restore the user before resetting');
    }

    const link = await this.authService.createAdminPasswordResetLink(userId);
    // The token itself is never logged or audited.
    await this.audit(actorId, 'ADMIN_CREATE_PASSWORD_RESET_LINK', userId, {
      newValues: { expiresAt: link.expiresAt.toISOString() },
    });
    return link;
  }

  /**
   * Gate for any write to another user's account (email, role, ...). Same
   * rank rule as every other admin action; checks the CURRENT roles in the DB.
   */
  async assertActorMayManageUser(
    actorId: string,
    userId: string
  ): Promise<void> {
    const actor = await this.requireActor(actorId);
    const target = await this.requireUser(userId);
    this.assertMayManage(actor, target);
  }

  /**
   * Strict outranking, for every role including IMPLEMENTOR: the actor must be
   * at least CODER and rank strictly above the target. Acting on yourself is
   * refused here too: self-service paths (updateProfile, changePassword)
   * re-check the current password, which an admin mutation would skip.
   */
  private assertMayManage(
    actor: { id: string; role: UserRole },
    target: { id: string; role: UserRole }
  ): void {
    if (actor.id === target.id) {
      throw new ForbiddenException(
        'Use your account settings to change your own account'
      );
    }
    if (
      !roleAtLeast(actor.role, UserRole.CODER) ||
      ROLE_RANK[target.role] >= ROLE_RANK[actor.role]
    ) {
      throw new ForbiddenException(
        'You can only manage users with a role below your own'
      );
    }
  }

  private async countActiveImplementors(): Promise<number> {
    return this.db.users.count({
      where: { role: UserRole.IMPLEMENTOR, deletedAt: null },
    });
  }

  private async requireActor(id: string) {
    const actor = await this.db.users.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!actor) throw new ForbiddenException('Acting user not found');
    return actor;
  }

  private async requireUser(id: string) {
    const user = await this.db.users.findUnique({
      where: { id },
      select: { id: true, role: true, deletedAt: true, deletionReason: true },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  private async getAdminUser(id: string): Promise<AdminUserAccount> {
    const row = await this.db.users.findUnique({
      where: { id },
      include: userInclude,
    });
    if (!row) throw new NotFoundException(`User ${id} not found`);
    return this.toAdminUser(row);
  }

  private toAdminUser(r: UserRow): AdminUserAccount {
    const now = Date.now();
    return {
      id: r.id,
      email: r.email,
      displayName: r.displayName,
      role: r.role,
      hasGoogleLink: !!r.googleLink,
      hasPassword: !!r.passwordHash,
      isBanned: r.banRecords.some(
        b => !b.expiresAt || b.expiresAt.getTime() > now
      ),
      characters: r.characters,
      lastLoginAt: r.lastLoginAt,
      createdAt: r.createdAt,
      deletedAt: r.deletedAt,
      deletionReason: r.deletionReason,
    };
  }

  private async audit(
    actorId: string,
    action: string,
    userId: string,
    values: {
      oldValues?: Prisma.InputJsonValue;
      newValues?: Prisma.InputJsonValue;
    }
  ): Promise<void> {
    this.logger.log(`${action} actor=${actorId} target=${userId}`);
    await this.db.auditLogs.create({
      data: {
        id: crypto.randomUUID(),
        action,
        entityType: 'User',
        entityId: userId,
        userId: actorId,
        ...values,
      },
    });
  }
}
