import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service';
import { StatusFlagValuesService } from './status-flag-values.service';

type Row = {
  flag: string;
  aiValue: number;
  preventsMovement: boolean;
  preventsCasting: boolean;
  preventsSpeaking: boolean;
};

const NO_PREVENTS = {
  preventsMovement: false,
  preventsCasting: false,
  preventsSpeaking: false,
};

/** In-memory stand-in for the statusFlagValue delegate. */
function makeDb(seed: Row[] = []) {
  const rows = [...seed];
  const statusFlagValue = {
    findMany: jest.fn(async () => rows.map(r => ({ ...r }))),
    findUnique: jest.fn(async ({ where }: { where: { flag: string } }) => {
      const r = rows.find(x => x.flag === where.flag);
      return r ? { ...r } : null;
    }),
    create: jest.fn(async ({ data }: { data: Row }) => {
      rows.push({ ...data });
      return { ...data };
    }),
    update: jest.fn(
      async ({
        where,
        data,
      }: {
        where: { flag: string };
        data: Partial<Row>;
      }) => {
        const r = rows.find(x => x.flag === where.flag)!;
        Object.assign(r, data);
        return { ...r };
      }
    ),
    delete: jest.fn(async ({ where }: { where: { flag: string } }) => {
      const i = rows.findIndex(x => x.flag === where.flag);
      return rows.splice(i, 1)[0];
    }),
  };
  return {
    db: { statusFlagValue } as unknown as DatabaseService,
    statusFlagValue,
  };
}

describe('StatusFlagValuesService', () => {
  it('creates a flag value', async () => {
    const { db, statusFlagValue } = makeDb();
    const created = await new StatusFlagValuesService(db).create({
      flag: 'sanctuary',
      aiValue: 50,
      ...NO_PREVENTS,
    });
    expect(created).toEqual({ flag: 'sanctuary', aiValue: 50, ...NO_PREVENTS });
    expect(statusFlagValue.create).toHaveBeenCalledTimes(1);
  });

  it('rejects a duplicate flag on create', async () => {
    const { db, statusFlagValue } = makeDb([
      { flag: 'blind', aiValue: -40, ...NO_PREVENTS },
    ]);
    await expect(
      new StatusFlagValuesService(db).create({
        flag: 'blind',
        aiValue: 1,
        ...NO_PREVENTS,
      })
    ).rejects.toThrow(BadRequestException);
    expect(statusFlagValue.create).not.toHaveBeenCalled();
  });

  it('updates the AI value of an existing flag', async () => {
    const { db } = makeDb([{ flag: 'blind', aiValue: -40, ...NO_PREVENTS }]);
    await expect(
      new StatusFlagValuesService(db).update('blind', { aiValue: -10 })
    ).resolves.toEqual({ flag: 'blind', aiValue: -10, ...NO_PREVENTS });
  });

  it('sets prevents flags on create and only touches the ones supplied on update', async () => {
    const { db } = makeDb();
    const service = new StatusFlagValuesService(db);
    await service.create({
      flag: 'webbed',
      aiValue: 0,
      preventsMovement: true,
      preventsCasting: false,
      preventsSpeaking: false,
    });
    await expect(
      service.update('webbed', { aiValue: 0, preventsCasting: true })
    ).resolves.toEqual({
      flag: 'webbed',
      aiValue: 0,
      preventsMovement: true,
      preventsCasting: true,
      preventsSpeaking: false,
    });
  });

  it('throws NotFound for missing flags and deletes existing', async () => {
    const { db } = makeDb([{ flag: 'blind', aiValue: -40, ...NO_PREVENTS }]);
    const service = new StatusFlagValuesService(db);
    await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    await expect(service.update('nope', { aiValue: 1 })).rejects.toThrow(
      NotFoundException
    );
    await service.remove('blind');
    await expect(service.findOne('blind')).rejects.toThrow(NotFoundException);
  });
});
