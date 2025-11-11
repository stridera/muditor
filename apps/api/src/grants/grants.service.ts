import { Injectable, NotFoundException } from '@nestjs/common';
import { GrantPermission, GrantResourceType, Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import {
  CreateGrantInput,
  GrantZoneAccessInput,
  UpdateGrantInput,
} from './grants.input';

@Injectable()
export class GrantsService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Create a new grant
   */
  async create(data: CreateGrantInput, grantedBy: string) {
    // Verify user exists
    const user = await this.db.users.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${data.userId} not found`);
    }

    // Verify resource exists (for zones)
    if (data.resourceType === GrantResourceType.ZONE) {
      const zone = await this.db.zones.findUnique({
        where: { id: Number(data.resourceId) },
      });

      if (!zone) {
        throw new NotFoundException(`Zone ${data.resourceId} not found`);
      }
    }

    const createData: Prisma.UserGrantsUncheckedCreateInput = {
      userId: data.userId,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      permissions: data.permissions as GrantPermission[],
      grantedBy,
    };
    if (data.notes !== undefined) createData.notes = data.notes;
    if (data.expiresAt) createData.expiresAt = new Date(data.expiresAt);
    return this.db.userGrants.create({
      data: createData,
      include: {
        user: {
          select: {
            username: true,
          },
        },
        grantedByUser: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  /**
   * Find all grants with optional filtering
   */
  async findAll(userId?: string, resourceType?: GrantResourceType) {
    const where: Prisma.UserGrantsWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (resourceType) {
      where.resourceType = resourceType;
    }

    return this.db.userGrants.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
          },
        },
        grantedByUser: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        grantedAt: 'desc',
      },
    });
  }

  /**
   * Find a single grant by ID
   */
  async findOne(id: number) {
    const grant = await this.db.userGrants.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        grantedByUser: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!grant) {
      throw new NotFoundException(`Grant with ID ${id} not found`);
    }

    return grant;
  }

  /**
   * Update a grant
   */
  async update(id: number, data: UpdateGrantInput) {
    await this.findOne(id); // Ensure grant exists

    const updateData: Prisma.UserGrantsUncheckedUpdateInput = {};
    if (data.permissions) {
      updateData.permissions = data.permissions as GrantPermission[];
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }
    if (data.expiresAt) {
      updateData.expiresAt = new Date(data.expiresAt);
    }
    return this.db.userGrants.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            username: true,
          },
        },
        grantedByUser: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  /**
   * Delete a grant
   */
  async remove(id: number) {
    await this.findOne(id); // Ensure grant exists

    return this.db.userGrants.delete({
      where: { id },
    });
  }

  /**
   * Grant zone access to a user (convenience method)
   */
  async grantZoneAccess(data: GrantZoneAccessInput, grantedBy: string) {
    const input: CreateGrantInput = {
      userId: data.userId,
      resourceType: GrantResourceType.ZONE,
      resourceId: data.zoneId.toString(),
      permissions: data.permissions,
    };
    if (data.expiresAt) input.expiresAt = data.expiresAt;
    if (data.notes) input.notes = data.notes;
    return this.create(input, grantedBy);
  }

  /**
   * Revoke zone access from a user
   */
  async revokeZoneAccess(userId: string, zoneId: number) {
    const grant = await this.db.userGrants.findUnique({
      where: {
        userId_resourceType_resourceId: {
          userId,
          resourceType: GrantResourceType.ZONE,
          resourceId: zoneId.toString(),
        },
      },
    });

    if (!grant) {
      throw new NotFoundException(
        `User ${userId} does not have access to zone ${zoneId}`
      );
    }

    return this.remove(grant.id);
  }

  /**
   * Get all zone grants for a user
   */
  async getUserZoneGrants(userId: string) {
    const grants = await this.db.userGrants.findMany({
      where: {
        userId,
        resourceType: GrantResourceType.ZONE,
      },
      include: {
        grantedByUser: {
          select: {
            username: true,
          },
        },
      },
    });

    // Fetch zone names
    const zoneIds = grants.map(g => Number(g.resourceId));
    const zones = await this.db.zones.findMany({
      where: {
        id: {
          in: zoneIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const zoneMap = new Map(zones.map(z => [z.id, z.name]));

    return grants.map(grant => ({
      zoneId: Number(grant.resourceId),
      zoneName: zoneMap.get(Number(grant.resourceId)) || 'Unknown Zone',
      permissions: grant.permissions,
      expiresAt: grant.expiresAt,
      notes: grant.notes,
    }));
  }

  /**
   * Check if a user has specific permission for a zone
   */
  async checkZonePermission(
    userId: string,
    zoneId: number,
    permission: GrantPermission
  ): Promise<boolean> {
    const grant = await this.db.userGrants.findUnique({
      where: {
        userId_resourceType_resourceId: {
          userId,
          resourceType: GrantResourceType.ZONE,
          resourceId: zoneId.toString(),
        },
      },
    });

    if (!grant) return false;

    // Check if grant has expired
    if (grant.expiresAt && grant.expiresAt < new Date()) {
      return false;
    }

    // ADMIN permission includes all permissions
    if (grant.permissions.includes(GrantPermission.ADMIN)) {
      return true;
    }

    return grant.permissions.includes(permission);
  }
}
