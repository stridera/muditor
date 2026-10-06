import { expectAllMutationsZoneProtected } from '../common/test/resolver-guard-assertions';
import { ZonesResolver } from './zones.resolver';

describe('ZonesResolver guards', () => {
  it('protects every mutation with login, BUILDER role and zone permission', () => {
    expectAllMutationsZoneProtected(ZonesResolver, [
      'createZone',
      'updateZone',
      'deleteZone',
    ]);
  });
});
