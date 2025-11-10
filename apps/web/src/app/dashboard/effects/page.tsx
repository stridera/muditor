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
  GetEffectQuery,
  GetEffectQueryVariables,
  GetEffectsCountDocument,
  GetEffectsCountQuery,
  GetEffectsCountQueryVariables,
  GetEffectDocument,
  GetEffectsDocument,
  GetEffectsQuery,
  GetEffectsQueryVariables,
  type Effect,
} from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  Loader2,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type EffectSummary = Pick<
  Effect,
  'id' | 'name' | 'effectType' | 'description' | 'defaultParams'
>;

export default function EffectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [viewingEffectId, setViewingEffectId] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, loading, error } = useQuery<
    GetEffectsQuery,
    GetEffectsQueryVariables
  >(GetEffectsDocument, {
    variables: {
      skip: page * pageSize,
      take: pageSize,
      search: debouncedSearchTerm || undefined,
    },
  });

  const { data: countData } = useQuery<
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

  const effects = (data?.effects || []) as EffectSummary[];
  const totalCount = countData?.effectsCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const getEffectTypeCategory = (effectType: string) => {
    if (effectType.startsWith('apply_status_eff_')) {
      return 'Status Effect';
    } else if (effectType.startsWith('apply_modifier_')) {
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
    // Clean up the effect type for display
    return effectType
      .replace('apply_status_eff_', '')
      .replace('apply_modifier_', 'Mod: ')
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

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Effects</h1>
          <p className='text-muted-foreground'>
            Browse all available effects and their parameters
          </p>
        </div>
        <Badge variant='secondary' className='text-lg px-4 py-2'>
          {totalCount} effects
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5' />
            Effects Database
          </CardTitle>
          <CardDescription>
            View all effects available in the game and their configurations
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
                      <TableHead>Effect Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Parameters</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {effects.map(effect => (
                      <TableRow
                        key={effect.id}
                        className='cursor-pointer hover:bg-muted/50'
                        onClick={() => setViewingEffectId(effect.id)}
                      >
                        <TableCell className='font-medium font-mono text-sm'>
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
                          {effect.description || (
                            <span className='text-muted-foreground italic'>
                              No description
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
                    <span className='text-sm text-muted-foreground'>Per page:</span>
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
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    title='Next page'
                  >
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 10))}
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
                  {formatEffectType(effectDetailsData.effect.effectType)}
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

                {/* Parameters */}
                <div>
                  <Label className='text-sm font-semibold'>
                    Default Parameters
                  </Label>
                  {formatParams(effectDetailsData.effect.defaultParams) ? (
                    <div className='mt-2 p-3 bg-muted rounded-lg'>
                      {formatParams(effectDetailsData.effect.defaultParams)}
                    </div>
                  ) : (
                    <p className='text-sm text-muted-foreground italic mt-1'>
                      No default parameters
                    </p>
                  )}
                </div>

                {/* JSON View */}
                <div>
                  <Label className='text-sm font-semibold'>Raw JSON</Label>
                  <pre className='mt-2 p-3 bg-muted rounded-lg text-xs overflow-x-auto'>
                    {JSON.stringify(effectDetailsData.effect.defaultParams, null, 2)}
                  </pre>
                </div>

                {/* Info Box */}
                <Alert>
                  <Info className='h-4 w-4' />
                  <AlertDescription className='text-sm'>
                    Effects can be attached to abilities with custom parameters. The
                    parameters shown here are the default values that will be used if
                    no override is specified.
                  </AlertDescription>
                </Alert>
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
    </div>
  );
}
