import { Direction, Sector } from '@muditor/db';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import { CreateRoomExitInput, CreateRoomInput } from './room.dto';
import { RoomsService } from './rooms.service';

interface MockDb {
  room: { create: jest.Mock; update: jest.Mock };
  roomExit: { create: jest.Mock };
}

describe('RoomsService (description canonical + deprecated roomDescription)', () => {
  let service: RoomsService;
  let db: MockDb;

  beforeEach(async () => {
    db = {
      room: {
        create: jest
          .fn()
          .mockImplementation(({ data }) => ({
            ...data,
            exits: [],
            extraDescs: [],
            mobResets: [],
            objResets: [],
          })),
        update: jest.fn(),
      },
      roomExit: {
        create: jest
          .fn()
          .mockImplementation(({ data }) => ({ ...data, id: 'exit-1' })),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsService, { provide: DatabaseService, useValue: db }],
    }).compile();

    service = module.get(RoomsService);
  });

  it('creates a room using description (canonical)', async () => {
    const input: CreateRoomInput = {
      id: 10,
      zoneId: 5,
      name: 'Hallway',
      description: 'A long narrow hallway',
      sector: Sector.CITY,
      flags: [],
    };
    await service.create(input);
    expect(db.room.create).toHaveBeenCalled();
    const call = db.room.create.mock.calls[0][0];
    expect(call.data.roomDescription).toBe('A long narrow hallway');
  });

  it('creates an exit with keywords[]', async () => {
    const exitInput: CreateRoomExitInput = {
      direction: Direction.NORTH,
      description: 'A wooden door',
      keywords: ['door', 'wooden'],
      roomZoneId: 5,
      roomId: 10,
      toZoneId: 6,
      toRoomId: 1,
      key: undefined,
    } as unknown as CreateRoomExitInput; // allow optional key
    const exit = await service.createExit(exitInput);
    expect(db.roomExit.create).toHaveBeenCalled();
    const call = db.roomExit.create.mock.calls[0][0];
    expect(call.data.keywords).toEqual(['door', 'wooden']);
    expect(exit.toZoneId).toBe(6);
    expect(exit.toRoomId).toBe(1);
  });
});
