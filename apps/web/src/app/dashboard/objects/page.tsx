'use client';

import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useZone } from '@/contexts/zone-context';
import {
  Plus,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import ZoneSelector from '../../../components/ZoneSelector';
import EnhancedSearch, {
  SearchFilters,
} from '../../../components/EnhancedSearch';
import {
  applySearchFilters,
  createObjectPresets,
  getUniqueValues,
} from '../../../lib/search-utils';

const GET_OBJECTS = gql`
  query GetObjects {
    objects(take: 100) {
      id
      type
      keywords
      shortDesc
      level
      weight
      cost
      zoneId
    }
  }
`;

const GET_OBJECTS_BY_ZONE = gql`
  query GetObjectsByZone($zoneId: Int!) {
    objectsByZone(zoneId: $zoneId) {
      id
      type
      keywords
      shortDesc
      level
      weight
      cost
      zoneId
    }
  }
`;

const DELETE_OBJECT = gql`
  mutation DeleteObject($id: Int!) {
    deleteObject(id: $id)
  }
`;

const DELETE_OBJECTS = gql`
  mutation DeleteObjects($ids: [Int!]!) {
    deleteObjects(ids: $ids)
  }
`;

export default function ObjectsPage() {
  const searchParams = useSearchParams();
  const zoneParam = searchParams.get('zone');
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

  // Handle initial zone parameter from URL
  useEffect(() => {
    if (zoneParam && selectedZone === null) {
      const zoneId = parseInt(zoneParam);
      if (!isNaN(zoneId)) {
        setSelectedZone(zoneId);
      }
    }
  }, [zoneParam, selectedZone, setSelectedZone]);

  const handleDelete = async (id: number, shortDesc: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${shortDesc}"? This action cannot be undone.`
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
      // First, fetch the complete object data
      const getObjectQuery = `
        query GetObject($id: Int!) {
          object(id: $id) {
            id
            keywords
            shortDesc
            description
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
          variables: { id: objectId },
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

      // Create clone data (remove id and modify shortDesc)
      const cloneData = {
        keywords: originalObject.keywords,
        shortDesc: `${originalObject.shortDesc} (Copy)`,
        description: originalObject.description,
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
            shortDesc
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
            <option value='shortDesc'>Name</option>
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
          {paginatedObjects.map((object: any) => (
            <div
              key={object.id}
              className='bg-white border rounded-lg p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex items-start justify-between'>
                {/* Checkbox for selection */}
                <div className='flex items-start gap-3'>
                  <button
                    onClick={() => toggleObjectSelection(object.id)}
                    className='mt-1 text-gray-400 hover:text-blue-600'
                  >
                    {selectedObjects.has(object.id) ? (
                      <CheckSquare className='w-5 h-5 text-blue-600' />
                    ) : (
                      <Square className='w-5 h-5' />
                    )}
                  </button>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h3 className='font-semibold text-lg text-gray-900'>
                        {object.shortDesc}
                      </h3>
                      <span className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full uppercase'>
                        {object.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 mb-2'>
                      Keywords: {object.keywords}
                    </p>
                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                      <span>Level {object.level}</span>
                      <span>{object.weight} lbs</span>
                      <span>{object.cost} coins</span>
                      <span>Zone {object.zoneId}</span>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2 ml-4'>
                  <Link
                    href={`/dashboard/objects/editor?id=${object.id}`}
                    className='inline-flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 text-sm'
                  >
                    <Edit className='w-3 h-3 mr-1' />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleCloneObject(object.id)}
                    disabled={cloningId === object.id}
                    className='inline-flex items-center text-green-600 hover:text-green-800 px-3 py-1 text-sm disabled:opacity-50'
                  >
                    <Copy className='w-3 h-3 mr-1' />
                    {cloningId === object.id ? 'Cloning...' : 'Clone'}
                  </button>
                  <button
                    onClick={() => handleDelete(object.id, object.shortDesc)}
                    disabled={deletingId === object.id}
                    className='inline-flex items-center text-red-600 hover:text-red-800 px-3 py-1 text-sm disabled:opacity-50'
                  >
                    <Trash2 className='w-3 h-3 mr-1' />
                    {deletingId === object.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
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
