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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreateCreationRecipeDocument,
  DeleteCreationRecipeDocument,
  GetAllAbilitiesDocument,
  GetClassesDocument,
  GetCreationRecipesDocument,
  UpdateCreationRecipeDocument,
  type GetCreationRecipesQuery,
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

type Recipe = GetCreationRecipesQuery['creationRecipes'][number];

type FormData = {
  abilityId: string;
  keyword: string;
  classId: string;
  objectZoneId: string;
  objectId: string;
};

const ANY_CLASS = 'any';

const defaultFormData: FormData = {
  abilityId: '',
  keyword: '',
  classId: ANY_CLASS,
  objectZoneId: '',
  objectId: '',
};

/** Parses a non-negative whole number; blank is null, junk is NaN. */
function parseOptionalCount(raw: string): number | null {
  const t = raw.trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isInteger(n) && n >= 0 ? n : Number.NaN;
}

/** Returns an error message, or null when the form is valid. */
function validate(form: FormData): string | null {
  if (!form.abilityId) return 'Ability is required';
  if (/\s/.test(form.keyword.trim())) {
    return 'Keyword must be a single word with no spaces';
  }
  const zone = parseOptionalCount(form.objectZoneId);
  if (zone === null || Number.isNaN(zone)) {
    return 'Object zone is required and must be a whole number';
  }
  if (Number.isNaN(parseOptionalCount(form.objectId))) {
    return 'Object id must be a whole number';
  }
  return null;
}

function objectLabel(r: Recipe): string {
  return r.objectId == null
    ? `any FOOD in zone ${r.objectZoneId}`
    : `${r.objectZoneId}:${r.objectId}`;
}

export default function CreationRecipesPage() {
  const { isBuilder } = usePermissions();
  const canEdit = isBuilder;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [deleting, setDeleting] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading, error, refetch } = useQuery(
    GetCreationRecipesDocument,
    { fetchPolicy: 'cache-and-network' }
  );
  const { data: abilitiesData } = useQuery(GetAllAbilitiesDocument, {
    variables: { abilityType: 'SPELL' },
  });
  const { data: classesData } = useQuery(GetClassesDocument);

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
    CreateCreationRecipeDocument,
    {
      onCompleted: () => onSaved('Creation recipe created'),
      onError: e => onFailed(e.message),
    }
  );
  const [updateValue, { loading: updating }] = useMutation(
    UpdateCreationRecipeDocument,
    {
      onCompleted: () => onSaved('Creation recipe updated'),
      onError: e => onFailed(e.message),
    }
  );
  const [deleteValue, { loading: deletingNow }] = useMutation(
    DeleteCreationRecipeDocument,
    {
      onCompleted: () => {
        setIsDeleteOpen(false);
        setDeleting(null);
        onSaved('Creation recipe deleted');
      },
      onError: e => {
        setIsDeleteOpen(false);
        setErrorMessage(e.message);
        setSuccessMessage('');
      },
    }
  );

  const rows = useMemo(() => {
    const all = data?.creationRecipes ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      r =>
        r.ability.name.toLowerCase().includes(q) ||
        (r.keyword ?? '').toLowerCase().includes(q) ||
        (r.characterClass?.plainName ?? '').toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const openCreate = () => {
    setEditing(null);
    setFormData(defaultFormData);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (row: Recipe) => {
    setEditing(row);
    setFormData({
      abilityId: row.abilityId.toString(),
      keyword: row.keyword ?? '',
      classId: row.classId?.toString() ?? ANY_CLASS,
      objectZoneId: row.objectZoneId.toString(),
      objectId: row.objectId?.toString() ?? '',
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
      abilityId: Number(formData.abilityId),
      keyword: formData.keyword.trim() || null,
      classId: formData.classId === ANY_CLASS ? null : Number(formData.classId),
      objectZoneId: parseOptionalCount(formData.objectZoneId) ?? 0,
      objectId: parseOptionalCount(formData.objectId),
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
            Error loading creation recipes: {error.message}
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
          Creation Recipes
        </h1>
        <p className='text-muted-foreground'>
          What creation spells (Minor Creation, Create Food, ...) conjure -{' '}
          {data?.creationRecipes.length ?? 0} total. The keyword is the word the
          caster types, matched as an abbreviation in id order. A class limits a
          row to that caster class; without one it is the default for every
          other class. Without an object id the spell makes any FOOD object in
          the zone. The game picks up changes on restart, not instantly.
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
          placeholder='Search by ability, keyword or class...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='max-w-sm'
        />
        {canEdit && (
          <Button onClick={openCreate}>
            <Plus className='h-4 w-4 mr-2' />
            New Recipe
          </Button>
        )}
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ability</TableHead>
              <TableHead>Keyword</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Object (zone:id)</TableHead>
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
                  No creation recipes found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.ability.name}</TableCell>
                  <TableCell className='font-mono text-xs'>
                    {row.keyword ?? '-'}
                  </TableCell>
                  <TableCell>
                    {row.characterClass?.plainName ?? 'Any other class'}
                  </TableCell>
                  <TableCell className='font-mono text-xs'>
                    {objectLabel(row)}
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
                  ? `Edit Recipe: ${editing.ability.name}`
                  : 'New Creation Recipe'}
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
                <Label htmlFor='rec-ability'>Ability</Label>
                <Select
                  value={formData.abilityId}
                  onValueChange={value =>
                    setFormData({ ...formData, abilityId: value })
                  }
                >
                  <SelectTrigger id='rec-ability'>
                    <SelectValue placeholder='Select a spell' />
                  </SelectTrigger>
                  <SelectContent>
                    {(abilitiesData?.abilities ?? []).map(a => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='rec-keyword'>Keyword</Label>
                <Input
                  id='rec-keyword'
                  value={formData.keyword}
                  onChange={e =>
                    setFormData({ ...formData, keyword: e.target.value })
                  }
                  placeholder='(none)'
                  className='font-mono'
                />
                <p className='text-xs text-muted-foreground'>
                  Optional single word (e.g. dagger). Leave blank for spells
                  that take no word. The ability, keyword and class together
                  must be unique.
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='rec-class'>Class</Label>
                <Select
                  value={formData.classId}
                  onValueChange={value =>
                    setFormData({ ...formData, classId: value })
                  }
                >
                  <SelectTrigger id='rec-class'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY_CLASS}>
                      Any other class (default)
                    </SelectItem>
                    {(classesData?.classes ?? []).map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.plainName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='rec-zone'>Object zone</Label>
                  <Input
                    id='rec-zone'
                    type='number'
                    min={0}
                    value={formData.objectZoneId}
                    onChange={e =>
                      setFormData({ ...formData, objectZoneId: e.target.value })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='rec-object'>Object id</Label>
                  <Input
                    id='rec-object'
                    type='number'
                    min={0}
                    value={formData.objectId}
                    onChange={e =>
                      setFormData({ ...formData, objectId: e.target.value })
                    }
                    placeholder='(any FOOD)'
                  />
                </div>
              </div>
              <p className='text-xs text-muted-foreground'>
                The object is not checked against the world: a missing object is
                logged by the game when the spell is cast.
              </p>
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
              Delete Creation Recipe
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recipe for &quot;
              {deleting?.ability.name}&quot;? This action cannot be undone.
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
