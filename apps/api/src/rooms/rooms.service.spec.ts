import { Sector } from '@muditor/db';
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

  const mockRoom: Partial<RoomDto> = {
    id: 1,
    name: 'Test Room',
    roomDescription: 'This is a test room for unit testing',
    zoneId: 511,
    sector: Sector.CITY,
    flags: [],
    layoutX: 0,
    layoutY: 0,
    layoutZ: 0,
    exits: [],
    extraDescs: [],
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

  describe('findAll', () => {
    it('should return array of rooms', async () => {
      (databaseService.room.findMany as jest.Mock).mockResolvedValue([
        mockRoom,
      ]);

      const result = await service.findAll({});

      expect(result).toEqual([mockRoom]);
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

      expect(result).toEqual(mockRoom);
      expect(databaseService.room.findUnique).toHaveBeenCalledWith({
        where: { zoneId_id: { zoneId: 511, id: 1 } },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when room not found', async () => {
      (databaseService.room.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(511, 999)).rejects.toThrow(
        'Room with zoneId 511 and id 999 not found'
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

      expect(result).toEqual(newRoom);
      expect(databaseService.room.create).toHaveBeenCalledWith({
        data: {
          id: 1,
          zoneId: 511,
          name: 'New Room',
          roomDescription: 'A new room for testing',
          sector: 'STRUCTURE',
          flags: [],
          layoutX: null,
          layoutY: null,
          layoutZ: null,
        },
        include: expect.any(Object),
      });
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

      expect(result).toEqual(updatedRoom);
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

      expect(result).toEqual(mockRoom);
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

      expect(result).toEqual(updatedRoom);
      expect(databaseService.room.update).toHaveBeenCalledWith({
        where: { zoneId_id: { zoneId: 511, id: 1 } },
        data: expect.any(Object),
        include: expect.any(Object),
      });
    });
  });
});
