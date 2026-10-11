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
  describe('container Key (composite object ref)', () => {
    const keyField = () => field('CONTAINER', 'Key');

    it('shows a stored composite key in zone and id boxes', () => {
      render(
        <TypeValueInput
          field={keyField()}
          values={{ Key: { zone: 23, id: 2 } }}
          onChange={jest.fn()}
        />
      );
      expect(screen.getByLabelText('Container Key zone')).toHaveValue(23);
      expect(screen.getByLabelText('Container Key id')).toHaveValue(2);
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('writes the composite form once zone and id are both set', () => {
      const onChange = jest.fn();
      render(
        <TypeValueInput field={keyField()} values={{}} onChange={onChange} />
      );
      fireEvent.change(screen.getByLabelText('Container Key zone'), {
        target: { value: '23' },
      });
      expect(onChange).not.toHaveBeenCalled();
      fireEvent.change(screen.getByLabelText('Container Key id'), {
        target: { value: '2' },
      });
      expect(onChange).toHaveBeenCalledWith('Key', { zone: 23, id: 2 });
    });

    it('shows a legacy int key with a warning and never writes an int', () => {
      const onChange = jest.fn();
      render(
        <TypeValueInput
          field={keyField()}
          values={{ Key: 2302 }}
          onChange={onChange}
        />
      );
      expect(screen.getByRole('alert')).toHaveTextContent('legacy number 2302');
      expect(screen.getByLabelText('Container Key zone')).toHaveValue(null);
      fireEvent.change(screen.getByLabelText('Container Key zone'), {
        target: { value: '23' },
      });
      fireEvent.change(screen.getByLabelText('Container Key id'), {
        target: { value: '2' },
      });
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('Key', { zone: 23, id: 2 });
    });

    it('treats -1 as no key and clearing both boxes writes -1', () => {
      const onChange = jest.fn();
      render(
        <TypeValueInput
          field={keyField()}
          values={{ Key: { zone: 23, id: 2 } }}
          onChange={onChange}
        />
      );
      fireEvent.change(screen.getByLabelText('Container Key zone'), {
        target: { value: '' },
      });
      expect(onChange).not.toHaveBeenCalled();
      fireEvent.change(screen.getByLabelText('Container Key id'), {
        target: { value: '' },
      });
      expect(onChange).toHaveBeenCalledWith('Key', -1);
    });
  });
});
