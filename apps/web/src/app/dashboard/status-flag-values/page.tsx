'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  CreateStatusFlagValueDocument,
  DeleteStatusFlagValueDocument,
  GetStatusFlagValuesDocument,
  UpdateStatusFlagValueDocument,
  type GetStatusFlagValuesQuery,
} from '@/generated/graphql';
import { usePermissions } from '@/hooks/use-permissions';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type FlagValue = GetStatusFlagValuesQuery['statusFlagValues'][number];

type FormData = { flag: string; aiValue: string };

const defaultFormData: FormData = { flag: '', aiValue: '0' };

const FLAG_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
const MAX_AI_VALUE = 100000;

/** Returns an error message, or null when the form is valid. */
function validate(form: FormData, creating: boolean): string | null {
  if (creating && !FLAG_PATTERN.test(form.flag.trim())) {
    return 'Flag must be lowercase letters, digits and single underscores (e.g. major_paralysis)';
  }
  const t = form.aiValue.trim();
  const n = Number(t);
  if (t === '' || !Number.isInteger(n) || Math.abs(n) > MAX_AI_VALUE) {
    return `AI value must be a whole number between -${MAX_AI_VALUE} and ${MAX_AI_VALUE}`;
  }
  return null;
}

export default function StatusFlagValuesPage() {
  const { isBuilder } = usePermissions();
  const canEdit = isBuilder;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<FlagValue | null>(null);
  const [deleting, setDeleting] = useState<FlagValue | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading, error, refetch } = useQuery(
    GetStatusFlagValuesDocument,
    { fetchPolicy: 'cache-and-network' }
  );

  const onSaved = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage('');
    setIsFormOpen(false);
    refetch();
    setTimeout(() => setSuccessMessage(''), 5000);
  };
  const onFailed = (message: string) => {
    // Keep dialogs open so the builder can correct input.
    setFormError(message);
    setErrorMessage(message);
    setSuccessMessage('');
  };

  const [createValue, { loading: creating }] = useMutation(
    CreateStatusFlagValueDocument,
    {
      onCompleted: () => onSaved('Status flag value created'),
      onError: e => onFailed(e.message),
    }
  );
  const [updateValue, { loading: updating }] = useMutation(
    UpdateStatusFlagValueDocument,
    {
      onCompleted: () => onSaved('Status flag value updated'),
      onError: e => onFailed(e.message),
    }
  );
  const [deleteValue, { loading: deletingNow }] = useMutation(
    DeleteStatusFlagValueDocument,
    {
      onCompleted: () => {
        setIsDeleteOpen(false);
        setDeleting(null);
        onSaved('Status flag value deleted');
      },
      onError: e => {
        setIsDeleteOpen(false);
        setErrorMessage(e.message);
        setSuccessMessage('');
      },
    }
  );

  const rows = useMemo(() => {
    const all = data?.statusFlagValues ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter(r => r.flag.toLowerCase().includes(q));
  }, [data, searchQuery]);

  const openCreate = () => {
    setEditing(null);
    setFormData(defaultFormData);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (row: FlagValue) => {
    setEditing(row);
    setFormData({ flag: row.flag, aiValue: row.aiValue.toString() });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate(formData, !editing);
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError('');
    const aiValue = Number(formData.aiValue.trim());
    if (editing) {
      await updateValue({
        variables: { flag: editing.flag, data: { aiValue } },
      });
    } else {
      await createValue({
        variables: { data: { flag: formData.flag.trim(), aiValue } },
      });
    }
  };

  if (loading && !data) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-6'>
        <Alert className='bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'>
          <XCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
          <AlertDescription className='text-red-800 dark:text-red-300'>
            Error loading status flag values: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const saving = creating || updating;

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-foreground mb-2'>
          Status Flag Values
        </h1>
        <p className='text-muted-foreground'>
          How much mob AI values each status flag when deciding whether it wants
          a piece of gear - {data?.statusFlagValues.length ?? 0} total. Positive
          values are good flags, negative values are harmful ones; flags without
          a row are worth 0. The game picks up changes on restart, not
          instantly.
        </p>
      </div>

      {successMessage && (
        <Alert className='mb-4 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800'>
          <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
          <AlertDescription className='text-green-800 dark:text-green-300'>
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && !isFormOpen && (
        <Alert className='mb-4 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'>
          <XCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
          <AlertDescription className='text-red-800 dark:text-red-300'>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className='flex justify-between items-center mb-4 gap-4'>
        <Input
          placeholder='Search by flag...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='max-w-sm'
        />
        {canEdit && (
          <Button onClick={openCreate}>
            <Plus className='h-4 w-4 mr-2' />
            New Flag Value
          </Button>
        )}
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flag</TableHead>
              <TableHead className='w-32'>AI value</TableHead>
              {canEdit && <TableHead className='text-right'>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 3 : 2}
                  className='text-center text-muted-foreground py-8'
                >
                  No status flag values found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => (
                <TableRow key={row.flag}>
                  <TableCell className='font-mono text-xs'>
                    {row.flag}
                  </TableCell>
                  <TableCell>{row.aiValue}</TableCell>
                  {canEdit && (
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setDeleting(row);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className='h-4 w-4 text-red-500' />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className='sm:max-w-[480px]'>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? `Edit Flag Value: ${editing.flag}`
                  : 'New Status Flag Value'}
              </DialogTitle>
              <DialogDescription>
                Changes are saved to the database. The game picks them up on
                restart.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 mt-4'>
              {formError && (
                <Alert className='bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'>
                  <XCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
                  <AlertDescription className='text-red-800 dark:text-red-300'>
                    {formError}
                  </AlertDescription>
                </Alert>
              )}

              <div className='space-y-2'>
                <Label htmlFor='flag-name'>Flag</Label>
                <Input
                  id='flag-name'
                  value={formData.flag}
                  onChange={e =>
                    setFormData({ ...formData, flag: e.target.value })
                  }
                  placeholder='major_paralysis'
                  className='font-mono'
                  disabled={!!editing}
                />
                <p className='text-xs text-muted-foreground'>
                  Unique. The status flag name as carried by status effects;
                  lowercase letters, digits and underscores. Cannot be changed
                  once created.
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='flag-value'>AI value</Label>
                <Input
                  id='flag-value'
                  type='number'
                  value={formData.aiValue}
                  onChange={e =>
                    setFormData({ ...formData, aiValue: e.target.value })
                  }
                />
                <p className='text-xs text-muted-foreground'>
                  Whole number. Negative for harmful flags.
                </p>
              </div>
            </div>

            <DialogFooter className='mt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={saving}>
                {saving && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
                {editing ? 'Save' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className='sm:max-w-[400px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-red-500' />
              Delete Status Flag Value
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the value for &quot;
              {deleting?.flag}&quot;? The flag will be worth 0 to mob AI. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='destructive'
              disabled={deletingNow}
              onClick={() =>
                deleting && deleteValue({ variables: { flag: deleting.flag } })
              }
            >
              {deletingNow && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
