import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import EnhancedSearch from '../EnhancedSearch';

const options = [
  { key: 'hasKeeper', label: 'Has Assigned Keeper', type: 'boolean' as const },
];

describe('EnhancedSearch boolean filters', () => {
  it('shows an active false filter distinctly and cycles unset -> on -> off -> unset', () => {
    const onFiltersChange = jest.fn();
    render(
      <EnhancedSearch
        initialFilters={{ searchTerm: '', customFilters: { hasKeeper: false } }}
        onFiltersChange={onFiltersChange}
        customFilterOptions={options}
      />
    );
    // Open the advanced panel.
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));

    const box = screen.getByRole('checkbox', { name: /Has Assigned Keeper/ });
    expect(box).toHaveAttribute('data-state', 'off');
    expect(box).toHaveAttribute('aria-checked', 'mixed');
    expect(box).toHaveTextContent('Has Assigned Keeper: No');

    fireEvent.click(box); // off -> unset
    expect(box).toHaveAttribute('data-state', 'unset');
    fireEvent.click(box); // unset -> on
    expect(box).toHaveAttribute('data-state', 'on');
    expect(box).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(box); // on -> off
    expect(box).toHaveAttribute('data-state', 'off');
  });

  it('treats URL-style string values the same', () => {
    render(
      <EnhancedSearch
        initialFilters={{
          searchTerm: '',
          customFilters: { hasKeeper: 'false' },
        }}
        onFiltersChange={() => {}}
        customFilterOptions={options}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));
    expect(
      screen.getByRole('checkbox', { name: /Has Assigned Keeper/ })
    ).toHaveAttribute('data-state', 'off');
  });
});
