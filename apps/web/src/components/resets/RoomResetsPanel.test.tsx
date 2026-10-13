import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import * as api from '@/lib/reset-api';
import { RoomResetsPanel } from './RoomResetsPanel';

jest.mock('@/lib/reset-api', () => {
  const actual = jest.requireActual('@/lib/reset-api');
  const fns = [
    'loadRoomResets',
    'createMobReset',
    'updateMobReset',
    'deleteMobReset',
    'addMobEquipment',
    'updateMobEquipment',
    'deleteMobEquipment',
    'addMobEquipmentContent',
    'updateMobEquipmentContent',
    'deleteMobEquipmentContent',
    'createObjectReset',
    'updateObjectReset',
    'deleteObjectReset',
    'addObjectContent',
    'updateObjectContent',
    'deleteObjectContent',
    'listZoneMobs',
    'listZoneObjects',
    'searchMobs',
    'searchObjects',
  ];
  return {
    ...actual,
    ...Object.fromEntries(fns.map(f => [f, jest.fn()])),
  };
});

const m = api as unknown as Record<string, jest.Mock>;

const sword = { id: 7, zoneId: 30, name: 'a rusty sword', type: 'WEAPON' };
const bag = { id: 8, zoneId: 30, name: 'a satchel', type: 'CONTAINER' };
const bread = { id: 9, zoneId: 30, name: 'a loaf of bread', type: 'FOOD' };
const chest = { id: 12, zoneId: 30, name: 'an oak chest', type: 'CONTAINER' };
const pouch = { id: 13, zoneId: 30, name: 'a pouch', type: 'CONTAINER' };

const goblinReset = {
  id: '1',
  zoneId: 30,
  mobZoneId: 30,
  mobId: 4,
  roomZoneId: 30,
  roomId: 10,
  maxInstances: 2,
  probability: 1,
  comment: null,
  mob: { id: 4, zoneId: 30, name: 'a goblin guard' },
  equipment: [
    {
      id: '11',
      objectZoneId: 30,
      objectId: 7,
      wearLocation: 'WIELD',
      maxInstances: 1,
      probability: 0.5,
      decorative: false,
      object: sword,
      contents: [],
    },
    {
      id: '12',
      objectZoneId: 30,
      objectId: 8,
      wearLocation: null,
      maxInstances: 1,
      probability: 1,
      decorative: false,
      object: bag,
      contents: [
        {
          id: '21',
          parentContentId: null,
          objectZoneId: 30,
          objectId: 9,
          quantity: 3,
          maxInstances: 5,
          comment: null,
          object: bread,
        },
      ],
    },
  ],
};

const chestReset = {
  id: '5',
  zoneId: 30,
  objectZoneId: 30,
  objectId: 12,
  roomZoneId: 30,
  roomId: 10,
  maxInstances: 1,
  probability: 1,
  comment: null,
  object: chest,
  contents: [
    {
      id: '31',
      parentContentId: null,
      objectZoneId: 30,
      objectId: 13,
      quantity: 1,
      maxInstances: 1,
      comment: null,
      object: pouch,
    },
    {
      id: '32',
      parentContentId: 31,
      objectZoneId: 30,
      objectId: 9,
      quantity: 2,
      maxInstances: 4,
      comment: null,
      object: bread,
    },
  ],
};

function load(
  mobs: unknown[] = [goblinReset],
  objects: unknown[] = [chestReset]
) {
  m.loadRoomResets!.mockResolvedValue({
    mobResets: mobs,
    objectResets: objects,
  });
}

beforeEach(() => {
  jest.resetAllMocks();
  load();
  m.listZoneMobs!.mockResolvedValue([
    { id: 4, zoneId: 30, name: 'a goblin guard', level: 5 },
    { id: 5, zoneId: 30, name: 'a goblin shaman', level: 8 },
  ]);
  m.listZoneObjects!.mockResolvedValue([sword, bag, bread, chest, pouch]);
  m.searchMobs!.mockResolvedValue([]);
  m.searchObjects!.mockResolvedValue([]);
});

const renderPanel = (
  props: Partial<React.ComponentProps<typeof RoomResetsPanel>> = {}
) => render(<RoomResetsPanel roomZoneId={30} roomId={10} canEdit {...props} />);

describe('RoomResetsPanel listing', () => {
  it('loads the room and lists mobs with gear and objects with nested contents', async () => {
    renderPanel();
    expect(m.loadRoomResets).toHaveBeenCalledWith(30, 10);
    expect(await screen.findByText('Mobs (1)')).toBeInTheDocument();
    expect(screen.getByText('Objects (1)')).toBeInTheDocument();
    expect(screen.getByText('a goblin guard')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Max instances of a goblin guard')
    ).toHaveValue(2);
    expect(screen.getByLabelText('Wear location of a rusty sword')).toHaveValue(
      'WIELD'
    );
    expect(screen.getByLabelText('Chance of a rusty sword')).toHaveValue(50);
    // gear container contents
    expect(
      screen.getAllByLabelText('Quantity of a loaf of bread')[0]
    ).toBeInTheDocument();
    // object reset: container, nested pouch, bread inside pouch
    expect(screen.getByText('an oak chest')).toBeInTheDocument();
    expect(screen.getAllByText('a pouch').length).toBeGreaterThan(0);
    expect(
      screen.getAllByLabelText('Max copies of a loaf of bread')
    ).toHaveLength(2);
  });

  it('says so when the room has no resets', async () => {
    load([], []);
    renderPanel();
    expect(
      await screen.findByText('No mobs spawn in this room.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('No objects spawn in this room.')
    ).toBeInTheDocument();
  });

  it('is read-only without write access', async () => {
    renderPanel({ canEdit: false });
    await screen.findByText('a goblin guard');
    expect(screen.queryByText('Place mob')).toBeNull();
    expect(screen.queryByText('Place object')).toBeNull();
    expect(
      screen.queryByLabelText('Delete reset of a goblin guard')
    ).toBeNull();
    expect(screen.queryByText('Add gear to a goblin guard')).toBeNull();
    expect(
      screen.getByLabelText('Max instances of a goblin guard')
    ).toBeDisabled();
  });

  it('shows a load failure in words, with the zone for a missing grant', async () => {
    m.loadRoomResets!.mockRejectedValue(new Error('Forbidden resource'));
    renderPanel();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You do not have write access to zone 30.'
    );
  });
});

describe('RoomResetsPanel mob resets', () => {
  it('places any mob of the zone from the picker', async () => {
    m.createMobReset!.mockResolvedValue(goblinReset);
    const onChanged = jest.fn();
    renderPanel({ onChanged });
    await screen.findByText('a goblin guard');
    fireEvent.click(screen.getByText('Place mob'));
    // never-placed mob is offered
    fireEvent.click(await screen.findByText('a goblin shaman'));
    await waitFor(() =>
      expect(m.createMobReset).toHaveBeenCalledWith({
        zoneId: 30,
        mobZoneId: 30,
        mobId: 5,
        roomZoneId: 30,
        roomId: 10,
        maxInstances: 1,
        probability: 1,
      })
    );
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(onChanged.mock.calls[0]![0]).toEqual({
      mobs: [{ id: 4, zoneId: 30, name: 'a goblin guard' }],
      objects: [{ id: 12, zoneId: 30, name: 'an oak chest' }],
    });
  });

  it('can place a mob from another zone found by search', async () => {
    m.createMobReset!.mockResolvedValue(goblinReset);
    m.searchMobs!.mockResolvedValue([
      { id: 2, zoneId: 12, name: 'a dragon', level: 50 },
    ]);
    renderPanel();
    await screen.findByText('a goblin guard');
    fireEvent.click(screen.getByText('Place mob'));
    fireEvent.change(await screen.findByLabelText('Where to look'), {
      target: { value: 'all' },
    });
    fireEvent.change(screen.getByLabelText('Search mobs'), {
      target: { value: 'dragon' },
    });
    fireEvent.click(await screen.findByText('a dragon'));
    await waitFor(() =>
      expect(m.createMobReset).toHaveBeenCalledWith(
        expect.objectContaining({
          zoneId: 30,
          mobZoneId: 12,
          mobId: 2,
          roomZoneId: 30,
        })
      )
    );
  });

  it('edits max instances and chance on blur, only when changed', async () => {
    m.updateMobReset!.mockResolvedValue(goblinReset);
    renderPanel();
    const max = await screen.findByLabelText('Max instances of a goblin guard');
    fireEvent.blur(max);
    expect(m.updateMobReset).not.toHaveBeenCalled();
    fireEvent.change(max, { target: { value: '4' } });
    fireEvent.blur(max);
    await waitFor(() =>
      expect(m.updateMobReset).toHaveBeenCalledWith('1', { maxInstances: 4 })
    );
    const chance = screen.getByLabelText('Chance of a goblin guard');
    fireEvent.change(chance, { target: { value: '25' } });
    fireEvent.blur(chance);
    await waitFor(() =>
      expect(m.updateMobReset).toHaveBeenCalledWith('1', { probability: 0.25 })
    );
  });

  it('puts back a nonsense max instead of saving it', async () => {
    renderPanel();
    const max = await screen.findByLabelText('Max instances of a goblin guard');
    fireEvent.change(max, { target: { value: '0' } });
    fireEvent.blur(max);
    expect(m.updateMobReset).not.toHaveBeenCalled();
    expect(max).toHaveValue(2);
  });

  it('deletes a mob reset and reloads', async () => {
    m.deleteMobReset!.mockResolvedValue(undefined);
    renderPanel();
    fireEvent.click(
      await screen.findByLabelText('Delete reset of a goblin guard')
    );
    await waitFor(() => expect(m.deleteMobReset).toHaveBeenCalledWith('1'));
    await waitFor(() => expect(m.loadRoomResets).toHaveBeenCalledTimes(2));
  });

  it('shows the API reason when a write is refused', async () => {
    m.deleteMobReset!.mockRejectedValue(new Error('Forbidden resource'));
    renderPanel();
    fireEvent.click(
      await screen.findByLabelText('Delete reset of a goblin guard')
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You do not have write access to zone 30.'
    );
  });
});

describe('RoomResetsPanel mob gear', () => {
  it('gives a mob an item worn in a slot', async () => {
    m.addMobEquipment!.mockResolvedValue(goblinReset);
    renderPanel();
    fireEvent.click(await screen.findByText('Add gear to a goblin guard'));
    fireEvent.change(screen.getByLabelText('Worn on'), {
      target: { value: 'HEAD' },
    });
    const picker = await screen.findByRole('dialog', {
      name: 'Give gear to a goblin guard',
    });
    fireEvent.click(await within(picker).findByText('a loaf of bread'));
    await waitFor(() =>
      expect(m.addMobEquipment).toHaveBeenCalledWith('1', {
        objectZoneId: 30,
        objectId: 9,
        wearLocation: 'HEAD',
        maxInstances: 1,
        probability: 1,
      })
    );
  });

  it('carried gear has no wear location', async () => {
    m.addMobEquipment!.mockResolvedValue(goblinReset);
    renderPanel();
    fireEvent.click(await screen.findByText('Add gear to a goblin guard'));
    const picker = await screen.findByRole('dialog', {
      name: 'Give gear to a goblin guard',
    });
    fireEvent.click(await within(picker).findByText('a rusty sword'));
    await waitFor(() =>
      expect(m.addMobEquipment).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ wearLocation: null })
      )
    );
  });

  it('changes the slot, chance and decorative flag of existing gear', async () => {
    m.updateMobEquipment!.mockResolvedValue(undefined);
    renderPanel();
    fireEvent.change(
      await screen.findByLabelText('Wear location of a rusty sword'),
      {
        target: { value: 'HOLD' },
      }
    );
    await waitFor(() =>
      expect(m.updateMobEquipment).toHaveBeenCalledWith('11', {
        wearLocation: 'HOLD',
      })
    );
    fireEvent.change(screen.getByLabelText('Wear location of a rusty sword'), {
      target: { value: '' },
    });
    await waitFor(() =>
      expect(m.updateMobEquipment).toHaveBeenCalledWith('11', {
        wearLocation: null,
      })
    );
    fireEvent.click(screen.getByLabelText('a rusty sword is decorative'));
    await waitFor(() =>
      expect(m.updateMobEquipment).toHaveBeenCalledWith('11', {
        decorative: true,
      })
    );
    const chance = screen.getByLabelText('Chance of a rusty sword');
    fireEvent.change(chance, { target: { value: '80' } });
    fireEvent.blur(chance);
    await waitFor(() =>
      expect(m.updateMobEquipment).toHaveBeenCalledWith('11', {
        probability: 0.8,
      })
    );
  });

  it('removes gear', async () => {
    m.deleteMobEquipment!.mockResolvedValue(undefined);
    renderPanel();
    fireEvent.click(
      await screen.findByLabelText('Remove a rusty sword from a goblin guard')
    );
    await waitFor(() =>
      expect(m.deleteMobEquipment).toHaveBeenCalledWith('11')
    );
  });

  it('puts items inside a container the mob carries, but not inside a sword', async () => {
    m.addMobEquipmentContent!.mockResolvedValue(goblinReset);
    renderPanel();
    await screen.findByText('a goblin guard');
    // the sword is not a container: no "Inside" section for it
    expect(screen.getAllByText(/^Inside /)).toHaveLength(2); // satchel + oak chest
    const satchel =
      screen.getByText('Inside a satchel').parentElement!.parentElement!;
    fireEvent.click(within(satchel).getByText('Add item'));
    // the picker is a dialog; pick a rusty sword
    const picker = await screen.findByRole('dialog', {
      name: 'Put in a satchel',
    });
    fireEvent.click(await within(picker).findByText('a rusty sword'));
    await waitFor(() =>
      expect(m.addMobEquipmentContent).toHaveBeenCalledWith('12', {
        objectZoneId: 30,
        objectId: 7,
        quantity: 1,
        maxInstances: 1,
      })
    );
  });

  it('edits and removes the contents of carried gear', async () => {
    m.updateMobEquipmentContent!.mockResolvedValue(undefined);
    m.deleteMobEquipmentContent!.mockResolvedValue(undefined);
    renderPanel();
    const qty = (
      await screen.findAllByLabelText('Quantity of a loaf of bread')
    )[0]!;
    fireEvent.change(qty, { target: { value: '6' } });
    fireEvent.blur(qty);
    await waitFor(() =>
      expect(m.updateMobEquipmentContent).toHaveBeenCalledWith('21', {
        quantity: 6,
      })
    );
    const max = screen.getAllByLabelText('Max copies of a loaf of bread')[0]!;
    fireEvent.change(max, { target: { value: '9' } });
    fireEvent.blur(max);
    await waitFor(() =>
      expect(m.updateMobEquipmentContent).toHaveBeenCalledWith('21', {
        maxInstances: 9,
      })
    );
    fireEvent.click(screen.getAllByLabelText('Remove a loaf of bread')[0]!);
    await waitFor(() =>
      expect(m.deleteMobEquipmentContent).toHaveBeenCalledWith('21')
    );
  });
});

describe('RoomResetsPanel object resets', () => {
  it('places an object', async () => {
    m.createObjectReset!.mockResolvedValue(chestReset);
    renderPanel();
    await screen.findByText('an oak chest');
    fireEvent.click(screen.getByText('Place object'));
    const picker = await screen.findByRole('dialog', {
      name: 'Place an object in this room',
    });
    fireEvent.click(await within(picker).findByText('a loaf of bread'));
    await waitFor(() =>
      expect(m.createObjectReset).toHaveBeenCalledWith({
        zoneId: 30,
        objectZoneId: 30,
        objectId: 9,
        roomZoneId: 30,
        roomId: 10,
        maxInstances: 1,
        probability: 1,
      })
    );
  });

  it('edits and deletes an object reset', async () => {
    m.updateObjectReset!.mockResolvedValue(chestReset);
    m.deleteObjectReset!.mockResolvedValue(undefined);
    renderPanel();
    const max = await screen.findByLabelText('Max instances of an oak chest');
    fireEvent.change(max, { target: { value: '3' } });
    fireEvent.blur(max);
    await waitFor(() =>
      expect(m.updateObjectReset).toHaveBeenCalledWith('5', { maxInstances: 3 })
    );
    fireEvent.click(screen.getByLabelText('Delete reset of an oak chest'));
    await waitFor(() => expect(m.deleteObjectReset).toHaveBeenCalledWith('5'));
  });

  it('puts an item inside a nested container with parentContentId', async () => {
    m.addObjectContent!.mockResolvedValue(chestReset);
    renderPanel();
    await screen.findByText('an oak chest');
    // the pouch (content 31) is a container: "Add inside"
    fireEvent.click(screen.getByText('Add inside'));
    const picker = await screen.findByRole('dialog', {
      name: 'Put in a pouch',
    });
    fireEvent.click(await within(picker).findByText('a rusty sword'));
    await waitFor(() =>
      expect(m.addObjectContent).toHaveBeenCalledWith('5', {
        objectZoneId: 30,
        objectId: 7,
        quantity: 1,
        maxInstances: 1,
        parentContentId: 31,
      })
    );
  });

  it('puts an item directly inside the container reset', async () => {
    m.addObjectContent!.mockResolvedValue(chestReset);
    renderPanel();
    await screen.findByText('an oak chest');
    const chestSection = screen.getByText('Inside an oak chest').parentElement!
      .parentElement!;
    fireEvent.click(within(chestSection).getAllByText('Add item')[0]!);
    const picker = await screen.findByRole('dialog', {
      name: 'Put in an oak chest',
    });
    fireEvent.click(await within(picker).findByText('a rusty sword'));
    await waitFor(() =>
      expect(m.addObjectContent).toHaveBeenCalledWith('5', {
        objectZoneId: 30,
        objectId: 7,
        quantity: 1,
        maxInstances: 1,
      })
    );
  });

  it('edits and removes nested contents', async () => {
    m.updateObjectContent!.mockResolvedValue(undefined);
    m.deleteObjectContent!.mockResolvedValue(undefined);
    renderPanel();
    const qtys = await screen.findAllByLabelText('Quantity of a loaf of bread');
    // [0] = mob satchel, [1] = chest > pouch > bread
    fireEvent.change(qtys[1]!, { target: { value: '7' } });
    fireEvent.blur(qtys[1]!);
    await waitFor(() =>
      expect(m.updateObjectContent).toHaveBeenCalledWith('32', { quantity: 7 })
    );
    fireEvent.click(screen.getAllByLabelText('Remove a loaf of bread')[1]!);
    await waitFor(() =>
      expect(m.deleteObjectContent).toHaveBeenCalledWith('32')
    );
  });
});
