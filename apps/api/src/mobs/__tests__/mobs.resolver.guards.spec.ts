import { expectAllMutationsZoneProtected } from '../../common/test/resolver-guard-assertions';
import { MobsResolver } from '../mobs.resolver';

describe('MobsResolver guards', () => {
  it('protects every mutation with login, BUILDER role and zone permission', () => {
    expectAllMutationsZoneProtected(MobsResolver, [
      'createMob',
      'updateMob',
      'deleteMob',
      'deleteMobs',
      'updateMobDefaultEffects',
    ]);
  });
});
