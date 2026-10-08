import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service';
import { EffectAurasService } from './effect-auras.service';

type Row = {
  id: number;
  slug: string;
  keys: string[];
  text: string;
  needsDetectMagic: boolean;
  exclusiveGroup: string | null;
  minAlignment: number | null;
  maxAlignment: number | null;
  sortOrder: number;
};

/** In-memory stand-in for the effectAura delegate. */
function makeDb(seed: Row[] = []) {
  const rows = [...seed];
  let nextId = rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
  const effectAura = {
    findMany: jest.fn(async () => rows.map(r => ({ ...r }))),
    findUnique: jest.fn(
      async ({ where }: { where: { id?: number; slug?: string } }) => {
        const r = rows.find(x =>
          where.id !== undefined ? x.id === where.id : x.slug === where.slug
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
  return { db: { effectAura } as unknown as DatabaseService, effectAura };
}

const base: Row = {
  id: 1,
  slug: 'sanctuary',
  keys: ['sanctuary'],
  text: 'A white aura surrounds $n.',
  needsDetectMagic: false,
  exclusiveGroup: null,
  minAlignment: null,
  maxAlignment: null,
  sortOrder: 0,
};

const createInput = {
  slug: 'bless',
  keys: ['bless'],
  text: 'Blessed.',
  needsDetectMagic: false,
  sortOrder: 5,
};

describe('EffectAurasService', () => {
  it('creates an aura and normalizes keys', async () => {
    const { db, effectAura } = makeDb();
    const created = await new EffectAurasService(db).create({
      ...createInput,
      keys: [' bless ', 'bless', 'blessing'],
    });
    expect(created.keys).toEqual(['bless', 'blessing']);
    expect(effectAura.create).toHaveBeenCalledTimes(1);
  });

  it('rejects a duplicate slug on create', async () => {
    const { db } = makeDb([base]);
    await expect(
      new EffectAurasService(db).create({ ...createInput, slug: 'sanctuary' })
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects empty or blank-only keys', async () => {
    const { db, effectAura } = makeDb();
    const service = new EffectAurasService(db);
    await expect(service.create({ ...createInput, keys: [] })).rejects.toThrow(
      BadRequestException
    );
    await expect(
      service.create({ ...createInput, keys: ['  ', ''] })
    ).rejects.toThrow(BadRequestException);
    expect(effectAura.create).not.toHaveBeenCalled();
  });

  it('rejects minAlignment > maxAlignment but allows equal and partial', async () => {
    const { db } = makeDb();
    const service = new EffectAurasService(db);
    await expect(
      service.create({ ...createInput, minAlignment: 10, maxAlignment: -10 })
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.create({
        ...createInput,
        slug: 'a',
        minAlignment: 5,
        maxAlignment: 5,
      })
    ).resolves.toBeDefined();
    await expect(
      service.create({ ...createInput, slug: 'b', minAlignment: 500 })
    ).resolves.toBeDefined();
  });

  it('validates the merged alignment range on update', async () => {
    const { db } = makeDb([{ ...base, minAlignment: 100, maxAlignment: 500 }]);
    const service = new EffectAurasService(db);
    await expect(service.update(1, { maxAlignment: 50 })).rejects.toThrow(
      BadRequestException
    );
    await expect(
      service.update(1, { maxAlignment: null })
    ).resolves.toMatchObject({ maxAlignment: null, minAlignment: 100 });
  });

  it('rejects renaming to another aura slug but allows keeping its own', async () => {
    const { db } = makeDb([base, { ...base, id: 2, slug: 'bless' }]);
    const service = new EffectAurasService(db);
    await expect(service.update(1, { slug: 'bless' })).rejects.toThrow(
      BadRequestException
    );
    await expect(
      service.update(1, { slug: 'sanctuary', text: 'New' })
    ).resolves.toMatchObject({ text: 'New' });
  });

  it('rejects empty keys on update', async () => {
    const { db } = makeDb([base]);
    await expect(
      new EffectAurasService(db).update(1, { keys: [] })
    ).rejects.toThrow(BadRequestException);
  });

  it('throws NotFound for missing ids and deletes existing', async () => {
    const { db } = makeDb([base]);
    const service = new EffectAurasService(db);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    await service.remove(1);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });
});
