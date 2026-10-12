import { fireEvent, render, screen } from '@testing-library/react';
import { TYPE_VALUE_FIELDS } from '@/lib/objectTypeValues';
import { TypeValueInput } from './TypeValueInput';

const field = (type: string, key: string) =>
  TYPE_VALUE_FIELDS[type]!.find(f => f.key === key)!;

describe('TypeValueInput: more game keys', () => {
  it('writes the portal destination under "Destination"', () => {
    const onChange = jest.fn();
    render(
      <TypeValueInput
        field={field('PORTAL', 'Destination')}
        values={{ Destination: 3045 }}
        onChange={onChange}
      />
    );
    const input = screen.getByLabelText('Destination Room');
    expect(input).toHaveValue(3045);
    fireEvent.change(input, { target: { value: '3100' } });
    expect(onChange).toHaveBeenCalledWith('Destination', 3100);
  });

  it('writes the board id under "Pages"', () => {
    const onChange = jest.fn();
    render(
      <TypeValueInput
        field={field('BOARD', 'Pages')}
        values={{}}
        onChange={onChange}
      />
    );
    fireEvent.change(screen.getByLabelText('Board ID'), {
      target: { value: '4' },
    });
    expect(onChange).toHaveBeenCalledWith('Pages', 4);
  });

  it('writes weapon hit roll and the corpse flag', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <TypeValueInput
        field={field('WEAPON', 'HitRoll')}
        values={{ HitRoll: 2 }}
        onChange={onChange}
      />
    );
    fireEvent.change(screen.getByLabelText('Hit Roll'), {
      target: { value: '-3' },
    });
    expect(onChange).toHaveBeenCalledWith('HitRoll', -3);
    rerender(
      <TypeValueInput
        field={field('CONTAINER', 'IsCorpse')}
        values={{}}
        onChange={onChange}
      />
    );
    fireEvent.change(screen.getByLabelText('Is a corpse?'), {
      target: { value: 'true' },
    });
    expect(onChange).toHaveBeenCalledWith('IsCorpse', true);
  });

  describe('recall rooms', () => {
    const recall = () => field('SCROLL', 'Recall Rooms');

    it('shows the stored default and class rooms', () => {
      render(
        <TypeValueInput
          field={recall()}
          values={{
            'Recall Rooms': {
              default: { zone: 30, id: 22 },
              classes: { sorcerer: { zone: 30, id: 46 } },
            },
          }}
          onChange={jest.fn()}
        />
      );
      expect(screen.getByLabelText('Recall default room zone')).toHaveValue(30);
      expect(screen.getByLabelText('Recall default room id')).toHaveValue(22);
      expect(screen.getByLabelText('Recall class 1')).toHaveValue('sorcerer');
      expect(screen.getByLabelText('Recall class 1 room')).toHaveValue(46);
    });

    it('writes {default} once both boxes are filled, nothing before', () => {
      const onChange = jest.fn();
      render(
        <TypeValueInput field={recall()} values={{}} onChange={onChange} />
      );
      fireEvent.change(screen.getByLabelText('Recall default room zone'), {
        target: { value: '30' },
      });
      expect(onChange).toHaveBeenLastCalledWith('Recall Rooms', null);
      fireEvent.change(screen.getByLabelText('Recall default room id'), {
        target: { value: '22' },
      });
      expect(onChange).toHaveBeenLastCalledWith('Recall Rooms', {
        default: { zone: 30, id: 22 },
      });
    });

    it('adds a class room with a lower-cased name and removes it again', () => {
      const onChange = jest.fn();
      render(
        <TypeValueInput
          field={recall()}
          values={{ 'Recall Rooms': { default: { zone: 30, id: 22 } } }}
          onChange={onChange}
        />
      );
      fireEvent.click(screen.getByText('Add class room'));
      fireEvent.change(screen.getByLabelText('Recall class 1'), {
        target: { value: 'Sorcerer' },
      });
      fireEvent.change(screen.getByLabelText('Recall class 1 zone'), {
        target: { value: '30' },
      });
      // incomplete row: not written yet
      expect(onChange).toHaveBeenLastCalledWith('Recall Rooms', {
        default: { zone: 30, id: 22 },
      });
      fireEvent.change(screen.getByLabelText('Recall class 1 room'), {
        target: { value: '46' },
      });
      expect(onChange).toHaveBeenLastCalledWith('Recall Rooms', {
        default: { zone: 30, id: 22 },
        classes: { sorcerer: { zone: 30, id: 46 } },
      });
      fireEvent.click(screen.getByLabelText('Remove recall class 1'));
      expect(onChange).toHaveBeenLastCalledWith('Recall Rooms', {
        default: { zone: 30, id: 22 },
      });
    });

    it('clearing the last room writes null, and clearing one box keeps the other', () => {
      const onChange = jest.fn();
      render(
        <TypeValueInput
          field={recall()}
          values={{ 'Recall Rooms': { default: { zone: 30, id: 22 } } }}
          onChange={onChange}
        />
      );
      fireEvent.change(screen.getByLabelText('Recall default room zone'), {
        target: { value: '' },
      });
      expect(onChange).toHaveBeenLastCalledWith('Recall Rooms', null);
      expect(screen.getByLabelText('Recall default room id')).toHaveValue(22);
    });
  });
});
