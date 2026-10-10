import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import 'reflect-metadata';
import { ObjectsResolver } from '../objects.resolver';
import { ObjectsService } from '../objects.service';
import { DatabaseService } from '../../database/database.service';
import { CreateObjectInput } from '../object.dto';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../../auth/guards/minimum-role.guard';
import { ZonePermissionGuard } from '../../auth/guards/zone-permission.guard';

const allowAll = { canActivate: () => true };

describe('ObjectsService nextFreeId / assertIdFree', () => {
  let service: ObjectsService;
  const objects = { aggregate: jest.fn(), findUnique: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectsService,
        { provide: DatabaseService, useValue: { objects } },
      ],
    }).compile();
    service = module.get(ObjectsService);
  });

  it('suggests highest id + 1 for the zone', async () => {
    objects.aggregate.mockResolvedValue({ _max: { id: 41 } });
    await expect(service.nextFreeId(30)).resolves.toBe(42);
    expect(objects.aggregate).toHaveBeenCalledWith({
      where: { zoneId: 30 },
      _max: { id: true },
    });
  });

  it('suggests 0 for an empty zone', async () => {
    objects.aggregate.mockResolvedValue({ _max: { id: null } });
    await expect(service.nextFreeId(30)).resolves.toBe(0);
  });

  it('assertIdFree rejects an id that exists in the zone', async () => {
    objects.findUnique.mockResolvedValue({ id: 5 });
    await expect(service.assertIdFree(30, 5)).rejects.toBeInstanceOf(
      ConflictException
    );
    expect(objects.findUnique).toHaveBeenCalledWith({
      where: { zoneId_id: { zoneId: 30, id: 5 } },
      select: { id: true },
    });
  });

  it('assertIdFree accepts an unused id', async () => {
    objects.findUnique.mockResolvedValue(null);
    await expect(service.assertIdFree(30, 6)).resolves.toBeUndefined();
  });
});

describe('ObjectsResolver createObject id handling', () => {
  let resolver: ObjectsResolver;
  const mockService = {
    assertIdFree: jest.fn(),
    create: jest.fn(),
    nextFreeId: jest.fn(),
  };

  const input = {
    id: 7,
    zoneId: 30,
    keywords: ['sword'],
    name: 'a sword',
    roomDescription: 'A sword lies here.',
  } as unknown as CreateObjectInput;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectsResolver,
        { provide: ObjectsService, useValue: mockService },
      ],
    })
      .overrideGuard(OptionalJwtAuthGuard)
      .useValue(allowAll)
      .overrideGuard(GraphQLJwtAuthGuard)
      .useValue(allowAll)
      .overrideGuard(MinimumRoleGuard)
      .useValue(allowAll)
      .overrideGuard(ZonePermissionGuard)
      .useValue(allowAll)
      .compile();
    resolver = module.get(ObjectsResolver);
  });

  it('nextObjectId delegates to the service', async () => {
    mockService.nextFreeId.mockResolvedValue(12);
    await expect(resolver.nextObjectId(30)).resolves.toBe(12);
    expect(mockService.nextFreeId).toHaveBeenCalledWith(30);
  });

  it('does not create when the id is taken', async () => {
    mockService.assertIdFree.mockRejectedValue(new ConflictException('dup'));
    await expect(resolver.createObject(input)).rejects.toBeInstanceOf(
      ConflictException
    );
    expect(mockService.assertIdFree).toHaveBeenCalledWith(30, 7);
    expect(mockService.create).not.toHaveBeenCalled();
  });
});
