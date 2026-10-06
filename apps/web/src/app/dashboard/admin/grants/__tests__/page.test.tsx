/**
 * Zone grants admin page: lists users with their grants and creates grants.
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  CreateZoneGrantDocument,
  GetZonesForSelectorDocument,
  GrantsAdminUsersDocument,
  GrantsAdminZoneGrantsDocument,
} from '@/generated/graphql';
import GrantsAdminPage from '../page';

const mockCreateGrant = jest.fn();
const mockDeleteGrant = jest.fn();
const mockRefetch = jest.fn();
let mockPerms = { isHeadBuilder: true, loading: false };

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => mockPerms,
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: (doc: unknown) => {
    if (doc === GrantsAdminUsersDocument) {
      return {
        loading: false,
        data: {
          users: [
            { id: 'u1', displayName: 'BuilderChar', role: 'BUILDER' },
            { id: 'u2', displayName: 'TestPlayer', role: 'PLAYER' },
          ],
        },
      };
    }
    if (doc === GrantsAdminZoneGrantsDocument) {
      return {
        loading: false,
        refetch: mockRefetch,
        data: {
          grants: [
            {
              id: '9',
              userId: 'u1',
              resourceId: '30',
              permissions: ['WRITE'],
            },
          ],
        },
      };
    }
    if (doc === GetZonesForSelectorDocument) {
      return {
        loading: false,
        data: {
          zones: [
            { id: 30, name: 'Mielikki' },
            { id: 31, name: 'Ofingia' },
          ],
        },
      };
    }
    return { loading: false, data: undefined };
  },
  useMutation: (doc: unknown) =>
    doc === CreateZoneGrantDocument
      ? [mockCreateGrant, { loading: false }]
      : [mockDeleteGrant, { loading: false }],
}));

describe('GrantsAdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerms = { isHeadBuilder: true, loading: false };
    mockCreateGrant.mockResolvedValue({ data: {} });
    mockDeleteGrant.mockResolvedValue({ data: {} });
  });

  it('renders users with roles and existing zone grants', () => {
    render(<GrantsAdminPage />);
    expect(screen.getByRole('cell', { name: 'BuilderChar' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'TestPlayer' })).toBeVisible();
    expect(screen.getByText('BUILDER')).toBeVisible();
    expect(screen.getByText(/Mielikki \(WRITE\)/)).toBeVisible();
  });

  it('calls createGrant with the selected user, zone and permission', async () => {
    render(<GrantsAdminPage />);
    fireEvent.change(screen.getByLabelText('User'), {
      target: { value: 'u1' },
    });
    // Zone 30 is already granted to u1, so only zone 31 is offered.
    expect(screen.queryByRole('option', { name: /30 - Mielikki/ })).toBeNull();
    fireEvent.change(screen.getByLabelText('Zone'), {
      target: { value: '31' },
    });
    fireEvent.change(screen.getByLabelText('Permission'), {
      target: { value: 'ADMIN' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add grant' }));

    await waitFor(() => expect(mockCreateGrant).toHaveBeenCalledTimes(1));
    expect(mockCreateGrant).toHaveBeenCalledWith({
      variables: {
        data: {
          userId: 'u1',
          resourceType: 'ZONE',
          resourceId: '31',
          permissions: ['ADMIN'],
        },
      },
    });
  });

  it('removes a grant via deleteGrant', async () => {
    render(<GrantsAdminPage />);
    fireEvent.click(
      screen.getByRole('button', { name: /Remove grant 30 from BuilderChar/ })
    );
    await waitFor(() =>
      expect(mockDeleteGrant).toHaveBeenCalledWith({ variables: { id: '9' } })
    );
  });

  it('renders for a HEAD_BUILDER', () => {
    mockPerms = { isHeadBuilder: true, loading: false };
    render(<GrantsAdminPage />);
    expect(screen.getByRole('cell', { name: 'BuilderChar' })).toBeVisible();
    expect(screen.queryByText(/Head Builder role or higher/)).toBeNull();
  });

  it('denies access to a BUILDER (below HEAD_BUILDER)', () => {
    mockPerms = { isHeadBuilder: false, loading: false };
    render(<GrantsAdminPage />);
    expect(screen.getByText(/Head Builder role or higher/)).toBeVisible();
    expect(screen.queryByRole('cell', { name: 'BuilderChar' })).toBeNull();
  });
});
