import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '../common/logging/logging.service';
import { DatabaseService } from '../database/database.service';
import { RoomsService } from './rooms.service';

// Focused unit test for batchUpdatePositions success + partial failure mapping

describe('RoomsService.batchUpdatePositions', () => {
  let service: RoomsService;
  let logging: LoggingService & { logError: jest.Mock };

  beforeEach(async () => {
    const loggingMock = { logError: jest.fn() } as LoggingService & {
      logError: jest.Mock;
    };

    // Simulate prisma transaction behavior
    const roomsDelegate = {
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

    type TxCtx = { rooms: typeof roomsDelegate };
    const mockDb = {
      rooms: roomsDelegate,
      $transaction: jest.fn(async (cb: (tx: TxCtx) => Promise<unknown>) =>
        cb({ rooms: roomsDelegate })
      ),
    } as unknown as DatabaseService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: LoggingService, useValue: loggingMock },
      ],
    }).compile();

    service = module.get(RoomsService);
    logging = module.get(LoggingService) as LoggingService & {
      logError: jest.Mock;
    };
  });

  it('returns updatedCount and errors for mixed results', async () => {
    const updates = [
      { zoneId: 1, roomId: 1, layoutX: 10 }, // success
      { zoneId: 1, roomId: 2, layoutY: 5 }, // failure (id === 2 triggers error)
    ];

    const result = await service.batchUpdatePositions(updates);
    expect(result.updatedCount).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/Room 1\/2:/);
    expect(logging.logError.mock.calls.length).toBe(1);
  });
});
