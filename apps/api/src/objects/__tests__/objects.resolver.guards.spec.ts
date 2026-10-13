import { expectAllMutationsZoneProtected } from '../../common/test/resolver-guard-assertions';
import { ObjectAbilitiesResolver } from '../object-abilities.resolver';
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

  it('protects the spell-list mutation with login, BUILDER role and zone permission', () => {
    expectAllMutationsZoneProtected(ObjectAbilitiesResolver, [
      'setObjectAbilities',
    ]);
  });
});
