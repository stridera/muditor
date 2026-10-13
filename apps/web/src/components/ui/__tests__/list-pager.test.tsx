import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ListPager } from '../list-pager';

describe('ListPager', () => {
  it('shows the range of the current page out of the server total', () => {
    render(
      <ListPager
        page={3}
        pageSize={50}
        total={120}
        shown={20}
        onPageChange={jest.fn()}
        noun='socials'
      />
    );
    expect(screen.getByTestId('list-pager-range')).toHaveTextContent(
      'Showing 101-120 of 120 socials'
    );
    expect(screen.getByText('Page 3 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('moves between pages', () => {
    const onPageChange = jest.fn();
    render(
      <ListPager
        page={2}
        pageSize={50}
        total={120}
        shown={50}
        onPageChange={onPageChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange.mock.calls).toEqual([[1], [3]]);
  });

  it('hides the buttons for a single page and handles no rows', () => {
    render(
      <ListPager
        page={1}
        pageSize={50}
        total={0}
        shown={0}
        onPageChange={jest.fn()}
      />
    );
    expect(screen.getByTestId('list-pager-range')).toHaveTextContent(
      'Showing 0-0 of 0 results'
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
