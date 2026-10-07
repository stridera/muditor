import { Test, TestingModule } from '@nestjs/testing';
import { ObjectType as ObjectTypeEnum } from '@muditor/db';
import 'reflect-metadata';
import '../../objects/object.dto';
import { ObjectsResolver } from '../../objects/objects.resolver';
import { ObjectsService } from '../../objects/objects.service';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../../auth/guards/minimum-role.guard';
import { ZonePermissionGuard } from '../../auth/guards/zone-permission.guard';

const allowAll = { canActivate: () => true };

describe('ObjectsResolver empty path', () => {
  let resolver: ObjectsResolver;
  const mockService = {
    findByType: jest.fn().mockResolvedValue([]),
  } as unknown as ObjectsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectsResolver,
        { provide: ObjectsService, useValue: mockService },
      ],
    })
      // Guards are covered by *.resolver.guards.spec.ts; stub them here.
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

  it('returns empty array when service returns no objects', async () => {
    const result = await resolver.findByType(ObjectTypeEnum.NOTHING);
    expect(result).toEqual([]);
    expect(mockService.findByType).toHaveBeenCalledWith(
      ObjectTypeEnum.NOTHING,
      true
    );
  });
});
