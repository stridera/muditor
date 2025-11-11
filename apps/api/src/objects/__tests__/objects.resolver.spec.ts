import { Test, TestingModule } from '@nestjs/testing';
import { ObjectType as ObjectTypeEnum } from '@prisma/client';
import 'reflect-metadata';
import { ObjectsResolver } from '../../objects/objects.resolver';
import { ObjectsService } from '../../objects/objects.service';

// Minimal DTO import ensures enum registration side effects run
import '../../objects/object.dto';

describe('ObjectsResolver', () => {
  let resolver: ObjectsResolver;
  const mockService = {
    findByType: jest.fn().mockResolvedValue([
      {
        id: 1,
        type: ObjectTypeEnum.NOTHING,
        keywords: ['test'],
        name: 'Test Object',
        roomDescription: 'room desc',
        examineDescription: 'exam',
        actionDescription: null,
        flags: [],
        effectFlags: [],
        wearFlags: [],
        weight: 0,
        cost: 0,
        timer: 0,
        decomposeTimer: 0,
        level: 1,
        concealment: 0,
        values: {},
        zoneId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
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

  it('findByType returns mapped objects and calls service with enum', async () => {
    const result = await resolver.findByType(ObjectTypeEnum.NOTHING);
    expect(mockService.findByType).toHaveBeenCalledWith(ObjectTypeEnum.NOTHING);
    expect(result[0]!.type).toBe(ObjectTypeEnum.NOTHING);
  });
});
