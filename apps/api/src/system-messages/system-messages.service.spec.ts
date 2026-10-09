import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service';
import { SystemMessagesService } from './system-messages.service';

type Row = {
  id: number;
  key: string;
  category: string;
  messages: string[];
};

/** In-memory stand-in for the systemMessage delegate. */
function makeDb(seed: Row[] = []) {
  const rows = [...seed];
  let nextId = rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
  const systemMessage = {
    findMany: jest.fn(async () => rows.map(r => ({ ...r }))),
    findUnique: jest.fn(
      async ({ where }: { where: { id?: number; key?: string } }) => {
        const r = rows.find(x =>
          where.id !== undefined ? x.id === where.id : x.key === where.key
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
  return { db: { systemMessage } as unknown as DatabaseService, systemMessage };
}

const base: Row = {
  id: 1,
  key: 'month_names',
  category: 'calendar',
  messages: ['the Month of Deepwinter', 'the Month of the Claw'],
};

describe('SystemMessagesService', () => {
  it('creates a message and drops blank variants', async () => {
    const { db } = makeDb();
    const created = await new SystemMessagesService(db).create({
      key: 'insult_lines',
      category: 'social',
      messages: ['You smell.', '   ', '', 'Your mother was a bugbear!'],
    });
    expect(created.messages).toEqual([
      'You smell.',
      'Your mother was a bugbear!',
    ]);
  });

  it('rejects a duplicate key on create', async () => {
    const { db, systemMessage } = makeDb([base]);
    await expect(
      new SystemMessagesService(db).create({
        key: 'month_names',
        category: 'calendar',
        messages: ['x'],
      })
    ).rejects.toThrow(BadRequestException);
    expect(systemMessage.create).not.toHaveBeenCalled();
  });

  it('rejects empty or blank-only messages', async () => {
    const { db } = makeDb([base]);
    const service = new SystemMessagesService(db);
    await expect(
      service.create({ key: 'k', category: 'c', messages: [] })
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.create({ key: 'k', category: 'c', messages: [' ', ''] })
    ).rejects.toThrow(BadRequestException);
    await expect(service.update(1, { messages: [' '] })).rejects.toThrow(
      BadRequestException
    );
  });

  it('updates category and messages but never the key', async () => {
    const { db, systemMessage } = makeDb([base]);
    const updated = await new SystemMessagesService(db).update(1, {
      category: 'time',
      messages: ['A'],
    });
    expect(updated).toMatchObject({
      key: 'month_names',
      category: 'time',
      messages: ['A'],
    });
    expect(systemMessage.update.mock.calls[0]![0].data).not.toHaveProperty(
      'key'
    );
  });

  it('throws NotFound for missing ids and deletes existing', async () => {
    const { db } = makeDb([base]);
    const service = new SystemMessagesService(db);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    await service.remove(1);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });
});
