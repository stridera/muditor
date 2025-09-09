'use client';

import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useZone } from '@/contexts/zone-context';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ZoneSelector from '../../../components/ZoneSelector';
import EnhancedSearch, {
  SearchFilters,
} from '../../../components/EnhancedSearch';
import { applySearchFilters } from '../../../lib/search-utils';

const GET_SHOPS = gql`
  query GetShops {
    shops {
      id
      buyProfit
      sellProfit
      temper1
      keeperId
      zoneId
    }
  }
`;

const GET_SHOPS_BY_ZONE = gql`
  query GetShopsByZone($zoneId: Int!) {
    shopsByZone(zoneId: $zoneId) {
      id
      buyProfit
      sellProfit
      temper1
      keeperId
      zoneId
    }
  }
`;

const DELETE_SHOP = gql`
  mutation DeleteShop($id: Int!) {
    deleteShop(id: $id)
  }
`;

export default function ShopsPage() {
  const searchParams = useSearchParams();
  const zoneParam = searchParams.get('zone');
  const { selectedZone, setSelectedZone } = useZone();

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: '',
  });

  const { loading, error, data, refetch } = useQuery(
    selectedZone ? GET_SHOPS_BY_ZONE : GET_SHOPS,
    {
      variables: selectedZone ? { zoneId: selectedZone } : undefined,
    }
  ) as {
    loading: boolean;
    error?: any;
    data?: { shops?: any[]; shopsByZone?: any[] };
    refetch: () => void;
  };

  const [deleteShop] = useMutation(DELETE_SHOP);

  // Handle initial zone parameter from URL
  useEffect(() => {
    if (zoneParam && selectedZone === null) {
      const zoneId = parseInt(zoneParam);
      if (!isNaN(zoneId)) {
        setSelectedZone(zoneId);
      }
    }
  }, [zoneParam, selectedZone, setSelectedZone]);

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        `Are you sure you want to delete Shop #${id}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteShop({ variables: { id } });
      await refetch();
    } catch (err) {
      console.error('Error deleting shop:', err);
      alert('Failed to delete shop. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Get shops from whichever query is active
  const shops = data?.shops || data?.shopsByZone || [];

  // Apply advanced search filters
  const filteredShops = applySearchFilters(shops, searchFilters, {
    // Custom field mappings for shop-specific filters
    isHighProfit: shop => shop.buyProfit >= 0.8 && shop.sellProfit >= 0.8,
    hasKeeper: shop => shop.keeperId && shop.keeperId > 0,
  });

  if (loading) return <div className='p-4'>Loading shops...</div>;
  if (error)
    return <div className='p-4 text-red-600'>Error: {error.message}</div>;

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            {selectedZone ? `Zone ${selectedZone} Shops` : 'Shops'}
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            {filteredShops.length} of {shops.length} shops
            {selectedZone && ' in this zone'}
          </p>
        </div>
        <Link
          href='/dashboard/shops/editor'
          className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700'
        >
          <Plus className='w-4 h-4 mr-2' />
          Create New Shop
        </Link>
      </div>

      {/* Zone Selector */}
      <div className='mb-4'>
        <ZoneSelector
          selectedZone={selectedZone}
          onZoneChange={setSelectedZone}
        />
      </div>

      {/* Enhanced Search */}
      <EnhancedSearch
        onFiltersChange={setSearchFilters}
        placeholder='Search shops by ID, keeper ID, or zone...'
        customFilterOptions={[
          {
            key: 'isHighProfit',
            label: 'High Profit Shops',
            type: 'boolean',
          },
          {
            key: 'hasKeeper',
            label: 'Has Assigned Keeper',
            type: 'boolean',
          },
        ]}
        presets={[
          {
            id: 'profitable-shops',
            name: 'Profitable Shops',
            filters: { searchTerm: '', customFilters: { isHighProfit: true } },
          },
          {
            id: 'unassigned-shops',
            name: 'No Keeper Assigned',
            filters: { searchTerm: '', customFilters: { hasKeeper: false } },
          },
        ]}
        className='mb-6'
      />

      {filteredShops.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-gray-500 mb-4'>No shops found</div>
          <Link
            href='/dashboard/shops/editor'
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
          >
            Create Shop
          </Link>
        </div>
      ) : (
        <div className='grid gap-4'>
          {filteredShops.map((shop: any) => (
            <div
              key={shop.id}
              className='bg-white border rounded-lg p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <h3 className='font-semibold text-lg text-gray-900'>
                      Shop #{shop.id}
                    </h3>
                  </div>
                  <div className='flex items-center gap-4 text-sm text-gray-500 mb-2'>
                    <span>Buy: {(shop.buyProfit * 100).toFixed(0)}%</span>
                    <span>Sell: {(shop.sellProfit * 100).toFixed(0)}%</span>
                    <span>Temper: {shop.temper1}</span>
                  </div>
                  <div className='flex items-center gap-4 text-sm text-gray-500'>
                    {shop.keeperId && <span>Keeper ID: {shop.keeperId}</span>}
                    <span>Zone {shop.zoneId}</span>
                  </div>
                </div>
                <div className='flex items-center gap-2 ml-4'>
                  <Link
                    href={`/dashboard/shops/editor?id=${shop.id}`}
                    className='inline-flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 text-sm'
                  >
                    <Edit className='w-3 h-3 mr-1' />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(shop.id)}
                    disabled={deletingId === shop.id}
                    className='inline-flex items-center text-red-600 hover:text-red-800 px-3 py-1 text-sm disabled:opacity-50'
                  >
                    <Trash2 className='w-3 h-3 mr-1' />
                    {deletingId === shop.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
