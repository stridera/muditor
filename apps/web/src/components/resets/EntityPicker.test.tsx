import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import * as api from '@/lib/reset-api';
import { EntityPicker } from './EntityPicker';

jest.mock('@/lib/reset-api', () => ({
  listZoneMobs: jest.fn(),
  listZoneObjects: jest.fn(),
  searchMobs: jest.fn(),
  searchObjects: jest.fn(),
}));

const m = api as unknown as Record<string, jest.Mock>;

beforeEach(() => {
  jest.resetAllMocks();
  m.listZoneMobs!.mockResolvedValue([
    { id: 1, zoneId: 30, name: 'a rat', level: 1 },
    { id: 2, zoneId: 30, name: 'a bat', level: 2 },
  ]);
  m.listZoneObjects!.mockResolvedValue([
    { id: 5, zoneId: 30, name: 'a chest', type: 'CONTAINER' },
    { id: 6, zoneId: 30, name: 'a coin', type: 'TREASURE' },
  ]);
  m.searchMobs!.mockResolvedValue([
    { id: 9, zoneId: 99, name: 'a ratcatcher', level: 7 },
  ]);
  m.searchObjects!.mockResolvedValue([]);
});

describe('EntityPicker', () => {
  it('lists every mob of the zone without needing them placed first', async () => {
    render(
      <EntityPicker
        kind='mob'
        zoneId={30}
        onPick={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(await screen.findByText('a rat')).toBeInTheDocument();
    expect(screen.getByText('a bat')).toBeInTheDocument();
    expect(m.listZoneMobs).toHaveBeenCalledWith(30);
  });

  it('filters the zone list by name or id and picks one', async () => {
    const onPick = jest.fn();
    render(
      <EntityPicker
        kind='mob'
        zoneId={30}
        onPick={onPick}
        onCancel={jest.fn()}
      />
    );
    await screen.findByText('a rat');
    fireEvent.change(screen.getByLabelText('Search mobs'), {
      target: { value: 'bat' },
    });
    expect(screen.queryByText('a rat')).toBeNull();
    fireEvent.click(screen.getByText('a bat'));
    expect(onPick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2, zoneId: 30, name: 'a bat' })
    );
    fireEvent.change(screen.getByLabelText('Search mobs'), {
      target: { value: '1' },
    });
    expect(screen.getByText('a rat')).toBeInTheDocument();
  });

  it('searches every zone, but only from two letters on', async () => {
    jest.useFakeTimers();
    try {
      render(
        <EntityPicker
          kind='mob'
          zoneId={30}
          onPick={jest.fn()}
          onCancel={jest.fn()}
        />
      );
      await act(async () => {
        await Promise.resolve();
      });
      fireEvent.change(screen.getByLabelText('Where to look'), {
        target: { value: 'all' },
      });
      fireEvent.change(screen.getByLabelText('Search mobs'), {
        target: { value: 'r' },
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });
      expect(m.searchMobs).not.toHaveBeenCalled();
      expect(screen.getByText(/at least 2 letters/)).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText('Search mobs'), {
        target: { value: 'rat' },
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });
      expect(m.searchMobs).toHaveBeenCalledWith('rat');
    } finally {
      jest.useRealTimers();
    }
    expect(await screen.findByText('a ratcatcher')).toBeInTheDocument();
  });

  it('can be limited to some object types', async () => {
    render(
      <EntityPicker
        kind='object'
        zoneId={30}
        objectTypes={['CONTAINER']}
        onPick={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(await screen.findByText('a chest')).toBeInTheDocument();
    expect(screen.queryByText('a coin')).toBeNull();
  });

  it('shows a load error and can be cancelled', async () => {
    m.listZoneMobs!.mockRejectedValue(new Error('boom'));
    const onCancel = jest.fn();
    render(
      <EntityPicker
        kind='mob'
        zoneId={30}
        onPick={jest.fn()}
        onCancel={onCancel}
      />
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('boom');
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText('Loading...')).toBeNull());
  });
});
