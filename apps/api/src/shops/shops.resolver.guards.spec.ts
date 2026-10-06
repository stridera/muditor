import { expectAllMutationsZoneProtected } from '../common/test/resolver-guard-assertions';
import 'reflect-metadata';
import { ZONE_SCOPE_KEY } from '../auth/guards/zone-permission.guard';
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

  it('createShop checks both the shop zone and the keeper mob zone', () => {
    const proto = ShopsResolver.prototype as unknown as Record<string, object>;
    const opts = Reflect.getMetadata(ZONE_SCOPE_KEY, proto.createShop as object);
    expect(opts.keys).toEqual(
      expect.arrayContaining(['zoneId', 'keeperZoneId'])
    );
  });
});
