import { Test, TestingModule } from '@nestjs/testing';
import { ObjectType } from '@muditor/db';
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

describe('ObjectsService.deleteMany', () => {
  let service: ObjectsService;
  const objects = { deleteMany: jest.fn() };
  const characterItems = { groupBy: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    jest.clearAllMocks();
    characterItems.groupBy.mockResolvedValue([]);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectsService,
        { provide: DatabaseService, useValue: { objects, characterItems } },
      ],
    }).compile();
    service = module.get(ObjectsService);
  });

  it('deletes by composite (zoneId, id), never by id alone', async () => {
    objects.deleteMany.mockResolvedValue({ count: 2 });

    const count = await service.deleteMany([
      { zoneId: 30, id: 1 },
      { zoneId: 31, id: 1 },
    ]);

    expect(count).toBe(2);
    expect(objects.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { zoneId: 30, id: 1 },
          { zoneId: 31, id: 1 },
        ],
      },
    });
  });

  it('does not touch the database for an empty list', async () => {
    expect(await service.deleteMany([])).toBe(0);
    expect(objects.deleteMany).not.toHaveBeenCalled();
  });
});

describe('ObjectsService.update spell mirror keys', () => {
  let service: ObjectsService;
  const objects = { update: jest.fn(), findUnique: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    objects.update.mockResolvedValue({});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectsService,
        { provide: DatabaseService, useValue: { objects } },
      ],
    }).compile();
    service = module.get(ObjectsService);
  });

  const sent = () =>
    (objects.update.mock.calls[0] as [{ data: { values?: unknown } }])[0].data
      .values;

  it('keeps the stored mirror of a spell item over a stale form copy', async () => {
    objects.findUnique.mockResolvedValue({
      type: 'WAND',
      values: { Spell: 'AB_2', Level: 30, Max_Charges: 4, Other: 1 },
    });
    await service.update(30, 5, {
      type: 'WAND',
      values: { Spell: 'AB_1', Level: 5, Max_Charges: 9, Other: 2 },
    });
    expect(sent()).toEqual({
      Spell: 'AB_2',
      Level: 30,
      Max_Charges: 4,
      Other: 2,
    });
  });

  it('does not resurrect mirror keys the spell editor cleared', async () => {
    objects.findUnique.mockResolvedValue({ type: 'POTION', values: {} });
    await service.update(30, 5, {
      values: { Spells: ['AB_1'], Level: 5, Other: 2 },
    });
    expect(sent()).toEqual({ Other: 2 });
  });

  it('leaves non-spell objects and value-less updates alone', async () => {
    objects.findUnique.mockResolvedValue({ type: 'ARMOR', values: {} });
    await service.update(30, 5, { values: { Level: 5 } });
    expect(sent()).toEqual({ Level: 5 });
    objects.update.mockClear();
    await service.update(30, 5, { name: 'x' });
    expect(objects.findUnique).toHaveBeenCalledTimes(1);
  });
});
