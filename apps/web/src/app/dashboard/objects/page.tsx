'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { useZone } from '@/contexts/zone-context';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
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
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import EnhancedSearch, {
  SearchFilters,
} from '../../../components/EnhancedSearch';
import ZoneSelector from '../../../components/ZoneSelector';
import {
  applySearchFilters,
  createObjectPresets,
  getUniqueValues,
} from '../../../lib/search-utils';

const GET_OBJECTS = gql`
  query GetObjectsDashboard {
    objects(take: 100) {
      id
      type
      keywords
      name
      level
      weight
      cost
      zoneId
      values
    }
  }
`;

const GET_OBJECTS_BY_ZONE = gql`
  query GetObjectsByZoneDashboard($zoneId: Int!) {
    objectsByZone(zoneId: $zoneId) {
      id
      type
      keywords
      name
      level
      weight
      cost
      zoneId
      values
    }
  }
`;

const DELETE_OBJECT = gql`
  mutation DeleteObject($id: Int!, $zoneId: Int!) {
    deleteObject(id: $id, zoneId: $zoneId) {
      id
    }
  }
`;

const DELETE_OBJECTS = gql`
  mutation DeleteObjects($ids: [Int!]!) {
    deleteObjects(ids: $ids)
  }
`;

export default function ObjectsPage() {
  return (
    <PermissionGuard requireImmortal={true}>
      <ObjectsContent />
    </PermissionGuard>
  );
}

function ObjectsContent() {
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
  const [objectDetails, setObjectDetails] = useState<Record<number, any>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortBy, setSortBy] = useState('level');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { loading, error, data, refetch } = useQuery(
    selectedZone ? GET_OBJECTS_BY_ZONE : GET_OBJECTS,
    {
      variables: selectedZone ? { zoneId: selectedZone } : undefined,
    }
  ) as {
    loading: boolean;
    error?: any;
    data?: { objects?: any[]; objectsByZone?: any[] };
    refetch: () => void;
  };

  const [deleteObject] = useMutation(DELETE_OBJECT);
  const [deleteObjects] = useMutation(DELETE_OBJECTS);

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
    const object = objects.find((obj: any) => obj.id === objectId);
    if (object && !objectDetails[objectId] && !object.description) {
      setLoadingDetails(new Set(loadingDetails).add(objectId));
      try {
        const getObjectQuery = `
          query GetObject($id: Int!, $zoneId: Int!) {
            object(id: $id, zoneId: $zoneId) {
              id
              type
              keywords
              name
              examineDescription
              actionDesc
              flags
              effectFlags
              wearFlags
              weight
              cost
              timer
              decomposeTimer
              level
              concealment
              values
              zoneId
              createdAt
              updatedAt
            }
          }
        `;

        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: getObjectQuery,
            variables: { id: objectId, zoneId: object.zoneId },
          }),
        });

        const result = await response.json();
        if (result.errors) {
          console.error(
            'Error loading object details:',
            result.errors[0].message
          );
        } else if (result.data.object) {
          console.log('Object data received:', result.data.object);
          console.log('Object values:', result.data.object.values);
          // Store detailed data separately to trigger re-render
          setObjectDetails(prev => ({
            ...prev,
            [objectId]: result.data.object,
          }));
        }
      } catch (err) {
        console.error('Error loading object details:', err);
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
      await deleteObject({ variables: { id } });
      await refetch();
    } catch (err) {
      console.error('Error deleting object:', err);
      alert('Failed to delete object. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Get objects from whichever query is active
  const objects = data?.objects || data?.objectsByZone || [];

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
    setSelectedObjects(new Set(paginatedObjects.map((obj: any) => obj.id)));
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
      console.error('Error deleting objects:', err);
      alert(
        `Failed to delete objects: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloneObject = async (objectId: number) => {
    setCloningId(objectId);
    try {
      // Get the object's zoneId first
      const object = objects.find((obj: any) => obj.id === objectId);
      if (!object) {
        throw new Error('Object not found');
      }

      // First, fetch the complete object data
      const getObjectQuery = `
        query GetObject($id: Int!, $zoneId: Int!) {
          object(id: $id, zoneId: $zoneId) {
            id
            keywords
            name
            examineDescription
            type
            cost
            weight
            level
            material
            condition
            extra
            itemFlags
            values
            zoneId
          }
        }
      `;

      const objectResponse = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: getObjectQuery,
          variables: { id: objectId, zoneId: object.zoneId },
        }),
      });

      const objectResult = await objectResponse.json();
      if (objectResult.errors) {
        throw new Error(objectResult.errors[0].message);
      }

      const originalObject = objectResult.data.object;
      if (!originalObject) {
        throw new Error('Object not found');
      }

      // Create clone data (remove id and modify name)
      const cloneData = {
        keywords: originalObject.keywords,
        name: `${originalObject.name} (Copy)`,
        examineDescription: originalObject.examineDescription,
        type: originalObject.type,
        cost: originalObject.cost,
        weight: originalObject.weight,
        level: originalObject.level,
        material: originalObject.material,
        condition: originalObject.condition,
        extra: originalObject.extra,
        itemFlags: originalObject.itemFlags,
        values: originalObject.values,
        zoneId: originalObject.zoneId,
      };

      // Create the cloned object
      const createMutation = `
        mutation CreateObject($data: CreateObjectInput!) {
          createObject(data: $data) {
            id
            keywords
            name
            type
            cost
            weight
            level
            zoneId
          }
        }
      `;

      const createResponse = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: createMutation,
          variables: { data: cloneData },
        }),
      });

      const createResult = await createResponse.json();
      if (createResult.errors) {
        throw new Error(createResult.errors[0].message);
      }

      const newObject = createResult.data.createObject;

      // Refresh the data to show the new object
      await refetch();

      // Show success message (could be replaced with a toast notification)
      alert(`Object cloned successfully! New object ID: ${newObject.id}`);
    } catch (err) {
      console.error('Error cloning object:', err);
      alert(
        `Failed to clone object: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setCloningId(null);
    }
  };

  const exportSelectedObjects = () => {
    if (selectedObjects.size === 0) return;

    const selectedData = sortedObjects.filter((obj: any) =>
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
  const filteredObjects = applySearchFilters(objects, searchFilters, {
    // Custom field mappings for object-specific filters
    isValuable: obj => obj.cost >= 1000,
    isLightweight: obj => obj.weight <= 5,
    isHeavy: obj => obj.weight >= 50,
    minCost: obj => obj.cost,
    maxWeight: obj => obj.weight,
  });

  // Sort the filtered objects
  const sortedObjects = [...filteredObjects].sort((a: any, b: any) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    const comparison =
      typeof aVal === 'string'
        ? aVal.localeCompare(bVal)
        : aVal < bVal
          ? -1
          : aVal > bVal
            ? 1
            : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedObjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedObjects = sortedObjects.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const startItem = startIndex + 1;
  const endItem = Math.min(startIndex + itemsPerPage, sortedObjects.length);

  if (loading) return <div className='p-4'>Loading objects...</div>;
  if (error)
    return <div className='p-4 text-red-600'>Error: {error.message}</div>;

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            {selectedZone ? `Zone ${selectedZone} Objects` : 'Objects'}
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Showing {startItem}-{endItem} of {sortedObjects.length} objects
            (Page {currentPage} of {totalPages})
            {selectedZone && ' in this zone'}
          </p>
        </div>
        <Link
          href='/dashboard/objects/editor'
          className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700'
        >
          <Plus className='w-4 h-4 mr-2' />
          Create New Object
        </Link>
      </div>

      {/* Zone Selector */}
      <div className='mb-4'>
        <ZoneSelector
          selectedZone={selectedZone}
          onZoneChange={setSelectedZone}
        />
      </div>

      {/* Sort and Items Per Page Controls */}
      <div className='flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg'>
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium text-gray-700'>Sort by:</label>
          <select
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className='border border-gray-300 rounded px-2 py-1 text-sm'
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
            className='p-1 hover:bg-gray-200 rounded'
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
          <label className='text-sm font-medium text-gray-700'>
            Items per page:
          </label>
          <select
            value={itemsPerPage}
            onChange={e => {
              setItemsPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className='border border-gray-300 rounded px-2 py-1 text-sm'
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
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <span className='text-blue-900 font-medium'>
                {selectedObjects.size} object
                {selectedObjects.size !== 1 ? 's' : ''} selected
              </span>
              <div className='flex items-center gap-2'>
                <button
                  onClick={selectAllObjects}
                  className='text-blue-600 hover:text-blue-800 text-sm underline'
                  disabled={selectedObjects.size === paginatedObjects.length}
                >
                  Select All ({paginatedObjects.length})
                </button>
                <button
                  onClick={clearSelection}
                  className='text-blue-600 hover:text-blue-800 text-sm underline'
                >
                  Clear Selection
                </button>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={exportSelectedObjects}
                className='inline-flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700'
              >
                <Download className='w-3 h-3 mr-1' />
                Export JSON
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className='inline-flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50'
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
          <div className='text-gray-500 mb-4'>No objects found</div>
          <Link
            href='/dashboard/objects/editor'
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
          >
            Create Object
          </Link>
        </div>
      ) : (
        <div className='grid gap-4'>
          {paginatedObjects.map((object: any) => {
            // Merge object with detailed data if available
            const fullObject = objectDetails[object.id]
              ? { ...object, ...objectDetails[object.id] }
              : object;
            return (
              <div
                key={fullObject.id}
                className='bg-white border rounded-lg hover:shadow-md transition-shadow'
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
                        className='mt-1 text-gray-400 hover:text-blue-600'
                      >
                        {selectedObjects.has(fullObject.id) ? (
                          <CheckSquare className='w-5 h-5 text-blue-600' />
                        ) : (
                          <Square className='w-5 h-5' />
                        )}
                      </button>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h3 className='font-semibold text-lg text-gray-900'>
                            #{fullObject.id} - {fullObject.name}
                          </h3>
                          <span className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full uppercase'>
                            {fullObject.type.replace('_', ' ')}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedObjects.has(fullObject.id)
                                ? 'rotate-180'
                                : ''
                            }`}
                          />
                        </div>
                        <p className='text-sm text-gray-600 mb-2'>
                          Keywords:{' '}
                          {Array.isArray(fullObject.keywords)
                            ? fullObject.keywords.join(', ')
                            : fullObject.keywords}
                        </p>
                        <div className='flex items-center gap-4 text-sm text-gray-500'>
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
                        className='inline-flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 text-sm'
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
                        className='inline-flex items-center text-green-600 hover:text-green-800 px-3 py-1 text-sm disabled:opacity-50'
                      >
                        <Copy className='w-3 h-3 mr-1' />
                        {cloningId === fullObject.id ? 'Cloning...' : 'Clone'}
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(fullObject.id, fullObject.name);
                        }}
                        disabled={deletingId === fullObject.id}
                        className='inline-flex items-center text-red-600 hover:text-red-800 px-3 py-1 text-sm disabled:opacity-50'
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
                  <div className='border-t border-gray-200 p-4 bg-gray-50'>
                    {loadingDetails.has(fullObject.id) ? (
                      <div className='text-center py-4'>
                        <div className='inline-flex items-center'>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2'></div>
                          <span className='text-sm text-gray-600'>
                            Loading object details...
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        {/* Full Description */}
                        {fullObject.examineDescription && (
                          <div>
                            <h4 className='font-medium text-gray-900 mb-2'>
                              Examine Description
                            </h4>
                            <p className='text-gray-700 text-sm bg-white p-3 rounded border'>
                              {fullObject.examineDescription}
                            </p>
                          </div>
                        )}

                        {/* Action Description */}
                        {fullObject.actionDesc && (
                          <div>
                            <h4 className='font-medium text-gray-900 mb-2'>
                              Action Description
                            </h4>
                            <p className='text-gray-700 text-sm bg-white p-3 rounded border'>
                              {fullObject.actionDesc}
                            </p>
                          </div>
                        )}

                        {/* Technical Details */}
                        <div>
                          <h4 className='font-medium text-gray-900 mb-2'>
                            Technical Details
                          </h4>
                          <div className='bg-white p-3 rounded border text-sm space-y-2'>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                              <div>
                                <span className='text-gray-600'>Weight:</span>
                                <span className='ml-1 font-medium'>
                                  {fullObject.weight} lbs
                                </span>
                              </div>
                              <div>
                                <span className='text-gray-600'>Cost:</span>
                                <span className='ml-1 font-medium'>
                                  {fullObject.cost} coins
                                </span>
                              </div>
                              <div>
                                <span className='text-gray-600'>Level:</span>
                                <span className='ml-1 font-medium'>
                                  {fullObject.level}
                                </span>
                              </div>
                              <div>
                                <span className='text-gray-600'>
                                  Concealment:
                                </span>
                                <span className='ml-1 font-medium'>
                                  {fullObject.concealment || 0}
                                </span>
                              </div>
                              {fullObject.timer > 0 && (
                                <div>
                                  <span className='text-gray-600'>Timer:</span>
                                  <span className='ml-1 font-medium'>
                                    {fullObject.timer}
                                  </span>
                                </div>
                              )}
                              {fullObject.decomposeTimer > 0 && (
                                <div>
                                  <span className='text-gray-600'>
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
                        {(fullObject.flags?.length > 0 ||
                          fullObject.effectFlags?.length > 0 ||
                          fullObject.wearFlags?.length > 0) && (
                          <div>
                            <h4 className='font-medium text-gray-900 mb-2'>
                              Flags
                            </h4>
                            <div className='bg-white p-3 rounded border text-sm space-y-2'>
                              {fullObject.flags?.length > 0 && (
                                <div>
                                  <span className='text-gray-600'>
                                    Object Flags:
                                  </span>
                                  <div className='flex flex-wrap gap-1 mt-1'>
                                    {fullObject.flags.map((flag: string) => (
                                      <span
                                        key={flag}
                                        className='px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded'
                                      >
                                        {flag.replace('_', ' ')}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {fullObject.effectFlags?.length > 0 && (
                                <div>
                                  <span className='text-gray-600'>
                                    Effect Flags:
                                  </span>
                                  <div className='flex flex-wrap gap-1 mt-1'>
                                    {fullObject.effectFlags.map(
                                      (flag: string) => (
                                        <span
                                          key={flag}
                                          className='px-2 py-1 bg-green-100 text-green-700 text-xs rounded'
                                        >
                                          {flag.replace('_', ' ')}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                              {fullObject.wearFlags?.length > 0 && (
                                <div>
                                  <span className='text-gray-600'>
                                    Wear Flags:
                                  </span>
                                  <div className='flex flex-wrap gap-1 mt-1'>
                                    {fullObject.wearFlags.map(
                                      (flag: string) => (
                                        <span
                                          key={flag}
                                          className='px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded'
                                        >
                                          {flag.replace('_', ' ')}
                                        </span>
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
                          <h4 className='font-medium text-gray-900 mb-2'>
                            Type Details
                          </h4>
                          <div className='bg-white p-3 rounded border text-sm space-y-2'>
                            {(() => {
                              console.log(
                                `Object ${fullObject.id} values:`,
                                fullObject.values
                              );
                              console.log(
                                `Has values:`,
                                fullObject.values &&
                                  Object.keys(fullObject.values).length > 0
                              );
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
                                        <span className='text-gray-600'>
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
                                        <span className='text-gray-600'>
                                          Average Damage:
                                        </span>
                                        <span>{fullObject.values.Average}</span>
                                      </div>
                                      <div className='flex justify-between'>
                                        <span className='text-gray-600'>
                                          Damage Type:
                                        </span>
                                        <span>
                                          {fullObject.values['Damage Type']}
                                        </span>
                                      </div>
                                      {fullObject.values.HitRoll !== 0 && (
                                        <div className='flex justify-between'>
                                          <span className='text-gray-600'>
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
                                      <span className='text-gray-600'>
                                        Capacity:
                                      </span>
                                      <span>{fullObject.values.Capacity}</span>
                                    </div>
                                    {fullObject.values.Remaining !==
                                      undefined && (
                                      <div className='flex justify-between'>
                                        <span className='text-gray-600'>
                                          Remaining:
                                        </span>
                                        <span>
                                          {fullObject.values.Remaining}
                                        </span>
                                      </div>
                                    )}
                                    {fullObject.values.Liquid && (
                                      <div className='flex justify-between'>
                                        <span className='text-gray-600'>
                                          Contains:
                                        </span>
                                        <span>{fullObject.values.Liquid}</span>
                                      </div>
                                    )}
                                    {fullObject.values.Poisoned !==
                                      undefined && (
                                      <div className='flex justify-between'>
                                        <span className='text-gray-600'>
                                          Poisoned:
                                        </span>
                                        <span
                                          className={
                                            fullObject.values.Poisoned
                                              ? 'text-red-600'
                                              : 'text-green-600'
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
                                          <span className='text-gray-600'>
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
                                      <span className='text-gray-600'>
                                        Duration:
                                      </span>
                                      <span>
                                        {fullObject.values.Remaining}/
                                        {fullObject.values.Capacity}
                                      </span>
                                    </div>
                                    <div className='flex justify-between'>
                                      <span className='text-gray-600'>
                                        Status:
                                      </span>
                                      <span
                                        className={
                                          fullObject.values['Is_Lit:']
                                            ? 'text-yellow-600'
                                            : 'text-gray-600'
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
                                      <span className='text-gray-600'>
                                        Filling:
                                      </span>
                                      <span>{fullObject.values.Filling}</span>
                                    </div>
                                    {fullObject.values.Poisoned !==
                                      undefined && (
                                      <div className='flex justify-between'>
                                        <span className='text-gray-600'>
                                          Poisoned:
                                        </span>
                                        <span
                                          className={
                                            fullObject.values.Poisoned
                                              ? 'text-red-600'
                                              : 'text-green-600'
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
                                        <span className='text-gray-600'>
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
                                ].includes(fullObject.type) && (
                                  <div className='space-y-1'>
                                    {Object.entries(fullObject.values).map(
                                      ([key, value]) => (
                                        <div
                                          key={key}
                                          className='flex justify-between'
                                        >
                                          <span className='text-gray-600'>
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
                              <div className='text-gray-500 italic'>
                                No additional type-specific details available
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timestamps */}
                        {(fullObject.createdAt || fullObject.updatedAt) && (
                          <div>
                            <h4 className='font-medium text-gray-900 mb-2'>
                              Timestamps
                            </h4>
                            <div className='bg-white p-3 rounded border text-sm space-y-1'>
                              {fullObject.createdAt && (
                                <div className='flex justify-between'>
                                  <span className='text-gray-600'>
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
                                  <span className='text-gray-600'>
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
        <div className='flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 rounded-lg'>
          <div className='text-sm text-gray-500'>
            Showing {startItem}-{endItem} of {sortedObjects.length} results
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className='inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
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
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ));
              })()}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className='px-2 text-gray-500'>...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md'
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
              className='inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
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
