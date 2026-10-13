import 'reflect-metadata';
import { UserRole } from '@muditor/db';
import { MINIMUM_ROLE_KEY } from '../auth/guards/minimum-role.guard';
import type { DatabaseService } from '../database/database.service';
import { SettingsResolver } from './settings.resolver';
import { SettingsService } from './settings.service';

const role = (method: string) =>
  Reflect.getMetadata(
    MINIMUM_ROLE_KEY,
    (SettingsResolver.prototype as unknown as Record<string, object>)[method]!
  ) as UserRole;

describe('commands list authz', () => {
  it('keeps the paged list and its count builder-only', () => {
    expect(role('findAllCommands')).toBe(UserRole.BUILDER);
    expect(role('countCommands')).toBe(UserRole.BUILDER);
  });
});

describe('SettingsService command list filtering', () => {
  function setup(aliasHits: { name: string }[] = []) {
    const db = {
      command: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      $queryRaw: jest.fn().mockResolvedValue(aliasHits),
    };
    return {
      service: new SettingsService(db as unknown as DatabaseService),
      db,
    };
  }

  it('pages, orders, and AND-s terms across name, summary and aliases', async () => {
    const { service, db } = setup([{ name: 'goto' }]);
    await service.findAllCommands({ search: 'tele', skip: 50, take: 50 });
    const q = db.command.findMany.mock.calls[0]![0];
    expect(q.skip).toBe(50);
    expect(q.take).toBe(50);
    expect(q.orderBy).toEqual([{ category: 'asc' }, { name: 'asc' }]);
    expect(q.where.AND).toHaveLength(1);
    expect(q.where.AND[0].OR).toEqual([
      { name: { contains: 'tele', mode: 'insensitive' } },
      { helpSummary: { contains: 'tele', mode: 'insensitive' } },
      { name: { in: ['goto'] } },
    ]);
  });

  it('returns everything for a blank search and counts with the same filter', async () => {
    const { service, db } = setup();
    await service.findAllCommands();
    expect(db.command.findMany.mock.calls[0]![0].where).toEqual({});
    expect(db.$queryRaw).not.toHaveBeenCalled();
    await service.countCommands('look');
    expect(db.command.count.mock.calls[0]![0].where.AND).toHaveLength(1);
  });
});
