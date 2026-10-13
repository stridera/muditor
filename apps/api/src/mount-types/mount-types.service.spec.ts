import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service';
import { MountTypesService } from './mount-types.service';

const ROW = {
  id: 3,
  tier: 3,
  alignmentSide: 'good',
  minLevel: 60,
  minAlignment: 900,
  mobZoneId: 0,
  mobId: 45,
  hpBonus: 50,
  mvBonus: 50,
};

function makeDb(opts: { row?: typeof ROW | null; mobExists?: boolean } = {}) {
  const mountType = {
    findMany: jest.fn(async () => [ROW]),
    findUnique: jest.fn(async () => (opts.row === undefined ? ROW : opts.row)),
    update: jest.fn(async ({ data }: { data: object }) => ({
      ...ROW,
      ...data,
    })),
  };
  const mobs = {
    findUnique: jest.fn(async () =>
      opts.mobExists === false ? null : { id: 45 }
    ),
  };
  return {
    db: { mountType, mobs } as unknown as DatabaseService,
    mountType,
    mobs,
  };
}

describe('MountTypesService', () => {
  it('lists tiers ordered by side then tier', async () => {
    const { db, mountType } = makeDb();
    expect(await new MountTypesService(db).findAll()).toEqual([ROW]);
    expect(mountType.findMany).toHaveBeenCalledWith({
      orderBy: [{ alignmentSide: 'asc' }, { tier: 'asc' }],
    });
  });

  it('updates the given fields and keeps the rest', async () => {
    const { db, mountType, mobs } = makeDb();
    await new MountTypesService(db).update({
      id: 3,
      minLevel: 65,
      hpBonus: 60,
    });
    expect(mobs.findUnique).toHaveBeenCalledWith({
      where: { zoneId_id: { zoneId: 0, id: 45 } },
      select: { id: true },
    });
    expect(mountType.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: {
        mobZoneId: 0,
        mobId: 45,
        minLevel: 65,
        hpBonus: 60,
      },
    });
  });

  it('rejects an unknown tier row', async () => {
    const { db, mountType } = makeDb({ row: null });
    await expect(
      new MountTypesService(db).update({ id: 99, minLevel: 1 })
    ).rejects.toThrow(NotFoundException);
    expect(mountType.update).not.toHaveBeenCalled();
  });

  it('rejects a mount mob that does not exist', async () => {
    const { db, mountType } = makeDb({ mobExists: false });
    await expect(
      new MountTypesService(db).update({ id: 3, mobZoneId: 9, mobId: 999 })
    ).rejects.toThrow(BadRequestException);
    expect(mountType.update).not.toHaveBeenCalled();
  });

  it.each([
    ['minLevel', -1],
    ['minLevel', 106],
    ['minLevel', 1.5],
    ['minAlignment', 1001],
    ['minAlignment', -5],
    ['hpBonus', 10_001],
    ['mvBonus', -1],
  ])('rejects %s = %p', async (field, value) => {
    const { db, mountType } = makeDb();
    await expect(
      new MountTypesService(db).update({ id: 3, [field]: value })
    ).rejects.toThrow(BadRequestException);
    expect(mountType.update).not.toHaveBeenCalled();
  });
});
