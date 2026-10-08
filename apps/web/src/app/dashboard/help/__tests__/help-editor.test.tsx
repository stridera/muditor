import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  HelpCategorySelect,
  NO_CATEGORY,
  categoryOptions,
} from '../category-select';
import { parseSeeAlso } from '../see-also';

// Radix Select needs these jsdom gaps filled before it will open.
beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
  global.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('HelpCategorySelect (issue #70: editor crashed on <Select.Item value="">)', () => {
  it('renders for an entry with no category without throwing', () => {
    expect(() =>
      render(<HelpCategorySelect value='' onChange={() => {}} />)
    ).not.toThrow();
    expect(screen.getByRole('combobox')).toHaveTextContent('None');
  });

  it('renders for a known and for an unlisted category', () => {
    const { rerender } = render(
      <HelpCategorySelect value='spell' onChange={() => {}} />
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('Spell');
    rerender(<HelpCategorySelect value='mystery' onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Mystery');
  });

  it('maps the None option back to an empty form value', () => {
    const onChange = jest.fn();
    render(<HelpCategorySelect value='spell' onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    fireEvent.click(screen.getByRole('option', { name: 'None' }));
    expect(onChange).toHaveBeenCalledWith('');
    expect(onChange).not.toHaveBeenCalledWith(NO_CATEGORY);
  });

  it('never offers an empty option value and includes data categories', () => {
    const opts = categoryOptions('', ['guide', 'custom']);
    expect(opts).not.toContain('');
    expect(opts).toContain('custom');
    expect(opts.filter(o => o === 'guide')).toHaveLength(1);
  });
});

describe('parseSeeAlso', () => {
  it('keeps the author casing instead of lowercasing', () => {
    expect(
      parseSeeAlso('Body\n\nSee also: "Magic Missile", ICE DARTS, MEDITATE')
    ).toEqual(['Magic Missile', 'ICE DARTS', 'MEDITATE']);
  });

  it('returns nothing without a See also line', () => {
    expect(parseSeeAlso('just text')).toEqual([]);
  });
});
