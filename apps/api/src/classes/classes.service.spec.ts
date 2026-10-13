import type { DatabaseService } from '../database/database.service';
import { ClassesService } from './classes.service';

/** In-memory stand-in for the characterClass delegate (find/update only). */
function makeDb(
  others: Array<{ name: string; plainName: string; tags: string[] }> = []
) {
  const row: Record<string, unknown> = {
    id: 1,
    name: 'Warrior',
    plainName: 'Warrior',
    description: 'd',
    hitDice: '1d8',
    primaryStat: null,
    alignmentBias: 0,
    tags: [],
  };
  const characterClass = {
    // Other classes holding any of the asked-for tags
    findMany: jest.fn(
      async ({ where }: { where: { tags: { hasSome: string[] } } }) =>
        others.filter(o => o.tags.some(t => where.tags.hasSome.includes(t)))
    ),
    findUnique: jest.fn(async ({ where }: { where: { id?: number } }) =>
      where.id === row.id ? { ...row } : null
    ),
    update: jest.fn(
      async ({ data }: { data: Record<string, unknown> }): Promise<unknown> => {
        Object.assign(row, data);
        return { ...row };
      }
    ),
  };
  return {
    db: { characterClass } as unknown as DatabaseService,
    characterClass,
  };
}

describe('ClassesService.update', () => {
  it('persists hitDice, primaryStat and alignmentBias and reads them back', async () => {
    const { db, characterClass } = makeDb();
    const service = new ClassesService(db);

    const updated = await service.update(1, {
      hitDice: '2d10',
      primaryStat: 'STR',
      alignmentBias: -50,
    });

    expect(characterClass.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { hitDice: '2d10', primaryStat: 'STR', alignmentBias: -50 },
    });
    expect(updated).toMatchObject({
      hitDice: '2d10',
      primaryStat: 'STR',
      alignmentBias: -50,
    });

    const reread = await service.findOne(1);
    expect(reread).toMatchObject({
      hitDice: '2d10',
      primaryStat: 'STR',
      alignmentBias: -50,
    });
  });

  it('leaves omitted fields untouched', async () => {
    const { db, characterClass } = makeDb();
    const service = new ClassesService(db);

    await service.update(1, { alignmentBias: 100 });

    expect(characterClass.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { alignmentBias: 100 },
    });
  });

  it('replaces tags, trimming blanks', async () => {
    const { db, characterClass } = makeDb();
    const service = new ClassesService(db);

    const updated = await service.update(1, {
      tags: [' core:monk ', '', 'x'],
    });

    expect(characterClass.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { tags: ['core:monk', 'x'] },
    });
    expect(updated).toMatchObject({ tags: ['core:monk', 'x'] });
  });

  it('rejects a core tag another class already carries', async () => {
    const { db, characterClass } = makeDb([
      { name: '<b>Monk</>', plainName: 'Monk', tags: ['core:monk'] },
    ]);
    const service = new ClassesService(db);

    await expect(service.update(1, { tags: ['core:monk'] })).rejects.toThrow(
      /core:monk is already used by the class "Monk"/
    );
    expect(characterClass.update).not.toHaveBeenCalled();
  });

  it('allows non-core tags to repeat and dedupes within one class', async () => {
    const { db, characterClass } = makeDb([
      { name: 'Monk', plainName: 'Monk', tags: ['martial'] },
    ]);
    const service = new ClassesService(db);

    await service.update(1, { tags: ['martial', 'martial', 'core:thief'] });

    expect(characterClass.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { tags: ['martial', 'core:thief'] },
    });
  });

  it('rejects a bare core: tag', async () => {
    const { db } = makeDb();
    await expect(
      new ClassesService(db).update(1, { tags: ['core:'] })
    ).rejects.toThrow(/Invalid tag/);
  });
});
