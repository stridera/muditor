/**
 * Admin users page: IMMORTAL+ may view, CODER+ get the action controls and
 * only roles below their own.
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  AdminCreatePasswordResetLinkDocument,
  AdminSetUserDeletedDocument,
  AdminSetUserRoleDocument,
  AdminUnlinkCharacterDocument,
  AdminUsersListDocument,
} from '@/generated/graphql';
import { roleAtLeast } from '@/lib/roles';
import AdminUsersPage from '../page';

const mockSetRole = jest.fn();
const mockSetDeleted = jest.fn();
const mockUnlink = jest.fn();
const mockResetLink = jest.fn();
const mockRefetch = jest.fn();

type Perms = {
  isImmortal: boolean;
  isCoder: boolean;
  isImplementor: boolean;
  loading: boolean;
  permissions: { role: string } | null;
};
const perms = (role: string): Perms => ({
  isImmortal: roleAtLeast(role, 'IMMORTAL'),
  isCoder: roleAtLeast(role, 'CODER'),
  isImplementor: roleAtLeast(role, 'IMPLEMENTOR'),
  loading: false,
  permissions: { role },
});
let mockPerms: Perms = perms('CODER');

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => mockPerms,
}));
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({ user: { id: 'me' } }),
}));

const users = [
  {
    id: 'u1',
    email: 'darth.venath@gmail.com',
    displayName: 'Darth',
    role: 'PLAYER',
    hasGoogleLink: true,
    hasPassword: false,
    isBanned: false,
    lastLoginAt: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    deletedAt: null,
    deletionReason: null,
    characters: [{ id: 'c1', name: 'Venath', level: 100 }],
  },
  {
    id: 'u2',
    email: 'boss@example.com',
    displayName: 'Boss',
    role: 'IMPLEMENTOR',
    hasGoogleLink: false,
    hasPassword: true,
    isBanned: false,
    lastLoginAt: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    deletedAt: null,
    deletionReason: null,
    characters: [],
  },
];

jest.mock('@apollo/client/react', () => ({
  useQuery: (doc: unknown) =>
    doc === AdminUsersListDocument
      ? { loading: false, refetch: mockRefetch, data: { adminUsers: users } }
      : { loading: false, data: undefined },
  useMutation: (doc: unknown) => {
    if (doc === AdminSetUserRoleDocument) return [mockSetRole];
    if (doc === AdminSetUserDeletedDocument) return [mockSetDeleted];
    if (doc === AdminUnlinkCharacterDocument) return [mockUnlink];
    if (doc === AdminCreatePasswordResetLinkDocument) return [mockResetLink];
    return [jest.fn()];
  },
}));

describe('AdminUsersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerms = perms('CODER');
    mockSetRole.mockResolvedValue({});
    mockResetLink.mockResolvedValue({
      data: {
        adminCreatePasswordResetLink: {
          url: 'https://muditor.fierymud.org/reset-password?token=abc',
          expiresAt: '2026-10-06T20:00:00.000Z',
        },
      },
    });
  });

  it('denies players (BUILDER and above are staff and pass)', () => {
    mockPerms = perms('PLAYER');
    render(<AdminUsersPage />);
    expect(screen.getByText(/IMMORTAL-level access required/)).toBeVisible();
    expect(screen.queryByText('User Accounts')).toBeNull();
  });

  it('shows IMMORTAL a read-only table without action controls', () => {
    mockPerms = perms('IMMORTAL');
    render(<AdminUsersPage />);
    expect(screen.getByText('darth.venath@gmail.com')).toBeVisible();
    expect(screen.getByText('Venath (100)')).toBeVisible();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('button', { name: /Reset link/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Unlink/ })).toBeNull();
  });

  it('offers a CODER only roles below CODER and locks higher users', () => {
    render(<AdminUsersPage />);
    const darth = screen.getByLabelText('Role for Darth') as HTMLSelectElement;
    const options = Array.from(darth.options).map(o => o.value);
    expect(options).toEqual(['PLAYER', 'IMMORTAL', 'BUILDER', 'HEAD_BUILDER']);
    expect(screen.getByLabelText('Role for Boss')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Create reset link for Boss' })
    ).toBeDisabled();
  });

  it('lets an IMPLEMENTOR assign any role', () => {
    mockPerms = perms('IMPLEMENTOR');
    render(<AdminUsersPage />);
    const darth = screen.getByLabelText('Role for Darth') as HTMLSelectElement;
    expect(Array.from(darth.options).map(o => o.value)).toContain(
      'IMPLEMENTOR'
    );
    expect(screen.getByLabelText('Role for Boss')).toBeEnabled();
  });

  it('changes a role through adminSetUserRole', async () => {
    render(<AdminUsersPage />);
    fireEvent.change(screen.getByLabelText('Role for Darth'), {
      target: { value: 'IMMORTAL' },
    });
    await waitFor(() =>
      expect(mockSetRole).toHaveBeenCalledWith({
        variables: { input: { userId: 'u1', role: 'IMMORTAL' } },
      })
    );
  });

  it('shows the generated reset link to the admin', async () => {
    render(<AdminUsersPage />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Create reset link for Darth' })
    );
    const field = (await screen.findByLabelText(
      'Password reset link'
    )) as HTMLInputElement;
    expect(field.value).toBe(
      'https://muditor.fierymud.org/reset-password?token=abc'
    );
    expect(mockResetLink).toHaveBeenCalledWith({ variables: { userId: 'u1' } });
  });
});
