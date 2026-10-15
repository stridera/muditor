import { ScriptType } from '@muditor/db';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TriggersService } from './triggers.service';

describe('TriggersService.detachFromEntity', () => {
  const prisma = {
    mobTriggers: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
    objectTriggers: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
    triggers: { update: jest.fn().mockResolvedValue({ id: 5, zoneId: 30 }) },
  };
  let service: TriggersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TriggersService(prisma as never);
  });

  it('scopes the mob link delete to the given mob key', async () => {
    await service.detachFromEntity(30, 5, { mobZoneId: 31, mobId: 7 }, 'u1');
    expect(prisma.mobTriggers.deleteMany).toHaveBeenCalledWith({
      where: { triggerZoneId: 30, triggerId: 5, mobZoneId: 31, mobId: 7 },
    });
    expect(prisma.objectTriggers.deleteMany).not.toHaveBeenCalled();
  });

  it('scopes the object link delete to the given object key', async () => {
    await service.detachFromEntity(
      30,
      5,
      { objectZoneId: 32, objectId: 9 },
      'u1'
    );
    expect(prisma.objectTriggers.deleteMany).toHaveBeenCalledWith({
      where: { triggerZoneId: 30, triggerId: 5, objectZoneId: 32, objectId: 9 },
    });
    expect(prisma.mobTriggers.deleteMany).not.toHaveBeenCalled();
  });

  it('rejects when no entity (or both) is given instead of deleting everything', async () => {
    await expect(service.detachFromEntity(30, 5, {})).rejects.toBeInstanceOf(
      BadRequestException
    );
    await expect(
      service.detachFromEntity(30, 5, {
        mobZoneId: 1,
        mobId: 1,
        objectZoneId: 1,
        objectId: 1,
      })
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.mobTriggers.deleteMany).not.toHaveBeenCalled();
    expect(prisma.objectTriggers.deleteMany).not.toHaveBeenCalled();
  });
});

describe('TriggersService.attachToEntity', () => {
  const prisma = {
    mobTriggers: { upsert: jest.fn().mockResolvedValue({}) },
    objectTriggers: { upsert: jest.fn().mockResolvedValue({}) },
    triggers: { update: jest.fn().mockResolvedValue({ id: 5, zoneId: 30 }) },
  };
  let service: TriggersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TriggersService(prisma as never);
  });

  it('writes the link row for mob id 0', async () => {
    await service.attachToEntity({
      triggerZoneId: 30,
      triggerId: 5,
      attachType: 'MOB',
      mobZoneId: 30,
      mobId: 0,
    } as never);
    expect(prisma.mobTriggers.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: {
          mobZoneId: 30,
          mobId: 0,
          triggerZoneId: 30,
          triggerId: 5,
        },
      })
    );
  });

  it('writes the link row for object id 0', async () => {
    await service.attachToEntity({
      triggerZoneId: 30,
      triggerId: 5,
      attachType: 'OBJECT',
      objectZoneId: 30,
      objectId: 0,
    } as never);
    expect(prisma.objectTriggers.upsert).toHaveBeenCalledTimes(1);
  });

  it('errors instead of reporting success when the entity ref is missing', async () => {
    await expect(
      service.attachToEntity({
        triggerZoneId: 30,
        triggerId: 5,
        attachType: 'MOB',
      } as never)
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.triggers.update).not.toHaveBeenCalled();
  });
});

describe('TriggersService room attachments', () => {
  const setup = () => {
    const prisma = {
      roomTriggers: {
        upsert: jest.fn().mockResolvedValue({}),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      triggers: { update: jest.fn().mockResolvedValue({ id: 5 }) },
    };
    const service = new TriggersService(
      prisma as unknown as ConstructorParameters<typeof TriggersService>[0]
    );
    return { service, prisma };
  };

  it('attaches a WORLD trigger to one room', async () => {
    const { service, prisma } = setup();
    await service.attachToEntity({
      triggerZoneId: 30,
      triggerId: 5,
      attachType: ScriptType.WORLD,
      roomZoneId: 31,
      roomId: 0,
    });
    expect(prisma.roomTriggers.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: {
          roomZoneId: 31,
          roomId: 0,
          triggerZoneId: 30,
          triggerId: 5,
        },
      })
    );
  });

  it('requires a room key for WORLD triggers', async () => {
    const { service } = setup();
    await expect(
      service.attachToEntity({
        triggerZoneId: 30,
        triggerId: 5,
        attachType: ScriptType.WORLD,
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('detaches from exactly one room', async () => {
    const { service, prisma } = setup();
    await service.detachFromEntity(30, 5, { roomZoneId: 31, roomId: 2 });
    expect(prisma.roomTriggers.deleteMany).toHaveBeenCalledWith({
      where: { triggerZoneId: 30, triggerId: 5, roomZoneId: 31, roomId: 2 },
    });
  });
});

describe('TriggersService attach to a missing entity', () => {
  const fkError = Object.assign(new Error('fk'), { code: 'P2003' });

  it('maps a foreign-key failure on a room link to NotFoundException', async () => {
    const prisma = {
      roomTriggers: { upsert: jest.fn().mockRejectedValue(fkError) },
      triggers: { update: jest.fn() },
    };
    const service = new TriggersService(prisma as never);
    await expect(
      service.attachToEntity({
        triggerZoneId: 30,
        triggerId: 5,
        attachType: ScriptType.WORLD,
        roomZoneId: 31,
        roomId: 9999,
      })
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.triggers.update).not.toHaveBeenCalled();
  });

  it('rethrows unrelated errors untouched', async () => {
    const boom = new Error('db down');
    const prisma = {
      roomTriggers: { upsert: jest.fn().mockRejectedValue(boom) },
      triggers: { update: jest.fn() },
    };
    const service = new TriggersService(prisma as never);
    await expect(
      service.attachToEntity({
        triggerZoneId: 30,
        triggerId: 5,
        attachType: ScriptType.WORLD,
        roomZoneId: 31,
        roomId: 1,
      })
    ).rejects.toBe(boom);
  });
});

describe('TriggersService.findAttachments', () => {
  const setup = () => {
    const prisma = {
      mobTriggers: {
        findMany: jest.fn().mockResolvedValue([
          {
            mob: {
              zoneId: 30,
              id: 7,
              name: '&1a guard&0',
              plainName: 'a guard',
            },
          },
        ]),
      },
      objectTriggers: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { object: { zoneId: 12, id: 3, name: 'a lamp', plainName: '' } },
          ]),
      },
      roomTriggers: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ room: { zoneId: 30, id: 0, name: 'A hall' } }]),
      },
    };
    const service = new TriggersService(
      prisma as unknown as ConstructorParameters<typeof TriggersService>[0]
    );
    return { service, prisma };
  };

  it('lists mobs, objects and rooms using plain names where available', async () => {
    const { service } = setup();
    await expect(service.findAttachments(30, 5)).resolves.toEqual([
      { kind: 'MOB', zoneId: 30, id: 7, name: 'a guard' },
      { kind: 'OBJECT', zoneId: 12, id: 3, name: 'a lamp' },
      { kind: 'ROOM', zoneId: 30, id: 0, name: 'A hall' },
    ]);
  });

  it('hides entities in god zones from non-staff readers only', async () => {
    const { service, prisma } = setup();
    await service.findAttachments(30, 5, true);
    expect(prisma.mobTriggers.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          triggerZoneId: 30,
          triggerId: 5,
          mob: { zones: { isGodZone: false } },
        },
      })
    );
    await service.findAttachments(30, 5, false);
    expect(prisma.roomTriggers.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { triggerZoneId: 30, triggerId: 5, room: {} },
      })
    );
  });
});
