import 'reflect-metadata';
import { UserRole } from '@muditor/db';
import { MINIMUM_ROLE_KEY } from '../auth/guards/minimum-role.guard';
import { GrantsResolver } from './grants.resolver';

describe('GrantsResolver guards', () => {
  const proto = GrantsResolver.prototype as unknown as Record<string, object>;
  const roleOf = (method: string): unknown =>
    Reflect.getMetadata(MINIMUM_ROLE_KEY, proto[method] as object);

  it.each([
    'findGrantableUsers',
    'createGrant',
    'updateGrant',
    'deleteGrant',
    'grantZoneAccess',
    'revokeZoneAccess',
  ])('%s requires HEAD_BUILDER', method => {
    expect(roleOf(method)).toBe(UserRole.HEAD_BUILDER);
  });

  it('resolves display names from the included user relations, null when absent', () => {
    const resolver = new GrantsResolver({} as never);
    expect(
      resolver.resolveDisplayName({ user: { displayName: 'BuilderChar' } })
    ).toBe('BuilderChar');
    expect(resolver.resolveDisplayName({ user: null })).toBeNull();
    expect(resolver.resolveDisplayName({})).toBeNull();
    expect(
      resolver.resolveGrantedByDisplayName({
        grantedByUser: { displayName: 'Admin' },
      })
    ).toBe('Admin');
    expect(resolver.resolveGrantedByDisplayName({})).toBeNull();
  });
});
