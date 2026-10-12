import { BadRequestException } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service';
import { SpellCirclesService } from './spell-circles.service';

function makeDb(seed: { circle: number; recoverSecs: number | null }[] = []) {
  const spellCircle = {
    findMany: jest.fn(async () => seed),
    upsert: jest.fn(
      async ({ create }: { create: { circle: number; recoverSecs: number } }) =>
        create
    ),
  };
  return { db: { spellCircle } as unknown as DatabaseService, spellCircle };
}

describe('SpellCirclesService', () => {
  it('lists circles 1-14 with null for missing or NULL times', async () => {
    const { db } = makeDb([
      { circle: 1, recoverSecs: 30 },
      { circle: 2, recoverSecs: null },
    ]);
    const rows = await new SpellCirclesService(db).findAll();
    expect(rows).toHaveLength(14);
    expect(rows[0]).toEqual({ circle: 1, recoverSecs: 30 });
    expect(rows[1]).toEqual({ circle: 2, recoverSecs: null });
    expect(rows[13]).toEqual({ circle: 14, recoverSecs: null });
  });

  it('stores a time and clears it with null', async () => {
    const { db, spellCircle } = makeDb();
    const service = new SpellCirclesService(db);
    await service.setRecoverSecs(3, 50);
    await service.setRecoverSecs(3, null);
    expect(spellCircle.upsert.mock.calls[0]![0].create).toEqual({
      circle: 3,
      recoverSecs: 50,
    });
    expect(spellCircle.upsert.mock.calls[1]![0].create).toEqual({
      circle: 3,
      recoverSecs: null,
    });
  });

  it.each([
    [0, 10],
    [15, 10],
    [1.5, 10],
    [3, -1],
    [3, 86_401],
    [3, 2.5],
  ])('rejects circle %p with time %p', async (circle, secs) => {
    const { db, spellCircle } = makeDb();
    await expect(
      new SpellCirclesService(db).setRecoverSecs(circle, secs)
    ).rejects.toThrow(BadRequestException);
    expect(spellCircle.upsert).not.toHaveBeenCalled();
  });
});
