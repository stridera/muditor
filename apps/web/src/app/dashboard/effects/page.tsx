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
import { Textarea } from '@/components/ui/textarea';
import type {
  Effect,
  GetEffectQuery,
  GetEffectQueryVariables,
  GetEffectsCountQuery,
  GetEffectsCountQueryVariables,
  GetEffectsQuery,
  GetEffectsQueryVariables,
} from '@/generated/graphql';
import {
  CreateEffectDocument,
  DeleteEffectDocument,
  GetEffectDocument,
  GetEffectsCountDocument,
  GetEffectsDocument,
  UpdateEffectDocument,
} from '@/generated/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type EffectSummary = Pick<
  Effect,
  | 'id'
  | 'name'
  | 'effectType'
  | 'description'
  | 'tags'
  | 'defaultParams'
  | 'paramSchema'
>;

interface EffectFormData {
  name: string;
  effectType: string;
  description: string;
  tags: string;
  defaultParams: string;
  paramSchema: string;
}

const emptyFormData: EffectFormData = {
  name: '',
  effectType: '',
  description: '',
  tags: '',
  defaultParams: '{}',
  paramSchema: '',
};

export default function EffectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [viewingEffectId, setViewingEffectId] = useState<string | null>(null);
  const [editingEffect, setEditingEffect] = useState<EffectSummary | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [deletingEffect, setDeletingEffect] = useState<EffectSummary | null>(
    null
  );
  const [formData, setFormData] = useState<EffectFormData>(emptyFormData);
  const [formError, setFormError] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, loading, error, refetch } = useQuery<
    GetEffectsQuery,
    GetEffectsQueryVariables
  >(GetEffectsDocument, {
    variables: {
      skip: page * pageSize,
      take: pageSize,
      search: debouncedSearchTerm || undefined,
    },
  });

  const { data: countData, refetch: refetchCount } = useQuery<
    GetEffectsCountQuery,
    GetEffectsCountQueryVariables
  >(GetEffectsCountDocument, {
    variables: {
      search: debouncedSearchTerm || undefined,
    },
  });

  const { data: effectDetailsData, loading: loadingDetails } = useQuery<
    GetEffectQuery,
    GetEffectQueryVariables
  >(GetEffectDocument, {
    variables: { id: viewingEffectId! },
    skip: !viewingEffectId,
  });

  const [createEffect, { loading: creating }] = useMutation(
    CreateEffectDocument,
    {
      onCompleted: () => {
        setIsCreating(false);
        setFormData(emptyFormData);
        setFormError(null);
        refetch();
        refetchCount();
      },
      onError: err => {
        setFormError(err.message);
      },
    }
  );

  const [updateEffect, { loading: updating }] = useMutation(
    UpdateEffectDocument,
    {
      onCompleted: () => {
        setEditingEffect(null);
        setFormData(emptyFormData);
        setFormError(null);
        refetch();
      },
      onError: err => {
        setFormError(err.message);
      },
    }
  );

  const [deleteEffect, { loading: deleting }] = useMutation(
    DeleteEffectDocument,
    {
      onCompleted: () => {
        setDeletingEffect(null);
        refetch();
        refetchCount();
      },
      onError: err => {
        setFormError(err.message);
      },
    }
  );

  const effects = (data?.effects || []) as EffectSummary[];
  const totalCount = countData?.effectsCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const getEffectTypeCategory = (effectType: string) => {
    if (effectType.startsWith('apply_status_eff_')) {
      return 'Status Effect';
    } else if (effectType.includes('_mod')) {
      return 'Stat Modifier';
    } else if (effectType.includes('damage')) {
      return 'Damage';
    } else if (effectType.includes('heal')) {
      return 'Healing';
    }
    return 'Other';
  };

  const getEffectTypeColor = (effectType: string) => {
    const category = getEffectTypeCategory(effectType);
    switch (category) {
      case 'Status Effect':
        return 'bg-purple-100 text-purple-700';
      case 'Stat Modifier':
        return 'bg-blue-100 text-blue-700';
      case 'Damage':
        return 'bg-red-100 text-red-700';
      case 'Healing':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatEffectType = (effectType: string) => {
    return effectType
      .replace('apply_status_eff_', '')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatParams = (params: any) => {
    if (!params || Object.keys(params).length === 0) {
      return null;
    }

    const entries = Object.entries(params).filter(
      ([key, value]) => value !== '' && value !== null
    );

    if (entries.length === 0) return null;

    return (
      <div className='space-y-1'>
        {entries.map(([key, value]) => (
          <div key={key} className='text-sm'>
            <span className='font-medium text-muted-foreground'>{key}:</span>{' '}
            <span className='font-mono'>{String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const openCreateDialog = () => {
    setFormData(emptyFormData);
    setFormError(null);
    setIsCreating(true);
  };

  const openEditDialog = (effect: EffectSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({
      name: effect.name || '',
      effectType: effect.effectType || '',
      description: effect.description || '',
      tags: (effect.tags || []).join(', '),
      defaultParams: JSON.stringify(effect.defaultParams || {}, null, 2),
      paramSchema: effect.paramSchema
        ? JSON.stringify(effect.paramSchema, null, 2)
        : '',
    });
    setFormError(null);
    setEditingEffect(effect);
  };

  const openDeleteDialog = (effect: EffectSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingEffect(effect);
  };

  const handleSubmit = () => {
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!formData.effectType.trim()) {
      setFormError('Effect type is required');
      return;
    }

    let parsedDefaultParams: any = {};
    let parsedParamSchema: any = null;

    try {
      if (formData.defaultParams.trim()) {
        parsedDefaultParams = JSON.parse(formData.defaultParams);
      }
    } catch (e) {
      setFormError('Default parameters must be valid JSON');
      return;
    }

    try {
      if (formData.paramSchema.trim()) {
        parsedParamSchema = JSON.parse(formData.paramSchema);
      }
    } catch (e) {
      setFormError('Parameter schema must be valid JSON');
      return;
    }

    const tags = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (editingEffect) {
      updateEffect({
        variables: {
          id: editingEffect.id,
          data: {
            name: formData.name.trim(),
            effectType: formData.effectType.trim(),
            description: formData.description.trim() || null,
            tags,
            defaultParams: parsedDefaultParams,
            paramSchema: parsedParamSchema,
          },
        },
      });
    } else {
      createEffect({
        variables: {
          data: {
            name: formData.name.trim(),
            effectType: formData.effectType.trim(),
            description: formData.description.trim() || undefined,
            tags,
            defaultParams: parsedDefaultParams,
            paramSchema: parsedParamSchema,
          },
        },
      });
    }
  };

  const handleDelete = () => {
    if (deletingEffect) {
      deleteEffect({ variables: { id: deletingEffect.id } });
    }
  };

  const isFormOpen = isCreating || editingEffect !== null;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Effects</h1>
          <p className='text-muted-foreground'>
            Manage all available effects and their parameters
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <Badge variant='secondary' className='text-lg px-4 py-2'>
            {totalCount} effects
          </Badge>
          <Button onClick={openCreateDialog}>
            <Plus className='h-4 w-4 mr-2' />
            New Effect
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5' />
            Effects Database
          </CardTitle>
          <CardDescription>
            View and manage all effects available in the game
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className='flex flex-col md:flex-row gap-4 mb-6'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search effects...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className='mb-4 text-sm text-muted-foreground'>
            Showing {effects.length} of {totalCount} total effects
            {debouncedSearchTerm && ' (filtered)'}
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
            </div>
          ) : error ? (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Error loading effects: {error.message}
              </AlertDescription>
            </Alert>
          ) : effects.length === 0 ? (
            <div className='text-center py-12 text-muted-foreground'>
              <Zap className='h-12 w-12 mx-auto mb-4 text-gray-300' />
              <p>No effects found matching your search</p>
            </div>
          ) : (
            <>
              {/* Effects Table */}
              <div className='border rounded-lg overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Effect Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Parameters</TableHead>
                      <TableHead className='w-24'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {effects.map(effect => (
                      <TableRow
                        key={effect.id}
                        className='cursor-pointer hover:bg-muted/50'
                        onClick={() => setViewingEffectId(effect.id)}
                      >
                        <TableCell className='font-medium'>
                          {effect.name}
                        </TableCell>
                        <TableCell className='font-mono text-sm'>
                          {formatEffectType(effect.effectType)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant='secondary'
                            className={getEffectTypeColor(effect.effectType)}
                          >
                            {getEffectTypeCategory(effect.effectType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {effect.tags && effect.tags.length > 0 ? (
                            <div className='flex gap-1 flex-wrap'>
                              {effect.tags.slice(0, 3).map(tag => (
                                <Badge
                                  key={tag}
                                  variant='outline'
                                  className='text-xs'
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {effect.tags.length > 3 && (
                                <Badge variant='outline' className='text-xs'>
                                  +{effect.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className='text-muted-foreground italic text-sm'>
                              None
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatParams(effect.defaultParams) || (
                            <span className='text-muted-foreground italic text-sm'>
                              None
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-1'>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={e => openEditDialog(effect, e)}
                              title='Edit effect'
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={e => openDeleteDialog(effect, e)}
                              title='Delete effect'
                              className='text-destructive hover:text-destructive'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4'>
                <div className='flex items-center gap-4'>
                  <div className='text-sm text-muted-foreground'>
                    Page {page + 1} of {totalPages} ({totalCount} total effects)
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>
                      Per page:
                    </span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={value => {
                        setPageSize(parseInt(value));
                        setPage(0);
                      }}
                    >
                      <SelectTrigger className='w-20 h-8'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='20'>20</SelectItem>
                        <SelectItem value='50'>50</SelectItem>
                        <SelectItem value='100'>100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    title='First page (1)'
                  >
                    <ChevronsLeft className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(p => Math.max(0, p - 10))}
                    disabled={page < 10}
                    title='Back 10 pages'
                  >
                    -10
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    title='Previous page'
                  >
                    <ChevronLeft className='h-4 w-4' />
                  </Button>

                  <div className='px-3 py-1 bg-muted rounded-md text-sm font-medium min-w-[60px] text-center'>
                    {page + 1}
                  </div>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setPage(p => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                    title='Next page'
                  >
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setPage(p => Math.min(totalPages - 1, p + 10))
                    }
                    disabled={page >= totalPages - 10}
                    title='Forward 10 pages'
                  >
                    +10
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                    title={`Last page (${totalPages})`}
                  >
                    <ChevronsRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Effect Details Dialog */}
      <Dialog
        open={!!viewingEffectId}
        onOpenChange={open => !open && setViewingEffectId(null)}
      >
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          {loadingDetails ? (
            <div className='flex items-center justify-center p-8'>
              <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
            </div>
          ) : effectDetailsData?.effect ? (
            <>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2'>
                  <Zap className='h-5 w-5' />
                  {effectDetailsData.effect.name}
                </DialogTitle>
                <Badge
                  variant='secondary'
                  className={`${getEffectTypeColor(
                    effectDetailsData.effect.effectType
                  )} w-fit`}
                >
                  {getEffectTypeCategory(effectDetailsData.effect.effectType)}
                </Badge>
              </DialogHeader>

              <div className='space-y-6'>
                {/* Description */}
                {effectDetailsData.effect.description && (
                  <div>
                    <Label className='text-sm font-semibold'>Description</Label>
                    <p className='text-sm text-muted-foreground mt-1'>
                      {effectDetailsData.effect.description}
                    </p>
                  </div>
                )}

                {/* Effect Type */}
                <div>
                  <Label className='text-sm font-semibold'>Effect Type</Label>
                  <p className='text-sm font-mono mt-1'>
                    {effectDetailsData.effect.effectType}
                  </p>
                </div>

                {/* Tags */}
                {effectDetailsData.effect.tags &&
                  effectDetailsData.effect.tags.length > 0 && (
                    <div>
                      <Label className='text-sm font-semibold'>Tags</Label>
                      <div className='flex gap-2 flex-wrap mt-2'>
                        {effectDetailsData.effect.tags.map(tag => (
                          <Badge key={tag} variant='outline'>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Parameters */}
                <div>
                  <Label className='text-sm font-semibold'>
                    Default Parameters
                  </Label>
                  <pre className='mt-2 p-3 bg-muted rounded-lg text-xs overflow-x-auto'>
                    {JSON.stringify(
                      effectDetailsData.effect.defaultParams,
                      null,
                      2
                    )}
                  </pre>
                </div>

                {/* Parameter Schema */}
                {effectDetailsData.effect.paramSchema && (
                  <div>
                    <Label className='text-sm font-semibold'>
                      Parameter Schema
                    </Label>
                    <pre className='mt-2 p-3 bg-muted rounded-lg text-xs overflow-x-auto'>
                      {JSON.stringify(
                        effectDetailsData.effect.paramSchema,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setViewingEffectId(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className='text-center p-8 text-muted-foreground'>
              Effect not found
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Effect Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={open => {
          if (!open) {
            setIsCreating(false);
            setEditingEffect(null);
            setFormError(null);
          }
        }}
      >
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {editingEffect ? 'Edit Effect' : 'Create New Effect'}
            </DialogTitle>
            <DialogDescription>
              {editingEffect
                ? 'Update the effect properties below.'
                : 'Fill in the details for the new effect.'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            {formError && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Name *</Label>
                <Input
                  id='name'
                  placeholder='e.g., ward_mod'
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='effectType'>Effect Type *</Label>
                <Input
                  id='effectType'
                  placeholder='e.g., ward_mod'
                  value={formData.effectType}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      effectType: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                placeholder='Describe what this effect does...'
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={2}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='tags'>Tags (comma-separated)</Label>
              <Input
                id='tags'
                placeholder='e.g., buff, defensive, magic'
                value={formData.tags}
                onChange={e =>
                  setFormData(prev => ({ ...prev, tags: e.target.value }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='defaultParams'>Default Parameters (JSON)</Label>
              <Textarea
                id='defaultParams'
                placeholder='{"amount": 10, "duration": 60}'
                value={formData.defaultParams}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    defaultParams: e.target.value,
                  }))
                }
                rows={4}
                className='font-mono text-sm'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='paramSchema'>
                Parameter Schema (JSON, optional)
              </Label>
              <Textarea
                id='paramSchema'
                placeholder='{"type": "object", "properties": {...}}'
                value={formData.paramSchema}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    paramSchema: e.target.value,
                  }))
                }
                rows={4}
                className='font-mono text-sm'
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsCreating(false);
                setEditingEffect(null);
                setFormError(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={creating || updating}>
              {(creating || updating) && (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              )}
              {editingEffect ? 'Save Changes' : 'Create Effect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingEffect}
        onOpenChange={open => !open && setDeletingEffect(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Effect</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the effect &quot;
              {deletingEffect?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeletingEffect(null)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
