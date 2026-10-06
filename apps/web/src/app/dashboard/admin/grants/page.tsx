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
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreateZoneGrantDocument,
  DeleteZoneGrantDocument,
  GetZonesForSelectorDocument,
  GrantsAdminUsersDocument,
  GrantsAdminZoneGrantsDocument,
  type GrantPermission,
} from '@/generated/graphql';
import { usePermissions } from '@/hooks/use-permissions';
import { useMutation, useQuery } from '@apollo/client/react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const PERMISSION_OPTIONS: GrantPermission[] = [
  'READ',
  'WRITE',
  'DELETE',
  'ADMIN',
];

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export default function GrantsAdminPage() {
  const { isHeadBuilder, loading: permLoading } = usePermissions();

  if (permLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin' />
      </div>
    );
  }

  if (!isHeadBuilder) {
    return (
      <div className='p-6'>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            You do not have permission to manage zone grants. Head Builder role
            or higher required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <GrantsAdminContent />;
}

function GrantsAdminContent() {
  const usersQuery = useQuery(GrantsAdminUsersDocument);
  const grantsQuery = useQuery(GrantsAdminZoneGrantsDocument);
  const zonesQuery = useQuery(GetZonesForSelectorDocument);
  const [createGrant, { loading: creating }] = useMutation(
    CreateZoneGrantDocument
  );
  const [deleteGrant] = useMutation(DeleteZoneGrantDocument);

  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [permission, setPermission] = useState<GrantPermission>('WRITE');
  const [actionError, setActionError] = useState<string | null>(null);

  const users = usersQuery.data?.users;
  const grants = grantsQuery.data?.grants;
  const zones = zonesQuery.data?.zones;

  const zoneNames = useMemo(
    () => new Map((zones ?? []).map(z => [String(z.id), z.name])),
    [zones]
  );

  const grantsByUser = useMemo(() => {
    const map = new Map<string, NonNullable<typeof grants>>();
    for (const grant of grants ?? []) {
      const list = map.get(grant.userId) ?? [];
      list.push(grant);
      map.set(grant.userId, list);
    }
    return map;
  }, [grants]);

  const availableZones = useMemo(() => {
    const taken = new Set(
      (grantsByUser.get(userId) ?? []).map(g => g.resourceId)
    );
    return (zones ?? []).filter(z => !taken.has(String(z.id)));
  }, [zones, grantsByUser, userId]);

  const handleAdd = async () => {
    if (!userId || !zoneId) return;
    setActionError(null);
    try {
      await createGrant({
        variables: {
          data: {
            userId,
            resourceType: 'ZONE',
            resourceId: zoneId,
            permissions: [permission],
          },
        },
      });
      setZoneId('');
      await grantsQuery.refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Grant failed');
    }
  };

  const handleRemove = async (grantId: string) => {
    setActionError(null);
    try {
      await deleteGrant({ variables: { id: grantId } });
      await grantsQuery.refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Revoke failed');
    }
  };

  const loading = usersQuery.loading || grantsQuery.loading;
  const error = usersQuery.error || grantsQuery.error || zonesQuery.error;

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Zone Grants</h1>
        <p className='text-muted-foreground'>
          Builders need a WRITE or ADMIN grant on a zone to edit it.
        </p>
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      {actionError && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add grant</CardTitle>
          <CardDescription>
            Give a user access to a zone at a permission level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-4 items-end'>
            <div className='space-y-2'>
              <Label htmlFor='grant-user'>User</Label>
              <select
                id='grant-user'
                className={SELECT_CLASS}
                value={userId}
                onChange={e => {
                  setUserId(e.target.value);
                  setZoneId('');
                }}
              >
                <option value=''>Select user</option>
                {(users ?? []).map(u => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='grant-zone'>Zone</Label>
              <select
                id='grant-zone'
                className={SELECT_CLASS}
                value={zoneId}
                disabled={!userId}
                onChange={e => setZoneId(e.target.value)}
              >
                <option value=''>Select zone</option>
                {availableZones.map(z => (
                  <option key={z.id} value={String(z.id)}>
                    {z.id} - {z.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='grant-permission'>Permission</Label>
              <select
                id='grant-permission'
                className={SELECT_CLASS}
                value={permission}
                onChange={e => setPermission(e.target.value as GrantPermission)}
              >
                {PERMISSION_OPTIONS.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleAdd}
              disabled={!userId || !zoneId || creating}
            >
              {creating ? 'Adding...' : 'Add grant'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center p-8'>
              <Loader2 className='h-6 w-6 animate-spin' />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Zone grants</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(users ?? []).map(u => {
                  const userGrants = grantsByUser.get(u.id) ?? [];
                  return (
                    <TableRow key={u.id}>
                      <TableCell className='font-medium'>
                        {u.displayName}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {userGrants.length === 0 ? (
                          <span className='text-muted-foreground'>None</span>
                        ) : (
                          <div className='flex flex-wrap gap-2'>
                            {userGrants.map(g => (
                              <Badge
                                key={g.id}
                                variant='secondary'
                                className='gap-1'
                              >
                                {zoneNames.get(g.resourceId) ??
                                  `Zone ${g.resourceId}`}{' '}
                                ({g.permissions.join(', ')})
                                <button
                                  type='button'
                                  aria-label={`Remove grant ${g.resourceId} from ${u.displayName}`}
                                  onClick={() => handleRemove(g.id)}
                                >
                                  <Trash2 className='h-3 w-3' />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
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
