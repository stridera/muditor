import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole, GrantResourceType, GrantPermission } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';

/**
 * Guard that checks zone-based permissions using UserGrants
 *
 * Permission hierarchy:
 * - GOD, CODER, HEAD_BUILDER: Bypass grants (full access)
 * - IMMORTAL: View-only access to all zones
 * - BUILDER: Must have grants with WRITE permission for specific zones
 * - PLAYER: No zone access
 *
 * Usage:
 * Apply to resolvers that modify zone content (rooms, mobs, objects)
 */
@Injectable()
export class ZonePermissionGuard implements CanActivate {
  constructor(private db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) {
      return false; // No authenticated user
    }

    // Extract zoneId from request
    const zoneId = this.extractZoneId(ctx);

    if (!zoneId) {
      // No zone specified - allow if user has minimum role
      return [
        UserRole.GOD,
        UserRole.CODER,
        UserRole.HEAD_BUILDER,
        UserRole.IMMORTAL,
      ].includes(user.role);
    }

    // GOD, CODER, HEAD_BUILDER bypass grants system
    if (
      [UserRole.GOD, UserRole.CODER, UserRole.HEAD_BUILDER].includes(user.role)
    ) {
      return true;
    }

    // IMMORTAL has view-only access (READ permission)
    // Note: This guard is for WRITE operations, so IMMORTAL cannot pass
    if (user.role === UserRole.IMMORTAL) {
      return false; // View-only, cannot modify
    }

    // BUILDER must have grant with WRITE permission
    if (user.role === UserRole.BUILDER) {
      const grant = await this.db.userGrants.findUnique({
        where: {
          userId_resourceType_resourceId: {
            userId: user.id,
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

      // Check for WRITE or ADMIN permission
      return (
        grant.permissions.includes(GrantPermission.WRITE) ||
        grant.permissions.includes(GrantPermission.ADMIN)
      );
    }

    return false; // PLAYER or unknown role
  }

  /**
   * Extract zoneId from GraphQL request arguments
   */
  private extractZoneId(ctx: GqlExecutionContext): number | null {
    const args = ctx.getArgs();

    // Try various common argument names
    if (args.zoneId !== undefined) return Number(args.zoneId);
    if (args.data?.zoneId !== undefined) return Number(args.data.zoneId);
    if (args.id !== undefined) {
      // For composite key operations, try to extract zone from ID string
      const idStr = String(args.id);
      if (idStr.includes('-')) {
        const [zoneId] = idStr.split('-');
        return Number(zoneId);
      }
    }

    return null;
  }
}
