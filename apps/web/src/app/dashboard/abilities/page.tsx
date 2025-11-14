'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { TypeBadge } from '@/components/ui/type-badge';
import {
  CreateAbilityDocument,
  DeleteAbilityDocument,
  GetAbilitiesDocument,
  GetAbilityDetailsDocument,
  GetAbilitySchoolsDocument,
  UpdateAbilityDocument,
  type Ability,
  type AbilitySchool,
  type CreateAbilityInput,
  type CreateAbilityMutation,
  type CreateAbilityMutationVariables,
  type DeleteAbilityMutation,
  type DeleteAbilityMutationVariables,
  type GetAbilitiesQuery,
  type GetAbilitiesQueryVariables,
  type GetAbilityDetailsQuery,
  type GetAbilityDetailsQueryVariables,
  type GetAbilitySchoolsQuery,
  type GetAbilitySchoolsQueryVariables,
  type Position,
  type UpdateAbilityMutation,
  type UpdateAbilityMutationVariables,
} from '@/generated/graphql';
import { usePermissions } from '@/hooks/use-permissions';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Shield,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import { useEffect, useState, type FC } from 'react';

type AbilitySummary = Pick<
  Ability,
  | 'id'
  | 'name'
  | 'abilityType'
  | 'description'
  | 'minPosition'
  | 'violent'
  | 'castTimeRounds'
  | 'cooldownMs'
  | 'inCombatOnly'
  | 'isArea'
  | 'notes'
  | 'tags'
> & {
  school?: Pick<AbilitySchool, 'id' | 'name'> | null;
  effects?: Array<{
    effectId: string;
    effect: {
      id: string;
      name: string;
    };
  }> | null;
};

// Optional values must explicitly include undefined to satisfy exactOptionalPropertyTypes
interface AbilityFormData {
  name: string;
  abilityType: string;
  description: string;
  schoolId: number | undefined; // explicit undefined instead of optional property
  minPosition: Position;
  violent: boolean;
  castTimeRounds: number;
  cooldownMs: number;
  inCombatOnly: boolean;
  isArea: boolean;
  notes: string;
  tags: string[];
}

const ABILITY_TYPES = ['SPELL', 'SKILL', 'SONG', 'CHANT'];

const POSITIONS = ['PRONE', 'SITTING', 'KNEELING', 'STANDING', 'FLYING'];

// Icon mapping removed; TypeBadge handles visual differentiation.

export default function AbilitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [abilityTypeFilter, setAbilityTypeFilter] = useState('ALL');
  const [filterViolent, setFilterViolent] = useState('ALL');
  const [filterArea, setFilterArea] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingAbilityId, setViewingAbilityId] = useState<string | null>(null);
  const [editingAbility, setEditingAbility] = useState<AbilitySummary | null>(
    null
  );
  const [deleteAbility, setDeleteAbility] = useState<AbilitySummary | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { isCoder, isBuilder, isGod } = usePermissions();

  const canCreate = isCoder || isGod;
  const canEdit = isBuilder || isCoder || isGod;
  const canDelete = isBuilder || isCoder || isGod;

  const { data, loading, error, refetch } = useQuery<
    GetAbilitiesQuery,
    GetAbilitiesQueryVariables
  >(GetAbilitiesDocument, {
    variables: {
      skip: page * pageSize,
      take: pageSize,
      abilityType: abilityTypeFilter === 'ALL' ? undefined : abilityTypeFilter,
      search: debouncedSearchTerm || undefined,
    },
  });

  const { data: schoolsData } = useQuery<
    GetAbilitySchoolsQuery,
    GetAbilitySchoolsQueryVariables
  >(GetAbilitySchoolsDocument);

  const { data: abilityDetailsData, loading: loadingDetails } = useQuery<
    GetAbilityDetailsQuery,
    GetAbilityDetailsQueryVariables
  >(GetAbilityDetailsDocument, {
    variables: { id: viewingAbilityId! },
    skip: !viewingAbilityId,
  });

  const [createAbilityMutation, { loading: creating }] = useMutation<
    CreateAbilityMutation,
    CreateAbilityMutationVariables
  >(CreateAbilityDocument, {
    onCompleted: () => {
      setSuccessMessage('Ability created successfully');
      setErrorMessage('');
      setIsFormOpen(false);
      refetch();
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: error => {
      setErrorMessage(error.message);
      setSuccessMessage('');
    },
  });

  const [updateAbilityMutation, { loading: updating }] = useMutation<
    UpdateAbilityMutation,
    UpdateAbilityMutationVariables
  >(UpdateAbilityDocument, {
    onCompleted: () => {
      setSuccessMessage('Ability updated successfully');
      setErrorMessage('');
      setIsFormOpen(false);
      setEditingAbility(null);
      refetch();
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: error => {
      setErrorMessage(error.message);
      setSuccessMessage('');
    },
  });

  const [deleteAbilityMutation, { loading: deleting }] = useMutation<
    DeleteAbilityMutation,
    DeleteAbilityMutationVariables
  >(DeleteAbilityDocument, {
    onCompleted: () => {
      setSuccessMessage('Ability deleted successfully');
      setErrorMessage('');
      setDeleteAbility(null);
      refetch();
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: error => {
      setErrorMessage(error.message);
      setSuccessMessage('');
    },
  });

  const abilities = data?.abilities || [];
  const totalCount = data?.abilitiesCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const schools = schoolsData?.abilitySchools || [];

  // Filter abilities client-side for violent and area (server handles search and type)
  const filteredAbilities = abilities.filter(ability => {
    const matchesViolent =
      filterViolent === 'ALL' ||
      (filterViolent === 'VIOLENT' && ability.violent) ||
      (filterViolent === 'PEACEFUL' && !ability.violent);

    const matchesArea =
      filterArea === 'ALL' ||
      (filterArea === 'AREA' && ability.isArea) ||
      (filterArea === 'SINGLE' && !ability.isArea);

    return matchesViolent && matchesArea;
  });

  const handleCreate = () => {
    setEditingAbility(null);
    setIsFormOpen(true);
  };

  const handleView = (abilityId: string) => {
    setViewingAbilityId(abilityId);
  };

  const handleEdit = (ability: AbilitySummary) => {
    setEditingAbility(ability);
    setIsFormOpen(true);
  };

  const handleDelete = (ability: AbilitySummary) => {
    setDeleteAbility(ability);
  };

  const confirmDelete = () => {
    if (deleteAbility) {
      deleteAbilityMutation({ variables: { id: deleteAbility.id } });
    }
  };

  const handleSubmit = (formData: AbilityFormData) => {
    const data: CreateAbilityInput = {
      name: formData.name,
      abilityType: formData.abilityType,
      description: formData.description || undefined,
      schoolId: formData.schoolId || undefined,
      minPosition: formData.minPosition,
      violent: formData.violent,
      castTimeRounds: formData.castTimeRounds,
      cooldownMs: formData.cooldownMs,
      inCombatOnly: formData.inCombatOnly,
      isArea: formData.isArea,
      notes: formData.notes || undefined,
      tags: formData.tags,
    };

    if (editingAbility) {
      updateAbilityMutation({
        variables: {
          id: editingAbility.id,
          data,
        },
      });
    } else {
      createAbilityMutation({
        variables: {
          data,
        },
      });
    }
  };

  // getAbilityTypeIcon removed; TypeBadge provides type visualization.

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Abilities</h1>
          <p className='text-muted-foreground'>
            Manage spells, skills, songs, and chants
          </p>
        </div>
        <div className='flex items-center gap-2'>
          {canCreate && (
            <Button onClick={handleCreate}>
              <Plus className='h-4 w-4 mr-2' />
              New Ability
            </Button>
          )}
          <Badge variant='secondary' className='text-lg px-4 py-2'>
            {totalCount} abilities
          </Badge>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className='bg-green-50 border-green-200'>
          <CheckCircle className='h-4 w-4 text-green-600' />
          <AlertDescription className='text-green-800'>
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5' />
            Abilities Database
          </CardTitle>
          <CardDescription>
            {canEdit
              ? 'View, edit, and manage all abilities available in the game'
              : 'View all abilities available in the game'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className='flex flex-col md:flex-row gap-4 mb-6'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search abilities...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <Select
              value={abilityTypeFilter}
              onValueChange={setAbilityTypeFilter}
            >
              <SelectTrigger className='w-full md:w-[180px]'>
                <SelectValue placeholder='Ability Type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Types</SelectItem>
                {ABILITY_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterViolent} onValueChange={setFilterViolent}>
              <SelectTrigger className='w-full md:w-[180px]'>
                <SelectValue placeholder='Violent' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All</SelectItem>
                <SelectItem value='VIOLENT'>Violent</SelectItem>
                <SelectItem value='PEACEFUL'>Peaceful</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger className='w-full md:w-[180px]'>
                <SelectValue placeholder='Target' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Targets</SelectItem>
                <SelectItem value='AREA'>Area Effect</SelectItem>
                <SelectItem value='SINGLE'>Single Target</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className='mb-4 text-sm text-muted-foreground'>
            Showing {filteredAbilities.length} of {totalCount} total abilities
            {(debouncedSearchTerm ||
              abilityTypeFilter !== 'ALL' ||
              filterViolent !== 'ALL' ||
              filterArea !== 'ALL') &&
              ' (filtered)'}
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
            </div>
          ) : error ? (
            <div className='text-center py-12 text-red-600'>
              Error loading abilities: {error.message}
            </div>
          ) : filteredAbilities.length === 0 ? (
            <div className='text-center py-12 text-muted-foreground'>
              <BookOpen className='h-12 w-12 mx-auto mb-4 text-gray-300' />
              <p>No abilities found matching your filters</p>
            </div>
          ) : (
            <>
              {/* Abilities Table */}
              <div className='border rounded-lg overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Effects</TableHead>
                      <TableHead>Cast Time</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>Notes</TableHead>
                      {canEdit && (
                        <TableHead className='text-right'>Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAbilities.map(ability => {
                      return (
                        <TableRow
                          key={ability.id}
                          className='cursor-pointer hover:bg-muted/50'
                          onClick={() => handleView(ability.id)}
                        >
                          <TableCell className='font-medium'>
                            {ability.name}
                          </TableCell>
                          <TableCell>
                            <TypeBadge type={ability.abilityType} />
                          </TableCell>
                          <TableCell>
                            {ability.school?.name || (
                              <span className='text-muted-foreground italic text-sm'>
                                None
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {ability.effects && ability.effects.length > 0 ? (
                              <div className='flex flex-wrap gap-1'>
                                {ability.effects
                                  .slice(0, 2)
                                  .map(abilityEffect => (
                                    <Badge
                                      key={abilityEffect.effectId}
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      {abilityEffect.effect.name}
                                    </Badge>
                                  ))}
                                {ability.effects.length > 2 && (
                                  <Badge
                                    variant='secondary'
                                    className='text-xs'
                                  >
                                    +{ability.effects.length - 2} more
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
                            {ability.castTimeRounds}{' '}
                            {ability.castTimeRounds === 1 ? 'round' : 'rounds'}
                          </TableCell>
                          <TableCell>
                            <div className='flex flex-wrap gap-1'>
                              {ability.violent ? (
                                <Badge
                                  variant='destructive'
                                  className='text-xs bg-red-100 text-red-700'
                                >
                                  <Zap className='h-3 w-3 mr-1' />
                                  Violent
                                </Badge>
                              ) : (
                                <Badge
                                  variant='secondary'
                                  className='text-xs bg-blue-100 text-blue-700'
                                >
                                  <Shield className='h-3 w-3 mr-1' />
                                  Peaceful
                                </Badge>
                              )}
                              {ability.isArea && (
                                <Badge variant='outline' className='text-xs'>
                                  Area
                                </Badge>
                              )}
                              {ability.inCombatOnly && (
                                <Badge variant='outline' className='text-xs'>
                                  Combat
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className='max-w-md truncate'>
                            {ability.notes || (
                              <span className='text-muted-foreground italic'>
                                No notes
                              </span>
                            )}
                          </TableCell>
                          {canEdit && (
                            <TableCell className='text-right'>
                              <div className='flex justify-end gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleEdit(ability);
                                  }}
                                >
                                  <Pencil className='h-4 w-4' />
                                </Button>
                                {canDelete && (
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleDelete(ability);
                                    }}
                                  >
                                    <Trash2 className='h-4 w-4 text-red-600' />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4'>
                <div className='flex items-center gap-4'>
                  <div className='text-sm text-muted-foreground'>
                    Page {page + 1} of {totalPages} ({totalCount} total
                    abilities)
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>
                      Per page:
                    </span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={value => {
                        setPageSize(parseInt(value));
                        setPage(0); // Reset to first page when changing page size
                      }}
                    >
                      <SelectTrigger className='w-20 h-8'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='10'>10</SelectItem>
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

      {/* Ability Form Dialog */}
      <AbilityFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        ability={editingAbility}
        schools={schools}
        onSubmit={handleSubmit}
        loading={creating || updating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteAbility}
        onOpenChange={() => setDeleteAbility(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ability</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteAbility?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className='bg-red-600 hover:bg-red-700'
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ability Details View Dialog */}
      <Dialog
        open={!!viewingAbilityId}
        onOpenChange={open => !open && setViewingAbilityId(null)}
      >
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          {loadingDetails ? (
            <div className='flex items-center justify-center p-8'>
              <div className='text-muted-foreground'>
                Loading ability details...
              </div>
            </div>
          ) : abilityDetailsData?.ability ? (
            <>
              <DialogHeader>
                <DialogTitle className='flex items-center justify-between'>
                  <span>{abilityDetailsData.ability.name}</span>
                  <Badge variant='outline'>
                    {abilityDetailsData.ability.abilityType}
                  </Badge>
                </DialogTitle>
                {abilityDetailsData.ability.gameId && (
                  <div className='text-sm text-muted-foreground'>
                    Game ID: {abilityDetailsData.ability.gameId}
                  </div>
                )}
              </DialogHeader>

              <div className='space-y-6'>
                {/* Basic Information */}
                <div>
                  <h3 className='text-lg font-semibold mb-2'>
                    Basic Information
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                    {abilityDetailsData.ability.description && (
                      <div className='col-span-2'>
                        <Label>Description</Label>
                        <p className='text-sm text-muted-foreground mt-1'>
                          {abilityDetailsData.ability.description}
                        </p>
                      </div>
                    )}
                    {abilityDetailsData.ability.school && (
                      <div>
                        <Label>School</Label>
                        <p className='text-sm mt-1'>
                          {abilityDetailsData.ability.school.name}
                        </p>
                        {abilityDetailsData.ability.school.description && (
                          <p className='text-xs text-muted-foreground mt-1'>
                            {abilityDetailsData.ability.school.description}
                          </p>
                        )}
                      </div>
                    )}
                    <div>
                      <Label>Minimum Position</Label>
                      <p className='text-sm mt-1'>
                        {abilityDetailsData.ability.minPosition}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Combat Properties */}
                <div>
                  <h3 className='text-lg font-semibold mb-2'>
                    Combat Properties
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label>Cast Time</Label>
                      <p className='text-sm mt-1'>
                        {abilityDetailsData.ability.castTimeRounds} rounds
                      </p>
                    </div>
                    <div>
                      <Label>Cooldown</Label>
                      <p className='text-sm mt-1'>
                        {abilityDetailsData.ability.cooldownMs}ms
                      </p>
                    </div>
                    <div>
                      <Label>Violent</Label>
                      <p className='text-sm mt-1'>
                        {abilityDetailsData.ability.violent ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <Label>Area Effect</Label>
                      <p className='text-sm mt-1'>
                        {abilityDetailsData.ability.isArea ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <Label>In Combat Only</Label>
                      <p className='text-sm mt-1'>
                        {abilityDetailsData.ability.inCombatOnly ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Effects */}
                {abilityDetailsData.ability.effects &&
                  abilityDetailsData.ability.effects.length > 0 && (
                    <div>
                      <h3 className='text-lg font-semibold mb-2'>Effects</h3>
                      <div className='space-y-3'>
                        {abilityDetailsData.ability.effects
                          .sort((a, b) => a.order - b.order)
                          .map(effect => (
                            <div
                              key={effect.effectId}
                              className='border rounded-lg p-3'
                            >
                              <div className='flex items-center justify-between mb-2'>
                                <div className='font-medium'>
                                  {effect.effect.name}
                                </div>
                                <Badge variant='secondary'>
                                  Order: {effect.order}
                                </Badge>
                              </div>
                              {effect.effect.description && (
                                <p className='text-sm text-muted-foreground mb-2'>
                                  {effect.effect.description}
                                </p>
                              )}
                              <div className='grid grid-cols-3 gap-2 text-sm'>
                                <div>
                                  <span className='text-muted-foreground'>
                                    Type:
                                  </span>{' '}
                                  {effect.effect.effectType}
                                </div>
                                {effect.trigger && (
                                  <div>
                                    <span className='text-muted-foreground'>
                                      Trigger:
                                    </span>{' '}
                                    {effect.trigger}
                                  </div>
                                )}
                                <div>
                                  <span className='text-muted-foreground'>
                                    Chance:
                                  </span>{' '}
                                  {effect.chancePct}%
                                </div>
                                {effect.condition && (
                                  <div className='col-span-3'>
                                    <span className='text-muted-foreground'>
                                      Condition:
                                    </span>{' '}
                                    {effect.condition}
                                  </div>
                                )}
                                {effect.overrideParams && (
                                  <div className='col-span-3'>
                                    <span className='text-muted-foreground'>
                                      Parameters:
                                    </span>
                                    <pre className='text-xs mt-1'>
                                      {JSON.stringify(
                                        effect.overrideParams,
                                        null,
                                        2
                                      )}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Targeting */}
                {abilityDetailsData.ability.targeting && (
                  <div>
                    <h3 className='text-lg font-semibold mb-2'>Targeting</h3>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label>Target Scope</Label>
                        <p className='text-sm mt-1'>
                          {abilityDetailsData.ability.targeting.scope}
                        </p>
                      </div>
                      <div>
                        <Label>Max Targets</Label>
                        <p className='text-sm mt-1'>
                          {abilityDetailsData.ability.targeting.maxTargets}
                        </p>
                      </div>
                      <div>
                        <Label>Range</Label>
                        <p className='text-sm mt-1'>
                          {abilityDetailsData.ability.targeting.range}
                        </p>
                      </div>
                      <div>
                        <Label>Requires Line of Sight</Label>
                        <p className='text-sm mt-1'>
                          {abilityDetailsData.ability.targeting.requireLos
                            ? 'Yes'
                            : 'No'}
                        </p>
                      </div>
                      {abilityDetailsData.ability.targeting.scopePattern && (
                        <div className='col-span-2'>
                          <Label>Scope Pattern</Label>
                          <p className='text-sm mt-1'>
                            {abilityDetailsData.ability.targeting.scopePattern}
                          </p>
                        </div>
                      )}
                      {abilityDetailsData.ability.targeting.validTargets &&
                        abilityDetailsData.ability.targeting.validTargets
                          .length > 0 && (
                          <div className='col-span-2'>
                            <Label>Valid Targets</Label>
                            <div className='flex gap-2 mt-1'>
                              {abilityDetailsData.ability.targeting.validTargets.map(
                                target => (
                                  <Badge key={target} variant='outline'>
                                    {target}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Restrictions */}
                {abilityDetailsData.ability.restrictions &&
                  abilityDetailsData.ability.restrictions.requirements &&
                  abilityDetailsData.ability.restrictions.requirements.length >
                    0 && (
                    <div>
                      <h3 className='text-lg font-semibold mb-2'>
                        Restrictions
                      </h3>
                      <div className='space-y-2'>
                        {abilityDetailsData.ability.restrictions.requirements.map(
                          (req: unknown, idx: number) => (
                            <div key={idx} className='border rounded-lg p-3'>
                              <pre className='text-xs'>
                                {JSON.stringify(req, null, 2)}
                              </pre>
                            </div>
                          )
                        )}
                        {abilityDetailsData.ability.restrictions
                          .customRequirementLua && (
                          <div>
                            <Label>Custom Requirement (Lua)</Label>
                            <pre className='bg-muted p-3 rounded-lg text-xs overflow-x-auto mt-1'>
                              <code>
                                {
                                  abilityDetailsData.ability.restrictions
                                    .customRequirementLua
                                }
                              </code>
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Saving Throws */}
                {abilityDetailsData.ability.savingThrows &&
                  abilityDetailsData.ability.savingThrows.length > 0 && (
                    <div>
                      <h3 className='text-lg font-semibold mb-2'>
                        Saving Throws
                      </h3>
                      <div className='space-y-2'>
                        {abilityDetailsData.ability.savingThrows.map(save => (
                          <div key={save.id} className='border rounded-lg p-3'>
                            <div className='grid grid-cols-2 gap-4 text-sm'>
                              <div>
                                <span className='text-muted-foreground'>
                                  Type:
                                </span>{' '}
                                {save.saveType}
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  DC Formula:
                                </span>{' '}
                                {save.dcFormula}
                              </div>
                              {save.onSaveAction && (
                                <div className='col-span-2'>
                                  <span className='text-muted-foreground'>
                                    On Save:
                                  </span>
                                  <pre className='text-xs mt-1'>
                                    {JSON.stringify(save.onSaveAction, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Messages */}
                {abilityDetailsData.ability.messages && (
                  <div>
                    <h3 className='text-lg font-semibold mb-2'>Messages</h3>
                    <div className='space-y-2 text-sm'>
                      {abilityDetailsData.ability.messages.startToCaster && (
                        <div>
                          <Label className='text-xs'>Cast (Self)</Label>
                          <p className='text-muted-foreground'>
                            {abilityDetailsData.ability.messages.startToCaster}
                          </p>
                        </div>
                      )}
                      {abilityDetailsData.ability.messages.startToVictim && (
                        <div>
                          <Label className='text-xs'>Cast (Target)</Label>
                          <p className='text-muted-foreground'>
                            {abilityDetailsData.ability.messages.startToVictim}
                          </p>
                        </div>
                      )}
                      {abilityDetailsData.ability.messages.startToRoom && (
                        <div>
                          <Label className='text-xs'>Cast (Room)</Label>
                          <p className='text-muted-foreground'>
                            {abilityDetailsData.ability.messages.startToRoom}
                          </p>
                        </div>
                      )}
                      {abilityDetailsData.ability.messages.wearoffToTarget && (
                        <div>
                          <Label className='text-xs'>Wear Off</Label>
                          <p className='text-muted-foreground'>
                            {
                              abilityDetailsData.ability.messages
                                .wearoffToTarget
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Lua Script */}
                {abilityDetailsData.ability.luaScript && (
                  <div>
                    <h3 className='text-lg font-semibold mb-2'>Lua Script</h3>
                    <pre className='bg-muted p-3 rounded-lg text-xs overflow-x-auto'>
                      <code>{abilityDetailsData.ability.luaScript}</code>
                    </pre>
                  </div>
                )}

                {/* Tags and Notes */}
                <div className='grid grid-cols-2 gap-4'>
                  {abilityDetailsData.ability.tags &&
                    abilityDetailsData.ability.tags.length > 0 && (
                      <div>
                        <Label>Tags</Label>
                        <div className='flex flex-wrap gap-2 mt-1'>
                          {abilityDetailsData.ability.tags.map(tag => (
                            <Badge key={tag} variant='secondary'>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {abilityDetailsData.ability.notes && (
                    <div className='col-span-2'>
                      <Label>Notes</Label>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {abilityDetailsData.ability.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setViewingAbilityId(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setViewingAbilityId(null);
                    handleEdit(abilityDetailsData.ability as AbilitySummary);
                  }}
                >
                  Edit
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className='flex items-center justify-center p-8'>
              <div className='text-muted-foreground'>Ability not found</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface AbilityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ability: AbilitySummary | null;
  schools: readonly AbilitySchool[];
  onSubmit: (data: AbilityFormData) => void;
  loading: boolean;
}

const AbilityFormDialog: FC<AbilityFormDialogProps> = ({
  open,
  onOpenChange,
  ability,
  schools,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<AbilityFormData>({
    name: '',
    abilityType: 'SPELL',
    description: '',
    minPosition: 'STANDING',
    violent: false,
    castTimeRounds: 1,
    cooldownMs: 0,
    inCombatOnly: false,
    isArea: false,
    notes: '',
    tags: [],
    schoolId: undefined,
  });

  // Update form when ability changes
  useEffect(() => {
    if (ability) {
      setFormData(prev => ({
        ...prev,
        name: ability.name,
        abilityType: ability.abilityType,
        description: ability.description || '',
        schoolId: ability.school ? parseInt(ability.school.id) : undefined,
        minPosition: ability.minPosition,
        violent: ability.violent,
        castTimeRounds: ability.castTimeRounds,
        cooldownMs: ability.cooldownMs,
        inCombatOnly: ability.inCombatOnly,
        isArea: ability.isArea,
        notes: ability.notes || '',
        tags: (ability.tags as string[]) || [],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        name: '',
        abilityType: 'SPELL',
        description: '',
        schoolId: undefined,
        minPosition: 'STANDING',
        violent: false,
        castTimeRounds: 1,
        cooldownMs: 0,
        inCombatOnly: false,
        isArea: false,
        notes: '',
        tags: [],
      }));
    }
  }, [ability]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {ability ? 'Edit Ability' : 'Create New Ability'}
            </DialogTitle>
            <DialogDescription>
              {ability
                ? 'Update the ability details below'
                : 'Fill in the details to create a new ability'}
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Name *</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='e.g., Fireball'
                required
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='abilityType'>Type *</Label>
              <Select
                value={formData.abilityType}
                onValueChange={value =>
                  setFormData({ ...formData, abilityType: value })
                }
              >
                <SelectTrigger id='abilityType'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ABILITY_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Describe the ability...'
                rows={3}
              />
            </div>

            {(formData.abilityType === 'SPELL' ||
              formData.abilityType === 'CHANT') && (
              <div className='grid gap-2'>
                <Label htmlFor='schoolId'>School</Label>
                <Select
                  // Use sentinel 'NONE' instead of empty string to satisfy Radix requirement
                  value={
                    formData.schoolId != null
                      ? formData.schoolId.toString()
                      : 'NONE'
                  }
                  onValueChange={value =>
                    setFormData({
                      ...formData,
                      schoolId:
                        value === 'NONE' ? undefined : parseInt(value, 10),
                    })
                  }
                >
                  <SelectTrigger id='schoolId'>
                    <SelectValue placeholder='Select a school (optional)' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='NONE'>None</SelectItem>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='castTimeRounds'>Cast Time (rounds)</Label>
                <Input
                  id='castTimeRounds'
                  type='number'
                  value={formData.castTimeRounds}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      castTimeRounds: parseInt(e.target.value) || 1,
                    })
                  }
                  min={1}
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='cooldownMs'>Cooldown (ms)</Label>
                <Input
                  id='cooldownMs'
                  type='number'
                  value={formData.cooldownMs}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      cooldownMs: parseInt(e.target.value) || 0,
                    })
                  }
                  min={0}
                />
              </div>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='minPosition'>Minimum Position</Label>
              <Select
                value={formData.minPosition}
                onValueChange={value =>
                  setFormData({ ...formData, minPosition: value as Position })
                }
              >
                <SelectTrigger id='minPosition'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map(pos => (
                    <SelectItem key={pos} value={pos}>
                      {pos.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='violent'
                  checked={formData.violent}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, violent: checked })
                  }
                />
                <Label htmlFor='violent' className='cursor-pointer'>
                  Violent (damages targets)
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='isArea'
                  checked={formData.isArea}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, isArea: checked })
                  }
                />
                <Label htmlFor='isArea' className='cursor-pointer'>
                  Area Effect (affects multiple targets)
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='inCombatOnly'
                  checked={formData.inCombatOnly}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({
                      ...formData,
                      inCombatOnly: checked,
                    })
                  }
                />
                <Label htmlFor='inCombatOnly' className='cursor-pointer'>
                  Combat Only (can only be used in combat)
                </Label>
              </div>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='notes'>Notes</Label>
              <Textarea
                id='notes'
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder='Additional notes about the ability...'
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {ability ? 'Updating...' : 'Creating...'}
                </>
              ) : ability ? (
                'Update Ability'
              ) : (
                'Create Ability'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
