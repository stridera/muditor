import { Direction, ExitFlag, ExitState, Sector } from '@muditor/db';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import {
  CreateRoomInput,
  RoomDto,
  UpdateRoomInput,
  UpdateRoomPositionInput,
} from './room.dto';
import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
  let service: RoomsService;
  let databaseService: jest.Mocked<DatabaseService>;

  const mockRoom = {
    id: 1,
    name: 'Test Room',
    roomDescription: 'This is a test room for unit testing',
    zoneId: 511,
    sector: Sector.CITY,
    layoutX: 0,
    layoutY: 0,
    layoutZ: 0,
    exits: [] as RoomDto['exits'],
    extraDescs: [] as RoomDto['extraDescs'],
    baseLightLevel: 0,
    capacity: 10,
    isPeaceful: false,
    allowsMagic: true,
    allowsRecall: true,
    allowsSummon: true,
    allowsTeleport: true,
    isDeathTrap: false,
  };

  beforeEach(async () => {
    const mockDatabaseService = {
      room: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      roomExits: {
        create: jest.fn(),
        delete: jest.fn(),
      },
      roomExit: {
        create: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as jest.Mocked<DatabaseService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    databaseService = module.get(DatabaseService);
  });

  describe('findAll relation loading', () => {
    const plan = (over = {}) => ({
      lightweight: false,
      exits: false,
      extraDescs: false,
      environmentalEffects: false,
      mobs: false,
      objects: false,
      ...over,
    });

    it('includes only the planned relations', async () => {
      const findMany = databaseService.room.findMany as jest.Mock;
      findMany.mockResolvedValue([mockRoom]);
      await service.findAll({ plan: plan({ mobs: true }) });
      const include = findMany.mock.calls[0][0].include;
      expect(Object.keys(include)).toEqual(['mobResets']);
      findMany.mockClear();
      await service.findAll({ plan: plan() });
      expect(findMany.mock.calls[0][0].include).toEqual({});
    });

    it('loads every relation when no plan is given', async () => {
      const findMany = databaseService.room.findMany as jest.Mock;
      findMany.mockResolvedValue([mockRoom]);
      await service.findAll({});
      expect(Object.keys(findMany.mock.calls[0][0].include).sort()).toEqual([
        'environmentalEffects',
        'exits',
        'mobResets',
        'objectResets',
        'roomExtraDescriptions',
      ]);
    });

    it('uses the raw lightweight loader when the plan says so', async () => {
      const queryRaw = jest.fn().mockResolvedValue([]);
      (databaseService as unknown as { $queryRawUnsafe: jest.Mock })[
        '$queryRawUnsafe'
      ] = queryRaw;
      await service.findAll({ plan: plan({ lightweight: true }) });
      expect(queryRaw).toHaveBeenCalled();
      expect(databaseService.room.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of rooms', async () => {
      (databaseService.room.findMany as jest.Mock).mockResolvedValue([
        mockRoom,
      ]);

      const result = await service.findAll({});

      expect(result).toEqual([
        expect.objectContaining({ id: 1, name: 'Test Room', zoneId: 511 }),
      ]);
      expect(databaseService.room.findMany).toHaveBeenCalled();
    });

    it('should apply skip and take parameters', async () => {
      (databaseService.room.findMany as jest.Mock).mockResolvedValue([
        mockRoom,
      ]);

      await service.findAll({ skip: 10, take: 5 });

      expect(databaseService.room.findMany).toHaveBeenCalled();
    });

    it('should filter by zoneId when provided', async () => {
      (databaseService.room.findMany as jest.Mock).mockResolvedValue([
        mockRoom,
      ]);

      await service.findAll({ zoneId: 511 });

      expect(databaseService.room.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a room by id', async () => {
      (databaseService.room.findUnique as jest.Mock).mockResolvedValue(
        mockRoom
      );

      const result = await service.findOne(511, 1);

      expect(result).toEqual(
        expect.objectContaining({ id: 1, name: 'Test Room', zoneId: 511 })
      );
      expect(databaseService.room.findUnique).toHaveBeenCalledWith({
        where: { zoneId_id: { zoneId: 511, id: 1 } },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when room not found', async () => {
      (databaseService.room.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(511, 999)).rejects.toThrow(
        'Room 511/999 not found'
      );
    });
  });

  describe('create', () => {
    const createRoomInput: CreateRoomInput = {
      id: 1,
      name: 'New Room',
      description: 'A new room for testing',
      zoneId: 511,
    };

    it('should create a new room', async () => {
      const newRoom = { ...mockRoom, ...createRoomInput };
      (databaseService.room.create as jest.Mock).mockResolvedValue(newRoom);

      const result = await service.create(createRoomInput);

      expect(result).toEqual(
        expect.objectContaining({ id: 1, name: 'New Room', zoneId: 511 })
      );
      expect(databaseService.room.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 1,
          zoneId: 511,
          name: 'New Room',
          roomDescription: 'A new room for testing',
          sector: 'STRUCTURE',
        }),
        include: expect.any(Object),
      });
    });

    it('should throw ConflictException when the room id already exists', async () => {
      (databaseService.room.create as jest.Mock).mockRejectedValue(
        Object.assign(new Error('Unique constraint failed'), { code: 'P2002' })
      );

      await expect(service.create(createRoomInput)).rejects.toThrow(
        new ConflictException('Room 1 already exists in zone 511')
      );
    });

    it('should rethrow other database errors unchanged', async () => {
      const boom = new Error('connection lost');
      (databaseService.room.create as jest.Mock).mockRejectedValue(boom);

      await expect(service.create(createRoomInput)).rejects.toBe(boom);
    });
  });

  describe('update', () => {
    const updateRoomInput: UpdateRoomInput = {
      description: 'Updated room description',
    };

    it('should update a room', async () => {
      const updatedRoom = { ...mockRoom, ...updateRoomInput };
      (databaseService.room.update as jest.Mock).mockResolvedValue(updatedRoom);

      const result = await service.update(511, 1, updateRoomInput);

      expect(result).toEqual(
        expect.objectContaining({ id: 1, name: 'Test Room' })
      );
      expect(databaseService.room.update).toHaveBeenCalledWith({
        where: { zoneId_id: { zoneId: 511, id: 1 } },
        data: expect.any(Object),
        include: expect.any(Object),
      });
    });
  });

  describe('delete', () => {
    it('should delete a room', async () => {
      (databaseService.room.delete as jest.Mock).mockResolvedValue(mockRoom);

      const result = await service.delete(511, 1);

      expect(result).toEqual(
        expect.objectContaining({ id: 1, name: 'Test Room', zoneId: 511 })
      );
      expect(databaseService.room.delete).toHaveBeenCalledWith({
        where: { zoneId_id: { zoneId: 511, id: 1 } },
        include: expect.any(Object),
      });
    });
  });

  describe('count', () => {
    it('should return total count of rooms', async () => {
      (databaseService.room.count as jest.Mock).mockResolvedValue(50);

      const result = await service.count();

      expect(result).toBe(50);
      expect(databaseService.room.count).toHaveBeenCalled();
    });

    it('should return count filtered by zoneId', async () => {
      (databaseService.room.count as jest.Mock).mockResolvedValue(25);

      const result = await service.count(511);

      expect(result).toBe(25);
      expect(databaseService.room.count).toHaveBeenCalledWith({
        where: { zoneId: 511 },
      });
    });
  });

  describe('updatePosition', () => {
    const positionInput: UpdateRoomPositionInput = {
      layoutX: 100,
      layoutY: 200,
      layoutZ: 5,
    };

    it('should update room position', async () => {
      const updatedRoom = { ...mockRoom, ...positionInput };
      (databaseService.room.update as jest.Mock).mockResolvedValue(updatedRoom);

      const result = await service.updatePosition(511, 1, positionInput);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          layoutX: 100,
          layoutY: 200,
          layoutZ: 5,
        })
      );
      expect(databaseService.room.update).toHaveBeenCalledWith({
        where: { zoneId_id: { zoneId: 511, id: 1 } },
        data: expect.any(Object),
        include: expect.any(Object),
      });
    });
  });

  describe('exits', () => {
    const exitDb = () =>
      (databaseService as unknown as { roomExit: Record<string, jest.Mock> })
        .roomExit;

    it('createExit persists flags instead of forcing an empty list', async () => {
      exitDb().create!.mockResolvedValue({ id: 1 });
      await service.createExit({
        roomZoneId: 30,
        roomId: 1,
        direction: Direction.NORTH,
        flags: [ExitFlag.PICKPROOF],
        defaultState: ExitState.LOCKED,
        hitPoints: 40,
      });
      expect(exitDb().create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          flags: [ExitFlag.PICKPROOF],
          defaultState: ExitState.LOCKED,
          hitPoints: 40,
        }),
      });
    });

    it('updateExit updates in place by composite key, never deleting', async () => {
      exitDb().update!.mockResolvedValue({ id: 1 });
      await service.updateExit({
        roomZoneId: 30,
        roomId: 1,
        direction: Direction.NORTH,
        flags: [ExitFlag.PICKPROOF],
        defaultState: ExitState.LOCKED,
        hitPoints: 40,
      });
      expect(exitDb().update).toHaveBeenCalledWith({
        where: {
          roomZoneId_roomId_direction: {
            roomZoneId: 30,
            roomId: 1,
            direction: Direction.NORTH,
          },
        },
        data: {
          flags: [ExitFlag.PICKPROOF],
          defaultState: ExitState.LOCKED,
          hitPoints: 40,
        },
      });
    });

    it('updateExit leaves omitted fields alone and clears explicit nulls', async () => {
      exitDb().update!.mockResolvedValue({ id: 1 });
      await service.updateExit({
        roomZoneId: 30,
        roomId: 1,
        direction: Direction.EAST,
        keyZoneId: null,
        keyId: null,
        description: null,
        keywords: null,
        flags: null,
        defaultState: null,
        hitPoints: null,
      });
      const data = exitDb().update!.mock.calls[0]![0].data;
      expect(data).toEqual({
        keyZoneId: null,
        keyId: null,
        description: null,
        keywords: [],
        flags: [],
        defaultState: 'OPEN',
        hitPoints: null,
      });
      expect(data).not.toHaveProperty('toZoneId');
      expect(data).not.toHaveProperty('toRoomId');
    });

    it('updateExit reports a missing exit as NotFound', async () => {
      exitDb().update!.mockRejectedValue({ code: 'P2025' });
      await expect(
        service.updateExit({
          roomZoneId: 30,
          roomId: 1,
          direction: Direction.UP,
        })
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
