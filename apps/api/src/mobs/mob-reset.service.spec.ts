import { Test, TestingModule } from '@nestjs/testing';
import { WearFlag } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { MobResetService } from './mob-reset.service';

// Minimal Prisma model shape mocks
interface MockMobResetEquipment {
  id: number;
  objectZoneId: number;
  objectId: number;
  wearLocation: WearFlag | null;
  maxInstances: number;
  probability: number;
  objects: { id: number; zoneId: number; name: string; type: string };
}

interface MockMobReset {
  id: number;
  zoneId: number;
  mobZoneId: number;
  mobId: number;
  roomZoneId: number;
  roomId: number;
  maxInstances: number;
  probability: number;
  comment: string | null;
  mobResetEquipment: MockMobResetEquipment[];
  mobs?: { id: number; zoneId: number; name: string } | null;
  rooms?: { id: number; zoneId: number; name: string } | null;
}

describe('MobResetService mapping', () => {
  let service: MobResetService;
  let db: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const mockDb = {
      mobResets: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      mobResetEquipment: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as jest.Mocked<DatabaseService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobResetService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get(MobResetService);
    db = module.get(DatabaseService) as jest.Mocked<DatabaseService>;
  });

  it('maps wearLocation null to undefined and includes object summary', async () => {
    const mockReset: MockMobReset = {
      id: 10,
      zoneId: 5,
      mobZoneId: 5,
      mobId: 22,
      roomZoneId: 5,
      roomId: 100,
      maxInstances: 1,
      probability: 1.0,
      comment: null,
      mobResetEquipment: [
        {
          id: 99,
          objectZoneId: 5,
          objectId: 200,
          wearLocation: null,
          maxInstances: 1,
          probability: 0.75,
          objects: { id: 200, zoneId: 5, name: 'Iron Sword', type: 'WEAPON' },
        },
      ],
      mobs: { id: 22, zoneId: 5, name: 'Goblin' },
      rooms: { id: 100, zoneId: 5, name: 'Cavern' },
    };
    (db.mobResets.findMany as jest.Mock).mockResolvedValue([mockReset]);

    const result = await service.findByMob(5, 22);
    expect(result).toHaveLength(1);
    const dto = result[0]!;
    expect(dto.equipment[0]!.wearLocation).toBeUndefined();
    expect(dto.equipment[0]!.object).toEqual({
      id: 200,
      zoneId: 5,
      name: 'Iron Sword',
      type: 'WEAPON',
    });
    expect(dto.mob?.name).toBe('Goblin');
    expect(dto.room?.name).toBe('Cavern');
  });

  it('retains wearLocation when present', async () => {
    const mockReset: MockMobReset = {
      id: 11,
      zoneId: 5,
      mobZoneId: 5,
      mobId: 23,
      roomZoneId: 5,
      roomId: 101,
      maxInstances: 1,
      probability: 1.0,
      comment: null,
      mobResetEquipment: [
        {
          id: 100,
          objectZoneId: 5,
          objectId: 201,
          wearLocation: WearFlag.WIELD,
          maxInstances: 1,
          probability: 1.0,
          objects: { id: 201, zoneId: 5, name: 'Short Bow', type: 'WEAPON' },
        },
      ],
      mobs: null,
      rooms: null,
    };
    (db.mobResets.findMany as jest.Mock).mockResolvedValue([mockReset]);

    const result = await service.findByMob(5, 23);
    expect(result[0]!.equipment[0]!.wearLocation).toBe(WearFlag.WIELD);
  });
});
