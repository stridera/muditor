'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  CreateReservedNameDocument,
  DeleteReservedNameDocument,
  GetReservedNamesDocument,
} from '@/generated/graphql';
import { usePermissions } from '@/hooks/use-permissions';
import { useMutation, useQuery } from '@apollo/client/react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';

const NAME_PATTERN = /^[a-z]+$/;

/** Returns an error message, or null when the name can be submitted. */
function validateName(raw: string): string | null {
  const name = raw.trim().toLowerCase();
  if (name === '') return 'Name is required';
  if (name.length > 30) return 'Name must be at most 30 letters';
  if (!NAME_PATTERN.test(name)) return 'Name must be a single word of letters';
  return null;
}

export default function ReservedNamesPage() {
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
            You do not have permission to manage reserved names. Head Builder
            role or higher required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <ReservedNamesContent />;
}

function ReservedNamesContent() {
  const { data, loading, error, refetch } = useQuery(GetReservedNamesDocument, {
    fetchPolicy: 'cache-and-network',
  });
  const [createName, { loading: creating }] = useMutation(
    CreateReservedNameDocument
  );
  const [deleteName] = useMutation(DeleteReservedNameDocument);

  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const nameError = name === '' ? null : validateName(name);

  const handleAdd = async () => {
    const invalid = validateName(name);
    if (invalid) {
      setActionError(invalid);
      return;
    }
    setActionError(null);
    setMessage(null);
    try {
      await createName({
        variables: {
          data: {
            name: name.trim().toLowerCase(),
            reason: reason.trim() === '' ? null : reason.trim(),
          },
        },
      });
      setMessage(`Reserved "${name.trim().toLowerCase()}"`);
      setName('');
      setReason('');
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Add failed');
    }
  };

  const handleRemove = async (id: string, word: string) => {
    setActionError(null);
    setMessage(null);
    try {
      await deleteName({ variables: { id } });
      setMessage(`Removed "${word}"`);
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Remove failed');
    }
  };

  const names = data?.reservedNames ?? [];

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Reserved Names</h1>
        <p className='text-muted-foreground'>
          Words players cannot use as a character name. The game reads this list
          at boot, so changes apply after the next server restart. Words the
          command parser owns (all, self, me, someone, ...) and mob names are
          reserved automatically.
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
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Reserve a name</CardTitle>
          <CardDescription>
            One word, letters only; stored lowercase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3 items-end'>
            <div className='space-y-2'>
              <Label htmlFor='reserved-name'>Name</Label>
              <Input
                id='reserved-name'
                value={name}
                maxLength={30}
                onChange={e => setName(e.target.value)}
              />
              {nameError && (
                <p className='text-sm text-destructive'>{nameError}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='reserved-reason'>Reason (optional)</Label>
              <Input
                id='reserved-reason'
                value={reason}
                maxLength={200}
                onChange={e => setReason(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={name.trim() === '' || !!nameError || creating}
            >
              {creating ? 'Adding...' : 'Add name'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reserved names ({names.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <div className='flex items-center justify-center p-8'>
              <Loader2 className='h-6 w-6 animate-spin' />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className='w-16' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {names.map(n => (
                  <TableRow key={n.id}>
                    <TableCell className='font-medium'>{n.name}</TableCell>
                    <TableCell className='text-muted-foreground'>
                      {n.reason ?? ''}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='icon'
                        aria-label={`Remove ${n.name}`}
                        onClick={() => handleRemove(n.id, n.name)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {names.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className='text-center text-muted-foreground'
                    >
                      No reserved names
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
