import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@muditor/db';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import {
  MINIMUM_ROLE_KEY,
  MinimumRoleGuard,
} from '../auth/guards/minimum-role.guard';
import { ValidationResolver } from './validation.resolver';

describe('ValidationResolver guards', () => {
  it('requires login and BUILDER+ for every query (no anonymous scans)', () => {
    const guards: unknown[] =
      Reflect.getMetadata(GUARDS_METADATA, ValidationResolver) ?? [];
    expect(guards).toContain(GraphQLJwtAuthGuard);
    expect(guards).toContain(MinimumRoleGuard);
    expect(Reflect.getMetadata(MINIMUM_ROLE_KEY, ValidationResolver)).toBe(
      UserRole.BUILDER
    );
  });
});
