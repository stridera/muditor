import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@muditor/db';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  MINIMUM_ROLE_KEY,
  MinimumRoleGuard,
} from '../auth/guards/minimum-role.guard';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { CreateReservedNameInput } from './reserved-name.input';
import { ReservedNamesResolver } from './reserved-names.resolver';

describe('ReservedNamesResolver guards', () => {
  const proto = ReservedNamesResolver.prototype as unknown as Record<
    string,
    object
  >;
  const methods = ['findAll', 'createReservedName', 'deleteReservedName'];

  it.each(methods)('%s requires HEAD_BUILDER', method => {
    expect(Reflect.getMetadata(MINIMUM_ROLE_KEY, proto[method] as object)).toBe(
      UserRole.HEAD_BUILDER
    );
  });

  it('requires login and the role guard on the whole resolver', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      ReservedNamesResolver
    ) as unknown[];
    expect(guards).toContain(GraphQLJwtAuthGuard);
    expect(guards).toContain(MinimumRoleGuard);
  });
});

describe('CreateReservedNameInput', () => {
  const check = async (name: unknown, reason?: unknown) => {
    const input = plainToInstance(CreateReservedNameInput, { name, reason });
    return { input, errors: await validate(input) };
  };

  it('lowercases and trims the name', async () => {
    const { input, errors } = await check('  Warden ');
    expect(errors).toHaveLength(0);
    expect(input.name).toBe('warden');
  });

  it.each(['', '   ', 'two words', 'bob1', "o'neil", 'x'.repeat(31)])(
    'rejects %j',
    async name => {
      const { errors } = await check(name);
      expect(errors.length).toBeGreaterThan(0);
    }
  );

  it('rejects a reason over 200 characters', async () => {
    const { errors } = await check('guard', 'x'.repeat(201));
    expect(errors.length).toBeGreaterThan(0);
  });
});
