import type { DatabaseService } from '../database/database.service';
import { ClassesService } from './classes.service';

/** In-memory stand-in for the characterClass delegate (find/update only). */
function makeDb() {
  const row: Record<string, unknown> = {
    id: 1,
    name: 'Warrior',
    plainName: 'Warrior',
    description: 'd',
    hitDice: '1d8',
    primaryStat: null,
    alignmentBias: 0,
  };
  const characterClass = {
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
});
