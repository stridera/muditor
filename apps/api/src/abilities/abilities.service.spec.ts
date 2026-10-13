import type { DatabaseService } from '../database/database.service';
import { AbilitiesService } from './abilities.service';
import type { UpdateAbilityInput } from './abilities.input';

/** In-memory stand-in for the ability delegate (update only). */
function makeDb() {
  const row: Record<string, unknown> = {
    id: 7,
    name: 'Fireball',
    plainName: 'fireball',
    description: 'Burns things',
    abilityType: 'SPELL',
    schoolId: 3,
    violent: true,
    combatOk: false,
    castTimeRounds: 2,
    cooldownMs: 1500,
    inCombatOnly: false,
    isArea: true,
    notes: 'tuned',
    tags: ['fire'],
    sphere: 'FIRE',
    damageType: 'FIRE',
    pages: 4,
    memorizationTime: 9,
    questOnly: true,
    humanoidOnly: true,
  };
  const update = jest.fn(
    async ({ data }: { data: Record<string, unknown> }): Promise<unknown> => {
      Object.assign(row, data);
      return { ...row };
    }
  );
  const findMany = jest.fn(
    async ({ where }: { where: { tags: { hasSome: string[] } } }) =>
      [{ name: 'Evade', tags: ['core:dodge'] }].filter(a =>
        a.tags.some(t => where.tags.hasSome.includes(t))
      )
  );
  return {
    db: { ability: { update, findMany } } as unknown as DatabaseService,
    row,
    update,
  };
}

describe('AbilitiesService.update (partial update)', () => {
  it('only writes the fields that were provided', async () => {
    const { db, update } = makeDb();
    const service = new AbilitiesService(db);

    await service.update(7, { description: 'Burns many things' });

    const { data } = update.mock.calls[0]![0] as {
      data: Record<string, unknown>;
    };
    expect(data).toEqual({ description: 'Burns many things' });
  });

  it('leaves combatOk, questOnly, humanoidOnly and memorizationTime untouched when omitted', async () => {
    const { db, row } = makeDb();
    const service = new AbilitiesService(db);

    await service.update(7, { name: 'Greater Fireball', cooldownMs: 3000 });

    expect(row).toMatchObject({
      name: 'Greater Fireball',
      plainName: 'greater fireball',
      cooldownMs: 3000,
      combatOk: false,
      questOnly: true,
      humanoidOnly: true,
      memorizationTime: 9,
    });
  });

  it('still writes explicit false and 0 values', async () => {
    const { db, row } = makeDb();
    const service = new AbilitiesService(db);

    await service.update(7, {
      questOnly: false,
      humanoidOnly: false,
      combatOk: true,
      memorizationTime: 0,
    });

    expect(row).toMatchObject({
      questOnly: false,
      humanoidOnly: false,
      combatOk: true,
      memorizationTime: 0,
    });
  });

  it('clears nullable columns only when null is sent explicitly', async () => {
    const { db, row } = makeDb();
    const service = new AbilitiesService(db);

    const input: UpdateAbilityInput = {
      schoolId: null,
      sphere: null,
      damageType: null,
      pages: null,
      notes: null,
      description: null,
    };
    await service.update(7, input);

    expect(row).toMatchObject({
      schoolId: null,
      sphere: null,
      damageType: null,
      pages: null,
      notes: null,
      description: null,
      questOnly: true,
    });
  });
});

describe('AbilitiesService core tags', () => {
  it('rejects a core tag another ability already carries', async () => {
    const { db, update } = makeDb();
    await expect(
      new AbilitiesService(db).update(7, { tags: ['fire', 'core:dodge'] })
    ).rejects.toThrow(/core:dodge is already used by the ability "Evade"/);
    expect(update).not.toHaveBeenCalled();
  });

  it('accepts unique core tags and trims/dedupes', async () => {
    const { db, update } = makeDb();
    await new AbilitiesService(db).update(7, {
      tags: [' fire ', 'fire', 'core:new_role'],
    });
    expect(
      (update.mock.calls[0]![0] as { data: { tags: string[] } }).data.tags
    ).toEqual(['fire', 'core:new_role']);
  });
});

describe('AbilitiesService sphere styles', () => {
  const makeStyleDb = () => {
    const findMany = jest.fn().mockResolvedValue([
      { sphere: 'FIRE', color: 'red' },
      { sphere: 'AIR', color: null },
    ]);
    const upsert = jest
      .fn()
      .mockImplementation(({ create }: { create: unknown }) => create);
    const db = {
      sphereStyle: { findMany, upsert },
    } as unknown as ConstructorParameters<typeof AbilitiesService>[0];
    return { db, upsert };
  };

  it('lists every sphere, with null for missing or NULL colours', async () => {
    const { db } = makeStyleDb();
    const rows = await new AbilitiesService(db).findAllSphereStyles();
    expect(rows).toHaveLength(11);
    expect(rows.find(r => r.sphere === 'FIRE')?.color).toBe('red');
    expect(rows.find(r => r.sphere === 'AIR')?.color).toBeNull();
    expect(rows.find(r => r.sphere === 'DEATH')?.color).toBeNull();
  });

  it('stores a trimmed lowercase tag body and clears on empty', async () => {
    const { db, upsert } = makeStyleDb();
    const service = new AbilitiesService(db);
    await service.updateSphereColor('AIR' as never, ' B:Cyan ');
    expect(upsert.mock.calls[0]![0].create).toEqual({
      sphere: 'AIR',
      color: 'b:cyan',
    });
    await service.updateSphereColor('AIR' as never, '');
    expect(upsert.mock.calls[1]![0].create).toEqual({
      sphere: 'AIR',
      color: null,
    });
  });

  it('accepts every form the game renders', async () => {
    const { db, upsert } = makeStyleDb();
    const service = new AbilitiesService(db);
    for (const c of ['red', 'b:cyan', '#FF8800', 'C196', 'bg-red:white']) {
      await service.updateSphereColor('AIR' as never, c);
    }
    expect(upsert.mock.calls.map(c => c[0].create.color)).toEqual([
      'red',
      'b:cyan',
      '#ff8800',
      'c196',
      'bg-red:white',
    ]);
  });

  it.each([
    'chartreuse',
    'fire',
    'b::red',
    '#ff88',
    'c256',
    'bg-',
    'red green',
  ])('rejects %s, which the game would ignore', async color => {
    const { db, upsert } = makeStyleDb();
    await expect(
      new AbilitiesService(db).updateSphereColor('AIR' as never, color)
    ).rejects.toThrow('Invalid sphere colour');
    expect(upsert).not.toHaveBeenCalled();
  });

  it('rejects colours that are not a tag body', async () => {
    const { db } = makeStyleDb();
    await expect(
      new AbilitiesService(db).updateSphereColor('AIR' as never, '<red>')
    ).rejects.toThrow('Invalid sphere colour');
  });
});
