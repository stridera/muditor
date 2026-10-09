import { Injectable } from '@nestjs/common';
import { UserRole } from '@muditor/db';
import { DatabaseService } from '../../database/database.service';
import { roleAtLeast } from '../../auth/role.util';

/**
 * Pure level -> role mapping (see class doc for the table). Exported so
 * resolvers can authorize level changes without a DB-backed service.
 */
export function calculateRoleFromLevel(level: number): UserRole {
  if (level < 100) return UserRole.PLAYER;
  if (level === 100) return UserRole.IMMORTAL;
  if (level >= 101 && level <= 102) return UserRole.BUILDER;
  if (level === 103) return UserRole.HEAD_BUILDER;
  if (level === 104) return UserRole.CODER;
  return UserRole.IMPLEMENTOR; // 105+
}

/**
 * Service responsible for calculating user roles based on character levels
 *
 * Role Hierarchy (based on max character level):
 * - PLAYER: < 100
 * - IMMORTAL: 100
 * - BUILDER: 101-102
 * - HEAD_BUILDER: 103
 * - CODER: 104
 * - IMPLEMENTOR: 105+
 */
@Injectable()
export class RoleCalculatorService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Calculate role from character level
   */
  calculateRoleFromLevel(level: number): UserRole {
    return calculateRoleFromLevel(level);
  }

  /**
   * Calculate role based on all user's characters
   * Takes the maximum level among all linked characters
   */
  async calculateRoleFromCharacters(userId: string): Promise<UserRole> {
    const characters = await this.db.characters.findMany({
      where: { userId },
      select: { level: true },
    });

    if (characters.length === 0) {
      return UserRole.PLAYER;
    }

    const maxLevel = Math.max(...characters.map(c => c.level));
    return this.calculateRoleFromLevel(maxLevel);
  }

  /**
   * Update user's role based on their characters.
   *
   * Escalation rule: recalculation only ever LOWERS a role automatically.
   * A raise is applied only when the caller passes `allowRaise: true`, which
   * is reserved for `linkCharacterToUser` (the user proves ownership of a
   * legacy character with its password). Unlink and every other trigger
   * (character create/update by staff) can never promote anyone, so staff
   * cannot mint a high-level character and then link/unlink it to escalate.
   *
   * Linking is the mirror case: it may only RAISE (`allowLower: false`), so a
   * manually granted role (e.g. a BUILDER with no staff character) is never
   * demoted just because a lower-level character was linked.
   */
  async updateUserRole(
    userId: string,
    options: { allowRaise?: boolean; allowLower?: boolean } = {}
  ): Promise<UserRole> {
    const calculated = await this.calculateRoleFromCharacters(userId);
    const user = await this.db.users.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) return calculated;

    const isRaise = !roleAtLeast(user.role, calculated);
    if (isRaise && !options.allowRaise) {
      return user.role;
    }
    if (!isRaise && options.allowLower === false) {
      return user.role;
    }
    if (calculated === user.role) return user.role;

    await this.db.users.update({
      where: { id: userId },
      data: { role: calculated },
    });

    return calculated;
  }

  /**
   * Check if a role has minimum required level
   * Used for permission checking
   */
  hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.PLAYER]: 0,
      [UserRole.IMMORTAL]: 1,
      [UserRole.BUILDER]: 2,
      [UserRole.HEAD_BUILDER]: 3,
      [UserRole.CODER]: 4,
      [UserRole.IMPLEMENTOR]: 5,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }
}
