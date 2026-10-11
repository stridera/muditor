/**
 * Reserved names admin page: lists, adds and removes reserved character names.
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  CreateReservedNameDocument,
  GetReservedNamesDocument,
} from '@/generated/graphql';
import ReservedNamesPage from '../page';

const mockCreate = jest.fn();
const mockDelete = jest.fn();
const mockRefetch = jest.fn();
let mockPerms = { isHeadBuilder: true, loading: false };

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => mockPerms,
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: (doc: unknown) =>
    doc === GetReservedNamesDocument
      ? {
          loading: false,
          refetch: mockRefetch,
          data: {
            reservedNames: [
              {
                id: '1',
                name: 'guard',
                reason: 'Generic mob word',
                createdAt: '2026-10-10T00:00:00Z',
              },
              { id: '2', name: 'staff', reason: null, createdAt: '2026-10-10' },
            ],
          },
        }
      : { loading: false, data: undefined },
  useMutation: (doc: unknown) =>
    doc === CreateReservedNameDocument
      ? [mockCreate, { loading: false }]
      : [mockDelete, { loading: false }],
}));

describe('ReservedNamesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerms = { isHeadBuilder: true, loading: false };
    mockCreate.mockResolvedValue({ data: {} });
    mockDelete.mockResolvedValue({ data: {} });
  });

  it('lists reserved names with their reasons', () => {
    render(<ReservedNamesPage />);
    expect(screen.getByRole('cell', { name: 'guard' })).toBeVisible();
    expect(
      screen.getByRole('cell', { name: 'Generic mob word' })
    ).toBeVisible();
    expect(screen.getByRole('cell', { name: 'staff' })).toBeVisible();
  });

  it('adds a name trimmed and lowercased', async () => {
    render(<ReservedNamesPage />);
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: '  Warden ' },
    });
    fireEvent.change(screen.getByLabelText('Reason (optional)'), {
      target: { value: 'Generic mob word' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add name' }));
    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
    expect(mockCreate).toHaveBeenCalledWith({
      variables: { data: { name: 'warden', reason: 'Generic mob word' } },
    });
    await waitFor(() => expect(mockRefetch).toHaveBeenCalled());
  });

  it('refuses a name that is not a single word of letters', () => {
    render(<ReservedNamesPage />);
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'two words' },
    });
    expect(screen.getByText(/single word of letters/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add name' })).toBeDisabled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('removes a name via deleteReservedName', async () => {
    render(<ReservedNamesPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove guard' }));
    await waitFor(() =>
      expect(mockDelete).toHaveBeenCalledWith({ variables: { id: '1' } })
    );
  });

  it('denies access to a BUILDER (below HEAD_BUILDER)', () => {
    mockPerms = { isHeadBuilder: false, loading: false };
    render(<ReservedNamesPage />);
    expect(screen.getByText(/Head Builder role or higher/)).toBeVisible();
    expect(screen.queryByRole('cell', { name: 'guard' })).toBeNull();
  });
});
