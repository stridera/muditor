import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@muditor/db';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import {
  MINIMUM_ROLE_KEY,
  MinimumRoleGuard,
} from '../auth/guards/minimum-role.guard';
import { CreationRecipesResolver } from '../creation-recipes/creation-recipes.resolver';
import { SpellSyllablesResolver } from '../spell-syllables/spell-syllables.resolver';
import { StatusFlagValuesResolver } from '../status-flag-values/status-flag-values.resolver';
import { SystemMessagesResolver } from '../system-messages/system-messages.resolver';

type Ctor = new (...args: never[]) => object;

// [resolver, read methods, write methods, write role]
const catalogs: Array<[Ctor, string[], string[], UserRole]> = [
  [
    StatusFlagValuesResolver,
    ['findAll', 'findOne'],
    ['createStatusFlagValue', 'updateStatusFlagValue', 'deleteStatusFlagValue'],
    UserRole.BUILDER,
  ],
  [
    SpellSyllablesResolver,
    ['findAll', 'findOne'],
    ['createSpellSyllable', 'updateSpellSyllable', 'deleteSpellSyllable'],
    UserRole.BUILDER,
  ],
  [
    CreationRecipesResolver,
    ['findAll', 'findOne'],
    ['createCreationRecipe', 'updateCreationRecipe', 'deleteCreationRecipe'],
    UserRole.BUILDER,
  ],
  [
    SystemMessagesResolver,
    ['findAll', 'findOne'],
    ['createSystemMessage', 'updateSystemMessage', 'deleteSystemMessage'],
    UserRole.CODER,
  ],
];

describe.each(catalogs)(
  'content catalog resolver guards: %p',
  (resolver, reads, writes, writeRole) => {
    it('requires login and a minimum role on the whole resolver', () => {
      const guards: unknown[] =
        Reflect.getMetadata(GUARDS_METADATA, resolver) ?? [];
      expect(guards).toContain(GraphQLJwtAuthGuard);
      expect(guards).toContain(MinimumRoleGuard);
    });

    it('reads are IMMORTAL+', () => {
      for (const name of reads) {
        expect(
          Reflect.getMetadata(MINIMUM_ROLE_KEY, resolver.prototype[name])
        ).toBe(UserRole.IMMORTAL);
      }
    });

    it('writes require the content-write role', () => {
      for (const name of writes) {
        expect(
          Reflect.getMetadata(MINIMUM_ROLE_KEY, resolver.prototype[name])
        ).toBe(writeRole);
      }
    });
  }
);
