import { expectAllMutationsZoneProtected } from '../../common/test/resolver-guard-assertions';
import { ObjectsResolver } from '../objects.resolver';

describe('ObjectsResolver guards', () => {
  it('protects every mutation with login, BUILDER role and zone permission', () => {
    expectAllMutationsZoneProtected(ObjectsResolver, [
      'createObject',
      'updateObject',
      'deleteObject',
      'deleteObjects',
      'updateObjectEffects',
      'updateObjectResistances',
      'updateConsumableEffects',
    ]);
  });
});
