import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@muditor/db';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { MINIMUM_ROLE_KEY } from '../../auth/guards/minimum-role.guard';
import { ClassesResolver } from '../../classes/classes.resolver';
import { RacesResolver } from '../../races/races.resolver';
import { getMutationMethods } from './resolver-guard-assertions';

const RESOLVER_TYPE_METADATA = 'graphql:resolver_type';

type Ctor = new (...args: never[]) => object;

function methodsOfType(resolver: Ctor, type: 'Query' | 'Mutation'): string[] {
  const proto = resolver.prototype as Record<string, unknown>;
  return Object.getOwnPropertyNames(proto).filter(
    n =>
      typeof proto[n] === 'function' &&
      Reflect.getMetadata(RESOLVER_TYPE_METADATA, proto[n] as object) === type
  );
}

describe.each([
  ['RacesResolver', RacesResolver as unknown as Ctor],
  ['ClassesResolver', ClassesResolver as unknown as Ctor],
])('%s read/write guard metadata', (_name, resolver) => {
  const proto = resolver.prototype as Record<string, object>;
  const classGuards: unknown[] =
    Reflect.getMetadata(GUARDS_METADATA, resolver) ?? [];

  it('requires login for the whole resolver', () => {
    expect(classGuards).toContain(GraphQLJwtAuthGuard);
  });

  it('read queries carry no minimum role (any authenticated user)', () => {
    const queries = methodsOfType(resolver, 'Query');
    expect(queries.length).toBeGreaterThan(0);
    for (const q of queries) {
      expect([
        q,
        Reflect.getMetadata(MINIMUM_ROLE_KEY, proto[q] as object),
      ]).toEqual([q, undefined]);
      const methodGuards: unknown[] =
        Reflect.getMetadata(GUARDS_METADATA, proto[q] as object) ?? [];
      expect(methodGuards).toEqual([]);
    }
  });

  it('mutations still require HEAD_BUILDER or CODER', () => {
    const mutations = getMutationMethods(resolver);
    expect(mutations.length).toBeGreaterThan(0);
    for (const m of mutations) {
      const role = Reflect.getMetadata(MINIMUM_ROLE_KEY, proto[m] as object);
      expect([m, [UserRole.HEAD_BUILDER, UserRole.CODER]]).toEqual([
        m,
        expect.arrayContaining([role]),
      ]);
    }
  });
});
