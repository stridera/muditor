import { GrantPermission, UserRole, type Users } from '@muditor/db';
import type { GrantsService } from '../grants/grants.service';
import type { CreateZoneInput } from './zone.dto';
import { ZonesResolver } from './zones.resolver';
import type { ZonesService } from './zones.service';

function setup() {
  const created = { id: 9001, name: 'Test Zone' };
  const zonesService = {
    create: jest.fn().mockResolvedValue(created),
  };
  const grantsService = {
    grantZoneAccess: jest.fn().mockResolvedValue({}),
  };
  const resolver = new ZonesResolver(
    zonesService as unknown as ZonesService,
    grantsService as unknown as GrantsService
  );
  return { resolver, zonesService, grantsService, created };
}

const input: CreateZoneInput = { id: 9001, name: 'Test Zone' };
const userWithRole = (role: UserRole): Users =>
  ({ id: 'user-1', role }) as unknown as Users;

describe('ZonesResolver.createZone', () => {
  it('returns the created zone including its id', async () => {
    const { resolver, zonesService, created } = setup();
    const result = await resolver.createZone(
      input,
      userWithRole(UserRole.IMPLEMENTOR)
    );
    expect(zonesService.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });

  it('auto-grants the creator ADMIN on the new zone when they are a BUILDER', async () => {
    const { resolver, grantsService } = setup();
    await resolver.createZone(input, userWithRole(UserRole.BUILDER));
    expect(grantsService.grantZoneAccess).toHaveBeenCalledWith(
      {
        userId: 'user-1',
        zoneId: 9001,
        permissions: [GrantPermission.ADMIN],
      },
      'user-1'
    );
  });

  it.each([UserRole.HEAD_BUILDER, UserRole.CODER, UserRole.IMPLEMENTOR])(
    'does not create a grant for %s (bypasses grants)',
    async role => {
      const { resolver, grantsService } = setup();
      await resolver.createZone(input, userWithRole(role));
      expect(grantsService.grantZoneAccess).not.toHaveBeenCalled();
    }
  );
});
