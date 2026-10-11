import type { DatabaseService } from '../database/database.service';
import { BoardsService } from './boards.service';

describe('BoardsService.getPosterIdentity', () => {
  const make = (rows: { name: string; level: number }[]) => {
    const findMany = jest.fn().mockResolvedValue(rows);
    const service = new BoardsService({
      characters: { findMany },
    } as unknown as DatabaseService);
    return { service, findMany };
  };

  it('only returns names of characters linked to the user, never the display name', async () => {
    const { service, findMany } = make([
      { name: 'Alice', level: 30 },
      { name: 'Bob', level: 50 },
    ]);
    const id = await service.getPosterIdentity({
      id: 'u1',
      displayName: 'Strider',
    } as { id: string });
    expect(id).toEqual({ names: ['Alice', 'Bob'], level: 50 });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' } })
    );
  });

  it('an account without characters has no identity and level 1', async () => {
    const { service } = make([]);
    expect(await service.getPosterIdentity({ id: 'u2' })).toEqual({
      names: [],
      level: 1,
    });
  });
});
