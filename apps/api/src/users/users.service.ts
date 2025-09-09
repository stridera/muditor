import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole, User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { UpdateUserInput } from './dto/update-user.input';
import { BanUserInput } from './dto/ban-user.input';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    return this.databaseService.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.databaseService.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.databaseService.user.findUnique({
      where: { username },
    });
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.findOne(id);

    return this.databaseService.user.update({
      where: { id },
      data: { role },
    });
  }

  async getUsersWithCharacters() {
    return this.databaseService.user.findMany({
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
      const existingUser = await this.databaseService.user.findFirst({
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

    const updatedUser = await this.databaseService.user.update({
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
    const existingBan = await this.databaseService.banRecord.findFirst({
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

    const banRecord = await this.databaseService.banRecord.create({
      data: {
        userId,
        bannedBy: bannedById,
        reason,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        user: true,
        admin: true,
      },
    });

    // Return with proper User entity typing
    return {
      ...banRecord,
      user: {
        ...banRecord.user,
        isBanned: true,
      },
      admin: {
        ...banRecord.admin,
        isBanned: false, // Admins shouldn't be banned
      },
    };
  }

  async unbanUser(userId: string, unbannedById: string) {
    // Verify user exists
    await this.findOne(userId);

    // Find active ban
    const activeBan = await this.databaseService.banRecord.findFirst({
      where: {
        userId,
        active: true,
      },
    });

    if (!activeBan) {
      throw new BadRequestException('User is not currently banned');
    }

    const updatedBanRecord = await this.databaseService.banRecord.update({
      where: { id: activeBan.id },
      data: {
        active: false,
        unbannedAt: new Date(),
        unbannedBy: unbannedById,
      },
      include: {
        user: true,
        admin: true,
      },
    });

    // Return with proper User entity typing
    return {
      ...updatedBanRecord,
      user: {
        ...updatedBanRecord.user,
        isBanned: false,
      },
      admin: {
        ...updatedBanRecord.admin,
        isBanned: false,
      },
    };
  }

  async getUserWithBanStatus(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id },
      include: {
        banRecords: {
          where: { active: true },
          include: {
            admin: {
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
    };
  }

  async getAllUsersWithBanStatus() {
    const users = await this.databaseService.user.findMany({
      include: {
        banRecords: {
          where: { active: true },
          include: {
            admin: {
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
    }));
  }

  async getBanHistory(userId: string) {
    const banRecords = await this.databaseService.banRecord.findMany({
      where: { userId },
      include: {
        user: true,
        admin: {
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
        : undefined,
      admin: record.admin
        ? {
            ...record.admin,
            isBanned: false, // Admins shouldn't be banned
          }
        : undefined,
    }));
  }

  // Permission helper methods for user hierarchy
  isPlayer(user: User): boolean {
    return user.role === UserRole.PLAYER;
  }

  isImmortal(user: User): boolean {
    return user.role === UserRole.IMMORTAL || this.isHigherThanImmortal(user);
  }

  isBuilder(user: User): boolean {
    return user.role === UserRole.BUILDER || this.isCoder(user);
  }

  isCoder(user: User): boolean {
    return user.role === UserRole.CODER || this.isGod(user);
  }

  isGod(user: User): boolean {
    return user.role === UserRole.GOD;
  }

  isHigherThanImmortal(user: User): boolean {
    return user.role === UserRole.CODER || user.role === UserRole.GOD;
  }

  canAccessDashboard(user: User): boolean {
    return this.isImmortal(user);
  }

  canManageUsers(user: User): boolean {
    return this.isGod(user) || this.isCoder(user);
  }

  canEditZone(user: User, zoneId?: number): boolean {
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

  canManageCharacters(user: User, characterOwnerId?: string): boolean {
    // Gods can manage any character
    if (this.isGod(user)) return true;

    // Users can manage their own characters
    if (characterOwnerId && user.id === characterOwnerId) return true;

    // Coders+ can manage characters
    if (this.isCoder(user)) return true;

    return false;
  }

  canViewValidation(user: User): boolean {
    return this.isImmortal(user);
  }

  async getMaxCharacterLevel(user: User): Promise<number> {
    const maxLevelResult = await this.databaseService.character.aggregate({
      where: { userId: user.id },
      _max: { level: true },
    });

    return maxLevelResult._max.level || 1; // Default to level 1 if no characters
  }

  async getUserPermissions(user: User) {
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
