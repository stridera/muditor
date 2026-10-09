import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service';
import { SpellSyllablesService } from './spell-syllables.service';

type Row = {
  id: number;
  sortOrder: number;
  syllable: string;
  replacement: string;
};

/** In-memory stand-in for the spellSyllable delegate. */
function makeDb(seed: Row[] = []) {
  const rows = [...seed];
  let nextId = rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
  const spellSyllable = {
    findMany: jest.fn(async () => rows.map(r => ({ ...r }))),
    findUnique: jest.fn(
      async ({ where }: { where: { id?: number; syllable?: string } }) => {
        const r = rows.find(x =>
          where.id !== undefined
            ? x.id === where.id
            : x.syllable === where.syllable
        );
        return r ? { ...r } : null;
      }
    ),
    create: jest.fn(async ({ data }: { data: Omit<Row, 'id'> }) => {
      const r = { id: nextId++, ...data };
      rows.push(r);
      return { ...r };
    }),
    update: jest.fn(
      async ({
        where,
        data,
      }: {
        where: { id: number };
        data: Partial<Row>;
      }) => {
        const r = rows.find(x => x.id === where.id)!;
        Object.assign(r, data);
        return { ...r };
      }
    ),
    delete: jest.fn(async ({ where }: { where: { id: number } }) => {
      const i = rows.findIndex(x => x.id === where.id);
      return rows.splice(i, 1)[0];
    }),
  };
  return { db: { spellSyllable } as unknown as DatabaseService, spellSyllable };
}

const base: Row = { id: 1, sortOrder: 2, syllable: 'ar', replacement: 'abra' };

describe('SpellSyllablesService', () => {
  it('creates a syllable', async () => {
    const { db, spellSyllable } = makeDb();
    const created = await new SpellSyllablesService(db).create({
      sortOrder: 3,
      syllable: 'ate',
      replacement: 'i',
    });
    expect(created).toMatchObject({ syllable: 'ate', sortOrder: 3 });
    expect(spellSyllable.create).toHaveBeenCalledTimes(1);
  });

  it('keeps a whitespace-only syllable untouched', async () => {
    const { db } = makeDb();
    await expect(
      new SpellSyllablesService(db).create({
        sortOrder: 1,
        syllable: ' ',
        replacement: ' ',
      })
    ).resolves.toMatchObject({ syllable: ' ', replacement: ' ' });
  });

  it('rejects a duplicate syllable on create', async () => {
    const { db, spellSyllable } = makeDb([base]);
    await expect(
      new SpellSyllablesService(db).create({
        sortOrder: 9,
        syllable: 'ar',
        replacement: 'x',
      })
    ).rejects.toThrow(BadRequestException);
    expect(spellSyllable.create).not.toHaveBeenCalled();
  });

  it('rejects renaming to another syllable but allows keeping its own', async () => {
    const { db } = makeDb([base, { ...base, id: 2, syllable: 'ate' }]);
    const service = new SpellSyllablesService(db);
    await expect(service.update(1, { syllable: 'ate' })).rejects.toThrow(
      BadRequestException
    );
    await expect(
      service.update(1, { syllable: 'ar', replacement: 'new' })
    ).resolves.toMatchObject({ replacement: 'new' });
  });

  it('updates only the supplied fields', async () => {
    const { db } = makeDb([base]);
    await expect(
      new SpellSyllablesService(db).update(1, { sortOrder: 7 })
    ).resolves.toEqual({ ...base, sortOrder: 7 });
  });

  it('throws NotFound for missing ids and deletes existing', async () => {
    const { db } = makeDb([base]);
    const service = new SpellSyllablesService(db);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    await service.remove(1);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });
});
