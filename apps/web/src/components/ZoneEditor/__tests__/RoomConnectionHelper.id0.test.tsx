import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { RoomConnectionHelper } from '../RoomConnectionHelper';

const rooms = [
  { id: 0, name: 'Room Zero', exits: [] },
  { id: 1, name: 'Room One', exits: [] },
];

describe('RoomConnectionHelper with room id 0', () => {
  it('treats selectedRoomId=0 as a selection, not as "nothing selected"', () => {
    render(
      <RoomConnectionHelper
        rooms={rooms}
        selectedRoomId={0}
        onCreateConnection={jest.fn()}
      />
    );
    expect(screen.getByText(/From: Room Zero/)).toBeInTheDocument();
    expect(
      screen.queryByText('Select a room to create connections')
    ).not.toBeInTheDocument();
  });

  it('can connect to target room 0', () => {
    const onCreate = jest.fn();
    render(
      <RoomConnectionHelper
        rooms={rooms}
        selectedRoomId={1}
        onCreateConnection={onCreate}
      />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /^north$/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Create Connection' }));
    expect(onCreate).toHaveBeenCalledWith(1, 0, 'NORTH');
    expect(onCreate).toHaveBeenCalledWith(0, 1, 'SOUTH');
  });
});
