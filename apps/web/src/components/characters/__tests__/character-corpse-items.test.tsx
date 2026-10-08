/**
 * Items lying in a character's corpse are not their inventory: they are
 * split out and shown read-only under "On corpse (room z:id)".
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CharacterCorpseItems } from '../character-corpse-items';
import { splitCharacterItems } from '../character-items';

const corpse = { id: 9, roomZoneId: 30, roomId: 45 };
const item = (
  id: number,
  extra: {
    equippedLocation?: string | null;
    corpseId?: number | null;
    corpse?: typeof corpse | null;
  } = {}
) => ({
  id,
  condition: 100,
  charges: 0,
  objects: { name: `item ${id}` },
  ...extra,
});

describe('splitCharacterItems', () => {
  it('keeps corpse rows out of equipped and inventory', () => {
    const rows = [
      item(1, { equippedLocation: 'WIELD' }),
      item(2),
      item(3, { corpseId: 9, corpse }),
      // A worn slot recorded on a corpse row must not count as equipped.
      item(4, { corpseId: 9, corpse, equippedLocation: 'HEAD' }),
    ];
    const out = splitCharacterItems(rows);
    expect(out.equipped.map(i => i.id)).toEqual([1]);
    expect(out.inventory.map(i => i.id)).toEqual([2]);
    expect(out.corpses).toHaveLength(1);
    expect(out.corpses[0]).toMatchObject({
      corpseId: 9,
      roomZoneId: 30,
      roomId: 45,
    });
    expect(out.corpses[0]?.items.map(i => i.id)).toEqual([3, 4]);
  });

  it('groups by corpse and tolerates missing lists and corpse info', () => {
    expect(splitCharacterItems(undefined)).toEqual({
      equipped: [],
      inventory: [],
      corpses: [],
    });
    const out = splitCharacterItems([
      item(1, { corpseId: 1, corpse: { id: 1, roomZoneId: 1, roomId: 2 } }),
      item(2, { corpseId: 2 }),
      item(3, { corpseId: 1, corpse: { id: 1, roomZoneId: 1, roomId: 2 } }),
    ]);
    expect(out.corpses.map(g => [g.corpseId, g.items.length])).toEqual([
      [1, 2],
      [2, 1],
    ]);
    expect(out.corpses[1]?.roomZoneId).toBeNull();
  });
});

describe('CharacterCorpseItems', () => {
  it('shows the room and the items without any edit controls', () => {
    const group = splitCharacterItems([
      item(3, { corpseId: 9, corpse }),
      item(4, { corpseId: 9, corpse }),
    ]).corpses[0]!;
    render(<CharacterCorpseItems group={group} />);
    expect(screen.getByText(/On corpse \(room 30:45\)/)).toBeInTheDocument();
    expect(screen.getByText('item 3')).toBeInTheDocument();
    expect(screen.getByText('item 4')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('says so when the corpse room is unknown', () => {
    const group = splitCharacterItems([item(5, { corpseId: 2 })]).corpses[0]!;
    render(<CharacterCorpseItems group={group} />);
    expect(screen.getByText(/On corpse \(unknown room\)/)).toBeInTheDocument();
  });
});
