import { Test, TestingModule } from '@nestjs/testing';
import { ObjectType as ObjectTypeEnum } from '@prisma/client';
import 'reflect-metadata';
import '../../objects/object.dto';
import { ObjectsResolver } from '../../objects/objects.resolver';
import { ObjectsService } from '../../objects/objects.service';

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
    }).compile();
    resolver = module.get(ObjectsResolver);
  });

  it('returns empty array when service returns no objects', async () => {
    const result = await resolver.findByType(ObjectTypeEnum.NOTHING);
    expect(result).toEqual([]);
    expect(mockService.findByType).toHaveBeenCalledWith(ObjectTypeEnum.NOTHING);
  });
});
