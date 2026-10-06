'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AdminCreatePasswordResetLinkDocument,
  AdminSetUserDeletedDocument,
  AdminSetUserRoleDocument,
  AdminUnlinkCharacterDocument,
  AdminUsersListDocument,
  type AdminUserAccountFieldsFragment,
  type UserRole,
} from '@/generated/graphql';
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { useMutation, useQuery } from '@apollo/client/react';
import { AlertTriangle, KeyRound, Loader2, Unlink } from 'lucide-react';
import { useMemo, useState } from 'react';

const ROLES: UserRole[] = [
  'PLAYER',
  'IMMORTAL',
  'BUILDER',
  'HEAD_BUILDER',
  'CODER',
  'IMPLEMENTOR',
];

const rank = (role: string | undefined | null) =>
  ROLES.indexOf((role ?? 'PLAYER') as UserRole);

const SELECT_CLASS =
  'flex h-9 rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

const yesNo = (v: boolean) => (v ? 'Yes' : 'No');
const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString() : 'Never';

export default function AdminUsersPage() {
  const { isImmortal, loading: permLoading } = usePermissions();

  if (permLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin' />
      </div>
    );
  }

  if (!isImmortal) {
    return (
      <div className='p-6'>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            You do not have permission to view user accounts. IMMORTAL-level
            access required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <AdminUsersContent />;
}

type Row = AdminUserAccountFieldsFragment;

function AdminUsersContent() {
  const { permissions, isCoder } = usePermissions();
  const { user: me } = useAuth();
  const usersQuery = useQuery(AdminUsersListDocument);
  const [setRole] = useMutation(AdminSetUserRoleDocument);
  const [setDeleted] = useMutation(AdminSetUserDeletedDocument);
  const [unlinkCharacter] = useMutation(AdminUnlinkCharacterDocument);
  const [createResetLink] = useMutation(AdminCreatePasswordResetLinkDocument);

  const [filter, setFilter] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<{
    displayName: string;
    url: string;
    expiresAt: string;
  } | null>(null);

  const myRole = permissions?.role ?? 'PLAYER';
  const isImpl = myRole === 'IMPLEMENTOR';
  // IMPLEMENTOR may set any role; CODER only roles strictly below their own.
  const assignableRoles = ROLES.filter(r => isImpl || rank(r) < rank(myRole));

  const rows: Row[] = usersQuery.data?.adminUsers ?? [];
  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      u =>
        u.email.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.characters.some(c => c.name.toLowerCase().includes(q))
    );
  }, [rows, filter]);

  const mayManage = (u: Row) =>
    isCoder && (isImpl || u.id === me?.id || rank(u.role) < rank(myRole));

  const run = async (action: () => Promise<unknown>, failure: string) => {
    setActionError(null);
    try {
      await action();
      await usersQuery.refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : failure);
    }
  };

  const handleRole = (u: Row, role: UserRole) =>
    run(
      () => setRole({ variables: { input: { userId: u.id, role } } }),
      'Role change failed'
    );

  const handleDelete = (u: Row) => {
    if (u.deletedAt) {
      return run(
        () =>
          setDeleted({
            variables: { input: { userId: u.id, deleted: false } },
          }),
        'Restore failed'
      );
    }
    const reason = window.prompt(`Reason for deleting ${u.displayName}?`);
    if (!reason?.trim()) return;
    return run(
      () =>
        setDeleted({
          variables: {
            input: { userId: u.id, deleted: true, reason: reason.trim() },
          },
        }),
      'Delete failed'
    );
  };

  const handleUnlink = (u: Row, characterId: string, name: string) => {
    if (!window.confirm(`Unlink ${name} from ${u.displayName}?`)) return;
    return run(
      () => unlinkCharacter({ variables: { input: { characterId } } }),
      'Unlink failed'
    );
  };

  const handleResetLink = async (u: Row) => {
    setActionError(null);
    setResetLink(null);
    try {
      const res = await createResetLink({ variables: { userId: u.id } });
      const link = res.data?.adminCreatePasswordResetLink;
      if (link) {
        setResetLink({
          displayName: u.displayName,
          url: link.url,
          expiresAt: link.expiresAt,
        });
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Could not create reset link'
      );
    }
  };

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>User Accounts</h1>
        <p className='text-muted-foreground'>
          Website accounts, their linked characters and sign-in methods.
          {!isCoder && ' You have read-only access.'}
        </p>
      </div>

      {usersQuery.error && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>{usersQuery.error.message}</AlertDescription>
        </Alert>
      )}
      {actionError && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {resetLink && (
        <Card>
          <CardHeader>
            <CardTitle>
              Password reset link for {resetLink.displayName}
            </CardTitle>
            <CardDescription>
              Send this to the player yourself; it is shown only once and
              expires {new Date(resetLink.expiresAt).toLocaleString()}.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex gap-2'>
            <Input
              readOnly
              aria-label='Password reset link'
              value={resetLink.url}
              onFocus={e => e.currentTarget.select()}
            />
            <Button
              variant='outline'
              onClick={() => navigator.clipboard?.writeText(resetLink.url)}
            >
              Copy
            </Button>
            <Button variant='ghost' onClick={() => setResetLink(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Accounts ({visible.length})</CardTitle>
          <Input
            placeholder='Filter by email, name or character'
            aria-label='Filter users'
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className='max-w-sm'
          />
        </CardHeader>
        <CardContent>
          {usersQuery.loading ? (
            <div className='flex items-center justify-center p-8'>
              <Loader2 className='h-6 w-6 animate-spin' />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Display name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Google</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Characters</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Deleted</TableHead>
                  {isCoder && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map(u => {
                  const manage = mayManage(u);
                  return (
                    <TableRow key={u.id}>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className='font-medium'>
                        {u.displayName}
                        {u.isBanned && (
                          <Badge variant='destructive' className='ml-2'>
                            Banned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isCoder ? (
                          <select
                            aria-label={`Role for ${u.displayName}`}
                            className={SELECT_CLASS}
                            value={u.role}
                            disabled={!manage}
                            onChange={e =>
                              handleRole(u, e.target.value as UserRole)
                            }
                          >
                            {/* Always show the current role, even if not assignable */}
                            {ROLES.filter(
                              r => r === u.role || assignableRoles.includes(r)
                            ).map(r => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Badge variant='outline'>{u.role}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{yesNo(u.hasGoogleLink)}</TableCell>
                      <TableCell>{yesNo(u.hasPassword)}</TableCell>
                      <TableCell>
                        {u.characters.length === 0 ? (
                          <span className='text-muted-foreground'>None</span>
                        ) : (
                          <div className='flex flex-wrap gap-1'>
                            {u.characters.map(c => (
                              <Badge
                                key={c.id}
                                variant='secondary'
                                className='gap-1'
                              >
                                {c.name} ({c.level})
                                {isCoder && manage && (
                                  <button
                                    type='button'
                                    aria-label={`Unlink ${c.name} from ${u.displayName}`}
                                    onClick={() =>
                                      handleUnlink(u, c.id, c.name)
                                    }
                                  >
                                    <Unlink className='h-3 w-3' />
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{fmtDate(u.lastLoginAt)}</TableCell>
                      <TableCell>{fmtDate(u.createdAt)}</TableCell>
                      <TableCell>
                        {u.deletedAt ? (
                          <span title={u.deletionReason ?? undefined}>Yes</span>
                        ) : (
                          'No'
                        )}
                      </TableCell>
                      {isCoder && (
                        <TableCell>
                          <div className='flex gap-2'>
                            <Button
                              size='sm'
                              variant='outline'
                              disabled={!manage || !!u.deletedAt}
                              aria-label={`Create reset link for ${u.displayName}`}
                              onClick={() => handleResetLink(u)}
                            >
                              <KeyRound className='mr-1 h-3 w-3' />
                              Reset link
                            </Button>
                            <Button
                              size='sm'
                              variant={u.deletedAt ? 'outline' : 'destructive'}
                              disabled={!manage || u.id === me?.id}
                              aria-label={`${u.deletedAt ? 'Restore' : 'Delete'} ${u.displayName}`}
                              onClick={() => handleDelete(u)}
                            >
                              {u.deletedAt ? 'Restore' : 'Delete'}
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
