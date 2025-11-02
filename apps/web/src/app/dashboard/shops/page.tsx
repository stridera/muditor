'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { useZone } from '@/contexts/zone-context';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { ChevronDown, Edit, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import EnhancedSearch, {
  SearchFilters,
} from '../../../components/EnhancedSearch';
import ZoneSelector from '../../../components/ZoneSelector';
import { applySearchFilters } from '../../../lib/search-utils';

const GET_SHOPS = gql`
  query GetShops {
    shops {
      id
      buyProfit
      sellProfit
      temper
      flags
      tradesWithFlags
      noSuchItemMessages
      doNotBuyMessages
      missingCashMessages
      buyMessages
      sellMessages
      keeperId
      keeper {
        id
        zoneId
        name
        keywords
      }
      zoneId
      createdAt
      updatedAt
      items {
        id
        amount
        objectId
        object {
          id
          zoneId
          name
          type
          cost
        }
      }
      accepts {
        id
        type
        keywords
      }
    }
  }
`;

const GET_SHOPS_BY_ZONE = gql`
  query GetShopsByZone($zoneId: Int!) {
    shopsByZone(zoneId: $zoneId) {
      id
      buyProfit
      sellProfit
      temper
      flags
      tradesWithFlags
      noSuchItemMessages
      doNotBuyMessages
      missingCashMessages
      buyMessages
      sellMessages
      keeperId
      keeper {
        id
        zoneId
        name
        keywords
      }
      zoneId
      createdAt
      updatedAt
      items {
        id
        amount
        objectId
        object {
          id
          zoneId
          name
          type
          cost
        }
      }
      accepts {
        id
        type
        keywords
      }
    }
  }
`;

const DELETE_SHOP = gql`
  mutation DeleteShop($id: Int!, $zoneId: Int!) {
    deleteShop(id: $id, zoneId: $zoneId) {
      id
    }
  }
`;

export default function ShopsPage() {
  return (
    <PermissionGuard requireImmortal={true}>
      <ShopsContent />
    </PermissionGuard>
  );
}

function ShopsContent() {
  const searchParams = useSearchParams();
  const zoneParam = searchParams.get('zone');
  const { selectedZone, setSelectedZone } = useZone();

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: '',
  });
  const [expandedShops, setExpandedShops] = useState<Set<number>>(new Set());

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

  const toggleShopExpanded = (shopId: number) => {
    if (expandedShops.has(shopId)) {
      setExpandedShops(new Set([...expandedShops].filter(id => id !== shopId)));
    } else {
      setExpandedShops(new Set(expandedShops).add(shopId));
    }
  };

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
            filters: {
              searchTerm: '',
              customFilters: { isHighProfit: true },
            },
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
              className='bg-white border rounded-lg hover:shadow-md transition-shadow'
            >
              <div
                className='p-4 cursor-pointer'
                onClick={() => toggleShopExpanded(shop.id)}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h3 className='font-semibold text-lg text-gray-900'>
                        #{shop.id} - Shop
                      </h3>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedShops.has(shop.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    <div className='flex items-center gap-4 text-sm text-gray-500 mb-2'>
                      <span>Buy: {(shop.buyProfit * 100).toFixed(0)}%</span>
                      <span>Sell: {(shop.sellProfit * 100).toFixed(0)}%</span>
                      <span>Temper: {shop.temper}</span>
                    </div>
                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                      {shop.keeper ? (
                        <Link
                          href={`/dashboard/mobs?zone=${shop.keeper.zoneId}&id=${shop.keeper.id}`}
                          className='text-blue-600 hover:text-blue-800 hover:underline'
                          onClick={e => e.stopPropagation()}
                        >
                          Keeper: {shop.keeper.name} (#{shop.keeper.id})
                        </Link>
                      ) : shop.keeperId ? (
                        <span>Keeper ID: {shop.keeperId}</span>
                      ) : (
                        <span className='text-orange-600'>
                          No Keeper Assigned
                        </span>
                      )}
                      <span>Zone {shop.zoneId}</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2 ml-4'>
                    <Link
                      href={`/dashboard/shops/editor?id=${shop.id}&zoneId=${shop.zoneId}`}
                      className='inline-flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 text-sm'
                      onClick={e => e.stopPropagation()}
                    >
                      <Edit className='w-3 h-3 mr-1' />
                      Edit
                    </Link>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(shop.id);
                      }}
                      disabled={deletingId === shop.id}
                      className='inline-flex items-center text-red-600 hover:text-red-800 px-3 py-1 text-sm disabled:opacity-50'
                    >
                      <Trash2 className='w-3 h-3 mr-1' />
                      {deletingId === shop.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedShops.has(shop.id) && (
                <div className='border-t border-gray-200 p-4 bg-gray-50'>
                  <div className='space-y-4'>
                    {/* Keeper Details */}
                    {shop.keeper && (
                      <div>
                        <h4 className='font-medium text-gray-900 mb-2'>
                          Shopkeeper
                        </h4>
                        <div className='bg-white p-3 rounded border text-sm'>
                          <Link
                            href={`/dashboard/mobs?zone=${shop.keeper.zoneId}&id=${shop.keeper.id}`}
                            className='text-blue-600 hover:text-blue-800 hover:underline font-medium'
                            onClick={e => e.stopPropagation()}
                          >
                            {shop.keeper.name} (Zone {shop.keeper.zoneId}, ID:{' '}
                            {shop.keeper.id})
                          </Link>
                          {shop.keeper.keywords?.length > 0 && (
                            <div className='mt-2'>
                              <span className='text-gray-600'>Keywords: </span>
                              <span className='text-gray-700'>
                                {shop.keeper.keywords.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Items Sold */}
                    {shop.items && shop.items.length > 0 && (
                      <div>
                        <h4 className='font-medium text-gray-900 mb-2'>
                          Items Sold ({shop.items.length})
                        </h4>
                        <div className='bg-white p-3 rounded border'>
                          <div className='space-y-2'>
                            {shop.items.map((item: any) => (
                              <div
                                key={item.id}
                                className='flex items-center justify-between text-sm border-b pb-2 last:border-b-0'
                              >
                                <div className='flex-1'>
                                  {item.object ? (
                                    <Link
                                      href={`/dashboard/objects?zone=${item.object.zoneId}&id=${item.object.id}`}
                                      className='text-blue-600 hover:text-blue-800 hover:underline font-medium'
                                      onClick={e => e.stopPropagation()}
                                    >
                                      {item.object.name}
                                    </Link>
                                  ) : (
                                    <span className='text-gray-700'>
                                      Object ID: {item.objectId}
                                    </span>
                                  )}
                                  {item.object && (
                                    <div className='text-xs text-gray-500 mt-1'>
                                      Zone {item.object.zoneId}, ID:{' '}
                                      {item.object.id} • Type:{' '}
                                      {item.object.type}
                                      {item.object.cost &&
                                        ` • Cost: ${item.object.cost} coins`}
                                    </div>
                                  )}
                                </div>
                                <div className='ml-4 text-gray-600'>
                                  {item.amount === -1 ? (
                                    <span className='text-green-600'>
                                      Unlimited
                                    </span>
                                  ) : (
                                    <span>Stock: {item.amount}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Items Accepted */}
                    {shop.accepts && shop.accepts.length > 0 && (
                      <div>
                        <h4 className='font-medium text-gray-900 mb-2'>
                          Items Accepted for Purchase ({shop.accepts.length})
                        </h4>
                        <div className='bg-white p-3 rounded border'>
                          <div className='flex flex-wrap gap-2'>
                            {shop.accepts.map((accept: any) => (
                              <span
                                key={accept.id}
                                className='px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full'
                              >
                                {accept.type.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trading Details */}
                    <div>
                      <h4 className='font-medium text-gray-900 mb-2'>
                        Trading Details
                      </h4>
                      <div className='bg-white p-3 rounded border text-sm'>
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                          <div>
                            <span className='text-gray-600'>Buy Profit:</span>
                            <span className='ml-1 font-medium'>
                              {(shop.buyProfit * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className='text-gray-600'>Sell Profit:</span>
                            <span className='ml-1 font-medium'>
                              {(shop.sellProfit * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className='text-gray-600'>Temper Level:</span>
                            <span className='ml-1 font-medium'>
                              {shop.temper}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    {(shop.messageBuy ||
                      shop.messageSell ||
                      shop.noSuchItem1 ||
                      shop.doNotBuy ||
                      shop.missingCash1) && (
                      <div>
                        <h4 className='font-medium text-gray-900 mb-2'>
                          Shop Messages
                        </h4>
                        <div className='bg-white p-3 rounded border text-sm space-y-2'>
                          {shop.messageBuy && (
                            <div>
                              <span className='text-gray-600'>
                                Buy Message:
                              </span>
                              <p className='text-gray-700 mt-1 italic'>
                                "{shop.messageBuy}"
                              </p>
                            </div>
                          )}
                          {shop.messageSell && (
                            <div>
                              <span className='text-gray-600'>
                                Sell Message:
                              </span>
                              <p className='text-gray-700 mt-1 italic'>
                                "{shop.messageSell}"
                              </p>
                            </div>
                          )}
                          {shop.noSuchItem1 && (
                            <div>
                              <span className='text-gray-600'>
                                No Such Item:
                              </span>
                              <p className='text-gray-700 mt-1 italic'>
                                "{shop.noSuchItem1}"
                              </p>
                            </div>
                          )}
                          {shop.noSuchItem2 && (
                            <div>
                              <span className='text-gray-600'>
                                No Such Item (Alt):
                              </span>
                              <p className='text-gray-700 mt-1 italic'>
                                "{shop.noSuchItem2}"
                              </p>
                            </div>
                          )}
                          {shop.doNotBuy && (
                            <div>
                              <span className='text-gray-600'>Do Not Buy:</span>
                              <p className='text-gray-700 mt-1 italic'>
                                "{shop.doNotBuy}"
                              </p>
                            </div>
                          )}
                          {shop.missingCash1 && (
                            <div>
                              <span className='text-gray-600'>
                                Missing Cash:
                              </span>
                              <p className='text-gray-700 mt-1 italic'>
                                "{shop.missingCash1}"
                              </p>
                            </div>
                          )}
                          {shop.missingCash2 && (
                            <div>
                              <span className='text-gray-600'>
                                Missing Cash (Alt):
                              </span>
                              <p className='text-gray-700 mt-1 italic'>
                                "{shop.missingCash2}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Flags */}
                    {(shop.flags?.length > 0 ||
                      shop.tradesWithFlags?.length > 0) && (
                      <div>
                        <h4 className='font-medium text-gray-900 mb-2'>
                          Shop Flags
                        </h4>
                        <div className='bg-white p-3 rounded border text-sm space-y-2'>
                          {shop.flags?.length > 0 && (
                            <div>
                              <span className='text-gray-600'>Shop Flags:</span>
                              <div className='flex flex-wrap gap-1 mt-1'>
                                {shop.flags.map((flag: string) => (
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
                          {shop.tradesWithFlags?.length > 0 && (
                            <div>
                              <span className='text-gray-600'>
                                Trades With:
                              </span>
                              <div className='flex flex-wrap gap-1 mt-1'>
                                {shop.tradesWithFlags.map((flag: string) => (
                                  <span
                                    key={flag}
                                    className='px-2 py-1 bg-green-100 text-green-700 text-xs rounded'
                                  >
                                    {flag.replace('_', ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Shop Information */}
                    <div>
                      <h4 className='font-medium text-gray-900 mb-2'>
                        Shop Information
                      </h4>
                      <div className='bg-white p-3 rounded border text-sm space-y-2'>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>Zone ID:</span>
                          <span>{shop.zoneId}</span>
                        </div>
                        <div className='border-t pt-2 mt-2'>
                          {shop.createdAt && (
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Created:</span>
                              <span>
                                {new Date(shop.createdAt).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {shop.updatedAt && (
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Updated:</span>
                              <span>
                                {new Date(shop.updatedAt).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
