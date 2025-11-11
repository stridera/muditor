import { Test, TestingModule } from '@nestjs/testing';
import { ObjectType } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { ObjectsService } from './objects.service';

describe('ObjectsService findByType', () => {
  let service: ObjectsService;
  let db: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const mockDb = {
      objects: {
        findMany: jest.fn(),
      },
    } as unknown as jest.Mocked<DatabaseService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectsService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get(ObjectsService);
    db = module.get(DatabaseService) as jest.Mocked<DatabaseService>;
  });

  it('passes enum filter to prisma and returns result', async () => {
    const mockObjects = [
      { id: 1, zoneId: 5, name: 'Steel Sword', type: ObjectType.WEAPON },
      { id: 2, zoneId: 5, name: 'Potion of Healing', type: ObjectType.POTION },
    ];

    (db.objects.findMany as jest.Mock).mockImplementation(({ where }) => {
      return Promise.resolve(mockObjects.filter(o => o.type === where?.type));
    });

    const result = await service.findByType(ObjectType.WEAPON);
    expect(result).toEqual([
      { id: 1, zoneId: 5, name: 'Steel Sword', type: ObjectType.WEAPON },
    ]);
    expect(db.objects.findMany).toHaveBeenCalledWith({
      where: { type: ObjectType.WEAPON },
      include: { zones: { select: { id: true, name: true } } },
    });
  });
});
