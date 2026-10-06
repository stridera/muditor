import { expectAllMutationsZoneProtected } from '../common/test/resolver-guard-assertions';
import { ShopsResolver } from './shops.resolver';

describe('ShopsResolver guards', () => {
  it('protects every mutation with login, BUILDER role and zone permission', () => {
    expectAllMutationsZoneProtected(ShopsResolver, [
      'createShop',
      'updateShop',
      'deleteShop',
      'updateShopInventory',
    ]);
  });
});
