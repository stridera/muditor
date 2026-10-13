import 'reflect-metadata';
import { UserRole } from '@muditor/db';
import { MINIMUM_ROLE_KEY } from '../auth/guards/minimum-role.guard';
import type { DatabaseService } from '../database/database.service';
import { SocialsResolver } from './socials.resolver';
import { SocialsService } from './socials.service';

describe('socials list', () => {
  it('stays IMMORTAL+ for the page and the count', () => {
    for (const m of ['findAll', 'count']) {
      expect(
        Reflect.getMetadata(
          MINIMUM_ROLE_KEY,
          (SocialsResolver.prototype as unknown as Record<string, object>)[m]!
        )
      ).toBe(UserRole.IMMORTAL);
    }
  });

  it('filters by name, orders by name and pages', async () => {
    const db = {
      social: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const service = new SocialsService(db as unknown as DatabaseService);
    await service.findAll({ search: 'sm ile', skip: 50, take: 50 });
    expect(db.social.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { name: { contains: 'sm', mode: 'insensitive' } },
          { name: { contains: 'ile', mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
      skip: 50,
      take: 50,
    });
    await service.count('smile');
    expect(db.social.count.mock.calls[0]![0].where.AND).toHaveLength(1);
    await service.findAll();
    expect(db.social.findMany.mock.calls[1]![0].where).toEqual({});
  });
});
