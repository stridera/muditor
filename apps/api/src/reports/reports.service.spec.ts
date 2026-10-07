import { BadRequestException } from '@nestjs/common';
import { ReportStatus, type Report } from '@muditor/db';
import { ReportsService } from './reports.service';

function row(over: Partial<Report> & { id: number }): Report {
  return {
    reportType: 'BUG',
    status: 'OPEN',
    reporterName: 'alice',
    reporterId: null,
    roomZoneId: 30,
    roomId: 1,
    message: 'door stuck',
    resolvedBy: null,
    resolvedAt: null,
    resolution: null,
    priority: null,
    duplicateOfId: null,
    tags: [],
    assignedTo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  } as Report;
}

function makeService(rows: Report[]) {
  const store = new Map(rows.map(r => [r.id, { ...r }]));
  const report = {
    findUnique: jest.fn(({ where }: { where: { id: number } }) =>
      Promise.resolve(store.get(where.id) ?? null)
    ),
    findMany: jest.fn(() =>
      Promise.resolve([...store.values()].filter(r => r.status === 'OPEN'))
    ),
    update: jest.fn(
      ({ where, data }: { where: { id: number }; data: Partial<Report> }) => {
        const next = { ...store.get(where.id)!, ...data } as Report;
        store.set(where.id, next);
        return Promise.resolve(next);
      }
    ),
    updateMany: jest.fn(() => Promise.resolve({ count: 0 })),
    count: jest.fn(() => Promise.resolve(0)),
  };
  return { service: new ReportsService({ report } as never), report, store };
}

describe('ReportsService', () => {
  it('stamps resolvedBy/resolvedAt when a report is resolved and clears them on reopen', async () => {
    const { service, store } = makeService([row({ id: 1 })]);
    await service.update(1, { status: ReportStatus.RESOLVED }, 'Strider');
    expect(store.get(1)!.resolvedBy).toBe('Strider');
    expect(store.get(1)!.resolvedAt).toBeInstanceOf(Date);
    await service.update(1, { status: ReportStatus.OPEN }, 'Strider');
    expect(store.get(1)!.resolvedBy).toBeNull();
    expect(store.get(1)!.resolvedAt).toBeNull();
  });

  it('treats priority -1 as clearing the override', async () => {
    const { service, store } = makeService([row({ id: 1, priority: 1 })]);
    await service.update(1, { priority: -1 }, 'Strider');
    expect(store.get(1)!.priority).toBeNull();
    await service.update(1, { priority: 0 }, 'Strider');
    expect(store.get(1)!.priority).toBe(0);
  });

  it('marks a duplicate against the root of the chain', async () => {
    const { service, store } = makeService([
      row({ id: 1 }),
      row({ id: 2, status: 'DUPLICATE', duplicateOfId: 1 }),
      row({ id: 3 }),
    ]);
    await service.markDuplicate(3, 2, 'Strider');
    expect(store.get(3)!.duplicateOfId).toBe(1);
    expect(store.get(3)!.status).toBe('DUPLICATE');
  });

  it('rejects self and cyclic duplicates', async () => {
    const { service } = makeService([
      row({ id: 1, status: 'DUPLICATE', duplicateOfId: 2 }),
      row({ id: 2 }),
    ]);
    await expect(service.markDuplicate(1, 1, 'x')).rejects.toBeInstanceOf(
      BadRequestException
    );
    await expect(service.markDuplicate(2, 1, 'x')).rejects.toBeInstanceOf(
      BadRequestException
    );
  });
});
