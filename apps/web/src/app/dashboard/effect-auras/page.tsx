'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import {
  CreateEffectAuraDocument,
  DeleteEffectAuraDocument,
  GetEffectAurasDocument,
  UpdateEffectAuraDocument,
  type GetEffectAurasQuery,
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

type EffectAura = GetEffectAurasQuery['effectAuras'][number];

type AuraFormData = {
  slug: string;
  keys: string;
  text: string;
  needsDetectMagic: boolean;
  exclusiveGroup: string;
  minAlignment: string;
  maxAlignment: string;
  sortOrder: string;
};

const defaultFormData: AuraFormData = {
  slug: '',
  keys: '',
  text: '',
  needsDetectMagic: false,
  exclusiveGroup: '',
  minAlignment: '',
  maxAlignment: '',
  sortOrder: '0',
};

function parseKeys(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(',')
        .map(k => k.trim())
        .filter(k => k !== '')
    ),
  ];
}

function parseOptionalInt(raw: string): number | null {
  const t = raw.trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isInteger(n) ? n : Number.NaN;
}

/** Returns an error message, or null when the form is valid. */
function validate(form: AuraFormData): string | null {
  if (!form.slug.trim()) return 'Slug is required';
  if (parseKeys(form.keys).length === 0) return 'At least one key is required';
  if (!form.text.trim()) return 'Text is required';
  const min = parseOptionalInt(form.minAlignment);
  const max = parseOptionalInt(form.maxAlignment);
  const sort = parseOptionalInt(form.sortOrder);
  if (Number.isNaN(min) || Number.isNaN(max) || Number.isNaN(sort)) {
    return 'Alignment bounds and sort order must be whole numbers';
  }
  if (min !== null && max !== null && min > max) {
    return 'Min alignment must be less than or equal to max alignment';
  }
  return null;
}

function alignmentLabel(a: EffectAura): string {
  if (a.minAlignment == null && a.maxAlignment == null) return 'Any';
  return `${a.minAlignment ?? '-inf'} to ${a.maxAlignment ?? '+inf'}`;
}

export default function EffectAurasPage() {
  const { isBuilder } = usePermissions();
  const canEdit = isBuilder;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<EffectAura | null>(null);
  const [deleting, setDeleting] = useState<EffectAura | null>(null);
  const [formData, setFormData] = useState<AuraFormData>(defaultFormData);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading, error, refetch } = useQuery(GetEffectAurasDocument, {
    fetchPolicy: 'cache-and-network',
  });

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

  const [createAura, { loading: creating }] = useMutation(
    CreateEffectAuraDocument,
    {
      onCompleted: () => onSaved('Effect aura created'),
      onError: e => onFailed(e.message),
    }
  );
  const [updateAura, { loading: updating }] = useMutation(
    UpdateEffectAuraDocument,
    {
      onCompleted: () => onSaved('Effect aura updated'),
      onError: e => onFailed(e.message),
    }
  );
  const [deleteAura, { loading: deletingNow }] = useMutation(
    DeleteEffectAuraDocument,
    {
      onCompleted: () => {
        setIsDeleteOpen(false);
        setDeleting(null);
        onSaved('Effect aura deleted');
      },
      onError: e => {
        setIsDeleteOpen(false);
        setErrorMessage(e.message);
        setSuccessMessage('');
      },
    }
  );

  const auras = useMemo(() => {
    const all = data?.effectAuras ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      a =>
        a.slug.toLowerCase().includes(q) ||
        a.text.toLowerCase().includes(q) ||
        a.keys.some(k => k.toLowerCase().includes(q))
    );
  }, [data, searchQuery]);

  const openCreate = () => {
    setEditing(null);
    setFormData(defaultFormData);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (aura: EffectAura) => {
    setEditing(aura);
    setFormData({
      slug: aura.slug,
      keys: aura.keys.join(', '),
      text: aura.text,
      needsDetectMagic: aura.needsDetectMagic,
      exclusiveGroup: aura.exclusiveGroup ?? '',
      minAlignment: aura.minAlignment?.toString() ?? '',
      maxAlignment: aura.maxAlignment?.toString() ?? '',
      sortOrder: aura.sortOrder.toString(),
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
      slug: formData.slug.trim(),
      keys: parseKeys(formData.keys),
      text: formData.text.trim(),
      needsDetectMagic: formData.needsDetectMagic,
      exclusiveGroup: formData.exclusiveGroup.trim() || null,
      minAlignment: parseOptionalInt(formData.minAlignment),
      maxAlignment: parseOptionalInt(formData.maxAlignment),
      sortOrder: parseOptionalInt(formData.sortOrder) ?? 0,
    };
    if (editing) {
      await updateAura({ variables: { id: editing.id, data: payload } });
    } else {
      await createAura({ variables: { data: payload } });
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
            Error loading effect auras: {error.message}
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
          Effect Auras
        </h1>
        <p className='text-muted-foreground'>
          Flavor lines shown when a player looks at someone affected by a
          matching effect - {data?.effectAuras.length ?? 0} total. Lines are
          shown in sort order; auras sharing an exclusive group only show the
          first match. The game picks up changes on reload/restart, not
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
          placeholder='Search by slug, key or text...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='max-w-sm'
        />
        {canEdit && (
          <Button onClick={openCreate}>
            <Plus className='h-4 w-4 mr-2' />
            New Aura
          </Button>
        )}
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-16'>Sort</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Keys</TableHead>
              <TableHead>Text</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Alignment</TableHead>
              {canEdit && <TableHead className='text-right'>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {auras.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 7 : 6}
                  className='text-center text-muted-foreground py-8'
                >
                  No effect auras found.
                </TableCell>
              </TableRow>
            ) : (
              auras.map(aura => (
                <TableRow key={aura.id}>
                  <TableCell>{aura.sortOrder}</TableCell>
                  <TableCell className='font-mono text-xs'>
                    {aura.slug}
                  </TableCell>
                  <TableCell className='font-mono text-xs'>
                    {aura.keys.join(', ')}
                  </TableCell>
                  <TableCell className='max-w-md truncate'>
                    {aura.text}
                  </TableCell>
                  <TableCell className='space-x-1'>
                    {aura.needsDetectMagic && (
                      <Badge variant='outline'>detect magic</Badge>
                    )}
                    {aura.exclusiveGroup && (
                      <Badge variant='secondary'>{aura.exclusiveGroup}</Badge>
                    )}
                  </TableCell>
                  <TableCell>{alignmentLabel(aura)}</TableCell>
                  {canEdit && (
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openEdit(aura)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setDeleting(aura);
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
                {editing ? `Edit Aura: ${editing.slug}` : 'New Effect Aura'}
              </DialogTitle>
              <DialogDescription>
                Changes are saved to the database. The game picks them up on
                reload/restart.
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
                <Label htmlFor='aura-slug'>Slug</Label>
                <Input
                  id='aura-slug'
                  value={formData.slug}
                  onChange={e =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder='sanctuary'
                  className='font-mono'
                />
                <p className='text-xs text-muted-foreground'>
                  Unique. Lowercase letters, digits, hyphens or underscores.
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='aura-keys'>Keys</Label>
                <Input
                  id='aura-keys'
                  value={formData.keys}
                  onChange={e =>
                    setFormData({ ...formData, keys: e.target.value })
                  }
                  placeholder='sanctuary, holy_aura'
                  className='font-mono'
                />
                <p className='text-xs text-muted-foreground'>
                  Comma-separated effect keys that trigger this line. At least
                  one required.
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='aura-text'>Text</Label>
                <Textarea
                  id='aura-text'
                  value={formData.text}
                  onChange={e =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className='flex items-center gap-2'>
                <Checkbox
                  id='aura-detect'
                  checked={formData.needsDetectMagic}
                  onCheckedChange={checked =>
                    setFormData({
                      ...formData,
                      needsDetectMagic: checked === true,
                    })
                  }
                />
                <Label htmlFor='aura-detect'>
                  Only visible with detect magic
                </Label>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='aura-group'>Exclusive group</Label>
                  <Input
                    id='aura-group'
                    value={formData.exclusiveGroup}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        exclusiveGroup: e.target.value,
                      })
                    }
                    placeholder='(none)'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='aura-sort'>Sort order</Label>
                  <Input
                    id='aura-sort'
                    type='number'
                    value={formData.sortOrder}
                    onChange={e =>
                      setFormData({ ...formData, sortOrder: e.target.value })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='aura-min'>Min alignment</Label>
                  <Input
                    id='aura-min'
                    type='number'
                    value={formData.minAlignment}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        minAlignment: e.target.value,
                      })
                    }
                    placeholder='(any)'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='aura-max'>Max alignment</Label>
                  <Input
                    id='aura-max'
                    type='number'
                    value={formData.maxAlignment}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        maxAlignment: e.target.value,
                      })
                    }
                    placeholder='(any)'
                  />
                </div>
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
              Delete Effect Aura
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the aura &quot;{deleting?.slug}
              &quot;? This action cannot be undone.
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
                deleting && deleteAura({ variables: { id: deleting.id } })
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
