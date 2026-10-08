import 'reflect-metadata';
import { ForbiddenException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@muditor/db';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { markSelfAuthenticated } from './user-access.util';
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

describe('UsersResolver user(id) access', () => {
  it('requires login (unauthenticated callers get Unauthorized from the guard)', () => {
    const guards: unknown[] =
      Reflect.getMetadata(GUARDS_METADATA, handlerOf('user')) ?? [];
    expect(guards.includes(GraphQLJwtAuthGuard)).toBe(true);
  });

  const service = {
    getUserWithBanStatus: jest.fn().mockResolvedValue({ id: 'u1' }),
    getBanHistory: jest.fn().mockResolvedValue([{ id: 'b1' }]),
  };
  const resolver = new UsersResolver(service as never, {} as never);
  const viewer = (id: string, role: UserRole) => ({ id, role });
  const target = {
    id: 'u1',
    email: 'u1@example.com',
    lastLoginAt: new Date('2026-01-01'),
  } as never;
  const ctx = (user: { id: string; role: UserRole } | undefined) => ({
    req: { user },
  });

  it('rejects another PLAYER with Forbidden', async () => {
    await expect(
      resolver.user('u1', viewer('u2', UserRole.PLAYER) as never)
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows the account itself', async () => {
    await expect(
      resolver.user('u1', viewer('u1', UserRole.PLAYER) as never)
    ).resolves.toEqual({ id: 'u1' });
  });

  it.each([UserRole.IMMORTAL, UserRole.CODER, UserRole.IMPLEMENTOR])(
    'allows staff (%s)',
    async role => {
      await expect(
        resolver.user('u1', viewer('staff', role) as never)
      ).resolves.toEqual({ id: 'u1' });
    }
  );

  it('hides email, lastLoginAt and banRecords from other players', async () => {
    const c = ctx(viewer('u2', UserRole.PLAYER));
    expect(() => resolver.email(target, c)).toThrow(ForbiddenException);
    expect(resolver.lastLoginAt(target, c)).toBeNull();
    await expect(resolver.banRecords(target, c)).resolves.toBeNull();
  });

  it('hides sensitive fields when there is no viewer', async () => {
    const c = ctx(undefined);
    expect(() => resolver.email(target, c)).toThrow(ForbiddenException);
    expect(resolver.lastLoginAt(target, c)).toBeNull();
    await expect(resolver.banRecords(target, c)).resolves.toBeNull();
  });

  it('shows sensitive fields to the account itself and to staff', async () => {
    for (const v of [
      viewer('u1', UserRole.PLAYER),
      viewer('imm', UserRole.IMMORTAL),
    ]) {
      const c = ctx(v);
      expect(resolver.email(target, c)).toBe('u1@example.com');
      expect(resolver.lastLoginAt(target, c)).toEqual(new Date('2026-01-01'));
      await expect(resolver.banRecords(target, c)).resolves.toEqual([
        { id: 'b1' },
      ]);
    }
  });

  it('shows the email on the user returned by an auth mutation', () => {
    const payloadUser = markSelfAuthenticated(target as object);
    expect(resolver.email(payloadUser as never, ctx(undefined))).toBe(
      'u1@example.com'
    );
  });

  it('does not let other accounts through just because the marker exists elsewhere', () => {
    expect(() =>
      resolver.email(target, ctx(viewer('u2', UserRole.PLAYER)))
    ).toThrow(ForbiddenException);
  });
});
