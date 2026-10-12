import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WearFlag } from '@muditor/db';
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
          wearLocation: WearFlag.MAINHAND,
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
    expect(result[0]!.equipment[0]!.wearLocation).toBe(WearFlag.MAINHAND);
  });

  it('keeps explicit 0 for probability and maxInstances on create (not 1)', async () => {
    (db.mobResets.create as jest.Mock).mockResolvedValue({
      id: 1,
      zoneId: 5,
      mobZoneId: 5,
      mobId: 0,
      roomZoneId: 5,
      roomId: 100,
      maxInstances: 0,
      probability: 0,
      comment: null,
      mobResetEquipment: [],
      mobs: null,
      rooms: null,
    } satisfies MockMobReset);

    await service.create({
      zoneId: 5,
      mobZoneId: 5,
      mobId: 0,
      roomZoneId: 5,
      roomId: 100,
      maxInstances: 0,
      probability: 0,
      equipment: [
        {
          objectZoneId: 5,
          objectId: 0,
          maxInstances: 0,
          probability: 0,
        },
      ],
    } as never);

    const { data } = (db.mobResets.create as jest.Mock).mock.calls[0]![0];
    expect(data.maxInstances).toBe(0);
    expect(data.probability).toBe(0);
    expect(data.mobResetEquipment.create[0]).toEqual(
      expect.objectContaining({ maxInstances: 0, probability: 0 })
    );
  });

  describe('equipment contents', () => {
    const container = {
      id: 10,
      resetId: 4,
      objects: { id: 50, zoneId: 5, name: 'a satchel', type: 'CONTAINER' },
    };

    function stubReset() {
      (db.mobResets as unknown as { findFirst: jest.Mock }).findFirst = jest
        .fn()
        .mockResolvedValue({
          id: 4,
          zoneId: 5,
          mobZoneId: 5,
          mobId: 22,
          roomZoneId: 5,
          roomId: 100,
          maxInstances: 1,
          probability: 1,
          comment: null,
          mobResetEquipment: [
            {
              id: 10,
              objectZoneId: 5,
              objectId: 50,
              wearLocation: null,
              maxInstances: 1,
              probability: 1,
              decorative: true,
              objects: container.objects,
              contents: [
                {
                  id: 1,
                  parentContentId: null,
                  objectZoneId: 5,
                  objectId: 60,
                  quantity: 2,
                  maxInstances: 6,
                  comment: 'rations',
                  objects: {
                    id: 60,
                    zoneId: 5,
                    name: 'bread',
                    type: 'FOOD',
                  },
                },
              ],
            },
          ],
          mobs: null,
          rooms: null,
        });
    }

    beforeEach(() => {
      (db as unknown as Record<string, unknown>)['mobResetEquipment'] = {
        ...(db.mobResetEquipment as object),
        findUnique: jest.fn().mockResolvedValue(container),
      };
      (db as unknown as Record<string, unknown>)['mobResetEquipmentContents'] =
        {
          findFirst: jest.fn(),
          create: jest.fn().mockResolvedValue({}),
          update: jest.fn().mockResolvedValue({}),
          delete: jest.fn().mockResolvedValue({}),
        };
      stubReset();
    });

    const contentsDb = () =>
      (db as unknown as Record<string, Record<string, jest.Mock>>)[
        'mobResetEquipmentContents'
      ]!;

    it('maps decorative and contents (quantity, max, comment) onto the equipment', async () => {
      const reset = await service.findOne(4);
      const eq = reset!.equipment[0]!;
      expect(eq.decorative).toBe(true);
      expect(eq.contents).toEqual([
        expect.objectContaining({
          id: 1,
          quantity: 2,
          maxInstances: 6,
          comment: 'rations',
        }),
      ]);
    });

    it('adds an item inside a carried container and returns the whole reset', async () => {
      const reset = await service.addEquipmentContent(10, {
        objectZoneId: 5,
        objectId: 61,
        quantity: 3,
      });
      expect(contentsDb().create!.mock.calls[0]![0].data).toEqual({
        equipmentId: 10,
        parentContentId: null,
        objectZoneId: 5,
        objectId: 61,
        quantity: 3,
        maxInstances: 1,
        comment: null,
      });
      expect(reset.id).toBe(4);
    });

    it('rejects contents for gear that is not a container', async () => {
      (
        db.mobResetEquipment as unknown as { findUnique: jest.Mock }
      ).findUnique.mockResolvedValue({
        ...container,
        objects: { ...container.objects, type: 'WEAPON' },
      });
      await expect(
        service.addEquipmentContent(10, { objectZoneId: 5, objectId: 61 })
      ).rejects.toThrow(/not a container/);
      expect(contentsDb().create).not.toHaveBeenCalled();
    });

    it('nests only inside a content row of the same equipment item', async () => {
      contentsDb().findFirst!.mockResolvedValueOnce(null);
      await expect(
        service.addEquipmentContent(10, {
          objectZoneId: 5,
          objectId: 61,
          parentContentId: 77,
        })
      ).rejects.toThrow(/does not belong to this container/);
      expect(contentsDb().findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 77, equipmentId: 10 } })
      );

      contentsDb().findFirst!.mockResolvedValueOnce({
        id: 1,
        parentContentId: null,
        objects: { id: 60, zoneId: 5, name: 'bread', type: 'FOOD' },
      });
      await expect(
        service.addEquipmentContent(10, {
          objectZoneId: 5,
          objectId: 61,
          parentContentId: 1,
        })
      ).rejects.toThrow(/not a container/);
    });

    it('404s for unknown equipment', async () => {
      (
        db.mobResetEquipment as unknown as { findUnique: jest.Mock }
      ).findUnique.mockResolvedValue(null);
      await expect(
        service.addEquipmentContent(99, { objectZoneId: 5, objectId: 61 })
      ).rejects.toThrow(/not found/);
    });

    it('update and delete of a content row write only what is given', async () => {
      expect(await service.updateEquipmentContent(1, { maxInstances: 8 })).toBe(
        true
      );
      expect(contentsDb().update!.mock.calls[0]![0]).toEqual({
        where: { id: 1 },
        data: { maxInstances: { set: 8 } },
      });
      expect(await service.deleteEquipmentContent(1)).toBe(true);
      const gone = Object.assign(new Error('gone'), { code: 'P2025' });
      contentsDb().delete!.mockRejectedValue(gone);
      await expect(service.deleteEquipmentContent(1)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('only touches equipment of the reset being updated', async () => {
      const updateMany = jest.fn().mockReturnValue('op');
      (db as unknown as Record<string, unknown>)['mobResetEquipment'] = {
        updateMany,
        create: jest.fn(),
      };
      (db.mobResets.update as jest.Mock).mockReturnValue('reset-op');
      (db as unknown as Record<string, unknown>)['$transaction'] = jest
        .fn()
        .mockResolvedValue([]);
      (db.mobResets as unknown as { findFirst: jest.Mock }).findFirst = jest
        .fn()
        .mockResolvedValue(null);

      await service.update(4, {
        maxInstances: 2,
        equipment: [{ id: 99 as never, probability: 0.5 }],
      });
      expect(updateMany).toHaveBeenCalledWith({
        where: { id: 99, resetId: 4 },
        data: { probability: { set: 0.5 } },
      });
    });

    it('needs both room keys to move a reset', async () => {
      await expect(service.update(4, { roomId: 3 })).rejects.toThrow(
        /both roomZoneId and roomId/
      );
    });
  });

  it('turns a foreign-key failure on create into a readable 400', async () => {
    (db.mobResets.create as jest.Mock).mockRejectedValue(
      Object.assign(new Error('fk'), { code: 'P2003' })
    );
    await expect(
      service.create({
        zoneId: 5,
        mobZoneId: 5,
        mobId: 99999,
        roomZoneId: 5,
        roomId: 1,
      } as never)
    ).rejects.toThrow(/does not exist/);
  });

  it('lists resets by zone and room, hiding god-zone rows from the public', async () => {
    (db.mobResets.findMany as jest.Mock).mockResolvedValue([]);
    await service.findByZone(5, true);
    await service.findByRoom(5, 100, false);
    const zoneCall = (db.mobResets.findMany as jest.Mock).mock.calls[0]![0];
    expect(zoneCall.where).toMatchObject({
      zoneId: 5,
      rooms: { zones: { isGodZone: false } },
    });
    expect(
      (db.mobResets.findMany as jest.Mock).mock.calls[1]![0].where
    ).toEqual({ roomZoneId: 5, roomId: 100 });
  });
});
