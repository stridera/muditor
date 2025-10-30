'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { PermissionGuard } from '@/components/auth/permission-guard';
import {
  useRealTimeValidation,
  ValidationHelpers,
  ValidationRules,
} from '../../../../hooks/useRealTimeValidation';

const GET_SHOP = gql`
  query GetShop($id: Int!) {
    shop(id: $id) {
      id
      buyProfit
      sellProfit
      temper1
      noSuchItem1
      noSuchItem2
      doNotBuy
      missingCash1
      missingCash2
      messageBuy
      messageSell
      keeperId
      zoneId
      flags
      tradesWithFlags
      createdAt
      updatedAt
      items {
        id
        amount
        objectId
        object {
          id
          shortDesc
          type
          cost
        }
      }
      accepts {
        id
        type
        keywords
      }
      hours {
        id
        open
        close
      }
    }
  }
`;

const GET_AVAILABLE_OBJECTS = gql`
  query GetAvailableObjects {
    objects {
      id
      keywords
      shortDesc
      type
      cost
      zoneId
    }
  }
`;

const GET_AVAILABLE_MOBS = gql`
  query GetAvailableMobs {
    mobs {
      id
      keywords
      shortDesc
      zoneId
    }
  }
`;

const UPDATE_SHOP = gql`
  mutation UpdateShop($id: Int!, $data: UpdateShopInput!) {
    updateShop(id: $id, data: $data) {
      id
      buyProfit
      sellProfit
    }
  }
`;

const CREATE_SHOP = gql`
  mutation CreateShop($data: CreateShopInput!) {
    createShop(data: $data) {
      id
      buyProfit
      sellProfit
    }
  }
`;

interface ShopFormData {
  buyProfit: number;
  sellProfit: number;
  temper1: number;
  noSuchItem1: string;
  noSuchItem2: string;
  doNotBuy: string;
  missingCash1: string;
  missingCash2: string;
  messageBuy: string;
  messageSell: string;
  keeperId: number | null;
  zoneId: number;
}

interface ShopItem {
  id?: string;
  amount: number;
  objectId: number;
  object?: any;
}

interface ShopHour {
  id?: string;
  openHour: number;
  closeHour: number;
}

const SHOP_FLAGS = [
  'WILL_FIGHT',
  'NO_WIELD',
  'NO_STEAL',
  'NO_KILL',
  'SELL_TO_EVIL',
  'SELL_TO_GOOD',
  'SELL_TO_NEUTRAL',
  'NO_KILL_EVIL',
  'NO_KILL_GOOD',
  'NO_KILL_NEUTRAL',
  'TRADE_IN_DARK',
  'HOGTIED_ONLY',
];

const OBJECT_TYPES = [
  'LIGHT',
  'SCROLL',
  'WAND',
  'STAFF',
  'WEAPON',
  'FIREWEAPON',
  'MISSILE',
  'TREASURE',
  'ARMOR',
  'POTION',
  'WORN',
  'OTHER',
  'TRASH',
  'TRAP',
  'CONTAINER',
  'NOTE',
  'LIQUID_CONTAINER',
  'KEY',
  'FOOD',
  'MONEY',
];

// Define validation rules for shop form
const shopValidationRules: ValidationRules<ShopFormData> = [
  {
    field: 'buyProfit',
    validate: ValidationHelpers.min(1, 'Buy profit must be at least 1'),
    debounceMs: 200,
  },
  {
    field: 'sellProfit',
    validate: ValidationHelpers.min(1, 'Sell profit must be at least 1'),
    debounceMs: 200,
  },
  {
    field: 'temper1',
    validate: ValidationHelpers.min(0, 'Temper cannot be negative'),
    debounceMs: 200,
  },
];

function ShopEditorContent() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get('id');
  const isNew = !shopId;

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<ShopFormData>({
    buyProfit: 1.0,
    sellProfit: 1.0,
    temper1: 0,
    noSuchItem1: '',
    noSuchItem2: '',
    doNotBuy: '',
    missingCash1: '',
    missingCash2: '',
    messageBuy: '',
    messageSell: '',
    keeperId: null,
    zoneId: 511,
  });

  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [shopHours, setShopHours] = useState<ShopHour[]>([
    { openHour: 6, closeHour: 20 },
  ]);
  const [acceptedTypes, setAcceptedTypes] = useState<string[]>([]);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [selectedTradesWithFlags, setSelectedTradesWithFlags] = useState<
    string[]
  >([]);

  // Initialize real-time validation
  const { errors, validateField, validateAllFields, clearError } =
    useRealTimeValidation<ShopFormData>(shopValidationRules);

  // Separate state for general/save errors
  const [generalError, setGeneralError] = useState<string>('');

  const { loading, error, data } = useQuery(GET_SHOP, {
    variables: { id: parseInt(shopId || '0') },
    skip: isNew,
  }) as { loading: boolean; error?: any; data?: { shop?: any } };

  const { data: objectsData } = useQuery(GET_AVAILABLE_OBJECTS) as {
    data?: { objects?: any[] };
  };
  const { data: mobsData } = useQuery(GET_AVAILABLE_MOBS) as {
    data?: { mobs?: any[] };
  };

  const [updateShop, { loading: updateLoading }] = useMutation(UPDATE_SHOP);
  const [createShop, { loading: createLoading }] = useMutation(CREATE_SHOP);

  useEffect(() => {
    if (data?.shop) {
      const shop = data.shop;
      setFormData({
        buyProfit: shop.buyProfit || 1.0,
        sellProfit: shop.sellProfit || 1.0,
        temper1: shop.temper1 || 0,
        noSuchItem1: shop.noSuchItem1 || '',
        noSuchItem2: shop.noSuchItem2 || '',
        doNotBuy: shop.doNotBuy || '',
        missingCash1: shop.missingCash1 || '',
        missingCash2: shop.missingCash2 || '',
        messageBuy: shop.messageBuy || '',
        messageSell: shop.messageSell || '',
        keeperId: shop.keeperId || null,
        zoneId: shop.zoneId || 511,
      });
      setShopItems(shop.items || []);
      setShopHours(shop.hours || [{ openHour: 6, closeHour: 20 }]);
      setAcceptedTypes(shop.accepts?.map((a: any) => a.objectType) || []);
      setSelectedFlags(shop.flags || []);
      setSelectedTradesWithFlags(shop.tradesWithFlags || []);
    }
  }, [data]);

  const handleInputChange = (
    field: keyof ShopFormData,
    value: string | number
  ) => {
    const updatedFormData = {
      ...formData,
      [field]: value,
    };

    setFormData(updatedFormData);

    // Clear general error when user makes changes
    if (generalError) {
      setGeneralError('');
    }

    // Trigger real-time validation for this field
    validateField(field, value, updatedFormData);
  };

  const handleFlagToggle = (flag: string, flagType: 'shop' | 'tradesWith') => {
    if (flagType === 'shop') {
      setSelectedFlags(prev =>
        prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
      );
    } else {
      setSelectedTradesWithFlags(prev =>
        prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
      );
    }
  };

  const handleAcceptedTypeToggle = (type: string) => {
    setAcceptedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const addShopItem = () => {
    setShopItems(prev => [...prev, { amount: 0, objectId: 0 }]);
  };

  const removeShopItem = (index: number) => {
    setShopItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateShopItem = (index: number, field: keyof ShopItem, value: any) => {
    setShopItems(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addShopHour = () => {
    setShopHours(prev => [...prev, { openHour: 6, closeHour: 20 }]);
  };

  const removeShopHour = (index: number) => {
    setShopHours(prev => prev.filter((_, i) => i !== index));
  };

  const updateShopHour = (
    index: number,
    field: keyof ShopHour,
    value: number
  ) => {
    setShopHours(prev =>
      prev.map((hour, i) => (i === index ? { ...hour, [field]: value } : hour))
    );
  };

  const validateForm = (): boolean => {
    // Use the real-time validation for final form validation
    return validateAllFields(formData);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const saveData = {
        ...formData,
        flags: selectedFlags,
        tradesWithFlags: selectedTradesWithFlags,
        // Note: Items, hours, and accepts would need separate mutations in a real implementation
        // For now, we're just saving the basic shop data
      };

      if (isNew) {
        await createShop({
          variables: {
            data: saveData,
          },
        });
      } else {
        await updateShop({
          variables: {
            id: parseInt(shopId!),
            data: saveData,
          },
        });
      }

      // Redirect back to shops list
      window.location.href = '/dashboard/shops';
    } catch (err) {
      console.error('Error saving shop:', err);
      setGeneralError('Failed to save shop. Please try again.');
    }
  };

  if (loading) return <div className='p-4'>Loading shop data...</div>;
  if (error)
    return <div className='p-4 text-red-600'>Error: {error.message}</div>;

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'settings', label: 'Settings' },
    { id: 'messages', label: 'Messages' },
  ];

  return (
    <div className='container mx-auto p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            {isNew ? 'Create New Shop' : `Edit Shop ${shopId}`}
          </h1>
          <p className='text-gray-600 mt-1'>
            Configure shop inventory, pricing, and trading policies
          </p>
        </div>
        <div className='flex gap-2'>
          <Link href='/dashboard/shops'>
            <button className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Shops
            </button>
          </Link>
          <button
            onClick={handleSave}
            disabled={updateLoading || createLoading}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
          >
            <Save className='w-4 h-4 mr-2' />
            {isNew ? 'Create Shop' : 'Save Changes'}
          </button>
        </div>
      </div>

      {generalError && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4'>
          {generalError}
        </div>
      )}

      {/* Tabs */}
      <div className='mb-6'>
        <nav className='flex space-x-8' aria-label='Tabs'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='space-y-6'>
        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className='grid grid-cols-2 gap-6'>
            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Pricing & Profits
              </h3>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='buyProfit'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Buy Profit Margin *
                  </label>
                  <input
                    type='number'
                    id='buyProfit'
                    step='0.1'
                    min='0.1'
                    value={formData.buyProfit}
                    onChange={e =>
                      handleInputChange(
                        'buyProfit',
                        parseFloat(e.target.value) || 1.0
                      )
                    }
                    className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.buyProfit ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.buyProfit && (
                    <p className='text-red-500 text-xs mt-1'>
                      {errors.buyProfit}
                    </p>
                  )}
                  <p className='text-xs text-gray-500 mt-1'>
                    Multiplier for buying from players (1.0 = 100%)
                  </p>
                </div>

                <div>
                  <label
                    htmlFor='sellProfit'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Sell Profit Margin *
                  </label>
                  <input
                    type='number'
                    id='sellProfit'
                    step='0.1'
                    min='0.1'
                    value={formData.sellProfit}
                    onChange={e =>
                      handleInputChange(
                        'sellProfit',
                        parseFloat(e.target.value) || 1.0
                      )
                    }
                    className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.sellProfit ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.sellProfit && (
                    <p className='text-red-500 text-xs mt-1'>
                      {errors.sellProfit}
                    </p>
                  )}
                  <p className='text-xs text-gray-500 mt-1'>
                    Multiplier for selling to players (1.0 = 100%)
                  </p>
                </div>

                <div>
                  <label
                    htmlFor='temper1'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Shopkeeper Temper
                  </label>
                  <input
                    type='number'
                    id='temper1'
                    min='0'
                    max='100'
                    value={formData.temper1}
                    onChange={e =>
                      handleInputChange(
                        'temper1',
                        parseInt(e.target.value) || 0
                      )
                    }
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    0 = calm, 100 = very aggressive
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Shop Details
              </h3>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='keeperId'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Shopkeeper
                  </label>
                  <select
                    id='keeperId'
                    value={formData.keeperId || ''}
                    onChange={e =>
                      handleInputChange(
                        'keeperId',
                        parseInt(e.target.value) || 0
                      )
                    }
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  >
                    <option value=''>No shopkeeper</option>
                    {mobsData?.mobs?.map((mob: any) => (
                      <option key={mob.id} value={mob.id}>
                        {mob.shortDesc} (#{mob.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor='zoneId'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Zone ID
                  </label>
                  <input
                    type='number'
                    id='zoneId'
                    value={formData.zoneId}
                    onChange={e =>
                      handleInputChange(
                        'zoneId',
                        parseInt(e.target.value) || 511
                      )
                    }
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>
              </div>

              <div className='mt-6'>
                <h4 className='text-sm font-medium text-gray-900 mb-3'>
                  Operating Hours
                </h4>
                <div className='space-y-2'>
                  {shopHours.map((hour, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <select
                        value={hour.openHour}
                        onChange={e =>
                          updateShopHour(
                            index,
                            'openHour',
                            parseInt(e.target.value)
                          )
                        }
                        className='rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm'
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}:00
                          </option>
                        ))}
                      </select>
                      <span className='text-sm text-gray-500'>to</span>
                      <select
                        value={hour.closeHour}
                        onChange={e =>
                          updateShopHour(
                            index,
                            'closeHour',
                            parseInt(e.target.value)
                          )
                        }
                        className='rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm'
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}:00
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeShopHour(index)}
                        className='text-red-600 hover:text-red-800 p-1'
                      >
                        <Trash2 className='w-3 h-3' />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addShopHour}
                    className='text-sm text-blue-600 hover:text-blue-800 inline-flex items-center'
                  >
                    <Plus className='w-3 h-3 mr-1' />
                    Add Hours
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className='space-y-6'>
            <div className='bg-white shadow rounded-lg p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Shop Inventory
                </h3>
                <button
                  onClick={addShopItem}
                  className='inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Add Item
                </button>
              </div>

              <div className='space-y-3'>
                {shopItems.map((item, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-4 p-3 border rounded-lg'
                  >
                    <div className='flex-1'>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Object
                      </label>
                      <select
                        value={item.objectId || ''}
                        onChange={e =>
                          updateShopItem(
                            index,
                            'objectId',
                            parseInt(e.target.value)
                          )
                        }
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      >
                        <option value=''>Select object</option>
                        {objectsData?.objects?.map((obj: any) => (
                          <option key={obj.id} value={obj.id}>
                            {obj.shortDesc} - {obj.cost}cp
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='w-24'>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Stock
                      </label>
                      <input
                        type='number'
                        min='0'
                        value={item.amount}
                        onChange={e =>
                          updateShopItem(
                            index,
                            'amount',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      />
                    </div>

                    <button
                      onClick={() => removeShopItem(index)}
                      className='text-red-600 hover:text-red-800 p-2'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                ))}

                {shopItems.length === 0 && (
                  <div className='text-center py-8 text-gray-500'>
                    No items in inventory. Click "Add Item" to start.
                  </div>
                )}
              </div>
            </div>

            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Accepted Item Types
              </h3>
              <p className='text-sm text-gray-600 mb-4'>
                Select which types of objects this shop will buy from players.
              </p>
              <div className='grid grid-cols-3 gap-2'>
                {OBJECT_TYPES.map(type => (
                  <label key={type} className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={acceptedTypes.includes(type)}
                      onChange={() => handleAcceptedTypeToggle(type)}
                      className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                    />
                    <span className='ml-2 text-sm text-gray-700'>
                      {type.replace('_', ' ').toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className='grid grid-cols-2 gap-6'>
            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Shop Flags
              </h3>
              <div className='space-y-2'>
                {SHOP_FLAGS.map(flag => (
                  <label key={flag} className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={selectedFlags.includes(flag)}
                      onChange={() => handleFlagToggle(flag, 'shop')}
                      className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                    />
                    <span className='ml-2 text-sm text-gray-700'>
                      {flag.replace('_', ' ').toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Trading Policies
              </h3>
              <div className='space-y-2'>
                {[
                  'EVIL',
                  'GOOD',
                  'NEUTRAL',
                  'HUMAN',
                  'ELF',
                  'DWARF',
                  'ORC',
                  'HALFLING',
                ].map(flag => (
                  <label key={flag} className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={selectedTradesWithFlags.includes(flag)}
                      onChange={() => handleFlagToggle(flag, 'tradesWith')}
                      className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                    />
                    <span className='ml-2 text-sm text-gray-700'>
                      Trades with {flag.toLowerCase()}s
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className='bg-white shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Shop Messages
            </h3>
            <div className='grid grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='messageBuy'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Buy Message
                  </label>
                  <textarea
                    id='messageBuy'
                    rows={3}
                    value={formData.messageBuy}
                    onChange={e =>
                      handleInputChange('messageBuy', e.target.value)
                    }
                    placeholder='Message when shopkeeper buys from player'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>

                <div>
                  <label
                    htmlFor='messageSell'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Sell Message
                  </label>
                  <textarea
                    id='messageSell'
                    rows={3}
                    value={formData.messageSell}
                    onChange={e =>
                      handleInputChange('messageSell', e.target.value)
                    }
                    placeholder='Message when shopkeeper sells to player'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>

                <div>
                  <label
                    htmlFor='noSuchItem1'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    No Such Item Message 1
                  </label>
                  <input
                    type='text'
                    id='noSuchItem1'
                    value={formData.noSuchItem1}
                    onChange={e =>
                      handleInputChange('noSuchItem1', e.target.value)
                    }
                    placeholder='Message when item not found'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='noSuchItem2'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    No Such Item Message 2
                  </label>
                  <input
                    type='text'
                    id='noSuchItem2'
                    value={formData.noSuchItem2}
                    onChange={e =>
                      handleInputChange('noSuchItem2', e.target.value)
                    }
                    placeholder='Alternative message when item not found'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>

                <div>
                  <label
                    htmlFor='doNotBuy'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Do Not Buy Message
                  </label>
                  <input
                    type='text'
                    id='doNotBuy'
                    value={formData.doNotBuy}
                    onChange={e =>
                      handleInputChange('doNotBuy', e.target.value)
                    }
                    placeholder='Message when refusing to buy item'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>

                <div>
                  <label
                    htmlFor='missingCash1'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Missing Cash Message 1
                  </label>
                  <input
                    type='text'
                    id='missingCash1'
                    value={formData.missingCash1}
                    onChange={e =>
                      handleInputChange('missingCash1', e.target.value)
                    }
                    placeholder='Message when player lacks funds'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>

                <div>
                  <label
                    htmlFor='missingCash2'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Missing Cash Message 2
                  </label>
                  <input
                    type='text'
                    id='missingCash2'
                    value={formData.missingCash2}
                    onChange={e =>
                      handleInputChange('missingCash2', e.target.value)
                    }
                    placeholder='Alternative message when player lacks funds'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopEditor() {
  return (
    <PermissionGuard requireImmortal={true}>
      <Suspense fallback={<div className='p-6'>Loading shop editor...</div>}>
        <ShopEditorContent />
      </Suspense>
    </PermissionGuard>
  );
}
