import { fireEvent, render, screen } from '@testing-library/react';
import { TYPE_VALUE_FIELDS } from '@/lib/objectTypeValues';
import { TypeValueInput } from './TypeValueInput';

const field = (type: string, key: string) =>
  TYPE_VALUE_FIELDS[type]!.find(f => f.key === key)!;

describe('TypeValueInput', () => {
  it('reads the game key and writes the game key', () => {
    const onChange = jest.fn();
    render(
      <TypeValueInput
        field={field('LIGHT', 'Remaining')}
        values={{ Remaining: 240, Capacity: 300 }}
        onChange={onChange}
      />
    );
    const input = screen.getByLabelText('Light Hours Remaining');
    expect(input).toHaveValue(240);
    fireEvent.change(input, { target: { value: '-1' } });
    expect(onChange).toHaveBeenCalledWith('Remaining', -1);
  });

  it('keeps a spaced key intact', () => {
    const onChange = jest.fn();
    render(
      <TypeValueInput
        field={field('CONTAINER', 'Weight Reduction')}
        values={{}}
        onChange={onChange}
      />
    );
    fireEvent.change(screen.getByLabelText('Weight Reduction (%)'), {
      target: { value: '90' },
    });
    expect(onChange).toHaveBeenCalledWith('Weight Reduction', 90);
  });

  it('toggles container flags using the stored Title-case names', () => {
    const onChange = jest.fn();
    render(
      <TypeValueInput
        field={field('CONTAINER', 'Flags')}
        values={{ Flags: ['Closeable'] }}
        onChange={onChange}
      />
    );
    expect(screen.getByLabelText('Closeable')).toBeChecked();
    fireEvent.click(screen.getByLabelText('Locked'));
    expect(onChange).toHaveBeenCalledWith('Flags', ['Closeable', 'Locked']);
  });

  it('keeps a stored liquid that is not in the list', () => {
    render(
      <TypeValueInput
        field={field('DRINKCONTAINER', 'Liquid')}
        values={{ Liquid: 'MYSTERY' }}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByLabelText('Liquid')).toHaveValue('MYSTERY');
  });

  it('commits a spell list on blur as an array', () => {
    const onChange = jest.fn();
    render(
      <TypeValueInput
        field={field('POTION', 'Spells')}
        values={{ Spells: ['BLESS'] }}
        onChange={onChange}
      />
    );
    const input = screen.getByLabelText('Spells');
    fireEvent.change(input, { target: { value: 'BLESS, ARMOR' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith('Spells', ['BLESS', 'ARMOR']);
  });
});
