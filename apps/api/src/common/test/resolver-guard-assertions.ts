import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@muditor/db';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import {
  MINIMUM_ROLE_KEY,
  MinimumRoleGuard,
} from '../../auth/guards/minimum-role.guard';
import { ZonePermissionGuard } from '../../auth/guards/zone-permission.guard';

const RESOLVER_TYPE_METADATA = 'graphql:resolver_type';

type Ctor = new (...args: never[]) => object;

/** Names of every method on the resolver decorated with @Mutation */
export function getMutationMethods(resolver: Ctor): string[] {
  const proto = resolver.prototype as Record<string, unknown>;
  return Object.getOwnPropertyNames(proto).filter(name => {
    const fn = proto[name];
    return (
      typeof fn === 'function' &&
      Reflect.getMetadata(RESOLVER_TYPE_METADATA, fn) === 'Mutation'
    );
  });
}

/**
 * Regression net: every mutation of the resolver must require login, the
 * BUILDER minimum role and the zone permission guard.
 */
export function expectAllMutationsZoneProtected(
  resolver: Ctor,
  expectedMutations: string[]
): void {
  const mutations = getMutationMethods(resolver);
  expect(mutations.sort()).toEqual([...expectedMutations].sort());

  const proto = resolver.prototype as Record<string, object>;
  for (const name of mutations) {
    const handler = proto[name] as object;
    const guards: unknown[] = [
      ...(Reflect.getMetadata(GUARDS_METADATA, resolver) ?? []),
      ...(Reflect.getMetadata(GUARDS_METADATA, handler) ?? []),
    ];
    const label = `${resolver.name}.${name}`;
    expect([label, guards.includes(GraphQLJwtAuthGuard)]).toEqual([
      label,
      true,
    ]);
    expect([label, guards.includes(MinimumRoleGuard)]).toEqual([label, true]);
    expect([label, guards.includes(ZonePermissionGuard)]).toEqual([
      label,
      true,
    ]);
    expect([label, Reflect.getMetadata(MINIMUM_ROLE_KEY, handler)]).toEqual([
      label,
      UserRole.BUILDER,
    ]);
  }
}
