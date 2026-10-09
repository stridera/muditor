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
  CreateSpellSyllableDocument,
  DeleteSpellSyllableDocument,
  GetSpellSyllablesDocument,
  UpdateSpellSyllableDocument,
  type GetSpellSyllablesQuery,
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

type Syllable = GetSpellSyllablesQuery['spellSyllables'][number];

type FormData = { sortOrder: string; syllable: string; replacement: string };

const defaultFormData: FormData = {
  sortOrder: '0',
  syllable: '',
  replacement: '',
};

const MAX_SORT_ORDER = 1_000_000;

/** Show whitespace-only text visibly (a single space is a real syllable). */
function visible(text: string): string {
  return text.trim() === '' ? JSON.stringify(text) : text;
}

/** Returns an error message, or null when the form is valid. */
function validate(form: FormData): string | null {
  const sort = Number(form.sortOrder.trim());
  if (
    form.sortOrder.trim() === '' ||
    !Number.isInteger(sort) ||
    Math.abs(sort) > MAX_SORT_ORDER
  ) {
    return 'Sort order must be a whole number';
  }
  // Not trimmed: a lone space is a legitimate syllable.
  if (form.syllable === '') return 'Syllable is required';
  if (form.syllable !== form.syllable.toLowerCase()) {
    return 'Syllable must be lowercase (the game matches the lowercased spell name)';
  }
  if (form.replacement === '') return 'Replacement is required';
  return null;
}

export default function SpellSyllablesPage() {
  const { isBuilder } = usePermissions();
  const canEdit = isBuilder;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Syllable | null>(null);
  const [deleting, setDeleting] = useState<Syllable | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading, error, refetch } = useQuery(
    GetSpellSyllablesDocument,
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
    CreateSpellSyllableDocument,
    {
      onCompleted: () => onSaved('Spell syllable created'),
      onError: e => onFailed(e.message),
    }
  );
  const [updateValue, { loading: updating }] = useMutation(
    UpdateSpellSyllableDocument,
    {
      onCompleted: () => onSaved('Spell syllable updated'),
      onError: e => onFailed(e.message),
    }
  );
  const [deleteValue, { loading: deletingNow }] = useMutation(
    DeleteSpellSyllableDocument,
    {
      onCompleted: () => {
        setIsDeleteOpen(false);
        setDeleting(null);
        onSaved('Spell syllable deleted');
      },
      onError: e => {
        setIsDeleteOpen(false);
        setErrorMessage(e.message);
        setSuccessMessage('');
      },
    }
  );

  const rows = useMemo(() => {
    const all = data?.spellSyllables ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      r =>
        r.syllable.toLowerCase().includes(q) ||
        r.replacement.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const openCreate = () => {
    setEditing(null);
    setFormData(defaultFormData);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (row: Syllable) => {
    setEditing(row);
    setFormData({
      sortOrder: row.sortOrder.toString(),
      syllable: row.syllable,
      replacement: row.replacement,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate(formData);
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError('');
    const payload = {
      sortOrder: Number(formData.sortOrder.trim()),
      syllable: formData.syllable,
      replacement: formData.replacement,
    };
    if (editing) {
      await updateValue({ variables: { id: editing.id, data: payload } });
    } else {
      await createValue({ variables: { data: payload } });
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
            Error loading spell syllables: {error.message}
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
          Spell Syllables
        </h1>
        <p className='text-muted-foreground'>
          Chant gibberish: how a bystander who cannot place a spell hears its
          name - {data?.spellSyllables.length ?? 0} total. At each position of
          the lowercased spell name the rows are tried in sort order (whole
          syllables first, then the single-letter cipher); the first syllable
          that prefixes the remaining text is replaced. The game picks up
          changes on restart, not instantly.
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
          placeholder='Search by syllable or replacement...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='max-w-sm'
        />
        {canEdit && (
          <Button onClick={openCreate}>
            <Plus className='h-4 w-4 mr-2' />
            New Syllable
          </Button>
        )}
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-24'>Sort</TableHead>
              <TableHead>Syllable</TableHead>
              <TableHead>Replacement</TableHead>
              {canEdit && <TableHead className='text-right'>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 4 : 3}
                  className='text-center text-muted-foreground py-8'
                >
                  No spell syllables found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.sortOrder}</TableCell>
                  <TableCell className='font-mono text-xs'>
                    {visible(row.syllable)}
                  </TableCell>
                  <TableCell className='font-mono text-xs'>
                    {visible(row.replacement)}
                  </TableCell>
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
                  ? `Edit Syllable: ${visible(editing.syllable)}`
                  : 'New Spell Syllable'}
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
                <Label htmlFor='syl-syllable'>Syllable</Label>
                <Input
                  id='syl-syllable'
                  value={formData.syllable}
                  onChange={e =>
                    setFormData({ ...formData, syllable: e.target.value })
                  }
                  placeholder='ar'
                  className='font-mono'
                />
                <p className='text-xs text-muted-foreground'>
                  Unique and lowercase. Not trimmed - a single space is a valid
                  syllable.
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='syl-replacement'>Replacement</Label>
                <Input
                  id='syl-replacement'
                  value={formData.replacement}
                  onChange={e =>
                    setFormData({ ...formData, replacement: e.target.value })
                  }
                  placeholder='abra'
                  className='font-mono'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='syl-sort'>Sort order</Label>
                <Input
                  id='syl-sort'
                  type='number'
                  value={formData.sortOrder}
                  onChange={e =>
                    setFormData({ ...formData, sortOrder: e.target.value })
                  }
                />
                <p className='text-xs text-muted-foreground'>
                  Whole number. Lower values are tried first, so put longer
                  syllables before the single letters they contain.
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
              Delete Spell Syllable
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the syllable &quot;
              {deleting ? visible(deleting.syllable) : ''}&quot;? This action
              cannot be undone.
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
                deleting && deleteValue({ variables: { id: deleting.id } })
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
