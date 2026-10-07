import type { DatabaseService } from '../../database/database.service';
import { zoneLookups } from './zone-lookups';

function dbWith(partial: Record<string, unknown>): DatabaseService {
  return partial as unknown as DatabaseService;
}

describe('zoneLookups dialogue trees', () => {
  const linksTo = (zones: number[]) =>
    jest.fn().mockResolvedValue(zones.map(questZoneId => ({ questZoneId })));

  it('resolves a tree used inside a single zone', async () => {
    const db = dbWith({ questDialogue: { findMany: linksTo([30, 30]) } });
    await expect(zoneLookups.dialogueTree('id').resolve(db, 7)).resolves.toBe(
      30
    );
  });

  it('denies (null) a tree no quest dialogue uses', async () => {
    const db = dbWith({ questDialogue: { findMany: linksTo([]) } });
    await expect(
      zoneLookups.dialogueTree('id').resolve(db, 7)
    ).resolves.toBeNull();
  });

  it('denies (null) a tree shared across zones', async () => {
    const db = dbWith({ questDialogue: { findMany: linksTo([30, 31]) } });
    await expect(
      zoneLookups.dialogueTree('id').resolve(db, 7)
    ).resolves.toBeNull();
  });

  it('resolves a node and a response through their tree', async () => {
    const db = dbWith({
      questDialogue: { findMany: linksTo([42]) },
      dialogueNodes: {
        findUnique: jest.fn().mockResolvedValue({ dialogueTreeId: 7 }),
      },
      dialogueResponses: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ node: { dialogueTreeId: 7 } }),
      },
    });
    await expect(zoneLookups.dialogueNode('id').resolve(db, 1)).resolves.toBe(
      42
    );
    await expect(
      zoneLookups.dialogueResponse('id').resolve(db, 1)
    ).resolves.toBe(42);
  });

  it('denies (null) a node or response that does not exist', async () => {
    const db = dbWith({
      questDialogue: { findMany: linksTo([42]) },
      dialogueNodes: { findUnique: jest.fn().mockResolvedValue(null) },
      dialogueResponses: { findUnique: jest.fn().mockResolvedValue(null) },
    });
    await expect(
      zoneLookups.dialogueNode('id').resolve(db, 1)
    ).resolves.toBeNull();
    await expect(
      zoneLookups.dialogueResponse('id').resolve(db, 1)
    ).resolves.toBeNull();
  });
});
