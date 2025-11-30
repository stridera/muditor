'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { FlagBadge } from '@/components/ui/flag-badge';
import { TypeBadge } from '@/components/ui/type-badge';
import { useZone } from '@/contexts/zone-context';
import {
  CreateObjectDocument,
  type CreateObjectInput,
  type CreateObjectMutation,
  type CreateObjectMutationVariables,
  DeleteObjectDocument,
  type DeleteObjectMutation,
  type DeleteObjectMutationVariables,
  DeleteObjectsDocument,
  type DeleteObjectsMutation,
  type DeleteObjectsMutationVariables,
  GetObjectDocument,
  type GetObjectQuery,
  type GetObjectQueryVariables,
  GetObjectsByZoneDocument,
  type GetObjectsByZoneQuery,
  type GetObjectsByZoneQueryVariables,
  GetObjectsDocument,
  type GetObjectsQuery,
  type GetObjectsQueryVariables,
  type ObjectDetailsFragment,
  type ObjectSummaryFragment,
} from '@/generated/graphql';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import {
  ArrowDown,
  ArrowUp,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Edit,
  Plus,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import EnhancedSearch, {
  type SearchFilters,
} from '../../../components/EnhancedSearch';
import {
  applySearchFilters,
  createObjectPresets,
  getUniqueValues,
} from '../../../lib/search-utils';

// Inline queries removed; using unified generated documents & fragments.

export default function ObjectsPage() {
  return (
    <PermissionGuard requireImmortal={true}>
      <ObjectsContent />
    </PermissionGuard>
  );
}

function ObjectsContent() {
  const apolloClient = useApolloClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const zoneParam = searchParams.get('zone');
  const idParam = searchParams.get('id');
  const { selectedZone, setSelectedZone } = useZone();

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: '',
  });
  const [selectedObjects, setSelectedObjects] = useState<Set<number>>(
    new Set()
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [cloningId, setCloningId] = useState<number | null>(null);
  const [expandedObjects, setExpandedObjects] = useState<Set<number>>(
    new Set()
  );
  const [loadingDetails, setLoadingDetails] = useState<Set<number>>(new Set());
  // Store detailed object data keyed by object id (details fragment)
  const [objectDetails, setObjectDetails] = useState<
    Record<number, ObjectDetailsFragment>
  >({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortBy, setSortBy] = useState('level');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { loading, error, data, refetch } = useQuery<
    GetObjectsQuery | GetObjectsByZoneQuery,
    GetObjectsQueryVariables | GetObjectsByZoneQueryVariables
  >(selectedZone ? GetObjectsByZoneDocument : GetObjectsDocument, {
    variables: selectedZone ? { zoneId: selectedZone } : { take: 100 },
  });

  const [deleteObject] = useMutation<
    DeleteObjectMutation,
    DeleteObjectMutationVariables
  >(DeleteObjectDocument);
  const [deleteObjects] = useMutation<
    DeleteObjectsMutation,
    DeleteObjectsMutationVariables
  >(DeleteObjectsDocument);

  // Redirect to object editor if id parameter is provided
  useEffect(() => {
    if (idParam && zoneParam) {
      const objectId = parseInt(idParam);
      const zoneId = parseInt(zoneParam);
      if (!isNaN(objectId) && !isNaN(zoneId)) {
        router.push(`/dashboard/objects/editor?zone=${zoneId}&id=${objectId}`);
      }
    }
  }, [idParam, zoneParam, router]);

  // Handle initial zone parameter from URL
  useEffect(() => {
    if (zoneParam && selectedZone === null) {
      const zoneId = parseInt(zoneParam);
      if (!isNaN(zoneId)) {
        setSelectedZone(zoneId);
      }
    }
  }, [zoneParam, selectedZone, setSelectedZone]);

  // Type guard to differentiate summary vs detailed object
  const isDetailed = (
    obj: ObjectSummaryFragment | ObjectDetailsFragment
  ): obj is ObjectDetailsFragment => {
    // examineDescription exists only on detailed fragment
    return (obj as ObjectDetailsFragment).examineDescription !== undefined;
  };

  const toggleObjectExpanded = async (objectId: number) => {
    if (expandedObjects.has(objectId)) {
      setExpandedObjects(
        new Set([...expandedObjects].filter(id => id !== objectId))
      );
      return;
    }

    // Add to expanded set
    setExpandedObjects(new Set(expandedObjects).add(objectId));

    // Load detailed data if not already loaded
    const object = objects.find(obj => obj.id === objectId);
    if (object && !objectDetails[objectId]) {
      setLoadingDetails(new Set(loadingDetails).add(objectId));
      try {
        const detailed = await apolloClient.query<
          GetObjectQuery,
          GetObjectQueryVariables
        >({
          query: GetObjectDocument,
          variables: { id: objectId, zoneId: object.zoneId },
          fetchPolicy: 'network-only',
        });
        const objDetails = detailed.data?.object;
        if (objDetails) {
          setObjectDetails(prev => ({
            ...prev,
            [objectId]: objDetails,
          }));
        }
      } catch {
        /* LoggingService.error('Error loading object details'); */
      } finally {
        setLoadingDetails(
          new Set([...loadingDetails].filter(id => id !== objectId))
        );
      }
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const obj = objects.find(o => o.id === id);
      if (!obj) {
        throw new Error('Object not found for deletion');
      }
      await deleteObject({ variables: { id, zoneId: obj.zoneId! } });
      await refetch();
    } catch {
      /* LoggingService.error('Error deleting object'); */
      alert('Failed to delete object. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Get objects from whichever query is active
  const objects: ObjectSummaryFragment[] =
    (data && 'objects' in data && (data as GetObjectsQuery).objects) ||
    (data &&
      'objectsByZone' in data &&
      (data as GetObjectsByZoneQuery).objectsByZone) ||
    [];

  // Get available types for filtering
  const availableTypes = getUniqueValues(objects, 'type');

  // Bulk operations
  const toggleObjectSelection = (objectId: number) => {
    const newSelected = new Set(selectedObjects);
    if (newSelected.has(objectId)) {
      newSelected.delete(objectId);
    } else {
      newSelected.add(objectId);
    }
    setSelectedObjects(newSelected);
  };

  const selectAllObjects = () => {
    setSelectedObjects(new Set(paginatedObjects.map(obj => obj.id!)));
  };

  const clearSelection = () => {
    setSelectedObjects(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedObjects.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedObjects.size} objects? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteObjects({ variables: { ids: Array.from(selectedObjects) } });
      await refetch();
      clearSelection();
    } catch (err) {
      /* LoggingService.error('Error deleting objects:', err); */
      alert(
        `Failed to delete objects: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const [createObject] = useMutation<
    CreateObjectMutation,
    CreateObjectMutationVariables
  >(CreateObjectDocument);

  const handleCloneObject = async (objectId: number) => {
    setCloningId(objectId);
    try {
      const object = objects.find(obj => obj.id === objectId);
      if (!object) {
        throw new Error('Object not found');
      }

      // Fetch full object details (still using network-only to ensure fresh data)
      const detailed = await apolloClient.query<
        GetObjectQuery,
        GetObjectQueryVariables
      >({
        query: GetObjectDocument,
        variables: { id: objectId, zoneId: object.zoneId },
        fetchPolicy: 'network-only',
      });
      const originalObject = detailed.data?.object;
      if (!originalObject) throw new Error('Original object details missing');

      // Build clone payload (NOTE: CreateObjectInput requires additional fields like id & roomDescription)
      const cloneData: CreateObjectInput = {
        id: Date.now() % 2147483647,
        keywords: originalObject.keywords,
        name: `${originalObject.name} (Copy)`,
        examineDescription: originalObject.examineDescription,
        roomDescription:
          originalObject.roomDescription || originalObject.examineDescription,
        type: originalObject.type,
        cost: originalObject.cost,
        weight: originalObject.weight,
        level: originalObject.level,
        concealment: originalObject.concealment,
        timer: originalObject.timer,
        decomposeTimer: originalObject.decomposeTimer,
        zoneId: originalObject.zoneId,
        values: originalObject.values,
        flags: originalObject.flags,
        effectFlags: originalObject.effectFlags,
        wearFlags: originalObject.wearFlags,
      };

      const createResult = await createObject({
        variables: { data: cloneData },
      });
      await refetch();
      alert(
        `Object cloned successfully! New object ID: ${createResult.data?.createObject.id}`
      );
    } catch (err) {
      /* LoggingService.error('Error cloning object:', err); */
      alert(
        `Failed to clone object: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setCloningId(null);
    }
  };

  const exportSelectedObjects = () => {
    if (selectedObjects.size === 0) return;

    const selectedData = sortedDisplayObjects.filter(obj =>
      selectedObjects.has(obj.id)
    );
    const jsonData = JSON.stringify(selectedData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `objects_${selectedObjects.size}_items.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Apply advanced search filters and sorting
  interface ObjectSearchShape {
    id: number;
    keywords?: string;
    name?: string;
    level: number;
    type?: string;
    cost: number;
    weight: number;
    zoneId: number;
    // Additional fields (roomDescription, examineDescription, concealment) only available once detailed data is loaded
    [key: string]: unknown;
  }
  const searchableObjects: ObjectSearchShape[] = objects.map(o => {
    const base: ObjectSearchShape = {
      id: o.id,
      keywords: Array.isArray(o.keywords) ? o.keywords.join(' ') : o.keywords,
      name: o.name,
      level: o.level,
      cost: o.cost,
      weight: o.weight,
      zoneId: o.zoneId,
    };
    if (o.type) {
      // Only include type if defined; avoid assigning undefined
      base.type = o.type as string;
    }
    return base;
  });
  const filteredObjects = applySearchFilters(searchableObjects, searchFilters, {
    // Custom field mappings for object-specific filters
    isValuable: obj => (obj.cost ?? 0) >= 1000,
    isLightweight: obj => (obj.weight ?? 0) <= 5,
    isHeavy: obj => (obj.weight ?? 0) >= 50,
    minCost: obj => obj.cost ?? 0,
    maxWeight: obj => obj.weight ?? 0,
  });

  // Sort the filtered objects
  // Map filtered search shapes back to original fragment objects for display
  const filteredIdSet = new Set(filteredObjects.map(o => o.id));
  const displayObjects = objects.filter(o => filteredIdSet.has(o.id));

  const sortedDisplayObjects = [...displayObjects].sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[sortBy];
    const bVal = (b as unknown as Record<string, unknown>)[sortBy];
    const normA = aVal ?? (typeof bVal === 'string' ? '' : 0);
    const normB = bVal ?? (typeof aVal === 'string' ? '' : 0);
    let comparison: number;
    if (typeof normA === 'string' && typeof normB === 'string') {
      comparison = normA.localeCompare(normB);
    } else {
      const numA = Number(normA);
      const numB = Number(normB);
      comparison = numA === numB ? 0 : numA < numB ? -1 : 1;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedDisplayObjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedObjects = sortedDisplayObjects.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const startItem = startIndex + 1;
  const endItem = Math.min(
    startIndex + itemsPerPage,
    sortedDisplayObjects.length
  );

  if (loading) return <div className='p-4'>Loading objects...</div>;
  if (error)
    return <div className='p-4 text-destructive'>Error: {error.message}</div>;

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>
              {selectedZone ? `Zone ${selectedZone} Objects` : 'All Objects'}
            </h1>
            <p className='text-sm text-muted-foreground mt-1'>
              Showing {startItem}-{endItem} of {sortedDisplayObjects.length}{' '}
              objects (Page {currentPage} of {totalPages})
              {selectedZone && ' in this zone'}
            </p>
          </div>
          {selectedZone && (
            <button
              onClick={() => {
                setSelectedZone(null);
                setCurrentPage(1);
              }}
              className='inline-flex items-center px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted'
              title='Clear zone filter and show all objects'
            >
              <X className='w-3 h-3 mr-1' />
              Clear Filter
            </button>
          )}
        </div>
        <Link
          href='/dashboard/objects/editor'
          className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/80'
        >
          <Plus className='w-4 h-4 mr-2' />
          Create New Object
        </Link>
      </div>

      {/* Sort and Items Per Page Controls */}
      <div className='flex items-center gap-4 mb-4 p-4 bg-muted rounded-lg'>
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium text-muted-foreground'>
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className='border border-border rounded px-2 py-1 text-sm bg-background'
          >
            <option value='level'>Level</option>
            <option value='name'>Name</option>
            <option value='type'>Type</option>
            <option value='cost'>Cost</option>
            <option value='weight'>Weight</option>
            <option value='id'>ID</option>
            <option value='zoneId'>Zone</option>
          </select>
          <button
            onClick={() => {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              setCurrentPage(1);
            }}
            className='p-1 hover:bg-muted rounded'
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? (
              <ArrowUp className='w-4 h-4' />
            ) : (
              <ArrowDown className='w-4 h-4' />
            )}
          </button>
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium text-muted-foreground'>
            Items per page:
          </label>
          <select
            value={itemsPerPage}
            onChange={e => {
              setItemsPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className='border border-border rounded px-2 py-1 text-sm bg-background'
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Enhanced Search */}
      <EnhancedSearch
        onFiltersChange={setSearchFilters}
        placeholder='Search objects by name, keywords, type, or ID...'
        showLevelFilter={true}
        availableTypes={availableTypes}
        presets={createObjectPresets()}
        customFilterOptions={[
          {
            key: 'isValuable',
            label: 'Valuable Items (1000+ cost)',
            type: 'boolean',
          },
          {
            key: 'isLightweight',
            label: 'Lightweight (≤5 lbs)',
            type: 'boolean',
          },
          {
            key: 'isHeavy',
            label: 'Heavy Items (≥50 lbs)',
            type: 'boolean',
          },
        ]}
        className='mb-6'
      />

      {/* Bulk Actions Toolbar */}
      {selectedObjects.size > 0 && (
        <div className='bg-card border border-border rounded-lg p-4 mb-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <span className='text-primary font-medium'>
                {selectedObjects.size} object
                {selectedObjects.size !== 1 ? 's' : ''} selected
              </span>
              <div className='flex items-center gap-2'>
                <button
                  onClick={selectAllObjects}
                  className='text-primary hover:text-primary/80 text-sm underline'
                  disabled={selectedObjects.size === paginatedObjects.length}
                >
                  Select All ({paginatedObjects.length})
                </button>
                <button
                  onClick={clearSelection}
                  className='text-primary hover:text-primary/80 text-sm underline'
                >
                  Clear Selection
                </button>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={exportSelectedObjects}
                className='inline-flex items-center px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80'
              >
                <Download className='w-3 h-3 mr-1' />
                Export JSON
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className='inline-flex items-center px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 disabled:opacity-50'
              >
                <Trash2 className='w-3 h-3 mr-1' />
                {isDeleting ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredObjects.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-muted-foreground mb-4'>No objects found</div>
          <Link
            href='/dashboard/objects/editor'
            className='bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90'
          >
            Create Object
          </Link>
        </div>
      ) : (
        <div className='grid gap-4'>
          {paginatedObjects.map(object => {
            // Merge object with detailed data if available (union type)
            const fullObject: ObjectSummaryFragment | ObjectDetailsFragment =
              objectDetails[object.id] || object;
            return (
              <div
                key={fullObject.id}
                className='bg-card border rounded-lg hover:shadow-md transition-shadow'
              >
                <div
                  className='p-4 cursor-pointer'
                  onClick={() => toggleObjectExpanded(fullObject.id)}
                >
                  <div className='flex items-start justify-between'>
                    {/* Checkbox for selection */}
                    <div className='flex items-start gap-3'>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleObjectSelection(fullObject.id);
                        }}
                        className='mt-1 text-muted-foreground hover:text-primary'
                      >
                        {selectedObjects.has(fullObject.id) ? (
                          <CheckSquare className='w-5 h-5 text-primary' />
                        ) : (
                          <Square className='w-5 h-5' />
                        )}
                      </button>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h3 className='font-semibold text-lg text-foreground'>
                            #{fullObject.id} - {fullObject.name}
                          </h3>
                          <TypeBadge type={fullObject.type ?? ''} />
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform ${
                              expandedObjects.has(fullObject.id)
                                ? 'rotate-180'
                                : ''
                            }`}
                          />
                        </div>
                        <p className='text-sm text-muted-foreground mb-2'>
                          Keywords:{' '}
                          {Array.isArray(fullObject.keywords)
                            ? fullObject.keywords.join(', ')
                            : fullObject.keywords}
                        </p>
                        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                          <span>Level {fullObject.level}</span>
                          <span>{fullObject.weight} lbs</span>
                          <span>{fullObject.cost} coins</span>
                          <span>Zone {fullObject.zoneId}</span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 ml-4'>
                      <Link
                        href={`/dashboard/objects/editor?zone=${fullObject.zoneId}&id=${fullObject.id}`}
                        className='inline-flex items-center text-primary hover:text-primary/80 px-3 py-1 text-sm'
                        onClick={e => e.stopPropagation()}
                      >
                        <Edit className='w-3 h-3 mr-1' />
                        Edit
                      </Link>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleCloneObject(fullObject.id);
                        }}
                        disabled={cloningId === fullObject.id}
                        className='inline-flex items-center text-secondary hover:text-secondary/80 px-3 py-1 text-sm disabled:opacity-50'
                      >
                        <Copy className='w-3 h-3 mr-1' />
                        {cloningId === fullObject.id ? 'Cloning...' : 'Clone'}
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(fullObject.id!, fullObject.name ?? '');
                        }}
                        disabled={deletingId === fullObject.id}
                        className='inline-flex items-center text-destructive hover:text-destructive/80 px-3 py-1 text-sm disabled:opacity-50'
                      >
                        <Trash2 className='w-3 h-3 mr-1' />
                        {deletingId === fullObject.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedObjects.has(fullObject.id) && (
                  <div className='border-t border-border p-4 bg-muted'>
                    {loadingDetails.has(fullObject.id) ? (
                      <div className='text-center py-4'>
                        <div className='inline-flex items-center'>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2'></div>
                          <span className='text-sm text-muted-foreground'>
                            Loading object details...
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        {/* Full Description */}
                        {isDetailed(fullObject) &&
                          fullObject.examineDescription && (
                            <div>
                              <h4 className='font-medium text-foreground mb-2'>
                                Examine Description
                              </h4>
                              <p className='text-foreground text-sm bg-card p-3 rounded border'>
                                {fullObject.examineDescription}
                              </p>
                            </div>
                          )}

                        {/* Action Description */}
                        {isDetailed(fullObject) &&
                          fullObject.actionDescription && (
                            <div>
                              <h4 className='font-medium text-foreground mb-2'>
                                Action Description
                              </h4>
                              <p className='text-foreground text-sm bg-card p-3 rounded border'>
                                {fullObject.actionDescription}
                              </p>
                            </div>
                          )}

                        {/* Technical Details */}
                        <div>
                          <h4 className='font-medium text-foreground mb-2'>
                            Technical Details
                          </h4>
                          <div className='bg-card p-3 rounded border text-sm space-y-2'>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                              <div>
                                <span className='text-muted-foreground'>
                                  Weight:
                                </span>
                                <span className='ml-1 font-medium'>
                                  {fullObject.weight} lbs
                                </span>
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  Cost:
                                </span>
                                <span className='ml-1 font-medium'>
                                  {fullObject.cost} coins
                                </span>
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  Level:
                                </span>
                                <span className='ml-1 font-medium'>
                                  {fullObject.level}
                                </span>
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  Concealment:
                                </span>
                                <span className='ml-1 font-medium'>
                                  {isDetailed(fullObject)
                                    ? fullObject.concealment
                                    : 0}
                                </span>
                              </div>
                              {isDetailed(fullObject) &&
                                fullObject.timer > 0 && (
                                  <div>
                                    <span className='text-muted-foreground'>
                                      Timer:
                                    </span>
                                    <span className='ml-1 font-medium'>
                                      {fullObject.timer}
                                    </span>
                                  </div>
                                )}
                              {isDetailed(fullObject) &&
                                fullObject.decomposeTimer > 0 && (
                                  <div>
                                    <span className='text-muted-foreground'>
                                      Decompose Timer:
                                    </span>
                                    <span className='ml-1 font-medium'>
                                      {fullObject.decomposeTimer}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Flags */}
                        {isDetailed(fullObject) &&
                          (fullObject.flags.length > 0 ||
                            fullObject.effectFlags.length > 0 ||
                            fullObject.wearFlags.length > 0) && (
                            <div>
                              <h4 className='font-medium text-foreground mb-2'>
                                Flags
                              </h4>
                              <div className='bg-card p-3 rounded border text-sm space-y-2'>
                                {fullObject.flags.length > 0 && (
                                  <div>
                                    <span className='text-muted-foreground'>
                                      Object Flags:
                                    </span>
                                    <div className='flex flex-wrap gap-1 mt-1'>
                                      {fullObject.flags.map((flag: string) => (
                                        <FlagBadge key={flag} flag={flag} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {fullObject.effectFlags.length > 0 && (
                                  <div>
                                    <span className='text-muted-foreground'>
                                      Effect Flags:
                                    </span>
                                    <div className='flex flex-wrap gap-1 mt-1'>
                                      {fullObject.effectFlags.map(
                                        (flag: string) => (
                                          <FlagBadge key={flag} flag={flag} />
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                                {fullObject.wearFlags.length > 0 && (
                                  <div>
                                    <span className='text-muted-foreground'>
                                      Wear Flags:
                                    </span>
                                    <div className='flex flex-wrap gap-1 mt-1'>
                                      {fullObject.wearFlags.map(
                                        (flag: string) => (
                                          <FlagBadge key={flag} flag={flag} />
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Type-Specific Information */}
                        <div>
                          <h4 className='font-medium text-foreground mb-2'>
                            Type Details
                          </h4>
                          <div className='bg-card p-3 rounded border text-sm space-y-2'>
                            {(() => {
                              // LoggingService.debug('Object values', fullObject.id, fullObject.values);
                              return (
                                fullObject.values &&
                                Object.keys(fullObject.values).length > 0
                              );
                            })() ? (
                              <>
                                {/* Weapon-specific */}
                                {fullObject.type === 'WEAPON' &&
                                  fullObject.values['Hit Dice'] && (
                                    <>
                                      <div className='flex justify-between'>
                                        <span className='text-muted-foreground'>
                                          Damage:
                                        </span>
                                        <span>
                                          {fullObject.values['Hit Dice'].num}d
                                          {fullObject.values['Hit Dice'].size}
                                          {fullObject.values['Hit Dice']
                                            .bonus >= 0
                                            ? '+'
                                            : ''}
                                          {fullObject.values['Hit Dice'].bonus}
                                        </span>
                                      </div>
                                      <div className='flex justify-between'>
                                        <span className='text-muted-foreground'>
                                          Average Damage:
                                        </span>
                                        <span>{fullObject.values.Average}</span>
                                      </div>
                                      <div className='flex justify-between'>
                                        <span className='text-muted-foreground'>
                                          Damage Type:
                                        </span>
                                        <span>
                                          {fullObject.values['Damage Type']}
                                        </span>
                                      </div>
                                      {fullObject.values.HitRoll !== 0 && (
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Hit Bonus:
                                          </span>
                                          <span>
                                            {fullObject.values.HitRoll >= 0
                                              ? '+'
                                              : ''}
                                            {fullObject.values.HitRoll}
                                          </span>
                                        </div>
                                      )}
                                    </>
                                  )}

                                {/* Container-specific */}
                                {(fullObject.type === 'CONTAINER' ||
                                  fullObject.type === 'DRINKCONTAINER') && (
                                  <>
                                    <div className='flex justify-between'>
                                      <span className='text-muted-foreground'>
                                        Capacity:
                                      </span>
                                      <span>{fullObject.values.Capacity}</span>
                                    </div>
                                    {fullObject.values.Remaining !==
                                      undefined && (
                                      <div className='flex justify-between'>
                                        <span className='text-muted-foreground'>
                                          Remaining:
                                        </span>
                                        <span>
                                          {fullObject.values.Remaining}
                                        </span>
                                      </div>
                                    )}
                                    {fullObject.values.Liquid && (
                                      <div className='flex justify-between'>
                                        <span className='text-muted-foreground'>
                                          Contains:
                                        </span>
                                        <span>{fullObject.values.Liquid}</span>
                                      </div>
                                    )}
                                    {fullObject.values.Poisoned !==
                                      undefined && (
                                      <div className='flex justify-between'>
                                        <span className='text-muted-foreground'>
                                          Poisoned:
                                        </span>
                                        <span
                                          className={
                                            fullObject.values.Poisoned
                                              ? 'text-destructive'
                                              : 'text-primary'
                                          }
                                        >
                                          {fullObject.values.Poisoned
                                            ? 'Yes'
                                            : 'No'}
                                        </span>
                                      </div>
                                    )}
                                    {fullObject.values['Weight Reduction'] !==
                                      undefined &&
                                      fullObject.values['Weight Reduction'] >
                                        0 && (
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Weight Reduction:
                                          </span>
                                          <span>
                                            {
                                              fullObject.values[
                                                'Weight Reduction'
                                              ]
                                            }
                                            %
                                          </span>
                                        </div>
                                      )}
                                  </>
                                )}

                                {/* Light-specific */}
                                {fullObject.type === 'LIGHT' && (
                                  <>
                                    <div className='flex justify-between'>
                                      <span className='text-muted-foreground'>
                                        Duration:
                                      </span>
                                      <span>
                                        {fullObject.values.Remaining}/
                                        {fullObject.values.Capacity}
                                      </span>
                                    </div>
                                    <div className='flex justify-between'>
                                      <span className='text-muted-foreground'>
                                        Status:
                                      </span>
                                      <span
                                        className={
                                          fullObject.values['Is_Lit:']
                                            ? 'text-secondary'
                                            : 'text-muted-foreground'
                                        }
                                      >
                                        {fullObject.values['Is_Lit:']
                                          ? 'Lit'
                                          : 'Unlit'}
                                      </span>
                                    </div>
                                  </>
                                )}

                                {/* Food-specific */}
                                {fullObject.type === 'FOOD' && (
                                  <>
                                    <div className='flex justify-between'>
                                      <span className='text-muted-foreground'>
                                        Filling:
                                      </span>
                                      <span>{fullObject.values.Filling}</span>
                                    </div>
                                    {fullObject.values.Poisoned !==
                                      undefined && (
                                      <div className='flex justify-between'>
                                        <span className='text-muted-foreground'>
                                          Poisoned:
                                        </span>
                                        <span
                                          className={
                                            fullObject.values.Poisoned
                                              ? 'text-destructive'
                                              : 'text-primary'
                                          }
                                        >
                                          {fullObject.values.Poisoned
                                            ? 'Yes'
                                            : 'No'}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Armor-specific */}
                                {fullObject.type === 'ARMOR' && (
                                  <>
                                    {fullObject.values['AC Apply'] && (
                                      <div className='flex justify-between'>
                                        <span className='text-muted-foreground'>
                                          AC Bonus:
                                        </span>
                                        <span>
                                          {fullObject.values['AC Apply'] >= 0
                                            ? '+'
                                            : ''}
                                          {fullObject.values['AC Apply']}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Generic values for other types */}
                                {![
                                  'WEAPON',
                                  'CONTAINER',
                                  'DRINKCONTAINER',
                                  'LIGHT',
                                  'FOOD',
                                  'ARMOR',
                                ].includes(fullObject.type ?? '') && (
                                  <div className='space-y-1'>
                                    {Object.entries(fullObject.values).map(
                                      ([key, value]) => (
                                        <div
                                          key={key}
                                          className='flex justify-between'
                                        >
                                          <span className='text-muted-foreground'>
                                            {key}:
                                          </span>
                                          <span>
                                            {typeof value === 'object'
                                              ? JSON.stringify(value)
                                              : String(value)}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className='text-muted-foreground italic'>
                                No additional type-specific details available
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timestamps */}
                        {isDetailed(fullObject) &&
                          (fullObject.createdAt || fullObject.updatedAt) && (
                            <div>
                              <h4 className='font-medium text-foreground mb-2'>
                                Timestamps
                              </h4>
                              <div className='bg-card p-3 rounded border text-sm space-y-1'>
                                {fullObject.createdAt && (
                                  <div className='flex justify-between'>
                                    <span className='text-muted-foreground'>
                                      Created:
                                    </span>
                                    <span>
                                      {new Date(
                                        fullObject.createdAt
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {fullObject.updatedAt && (
                                  <div className='flex justify-between'>
                                    <span className='text-muted-foreground'>
                                      Updated:
                                    </span>
                                    <span>
                                      {new Date(
                                        fullObject.updatedAt
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        {!isDetailed(fullObject) && (
                          <div className='text-xs text-muted-foreground italic'>
                            Detailed data not loaded yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between mt-6 px-4 py-3 bg-muted rounded-lg'>
          <div className='text-sm text-muted-foreground'>
            Showing {startItem}-{endItem} of {sortedDisplayObjects.length}{' '}
            results
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className='inline-flex items-center px-3 py-2 border border-border rounded-md text-sm font-medium text-muted-foreground bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <ChevronLeft className='w-4 h-4 mr-1' />
              Previous
            </button>

            <div className='flex items-center gap-1'>
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;

                if (totalPages <= maxVisiblePages) {
                  // Show all pages if total pages is 5 or less
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Show pages with ellipsis logic
                  const halfVisible = Math.floor(maxVisiblePages / 2);
                  let startPage = Math.max(1, currentPage - halfVisible);
                  const endPage = Math.min(
                    totalPages,
                    startPage + maxVisiblePages - 1
                  );

                  // Adjust start page if we're near the end
                  if (endPage - startPage < maxVisiblePages - 1) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }
                }

                return pages.map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-md ${
                      currentPage === pageNum
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {pageNum}
                  </button>
                ));
              })()}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className='px-2 text-muted-foreground'>...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className='px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md'
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className='inline-flex items-center px-3 py-2 border border-border rounded-md text-sm font-medium text-muted-foreground bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Next
              <ChevronRight className='w-4 h-4 ml-1' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
