import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@muditor/db';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import {
  MINIMUM_ROLE_KEY,
  MinimumRoleGuard,
} from '../auth/guards/minimum-role.guard';
import { expectAllMutationsZoneProtected } from '../common/test/resolver-guard-assertions';
import { ClassAiRulesResolver } from './class-ai-rules.resolver';
import { MobAiRulesResolver } from './mob-ai-rules.resolver';

const RESOLVER_TYPE_METADATA = 'graphql:resolver_type';

function methodsOfType(
  resolver: new (...args: never[]) => object,
  type: 'Query' | 'Mutation'
): string[] {
  const proto = resolver.prototype as Record<string, unknown>;
  return Object.getOwnPropertyNames(proto).filter(
    n =>
      typeof proto[n] === 'function' &&
      Reflect.getMetadata(RESOLVER_TYPE_METADATA, proto[n] as object) === type
  );
}

function expectRole(
  resolver: new (...args: never[]) => object,
  method: string,
  role: UserRole
): void {
  const handler = (resolver.prototype as Record<string, object>)[method]!;
  const guards: unknown[] = [
    ...(Reflect.getMetadata(GUARDS_METADATA, resolver) ?? []),
    ...(Reflect.getMetadata(GUARDS_METADATA, handler) ?? []),
  ];
  expect([method, guards.includes(GraphQLJwtAuthGuard)]).toEqual([
    method,
    true,
  ]);
  expect([method, guards.includes(MinimumRoleGuard)]).toEqual([method, true]);
  expect([method, Reflect.getMetadata(MINIMUM_ROLE_KEY, handler)]).toEqual([
    method,
    role,
  ]);
}

describe('ClassAiRulesResolver guards', () => {
  it('reads need IMMORTAL, every mutation needs BUILDER', () => {
    expect(methodsOfType(ClassAiRulesResolver, 'Query')).toEqual([
      'classAiRules',
    ]);
    expectRole(ClassAiRulesResolver, 'classAiRules', UserRole.IMMORTAL);
    const mutations = methodsOfType(ClassAiRulesResolver, 'Mutation');
    expect(mutations.sort()).toEqual([
      'createClassAiRule',
      'deleteClassAiRule',
      'reorderClassAiRules',
      'updateClassAiRule',
    ]);
    for (const m of mutations) {
      expectRole(ClassAiRulesResolver, m, UserRole.BUILDER);
    }
  });
});

describe('MobAiRulesResolver guards', () => {
  it('reads need IMMORTAL', () => {
    expect(methodsOfType(MobAiRulesResolver, 'Query')).toEqual(['mobAiRules']);
    expectRole(MobAiRulesResolver, 'mobAiRules', UserRole.IMMORTAL);
  });

  it('protects every mutation with login, BUILDER role and zone permission', () => {
    expectAllMutationsZoneProtected(MobAiRulesResolver, [
      'saveMobAiRule',
      'deleteMobAiRule',
      'reorderMobAiRules',
    ]);
  });
});
