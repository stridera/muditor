'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  GetCommandHelpDocument,
  UpdateCommandFlagsDocument,
  UpdateCommandHelpDocument,
  type GetCommandHelpQuery,
} from '@/generated/graphql';
import { usePermissions } from '@/hooks/use-permissions';
import { useMutation, useQuery } from '@apollo/client/react';
import { CheckCircle, Loader2, Pencil, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  FLAG_FIELDS,
  SUMMARY_MAX,
  TEXT_MAX,
  flagsChanged,
  flagsOf,
  matchesQuery,
  toMutationVars,
  validateHelpForm,
  type FlagsFormData,
  type HelpFormData,
} from './command-help';

type CommandRow = GetCommandHelpQuery['commands'][number];

export default function CommandsPage() {
  const { isBuilder, isCoder } = usePermissions();
  const canEdit = isBuilder;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<CommandRow | null>(null);
  const [formData, setFormData] = useState<HelpFormData>({
    helpSummary: '',
    helpText: '',
  });
  const [flagsData, setFlagsData] = useState<FlagsFormData>(flagsOf({}));
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading, error, refetch } = useQuery(GetCommandHelpDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const [updateHelp, { loading: saving }] = useMutation(
    UpdateCommandHelpDocument,
    {
      onCompleted: res => {
        setSuccessMessage(
          `Help for "${res.updateCommandHelp.name}" saved. The game picks it up on restart.`
        );
        setErrorMessage('');
        setIsFormOpen(false);
        refetch();
        setTimeout(() => setSuccessMessage(''), 5000);
      },
      onError: e => {
        // Keep the dialog open so the builder can correct input.
        setFormError(e.message);
        setErrorMessage(e.message);
        setSuccessMessage('');
      },
    }
  );

  const [updateFlags] = useMutation(UpdateCommandFlagsDocument, {
    onError: e => {
      setFormError(e.message);
      setErrorMessage(e.message);
      setSuccessMessage('');
    },
  });

  const rows = useMemo(
    () => (data?.commands ?? []).filter(c => matchesQuery(c, searchQuery)),
    [data, searchQuery]
  );

  const openEdit = (row: CommandRow) => {
    setEditing(row);
    setFormData({
      helpSummary: row.helpSummary ?? '',
      helpText: row.helpText ?? '',
    });
    setFlagsData(flagsOf(row));
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const problem = validateHelpForm(formData);
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError('');
    // Flags are mechanics: only a coder may change them, and a builder's save
    // never sends them (the API enforces the same).
    if (isCoder && flagsChanged(flagsOf(editing), flagsData)) {
      const res = await updateFlags({
        variables: { name: editing.name, ...flagsData },
      });
      if (!res?.data) return;
    }
    await updateHelp({
      variables: { name: editing.name, ...toMutationVars(formData) },
    });
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
            Error loading commands: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-foreground mb-2'>Commands</h1>
        <p className='text-muted-foreground'>
          In-game <code>help &lt;command&gt;</code> text for{' '}
          {data?.commands.length ?? 0} commands. Leave a field empty to use the
          game&apos;s built-in default. The game picks up changes on restart,
          not instantly.
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
          placeholder='Search by name, alias or summary...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='max-w-sm'
        />
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Summary</TableHead>
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
                  No commands found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => (
                <TableRow key={row.name}>
                  <TableCell className='font-mono text-xs'>
                    {row.name}
                    {row.aliases.length > 0 && (
                      <span className='ml-2 text-muted-foreground'>
                        ({row.aliases.join(', ')})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant='secondary'>{row.category}</Badge>
                  </TableCell>
                  <TableCell className='max-w-md truncate'>
                    {row.helpSummary || (
                      <span className='text-muted-foreground italic'>
                        built-in default
                      </span>
                    )}
                  </TableCell>
                  {canEdit && (
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='sm'
                        aria-label={`Edit ${row.name}`}
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className='sm:max-w-[640px] max-h-[90vh] overflow-y-auto'>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit help: {editing?.name}</DialogTitle>
              <DialogDescription>
                Empty fields fall back to the game&apos;s built-in text. The
                game picks up changes on restart.
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
                <Label htmlFor='cmd-summary'>Summary</Label>
                <Input
                  id='cmd-summary'
                  value={formData.helpSummary}
                  onChange={e =>
                    setFormData({ ...formData, helpSummary: e.target.value })
                  }
                  placeholder='One line shown under the command name'
                />
                <p
                  className={
                    formData.helpSummary.trim().length > SUMMARY_MAX
                      ? 'text-xs text-destructive'
                      : 'text-xs text-muted-foreground'
                  }
                >
                  Single line, up to {SUMMARY_MAX} characters (
                  {formData.helpSummary.trim().length} used).
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='cmd-text'>Help text</Label>
                <Textarea
                  id='cmd-text'
                  value={formData.helpText}
                  onChange={e =>
                    setFormData({ ...formData, helpText: e.target.value })
                  }
                  rows={10}
                  className='font-mono text-sm'
                  placeholder='Longer description shown after the usage line'
                />
                <p className='text-xs text-muted-foreground'>
                  Up to {TEXT_MAX} characters ({formData.helpText.trim().length}{' '}
                  used). Line breaks are kept.
                </p>
              </div>

              <fieldset className='space-y-2 rounded-md border p-3'>
                <legend className='px-1 text-sm font-medium'>
                  Policy flags
                </legend>
                <p className='text-xs text-muted-foreground'>
                  Game mechanics, not text.{' '}
                  {isCoder
                    ? 'Changes apply on the next game restart.'
                    : 'Only coders can change these.'}
                </p>
                {FLAG_FIELDS.map(f => (
                  <div key={f.key} className='flex items-start gap-2'>
                    <Checkbox
                      id={`cmd-flag-${f.key}`}
                      checked={flagsData[f.key]}
                      disabled={!isCoder}
                      onCheckedChange={v =>
                        setFlagsData({ ...flagsData, [f.key]: v === true })
                      }
                    />
                    <div className='grid gap-0.5 leading-none'>
                      <Label htmlFor={`cmd-flag-${f.key}`}>{f.label}</Label>
                      <p className='text-xs text-muted-foreground'>{f.hint}</p>
                    </div>
                  </div>
                ))}
              </fieldset>
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
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
