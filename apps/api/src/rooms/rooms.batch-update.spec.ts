import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import { RoomsService } from './rooms.service';

// Focused unit test for batchUpdatePositions success + partial failure mapping

describe('RoomsService.batchUpdatePositions', () => {
  let service: RoomsService;
  // Logging removed from service rewrite; we no longer assert logging side effects.

  beforeEach(async () => {
    // Simulate prisma transaction behavior using new singular delegate name `room`
    const roomDelegate = {
      update: jest.fn().mockImplementation(({ where }) => {
        if (where.zoneId_id.id === 2) {
          throw new Error('Simulated failure');
        }
        return Promise.resolve(true);
      }),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      upsert: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    };
    type TxCtx = { room: typeof roomDelegate };
    const mockDb = {
      room: roomDelegate,
      $transaction: jest.fn(async (cb: (tx: TxCtx) => Promise<unknown>) =>
        cb({ room: roomDelegate })
      ),
    } as unknown as DatabaseService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsService, { provide: DatabaseService, useValue: mockDb }],
    }).compile();

    service = module.get(RoomsService);
  });

  it('returns updatedCount and errors for mixed results', async () => {
    const updates = [
      { zoneId: 1, roomId: 1, layoutX: 10 }, // success
      { zoneId: 1, roomId: 2, layoutY: 5 }, // failure (id === 2 triggers error)
    ];

    const result = await service.batchUpdatePositions(updates);
    expect(result.updatedCount).toBe(1);
    expect(result.errors && result.errors.length).toBe(1);
    expect(result.errors && result.errors[0]).toMatch(/Room 1\/2:/);
    // Service now accumulates errors without invoking a logger; just ensure errors captured.
  });
});
