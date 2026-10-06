import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@muditor/db';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import {
  MINIMUM_ROLE_KEY,
  MinimumRoleGuard,
} from '../../auth/guards/minimum-role.guard';
import { ClassesResolver } from '../../classes/classes.resolver';
import { RacesResolver } from '../../races/races.resolver';
import { HelpResolver } from '../../help/help.resolver';
import { SiteContentResolver } from '../../site-content/site-content.resolver';
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

interface Expectation {
  /** Queries that allow anonymous callers (OptionalJwtAuthGuard only, no role). */
  publicQueries: string[];
  /** Every mutation and the exact minimum role it must require. */
  mutations: Record<string, UserRole>;
}

const EXPECTED: Array<[string, Ctor, Expectation]> = [
  [
    'RacesResolver',
    RacesResolver as unknown as Ctor,
    {
      publicQueries: ['findAll', 'findOne', 'count', 'getRaceSkills'],
      mutations: {
        createRace: UserRole.CODER,
        updateRace: UserRole.HEAD_BUILDER,
        deleteRace: UserRole.HEAD_BUILDER,
        assignSkillToRace: UserRole.HEAD_BUILDER,
        updateRaceSkill: UserRole.HEAD_BUILDER,
        removeRaceSkill: UserRole.HEAD_BUILDER,
      },
    },
  ],
  [
    'ClassesResolver',
    ClassesResolver as unknown as Ctor,
    {
      publicQueries: [
        'findAll',
        'findOne',
        'findByName',
        'count',
        'getClassSkills',
        'getClassCircles',
      ],
      mutations: {
        createClass: UserRole.CODER,
        updateClass: UserRole.HEAD_BUILDER,
        deleteClass: UserRole.HEAD_BUILDER,
        assignSkillToClass: UserRole.HEAD_BUILDER,
        updateClassSkill: UserRole.HEAD_BUILDER,
        removeClassSkill: UserRole.HEAD_BUILDER,
        createClassCircle: UserRole.HEAD_BUILDER,
        updateClassCircle: UserRole.HEAD_BUILDER,
        removeClassCircle: UserRole.HEAD_BUILDER,
      },
    },
  ],
  [
    'HelpResolver',
    HelpResolver as unknown as Ctor,
    {
      publicQueries: [
        'findAll',
        'findOne',
        'findByKeyword',
        'count',
        'getCategories',
        'search',
      ],
      mutations: {
        createHelpEntry: UserRole.BUILDER,
        updateHelpEntry: UserRole.BUILDER,
        deleteHelpEntry: UserRole.CODER,
      },
    },
  ],
  [
    'SiteContentResolver',
    SiteContentResolver as unknown as Ctor,
    {
      publicQueries: ['findAll', 'findOne'],
      mutations: {
        createSiteContent: UserRole.BUILDER,
        updateSiteContent: UserRole.BUILDER,
        deleteSiteContent: UserRole.BUILDER,
      },
    },
  ],
];

describe.each(EXPECTED)(
  '%s read/write guard metadata',
  (_name, resolver, expected) => {
    const proto = resolver.prototype as Record<string, object>;
    const guardsOf = (method: string): unknown[] =>
      Reflect.getMetadata(GUARDS_METADATA, proto[method] as object) ?? [];
    const roleOf = (method: string): unknown =>
      Reflect.getMetadata(MINIMUM_ROLE_KEY, proto[method] as object);

    it('has no resolver-wide guard (guards are declared per method)', () => {
      const classGuards: unknown[] =
        Reflect.getMetadata(GUARDS_METADATA, resolver) ?? [];
      expect(classGuards).toEqual([]);
    });

    it('public read queries use optional auth and carry no minimum role', () => {
      const queries = methodsOfType(resolver, 'Query');
      expect(expected.publicQueries.length).toBeGreaterThan(0);
      for (const q of expected.publicQueries) {
        expect(queries).toContain(q);
        expect([q, guardsOf(q)]).toEqual([q, [OptionalJwtAuthGuard]]);
        expect([q, roleOf(q)]).toEqual([q, undefined]);
      }
    });

    it('every other query requires login and the role guard', () => {
      for (const q of methodsOfType(resolver, 'Query')) {
        if (expected.publicQueries.includes(q)) continue;
        expect([q, guardsOf(q)]).toEqual([
          q,
          expect.arrayContaining([GraphQLJwtAuthGuard, MinimumRoleGuard]),
        ]);
      }
    });

    it('mutations require login, the role guard and the exact minimum role', () => {
      const mutations = getMutationMethods(resolver);
      expect([...mutations].sort()).toEqual(
        Object.keys(expected.mutations).sort()
      );
      for (const m of mutations) {
        expect([m, guardsOf(m)]).toEqual([
          m,
          expect.arrayContaining([GraphQLJwtAuthGuard, MinimumRoleGuard]),
        ]);
        expect([m, roleOf(m)]).toEqual([m, expected.mutations[m]]);
      }
    });
  }
);
