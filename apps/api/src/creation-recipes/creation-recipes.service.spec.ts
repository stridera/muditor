import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service';
import { CreationRecipesService } from './creation-recipes.service';

type Row = {
  id: number;
  abilityId: number;
  keyword: string | null;
  classId: number | null;
  objectZoneId: number;
  objectId: number | null;
};

/** In-memory stand-in for the creationRecipe/ability/characterClass delegates. */
function makeDb(seed: Row[] = []) {
  const rows = [...seed];
  let nextId = rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
  const withRefs = (r: Row) => ({
    ...r,
    ability: { id: r.abilityId, name: `ability ${r.abilityId}` },
    characterClass:
      r.classId === null ? null : { id: r.classId, name: 'c', plainName: 'c' },
  });
  const creationRecipe = {
    findMany: jest.fn(async () => rows.map(withRefs)),
    findUnique: jest.fn(async ({ where }: { where: { id: number } }) => {
      const r = rows.find(x => x.id === where.id);
      return r ? withRefs(r) : null;
    }),
    findFirst: jest.fn(
      async ({
        where,
      }: {
        where: {
          abilityId: number;
          keyword: string | null;
          classId: number | null;
          NOT?: { id: number };
        };
      }) =>
        rows.find(
          x =>
            x.abilityId === where.abilityId &&
            x.keyword === where.keyword &&
            x.classId === where.classId &&
            x.id !== where.NOT?.id
        ) ?? null
    ),
    create: jest.fn(async ({ data }: { data: Omit<Row, 'id'> }) => {
      const r = { id: nextId++, ...data };
      rows.push(r);
      return withRefs(r);
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
        return withRefs(r);
      }
    ),
    delete: jest.fn(async ({ where }: { where: { id: number } }) => {
      const i = rows.findIndex(x => x.id === where.id);
      return rows.splice(i, 1)[0];
    }),
  };
  const ability = {
    findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
      where.id < 1000 ? { id: where.id } : null
    ),
  };
  const characterClass = {
    findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
      where.id < 100 ? { id: where.id } : null
    ),
  };
  return {
    db: {
      creationRecipe,
      ability,
      characterClass,
    } as unknown as DatabaseService,
    creationRecipe,
  };
}

const base: Row = {
  id: 1,
  abilityId: 237,
  keyword: 'dagger',
  classId: null,
  objectZoneId: 10,
  objectId: 3,
};

describe('CreationRecipesService', () => {
  it('creates a recipe, normalizing a blank keyword to null', async () => {
    const { db, creationRecipe } = makeDb();
    const created = await new CreationRecipesService(db).create({
      abilityId: 5,
      keyword: '  ',
      objectZoneId: 12,
    });
    expect(created).toMatchObject({
      keyword: null,
      classId: null,
      objectId: null,
    });
    expect(creationRecipe.create).toHaveBeenCalledTimes(1);
  });

  it('lower-cases and trims the keyword', async () => {
    const { db } = makeDb();
    const created = await new CreationRecipesService(db).create({
      abilityId: 5,
      keyword: ' Sack ',
      objectZoneId: 12,
    });
    expect(created.keyword).toBe('sack');
  });

  it('rejects a duplicate (ability, keyword, class) including null class', async () => {
    const { db, creationRecipe } = makeDb([base]);
    const service = new CreationRecipesService(db);
    await expect(
      service.create({ abilityId: 237, keyword: 'dagger', objectZoneId: 1 })
    ).rejects.toThrow(BadRequestException);
    expect(creationRecipe.create).not.toHaveBeenCalled();
    // same keyword for a specific class is a different row
    await expect(
      service.create({
        abilityId: 237,
        keyword: 'dagger',
        classId: 3,
        objectZoneId: 1,
      })
    ).resolves.toBeDefined();
  });

  it('rejects unknown ability or class', async () => {
    const { db } = makeDb();
    const service = new CreationRecipesService(db);
    await expect(
      service.create({ abilityId: 5000, objectZoneId: 1 })
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.create({ abilityId: 5, classId: 500, objectZoneId: 1 })
    ).rejects.toThrow(BadRequestException);
  });

  it('validates the merged triple on update and allows keeping its own', async () => {
    const { db } = makeDb([base, { ...base, id: 2, keyword: 'sack' }]);
    const service = new CreationRecipesService(db);
    await expect(service.update(1, { keyword: 'sack' })).rejects.toThrow(
      BadRequestException
    );
    await expect(
      service.update(1, { keyword: 'dagger', objectId: 9 })
    ).resolves.toMatchObject({ objectId: 9 });
  });

  it('clears the class, keyword and object id with null', async () => {
    const { db } = makeDb([{ ...base, classId: 4 }]);
    await expect(
      new CreationRecipesService(db).update(1, {
        classId: null,
        keyword: null,
        objectId: null,
      })
    ).resolves.toMatchObject({ classId: null, keyword: null, objectId: null });
  });

  it('throws NotFound for missing ids and deletes existing', async () => {
    const { db } = makeDb([base]);
    const service = new CreationRecipesService(db);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    await service.remove(1);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });
});
