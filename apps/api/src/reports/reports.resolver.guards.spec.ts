import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@muditor/db';
import {
  MINIMUM_ROLE_KEY,
  MinimumRoleGuard,
} from '../auth/guards/minimum-role.guard';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { ReportsResolver } from './reports.resolver';

describe('ReportsResolver guards', () => {
  const proto = ReportsResolver.prototype as unknown as Record<string, object>;
  const roleOf = (method: string): unknown =>
    Reflect.getMetadata(MINIMUM_ROLE_KEY, proto[method] as object);

  it.each(['reports', 'report', 'reportOpenCount'])(
    '%s requires IMMORTAL',
    method => {
      expect(roleOf(method)).toBe(UserRole.IMMORTAL);
    }
  );

  it.each(['updateReport', 'markDuplicate'])(
    '%s requires HEAD_BUILDER',
    method => {
      expect(roleOf(method)).toBe(UserRole.HEAD_BUILDER);
    }
  );

  it.each([
    'reports',
    'report',
    'reportOpenCount',
    'updateReport',
    'markDuplicate',
  ])('%s requires login and the role guard', method => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      proto[method] as object
    ) as unknown[];
    expect(guards).toContain(GraphQLJwtAuthGuard);
    expect(guards).toContain(MinimumRoleGuard);
  });
});
