import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import 'reflect-metadata';
import { MobsResolver } from '../mobs.resolver';
import { MobsService } from '../mobs.service';
import { DatabaseService } from '../../database/database.service';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../../auth/guards/minimum-role.guard';
import { ZonePermissionGuard } from '../../auth/guards/zone-permission.guard';

const allowAll = { canActivate: () => true };

describe('MobsService nextFreeId / assertIdFree', () => {
  let service: MobsService;
  const mobs = { aggregate: jest.fn(), findUnique: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobsService,
        { provide: DatabaseService, useValue: { mobs } },
      ],
    }).compile();
    service = module.get(MobsService);
  });

  it('suggests highest id + 1 for the zone', async () => {
    mobs.aggregate.mockResolvedValue({ _max: { id: 41 } });
    await expect(service.nextFreeId(30)).resolves.toBe(42);
    expect(mobs.aggregate).toHaveBeenCalledWith({
      where: { zoneId: 30 },
      _max: { id: true },
    });
  });

  it('suggests 0 for an empty zone', async () => {
    mobs.aggregate.mockResolvedValue({ _max: { id: null } });
    await expect(service.nextFreeId(30)).resolves.toBe(0);
  });

  it('assertIdFree rejects an id that exists in the zone', async () => {
    mobs.findUnique.mockResolvedValue({ id: 5 });
    await expect(service.assertIdFree(30, 5)).rejects.toBeInstanceOf(
      ConflictException
    );
    expect(mobs.findUnique).toHaveBeenCalledWith({
      where: { zoneId_id: { zoneId: 30, id: 5 } },
      select: { id: true },
    });
  });

  it('assertIdFree accepts an unused id', async () => {
    mobs.findUnique.mockResolvedValue(null);
    await expect(service.assertIdFree(30, 6)).resolves.toBeUndefined();
  });
});

describe('MobsResolver nextMobId', () => {
  let resolver: MobsResolver;
  const mockService = { nextFreeId: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobsResolver,
        { provide: MobsService, useValue: mockService },
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
    resolver = module.get(MobsResolver);
  });

  it('delegates to the service', async () => {
    mockService.nextFreeId.mockResolvedValue(12);
    await expect(resolver.nextMobId(30)).resolves.toBe(12);
    expect(mockService.nextFreeId).toHaveBeenCalledWith(30);
  });
});
