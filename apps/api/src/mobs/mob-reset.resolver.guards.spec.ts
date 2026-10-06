import { expectAllMutationsZoneProtected } from '../common/test/resolver-guard-assertions';
import { MobResetResolver } from './mob-reset.resolver';

describe('MobResetResolver guards', () => {
  it('protects every mutation with login, BUILDER role and zone permission', () => {
    expectAllMutationsZoneProtected(MobResetResolver, [
      'createMobReset',
      'updateMobReset',
      'deleteMobReset',
      'deleteMobResetEquipment',
      'addMobResetEquipment',
      'updateMobResetEquipment',
    ]);
  });
});
