import { BadRequestException } from '@nestjs/common';
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
