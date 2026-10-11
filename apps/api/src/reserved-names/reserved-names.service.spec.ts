import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service';
import { ReservedNamesService } from './reserved-names.service';

type Row = {
  id: number;
  name: string;
  reason: string | null;
  createdAt: Date;
};

/** In-memory stand-in for the reservedNames delegate. */
function makeDb(seed: Row[] = []) {
  const rows = [...seed];
  let nextId = rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
  const reservedNames = {
    findMany: jest.fn(async () =>
      [...rows].sort((a, b) => a.name.localeCompare(b.name))
    ),
    findUnique: jest.fn(
      async ({ where }: { where: { id?: number; name?: string } }) => {
        const r = rows.find(x =>
          where.id !== undefined ? x.id === where.id : x.name === where.name
        );
        return r ? { ...r } : null;
      }
    ),
    create: jest.fn(
      async ({ data }: { data: { name: string; reason: string | null } }) => {
        const r = { id: nextId++, createdAt: new Date(0), ...data };
        rows.push(r);
        return { ...r };
      }
    ),
    delete: jest.fn(async ({ where }: { where: { id: number } }) => {
      const i = rows.findIndex(x => x.id === where.id);
      return rows.splice(i, 1)[0];
    }),
  };
  return { db: { reservedNames } as unknown as DatabaseService, reservedNames };
}

const guard: Row = {
  id: 1,
  name: 'guard',
  reason: 'Generic mob word',
  createdAt: new Date(0),
};

describe('ReservedNamesService', () => {
  it('lists names alphabetically', async () => {
    const { db } = makeDb([
      { ...guard, id: 2, name: 'merchant' },
      guard,
      { ...guard, id: 3, name: 'beggar' },
    ]);
    const names = (await new ReservedNamesService(db).findAll()).map(
      r => r.name
    );
    expect(names).toEqual(['beggar', 'guard', 'merchant']);
  });

  it('stores the name trimmed and lowercase, with a trimmed reason', async () => {
    const { db, reservedNames } = makeDb();
    const created = await new ReservedNamesService(db).create({
      name: '  Warden ',
      reason: ' Generic mob word ',
    });
    expect(created).toMatchObject({
      name: 'warden',
      reason: 'Generic mob word',
    });
    expect(reservedNames.create).toHaveBeenCalledWith({
      data: { name: 'warden', reason: 'Generic mob word' },
    });
  });

  it('stores a missing or blank reason as null', async () => {
    const { db } = makeDb();
    const service = new ReservedNamesService(db);
    await expect(service.create({ name: 'one' })).resolves.toMatchObject({
      reason: null,
    });
    await expect(
      service.create({ name: 'two', reason: '   ' })
    ).resolves.toMatchObject({ reason: null });
  });

  it('rejects a duplicate in any case', async () => {
    const { db, reservedNames } = makeDb([guard]);
    await expect(
      new ReservedNamesService(db).create({ name: 'GUARD' })
    ).rejects.toThrow(BadRequestException);
    expect(reservedNames.create).not.toHaveBeenCalled();
  });

  it('maps a racing unique violation to a bad request', async () => {
    const { db, reservedNames } = makeDb();
    reservedNames.create.mockRejectedValueOnce(
      Object.assign(new Error('dup'), { code: 'P2002' })
    );
    await expect(
      new ReservedNamesService(db).create({ name: 'guard' })
    ).rejects.toThrow(BadRequestException);
  });

  it('removes an existing name and throws NotFound for a missing id', async () => {
    const { db, reservedNames } = makeDb([guard]);
    const service = new ReservedNamesService(db);
    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    expect(reservedNames.delete).not.toHaveBeenCalled();
    await service.remove(1);
    expect(reservedNames.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });
});
