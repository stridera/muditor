import { fireEvent, render, screen } from '@testing-library/react';
import { RoomFlagsSection } from './RoomFlagsSection';

describe('RoomFlagsSection', () => {
  it('shows each flag at its default and writes the field that was toggled', () => {
    const onChange = jest.fn();
    render(<RoomFlagsSection room={{}} onChange={onChange} />);
    expect(screen.getByLabelText('Indoors')).not.toBeChecked();
    expect(screen.getByLabelText('Mobs can enter')).toBeChecked();
    fireEvent.click(screen.getByLabelText('Indoors'));
    expect(onChange).toHaveBeenLastCalledWith('isIndoors', true);
    fireEvent.click(screen.getByLabelText('Soundproof'));
    expect(onChange).toHaveBeenLastCalledWith('isSoundproof', true);
    fireEvent.click(screen.getByLabelText('Arena'));
    expect(onChange).toHaveBeenLastCalledWith('isArena', true);
    fireEvent.click(screen.getByLabelText('Guildhall'));
    expect(onChange).toHaveBeenLastCalledWith('isGuildhall', true);
    fireEvent.click(screen.getByLabelText('Mobs can enter'));
    expect(onChange).toHaveBeenLastCalledWith('allowsMobs', false);
    fireEvent.click(screen.getByLabelText('Tracking works'));
    expect(onChange).toHaveBeenLastCalledWith('allowsTracking', false);
    fireEvent.click(screen.getByLabelText('Portals work'));
    expect(onChange).toHaveBeenLastCalledWith('allowsPortals', false);
    fireEvent.click(screen.getByLabelText('Scanning works'));
    expect(onChange).toHaveBeenLastCalledWith('allowsScanning', false);
  });

  it('reflects the room values', () => {
    render(
      <RoomFlagsSection
        room={{ isArena: true, allowsScanning: false }}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByLabelText('Arena')).toBeChecked();
    expect(screen.getByLabelText('Scanning works')).not.toBeChecked();
  });

  it('asks for the inn name only for an inn, and clearing it writes null', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <RoomFlagsSection room={{}} onChange={onChange} />
    );
    expect(screen.queryByLabelText('Inn name')).toBeNull();
    fireEvent.click(screen.getByLabelText('Inn'));
    expect(onChange).toHaveBeenLastCalledWith('isInn', true);
    rerender(
      <RoomFlagsSection
        room={{ isInn: true, innName: 'The Rusty Boar' }}
        onChange={onChange}
      />
    );
    const name = screen.getByLabelText('Inn name');
    expect(name).toHaveValue('The Rusty Boar');
    fireEvent.change(name, { target: { value: 'The Gilded Boar' } });
    expect(onChange).toHaveBeenLastCalledWith('innName', 'The Gilded Boar');
    fireEvent.change(name, { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith('innName', null);
  });
});
