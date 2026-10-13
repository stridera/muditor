import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ObjectAbilitiesService } from '../object-abilities.service';

/** Rows the fake transaction hands back, in id order. */
function makeDb(object: { type: string; values: unknown } | null) {
  const rows: Array<Record<string, unknown>> = [];
  let nextId = 1;
  const tx = {
    objectAbilities: {
      deleteMany: jest.fn(async () => {
        rows.length = 0;
      }),
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        rows.push({
          id: nextId++,
          ...data,
          ability: {
            name: `<b>${data['abilityId']}</b>`,
            plainName: `AB_${data['abilityId']}`,
          },
        });
      }),
      findMany: jest.fn(async () => [...rows]),
    },
    objects: { update: jest.fn(async () => ({})) },
  };
  const db = {
    objects: {
      findUnique: jest.fn(async () => object),
      findFirst: jest.fn(async () => (object ? { id: 1 } : null)),
    },
    ability: {
      findMany: jest.fn(
        async ({ where }: { where: { id: { in: number[] } } }) =>
          where.id.in
            .filter(id => id < 1000)
            .map(id => ({ id, plainName: `AB_${id}` }))
      ),
    },
    $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
  };
  return { db, tx };
}

const make = (object: { type: string; values: unknown } | null) => {
  const { db, tx } = makeDb(object);
  return {
    tx,
    db,
    service: new ObjectAbilitiesService(db as never),
  };
};

describe('ObjectAbilitiesService.replace', () => {
  it('writes ordered rows with duplicates and mirrors values.Spells', async () => {
    const { service, tx } = make({
      type: 'POTION',
      values: { Level: 3, Other: 'kept' },
    });
    const out = await service.replace(30, 5, [
      { abilityId: 7, level: 12 },
      { abilityId: 7, level: 12 },
      { abilityId: 9, level: 20, charges: 4 },
    ]);
    expect(out.map(r => [r.id, r.abilityId, r.level, r.charges])).toEqual([
      [1, 7, 12, undefined],
      [2, 7, 12, undefined],
      [3, 9, 20, undefined],
    ]);
    const update = tx.objects.update.mock.calls[0] as unknown as [
      { data: { values: Record<string, unknown> } },
    ];
    expect(update[0].data.values).toEqual({
      Level: 12,
      Other: 'kept',
      Spells: ['AB_7', 'AB_7', 'AB_9'],
    });
  });

  it('keeps charges for wands and mirrors the single Spell key', async () => {
    const { service, tx } = make({ type: 'WAND', values: {} });
    const out = await service.replace(30, 5, [
      { abilityId: 7, level: 25, charges: 5 },
    ]);
    expect(out[0]!.charges).toBe(5);
    const update = tx.objects.update.mock.calls[0] as unknown as [
      { data: { values: Record<string, unknown> } },
    ];
    expect(update[0].data.values).toEqual({
      Spell: 'AB_7',
      Level: 25,
      Max_Charges: 5,
      Charges_Left: 5,
    });
  });

  it('an empty list clears the rows', async () => {
    const { service, tx } = make({
      type: 'WAND',
      values: { Spell: 'X', Level: 3 },
    });
    expect(await service.replace(30, 5, [])).toEqual([]);
    const update = tx.objects.update.mock.calls[0] as unknown as [
      { data: { values: Record<string, unknown> } },
    ];
    expect(update[0].data.values).toEqual({ Level: 3 });
  });

  it('rejects unknown abilities, other object types and missing objects', async () => {
    await expect(
      make({ type: 'POTION', values: {} }).service.replace(30, 5, [
        { abilityId: 5000, level: 1 },
      ])
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      make({ type: 'ARMOR', values: {} }).service.replace(30, 5, [])
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(make(null).service.replace(30, 5, [])).rejects.toBeInstanceOf(
      NotFoundException
    );
    await expect(
      make({ type: 'SCROLL', values: {} }).service.replace(
        30,
        5,
        Array.from({ length: 21 }, () => ({ abilityId: 1, level: 1 }))
      )
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('ObjectAbilitiesService.list', () => {
  it('returns [] for a hidden or missing object', async () => {
    expect(await make(null).service.list(30, 5)).toEqual([]);
  });
});
