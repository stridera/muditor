import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, Users } from '@prisma/client';
import * as crypto from 'crypto';
import { DatabaseService } from '../database/database.service';
import { BanUserInput } from './dto/ban-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    return this.databaseService.users.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.databaseService.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.databaseService.users.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.databaseService.users.findUnique({
      where: { username },
    });
  }

  async updateRole(id: string, role: UserRole) {
    await this.findOne(id);

    return this.databaseService.users.update({
      where: { id },
      data: { role },
    });
  }

  async getUsersWithCharacters() {
    return this.databaseService.users.findMany({
      include: {
        characters: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUser(input: UpdateUserInput) {
    const { id, ...updateData } = input;

    // Verify user exists
    await this.findOne(id);

    // Check if email is being updated and is unique
    if (updateData.email) {
      const existingUser = await this.databaseService.users.findFirst({
        where: {
          email: updateData.email,
          id: { not: id },
        },
      });

      if (existingUser) {
        throw new BadRequestException(
          'Email is already in use by another user'
        );
      }
    }

    const updatedUser = await this.databaseService.users.update({
      where: { id },
      data: updateData,
    });

    // Return with isBanned field
    return {
      ...updatedUser,
      isBanned: false, // After an update, we assume not banned
    };
  }

  async banUser(input: BanUserInput, bannedById: string) {
    const { userId, reason, expiresAt } = input;

    // Verify user exists
    await this.findOne(userId);

    // Check if user is already banned
    const existingBan = await this.databaseService.banRecords.findFirst({
      where: {
        userId,
        active: true,
      },
    });

    if (existingBan) {
      throw new BadRequestException('User is already banned');
    }

    // Prevent self-banning
    if (userId === bannedById) {
      throw new BadRequestException('You cannot ban yourself');
    }

    const banRecord = await this.databaseService.banRecords.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        bannedBy: bannedById,
        reason,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        user: true,
        bannedByUser: true,
      },
    });

    // Return with proper User entity typing
    return {
      ...banRecord,
      user: {
        ...banRecord.user,
        isBanned: true,
      },
      admin: banRecord.bannedByUser
        ? {
            id: banRecord.bannedByUser.id,
            username: banRecord.bannedByUser.username,
            role: banRecord.bannedByUser.role,
          }
        : {
            id: '',
            username: '',
            role: UserRole.PLAYER,
          },
    } as const;
  }

  async unbanUser(userId: string, unbannedById: string) {
    // Verify user exists
    await this.findOne(userId);

    // Find active ban
    const activeBan = await this.databaseService.banRecords.findFirst({
      where: {
        userId,
        active: true,
      },
    });

    if (!activeBan) {
      throw new BadRequestException('User is not currently banned');
    }

    const updatedBanRecord = await this.databaseService.banRecords.update({
      where: { id: activeBan.id },
      data: {
        active: false,
        unbannedAt: new Date(),
        unbannedBy: unbannedById,
      },
      include: {
        user: true,
        bannedByUser: true,
      },
    });

    // Return with proper User entity typing
    return {
      ...updatedBanRecord,
      user: {
        ...updatedBanRecord.user,
        isBanned: false,
      },
      admin: updatedBanRecord.bannedByUser
        ? {
            id: updatedBanRecord.bannedByUser.id,
            username: updatedBanRecord.bannedByUser.username,
            role: updatedBanRecord.bannedByUser.role,
          }
        : {
            id: '',
            username: '',
            role: UserRole.PLAYER,
          },
    } as const;
  }

  async getUserWithBanStatus(id: string) {
    const user = await this.databaseService.users.findUnique({
      where: { id },
      include: {
        banRecords: {
          where: { active: true },
          include: {
            bannedByUser: {
              select: {
                id: true,
                username: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      ...user,
      isBanned: user.banRecords.length > 0,
      // Preserve original nullable fields (null instead of undefined)
      banRecords: user.banRecords.map(r => ({ ...r })),
    };
  }

  async getAllUsersWithBanStatus() {
    const users = await this.databaseService.users.findMany({
      include: {
        banRecords: {
          where: { active: true },
          include: {
            bannedByUser: {
              select: {
                id: true,
                username: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => ({
      ...user,
      isBanned: user.banRecords.length > 0,
      banRecords: user.banRecords.map(r => ({ ...r })),
    }));
  }

  async getBanHistory(userId: string) {
    const banRecords = await this.databaseService.banRecords.findMany({
      where: { userId },
      include: {
        user: true,
        bannedByUser: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: { bannedAt: 'desc' },
    });

    // Transform to include isBanned for user entities
    return banRecords.map(record => ({
      ...record,
      user: record.user
        ? {
            ...record.user,
            isBanned: record.active,
          }
        : null,
      admin: record.bannedByUser
        ? {
            id: record.bannedByUser.id,
            username: record.bannedByUser.username,
            role: record.bannedByUser.role,
          }
        : null,
    }));
  }

  // Permission helper methods for user hierarchy
  isPlayer(user: Users): boolean {
    return user.role === UserRole.PLAYER;
  }

  isImmortal(user: Users): boolean {
    return user.role === UserRole.IMMORTAL || this.isHigherThanImmortal(user);
  }

  isBuilder(user: Users): boolean {
    return user.role === UserRole.BUILDER || this.isCoder(user);
  }

  isCoder(user: Users): boolean {
    return user.role === UserRole.CODER || this.isGod(user);
  }

  isGod(user: Users): boolean {
    return user.role === UserRole.GOD;
  }

  isHigherThanImmortal(user: Users): boolean {
    return user.role === UserRole.CODER || user.role === UserRole.GOD;
  }

  canAccessDashboard(user: Users): boolean {
    return this.isImmortal(user);
  }

  canManageUsers(user: Users): boolean {
    return this.isGod(user) || this.isCoder(user);
  }

  canEditZone(user: Users, zoneId?: number): boolean {
    if (this.isGod(user)) return true;
    if (this.isCoder(user)) return true;

    // Check if immortal has specific zone permissions
    if (this.isImmortal(user) && zoneId) {
      // This would need to be implemented with zone assignments
      // For now, immortals+ can edit any zone based on their role level
      return this.isBuilder(user) || this.isCoder(user);
    }

    return false;
  }

  canManageCharacters(user: Users, characterOwnerId?: string): boolean {
    // Gods can manage any character
    if (this.isGod(user)) return true;

    // Users can manage their own characters
    if (characterOwnerId && user.id === characterOwnerId) return true;

    // Coders+ can manage characters
    if (this.isCoder(user)) return true;

    return false;
  }

  canViewValidation(user: Users): boolean {
    return this.isImmortal(user);
  }

  async getMaxCharacterLevel(user: Users): Promise<number> {
    const maxLevelResult = await this.databaseService.characters.aggregate({
      where: { userId: user.id },
      _max: { level: true },
    });

    return maxLevelResult._max.level || 1; // Default to level 1 if no characters
  }

  async getUserPermissions(user: Users) {
    const maxCharacterLevel = await this.getMaxCharacterLevel(user);

    return {
      isPlayer: this.isPlayer(user),
      isImmortal: this.isImmortal(user),
      isBuilder: this.isBuilder(user),
      isCoder: this.isCoder(user),
      isGod: this.isGod(user),
      canAccessDashboard: this.canAccessDashboard(user),
      canManageUsers: this.canManageUsers(user),
      canViewValidation: this.canViewValidation(user),
      maxCharacterLevel,
      role: user.role,
    };
  }

  async findUserWithPermissions(id: string) {
    const user = await this.getUserWithBanStatus(id);
    const permissions = await this.getUserPermissions(user);

    return {
      ...user,
      permissions,
    };
  }
}
