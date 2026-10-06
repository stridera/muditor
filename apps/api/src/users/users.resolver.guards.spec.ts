import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@muditor/db';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersResolver } from './users.resolver';

const RESOLVER_TYPE_METADATA = 'graphql:resolver_type';
const proto = UsersResolver.prototype as unknown as Record<string, object>;
const handlerOf = (method: string): object => proto[method] as object;

const CODER_PLUS = [UserRole.CODER, UserRole.IMPLEMENTOR];
const IMMORTAL_PLUS = [UserRole.IMMORTAL, UserRole.CODER, UserRole.IMPLEMENTOR];

function expectGuarded(method: string, roles: UserRole[]) {
  const handler = handlerOf(method);
  expect(Reflect.getMetadata(RESOLVER_TYPE_METADATA, handler)).toBeDefined();
  const guards: unknown[] = Reflect.getMetadata(GUARDS_METADATA, handler) ?? [];
  expect([method, guards.includes(GraphQLJwtAuthGuard)]).toEqual([
    method,
    true,
  ]);
  expect([method, guards.includes(RolesGuard)]).toEqual([method, true]);
  expect([method, Reflect.getMetadata(ROLES_KEY, handler)]).toEqual([
    method,
    roles,
  ]);
}

describe('UsersResolver admin guards', () => {
  it('lets IMMORTAL+ list users on the admin page', () => {
    expectGuarded('adminUsers', IMMORTAL_PLUS);
  });

  it.each([
    'adminSetUserRole',
    'adminSetUserDeleted',
    'adminUnlinkCharacter',
    'adminCreatePasswordResetLink',
    'updateUser',
  ])('%s requires login and CODER+', method => {
    expectGuarded(method, CODER_PLUS);
  });
});
