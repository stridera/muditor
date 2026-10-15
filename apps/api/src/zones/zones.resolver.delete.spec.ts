import { ForbiddenException } from '@nestjs/common';
import { GrantPermission, UserRole, type Users } from '@muditor/db';
import type { GrantsService } from '../grants/grants.service';
import { ZonesResolver } from './zones.resolver';
import type { ZonesService } from './zones.service';

function setup(isZoneAdmin: boolean) {
  const deleted = { id: 42, name: 'Doomed' };
  const zonesService = { delete: jest.fn().mockResolvedValue(deleted) };
  const grantsService = {
    checkZonePermission: jest.fn().mockResolvedValue(isZoneAdmin),
  };
  const resolver = new ZonesResolver(
    zonesService as unknown as ZonesService,
    grantsService as unknown as GrantsService
  );
  return { resolver, zonesService, grantsService, deleted };
}

const userWithRole = (role: UserRole): Users =>
  ({ id: 'user-1', role }) as unknown as Users;

describe('ZonesResolver.deleteZone', () => {
  it.each([UserRole.HEAD_BUILDER, UserRole.CODER, UserRole.IMPLEMENTOR])(
    'allows %s without consulting grants',
    async role => {
      const { resolver, zonesService, grantsService, deleted } = setup(false);
      await expect(resolver.deleteZone(42, userWithRole(role))).resolves.toBe(
        deleted
      );
      expect(zonesService.delete).toHaveBeenCalledWith(42);
      expect(grantsService.checkZonePermission).not.toHaveBeenCalled();
    }
  );

  it('allows a BUILDER holding an ADMIN grant on the zone', async () => {
    const { resolver, zonesService, grantsService, deleted } = setup(true);
    await expect(
      resolver.deleteZone(42, userWithRole(UserRole.BUILDER))
    ).resolves.toBe(deleted);
    expect(grantsService.checkZonePermission).toHaveBeenCalledWith(
      'user-1',
      42,
      GrantPermission.ADMIN
    );
    expect(zonesService.delete).toHaveBeenCalledWith(42);
  });

  it('refuses a BUILDER with only a WRITE grant (no ADMIN)', async () => {
    const { resolver, zonesService } = setup(false);
    await expect(
      resolver.deleteZone(42, userWithRole(UserRole.BUILDER))
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(zonesService.delete).not.toHaveBeenCalled();
  });
});
