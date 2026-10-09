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
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  CreateSystemMessageDocument,
  DeleteSystemMessageDocument,
  GetSystemMessagesDocument,
  UpdateSystemMessageDocument,
  type GetSystemMessagesQuery,
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

type SystemMessage = GetSystemMessagesQuery['systemMessages'][number];

type FormData = { key: string; category: string; messages: string };

const defaultFormData: FormData = { key: '', category: '', messages: '' };

const IDENT_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

/** One variant per line; blank lines are dropped. */
function parseMessages(raw: string): string[] {
  return raw.split('\n').filter(line => line.trim() !== '');
}

/** Returns an error message, or null when the form is valid. */
function validate(form: FormData, creating: boolean): string | null {
  if (creating && !IDENT_PATTERN.test(form.key.trim())) {
    return 'Key must be lowercase letters, digits and single underscores (e.g. exp_progress)';
  }
  if (!IDENT_PATTERN.test(form.category.trim())) {
    return 'Category must be lowercase letters, digits and single underscores (e.g. weather)';
  }
  if (parseMessages(form.messages).length === 0) {
    return 'At least one message is required';
  }
  return null;
}

export default function SystemMessagesPage() {
  const { isCoder } = usePermissions();
  const canEdit = isCoder;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<SystemMessage | null>(null);
  const [deleting, setDeleting] = useState<SystemMessage | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading, error, refetch } = useQuery(
    GetSystemMessagesDocument,
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
    CreateSystemMessageDocument,
    {
      onCompleted: () => onSaved('System message created'),
      onError: e => onFailed(e.message),
    }
  );
  const [updateValue, { loading: updating }] = useMutation(
    UpdateSystemMessageDocument,
    {
      onCompleted: () => onSaved('System message updated'),
      onError: e => onFailed(e.message),
    }
  );
  const [deleteValue, { loading: deletingNow }] = useMutation(
    DeleteSystemMessageDocument,
    {
      onCompleted: () => {
        setIsDeleteOpen(false);
        setDeleting(null);
        onSaved('System message deleted');
      },
      onError: e => {
        setIsDeleteOpen(false);
        setErrorMessage(e.message);
        setSuccessMessage('');
      },
    }
  );

  const rows = useMemo(() => {
    const all = data?.systemMessages ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      r =>
        r.key.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.messages.some(m => m.toLowerCase().includes(q))
    );
  }, [data, searchQuery]);

  const openCreate = () => {
    setEditing(null);
    setFormData(defaultFormData);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (row: SystemMessage) => {
    setEditing(row);
    setFormData({
      key: row.key,
      category: row.category,
      messages: row.messages.join('\n'),
    });
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
    const category = formData.category.trim();
    const messages = parseMessages(formData.messages);
    if (editing) {
      // The key is what the game looks the message up by; it cannot change.
      await updateValue({
        variables: { id: editing.id, data: { category, messages } },
      });
    } else {
      await createValue({
        variables: {
          data: { key: formData.key.trim(), category, messages },
        },
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
            Error loading system messages: {error.message}
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
          System Messages
        </h1>
        <p className='text-muted-foreground'>
          Game text with several variants (experience progress lines, insults,
          month names, weather changes) - {data?.systemMessages.length ?? 0}{' '}
          total. Keys are looked up by the game, so they cannot be renamed.
          Color markup such as {'<blue>text</>'} is allowed. The game picks up
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
          placeholder='Search by key, category or text...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='max-w-sm'
        />
        {canEdit && (
          <Button onClick={openCreate}>
            <Plus className='h-4 w-4 mr-2' />
            New Message
          </Button>
        )}
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Key</TableHead>
              <TableHead className='w-24'>Variants</TableHead>
              <TableHead>First variant</TableHead>
              {canEdit && <TableHead className='text-right'>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 5 : 4}
                  className='text-center text-muted-foreground py-8'
                >
                  No system messages found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Badge variant='secondary'>{row.category}</Badge>
                  </TableCell>
                  <TableCell className='font-mono text-xs'>{row.key}</TableCell>
                  <TableCell>{row.messages.length}</TableCell>
                  <TableCell className='max-w-md truncate'>
                    {row.messages[0]}
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
        <DialogContent className='sm:max-w-[640px] max-h-[90vh] overflow-y-auto'>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? `Edit Message: ${editing.key}`
                  : 'New System Message'}
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
                <Label htmlFor='msg-key'>Key</Label>
                <Input
                  id='msg-key'
                  value={formData.key}
                  onChange={e =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                  placeholder='exp_progress'
                  className='font-mono'
                  disabled={!!editing}
                />
                <p className='text-xs text-muted-foreground'>
                  Unique. Lowercase letters, digits and underscores. Cannot be
                  changed once created. A new key only has an effect once the
                  game looks it up.
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='msg-category'>Category</Label>
                <Input
                  id='msg-category'
                  value={formData.category}
                  onChange={e =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder='weather'
                  className='font-mono'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='msg-messages'>Messages</Label>
                <Textarea
                  id='msg-messages'
                  value={formData.messages}
                  onChange={e =>
                    setFormData({ ...formData, messages: e.target.value })
                  }
                  rows={8}
                  className='font-mono text-sm'
                />
                <p className='text-xs text-muted-foreground'>
                  One variant per line; blank lines are ignored. At least one is
                  required.
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
              Delete System Message
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the message &quot;
              {deleting?.key}&quot;? Deleting a key the game looks up removes
              its text. This action cannot be undone.
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
