import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';

/**
 * Service responsible for calculating user roles based on character levels
 *
 * Role Hierarchy (based on max character level):
 * - PLAYER: < 100
 * - IMMORTAL: 100
 * - BUILDER: 101-102
 * - HEAD_BUILDER: 103
 * - CODER: 104
 * - GOD: 105+
 */
@Injectable()
export class RoleCalculatorService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Calculate role from character level
   */
  calculateRoleFromLevel(level: number): UserRole {
    if (level < 100) return UserRole.PLAYER;
    if (level === 100) return UserRole.IMMORTAL;
    if (level >= 101 && level <= 102) return UserRole.BUILDER;
    if (level === 103) return UserRole.HEAD_BUILDER;
    if (level === 104) return UserRole.CODER;
    if (level >= 105) return UserRole.GOD;

    // Fallback (should never reach here)
    return UserRole.PLAYER;
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
   * Update user's role based on their characters
   * Called after character link/unlink operations
   */
  async updateUserRole(userId: string): Promise<UserRole> {
    const newRole = await this.calculateRoleFromCharacters(userId);

    await this.db.users.update({
      where: { id: userId },
      data: { role: newRole },
    });

    return newRole;
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
      [UserRole.GOD]: 5,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }
}
