import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import { MobsService } from './mobs.service';

describe('MobsService.deleteMany', () => {
  let service: MobsService;
  const mobs = { deleteMany: jest.fn() };
  const characterPets = { groupBy: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    jest.clearAllMocks();
    characterPets.groupBy.mockResolvedValue([]);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobsService,
        { provide: DatabaseService, useValue: { mobs, characterPets } },
      ],
    }).compile();
    service = module.get(MobsService);
  });

  it('deletes by composite (zoneId, id), never by id alone', async () => {
    mobs.deleteMany.mockResolvedValue({ count: 2 });

    const count = await service.deleteMany([
      { zoneId: 30, id: 1 },
      { zoneId: 31, id: 1 },
    ]);

    expect(count).toBe(2);
    expect(mobs.deleteMany).toHaveBeenCalledWith({
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
    expect(mobs.deleteMany).not.toHaveBeenCalled();
  });
});
