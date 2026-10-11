import { AccountStorageResolver } from './account-storage.resolver';
import { AccountStorageService } from './account-storage.service';

/**
 * Account storage is read-only over GraphQL. The game (chest/bank commands) is
 * the source of truth for item and coin movement; any web-side write can mint
 * or duplicate value (the exploit this guards against was `depositItem`
 * creating arbitrary items without the character holding them).
 */
describe('Account storage is read-only', () => {
  const removed = [
    'depositItem',
    'withdrawItem',
    'depositWealth',
    'withdrawWealth',
  ];

  it('exposes no mutation resolvers', () => {
    const proto = AccountStorageResolver.prototype as unknown as Record<
      string,
      unknown
    >;
    for (const name of removed) {
      expect(proto[name]).toBeUndefined();
    }
    for (const key of Object.getOwnPropertyNames(
      AccountStorageResolver.prototype
    )) {
      expect(key.toLowerCase()).not.toMatch(/deposit|withdraw/);
    }
  });

  it('has no write methods on the service', () => {
    const proto = AccountStorageService.prototype as unknown as Record<
      string,
      unknown
    >;
    for (const name of removed) {
      expect(proto[name]).toBeUndefined();
    }
  });
});
