import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { UserRole } from '@muditor/db';
import { MinimumRole } from '../../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../../auth/guards/minimum-role.guard';
import {
  ZONE_SCOPE_KEY,
  ZonePermissionGuard,
  type ZoneScopeOptions,
} from '../../auth/guards/zone-permission.guard';

/** Overrides how ZonePermissionGuard derives the target zone(s) */
export type {
  ZoneScopeLookup,
  ZoneScopeOptions,
} from '../../auth/guards/zone-permission.guard';

export const ZoneScope = (options: ZoneScopeOptions) =>
  SetMetadata(ZONE_SCOPE_KEY, options);

/**
 * Standard protection for world-content mutations:
 * login + role >= BUILDER + WRITE grant on every affected zone
 * (IMPLEMENTOR/CODER/HEAD_BUILDER bypass the grant check).
 */
export const RequireZoneWrite = (options: ZoneScopeOptions = {}) =>
  applyDecorators(
    UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard, ZonePermissionGuard),
    MinimumRole(UserRole.BUILDER),
    ZoneScope(options)
  );
