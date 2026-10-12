import { fireEvent, render, screen } from '@testing-library/react';
import { EntityPanel } from '../EntityPanel';

jest.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light' }) }));
jest.mock('../MobNode', () => ({
  MobNode: ({ data }: { data: { name: string } }) => <div>{data.name}</div>,
}));
jest.mock('../ObjectNode', () => ({
  ObjectNode: ({ data }: { data: { name: string } }) => <div>{data.name}</div>,
}));
jest.mock('@/lib/entity-mutations', () => ({
  updateMob: jest.fn(),
  updateObject: jest.fn(),
}));

const baseProps = {
  zoneId: 30,
  selectedEntity: null,
  onSelectEntity: jest.fn(),
  onClearSelection: jest.fn(),
  onMobDragStart: jest.fn(),
  onObjectDragStart: jest.fn(),
  viewMode: 'edit' as const,
  panelWidth: 320,
};

// A fresh zone: nothing is placed in any room yet, but the zone has mobs.
const zoneMobs = [
  { id: 4, zoneId: 30, name: 'a goblin guard', level: 5 },
  { id: 5, zoneId: 30, name: 'a goblin shaman', level: 8 },
];
const zoneObjects = [
  { id: 7, zoneId: 30, name: 'a rusty sword', type: 'WEAPON' },
];

describe('EntityPanel palette', () => {
  it('lists mobs that are not placed anywhere', () => {
    render(
      <EntityPanel {...baseProps} mobs={zoneMobs} objects={zoneObjects} />
    );
    expect(screen.getByText('a goblin guard')).toBeInTheDocument();
    expect(screen.getByText('a goblin shaman')).toBeInTheDocument();
    expect(screen.queryByText('No mobs found')).toBeNull();
  });

  it('places a mob or object in the selected room from the palette', () => {
    const onPlaceEntity = jest.fn();
    render(
      <EntityPanel
        {...baseProps}
        mobs={zoneMobs}
        objects={zoneObjects}
        onPlaceEntity={onPlaceEntity}
      />
    );
    fireEvent.click(screen.getByText('Place a goblin shaman in selected room'));
    expect(onPlaceEntity).toHaveBeenCalledWith(
      'mob',
      expect.objectContaining({ id: 5, zoneId: 30, name: 'a goblin shaman' })
    );
    fireEvent.click(screen.getByText(/Objects \(1\)/));
    fireEvent.click(screen.getByText('Place a rusty sword in selected room'));
    expect(onPlaceEntity).toHaveBeenLastCalledWith(
      'object',
      expect.objectContaining({ id: 7, zoneId: 30, name: 'a rusty sword' })
    );
  });

  it('offers no Place button when nothing can be placed', () => {
    render(<EntityPanel {...baseProps} mobs={zoneMobs} objects={[]} />);
    expect(screen.queryByText(/in selected room/)).toBeNull();
  });
});
