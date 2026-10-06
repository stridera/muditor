import { expectAllMutationsZoneProtected } from '../common/test/resolver-guard-assertions';
import { ObjectResetResolver } from './object-reset.resolver';

describe('ObjectResetResolver guards', () => {
  it('protects every mutation with login, BUILDER role and zone permission', () => {
    expectAllMutationsZoneProtected(ObjectResetResolver, [
      'createObjectReset',
      'updateObjectReset',
      'deleteObjectReset',
    ]);
  });
});
