'use client';

export const dynamic = 'force-dynamic';

import { PermissionGuard } from '@/components/auth/permission-guard';
// Apollo hooks imported via generated code; direct useMutation/useQuery unused now
import type { ShopFlag, ShopTradesWith } from '@/generated/graphql';
import {
  CreateShopEditorDocument,
  GetAvailableMobsDocument,
  GetAvailableObjectsDocument,
  GetShopEditorDocument,
  SearchMobsDocument,
  GetZonesEditorDocument,
  UpdateShopEditorDocument,
  UpdateShopInventoryEditorDocument,
} from '@/generated/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { ArrowLeft, Plus, Save, Trash2, X } from 'lucide-react';
import { useListReturnHref } from '@/hooks/use-list-state';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import type { ValidationRules } from '../../../../hooks/useRealTimeValidation';
import {
  useRealTimeValidation,
  ValidationHelpers,
} from '../../../../hooks/useRealTimeValidation';

// Inline gql operations removed; now using generated typed hooks from codegen

interface ShopFormData {
  id: number; // required for create path per CreateShopInput
  buyProfit: number;
  sellProfit: number;
  temper: number;
  keeperId: number | null;
  keeperZoneId: number | null;
  zoneId: number;
}

import type { ShopItem, ShopQueryResult } from '@/lib/shopMapping';
import { mapShopItems } from '@/lib/shopMapping';
import { buildShopSavePayload, type ShopKeeperRef } from '@/lib/shopPayload';

interface MessageListProps {
  title: string;
  values: string[];
  setValues: (vals: string[]) => void;
  placeholder?: string;
}

function MessageList({
  title,
  values,
  setValues,
  placeholder,
}: MessageListProps) {
  const updateValue = (idx: number, val: string) => {
    setValues(values.map((v, i) => (i === idx ? val : v)));
  };
  const addRow = () => setValues([...values, '']);
  const removeRow = (idx: number) => {
    if (values.length === 1) {
      // Keep at least one row
      setValues(['']);
      return;
    }
    setValues(values.filter((_, i) => i !== idx));
  };
  return (
    <div>
      <h4 className='text-sm font-medium text-foreground mb-2'>{title}</h4>
      <div className='space-y-2'>
        {values.map((val, idx) => (
          <div key={idx} className='flex gap-2 items-start'>
            <textarea
              rows={2}
              value={val}
              onChange={e => updateValue(idx, e.target.value)}
              placeholder={placeholder}
              className='flex-1 rounded-md border-input shadow-sm focus:ring-ring focus:border-ring text-sm'
            />
            <button
              type='button'
              onClick={() => removeRow(idx)}
              className='text-destructive hover:text-destructive/90 p-1'
              aria-label={`Remove ${title} row ${idx + 1}`}
            >
              <Trash2 className='w-4 h-4' />
            </button>
          </div>
        ))}
        <button
          type='button'
          onClick={addRow}
          className='inline-flex items-center text-sm text-primary hover:text-primary/90'
        >
          <Plus className='w-3 h-3 mr-1' /> Add{' '}
          {title.replace(/ Messages?$/, '')} Message
        </button>
      </div>
    </div>
  );
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
    field: 'id',
    validate: value => (value && value > 0 ? null : 'Shop ID must be > 0'),
    debounceMs: 0,
  },
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
    field: 'temper',
    validate: ValidationHelpers.min(0, 'Temper cannot be negative'),
    debounceMs: 200,
  },
];

// Types now imported from mapping helpers

function ShopEditorContent() {
  const listHref = useListReturnHref('/dashboard/shops');
  const searchParams = useSearchParams();
  const shopId = searchParams.get('id');
  const zoneId = searchParams.get('zone');
  const isNew = !shopId;

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<ShopFormData>({
    id: 0,
    buyProfit: 1.0,
    sellProfit: 1.0,
    temper: 0,
    keeperId: null,
    keeperZoneId: null,
    zoneId: 511,
  });
  const [buyMessages, setBuyMessages] = useState<string[]>(['']);
  const [sellMessages, setSellMessages] = useState<string[]>(['']);
  const [noSuchItemMessages, setNoSuchItemMessages] = useState<string[]>(['']);
  const [doNotBuyMessages, setDoNotBuyMessages] = useState<string[]>(['']);
  const [missingCashMessages, setMissingCashMessages] = useState<string[]>([
    '',
  ]);

  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [acceptedTypes, setAcceptedTypes] = useState<string[]>([]);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [selectedTradesWithFlags, setSelectedTradesWithFlags] = useState<
    string[]
  >([]);

  // Add Item Modal state
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [modalSelectedZoneId, setModalSelectedZoneId] = useState<number>(0);
  const [modalSelectedObjectId, setModalSelectedObjectId] = useState<number>(0);
  const [modalAmount, setModalAmount] = useState<number>(0);

  // Initialize real-time validation
  const { errors, validateField, validateAllFields } =
    useRealTimeValidation<ShopFormData>(shopValidationRules);

  // Separate state for general/save errors
  const [generalError, setGeneralError] = useState<string>('');

  const { loading, error, data } = useQuery(GetShopEditorDocument, {
    variables: { id: parseInt(shopId || '0'), zoneId: parseInt(zoneId || '0') },
    skip: isNew,
  });

  // Get the zone ID from the shop data or from query params/form data
  const effectiveZoneId = (() => {
    const raw = data?.shop as ShopQueryResult | undefined;
    return (
      parseInt(zoneId || '0') ||
      (typeof raw?.zoneId === 'number' ? raw.zoneId : undefined) ||
      formData.zoneId
    );
  })();

  const { data: objectsData } = useQuery(GetAvailableObjectsDocument, {
    variables: { zoneId: effectiveZoneId },
    skip: !effectiveZoneId,
  });
  // Mob summary type inferred from generated types; local interface removed
  const { data: mobsData } = useQuery(GetAvailableMobsDocument, {
    variables: { zoneId: effectiveZoneId },
    skip: !effectiveZoneId,
  });

  // Keeper search across all zones (the keeper need not live in the shop's zone)
  const [keeperSearch, setKeeperSearch] = useState('');
  const { data: keeperSearchData } = useQuery(SearchMobsDocument, {
    variables: { search: keeperSearch.trim(), limit: 20 },
    skip: keeperSearch.trim().length < 2,
  });

  // Query for zones (for modal)
  // Zone summary type inferred from generated types; local interface removed
  const { data: zonesData } = useQuery(GetZonesEditorDocument);

  // Query for objects in modal's selected zone
  const { data: modalObjectsData } = useQuery(GetAvailableObjectsDocument, {
    variables: { zoneId: modalSelectedZoneId },
    skip: !modalSelectedZoneId || !showAddItemModal,
    fetchPolicy: 'network-only',
  });

  // Keeper the shop had when loaded; unchanged keepers are not re-sent on save.
  const [initialKeeper, setInitialKeeper] = useState<ShopKeeperRef | null>(
    null
  );

  const [updateShop, { loading: updateLoading }] = useMutation(
    UpdateShopEditorDocument
  );
  const [createShop, { loading: createLoading }] = useMutation(
    CreateShopEditorDocument
  );
  const [updateInventory] = useMutation(UpdateShopInventoryEditorDocument);

  useEffect(() => {
    if (data?.shop) {
      // Use a structural type to access arrays we requested in the query
      // Raw shop includes arrays and possible string ids for accepts from GraphQL
      type RawShop = ShopQueryResult & {
        noSuchItemMessages?: string[];
        doNotBuyMessages?: string[];
        missingCashMessages?: string[];
        buyMessages?: string[];
        sellMessages?: string[];
        accepts?: ShopQueryResult['accepts'];
        flags?: ShopFlag[];
        tradesWithFlags?: ShopTradesWith[];
      };
      const shop: RawShop = data.shop as unknown as RawShop;
      const loadedKeeperZoneId =
        typeof shop.keeperId === 'number' &&
        typeof data.shop.keeper?.zoneId === 'number'
          ? data.shop.keeper.zoneId
          : null;
      setInitialKeeper({
        keeperId: typeof shop.keeperId === 'number' ? shop.keeperId : null,
        keeperZoneId: loadedKeeperZoneId,
      });
      // Transform array-based messages into individual editable fields
      setFormData({
        id: shop.id ?? 0,
        buyProfit: typeof shop.buyProfit === 'number' ? shop.buyProfit : 1.0,
        sellProfit: typeof shop.sellProfit === 'number' ? shop.sellProfit : 1.0,
        temper: typeof shop.temper === 'number' ? shop.temper : 0,
        keeperId: typeof shop.keeperId === 'number' ? shop.keeperId : null,
        keeperZoneId: loadedKeeperZoneId,
        zoneId: typeof shop.zoneId === 'number' ? shop.zoneId : formData.zoneId,
      });
      setNoSuchItemMessages(
        Array.isArray(shop.noSuchItemMessages) && shop.noSuchItemMessages.length
          ? shop.noSuchItemMessages
          : ['']
      );
      setDoNotBuyMessages(
        Array.isArray(shop.doNotBuyMessages) && shop.doNotBuyMessages.length
          ? shop.doNotBuyMessages
          : ['']
      );
      setMissingCashMessages(
        Array.isArray(shop.missingCashMessages) &&
          shop.missingCashMessages.length
          ? shop.missingCashMessages
          : ['']
      );
      setBuyMessages(
        Array.isArray(shop.buyMessages) && shop.buyMessages.length
          ? shop.buyMessages
          : ['']
      );
      setSellMessages(
        Array.isArray(shop.sellMessages) && shop.sellMessages.length
          ? shop.sellMessages
          : ['']
      );
      setShopItems(mapShopItems(shop as ShopQueryResult));
      setAcceptedTypes(
        Array.isArray(shop.accepts)
          ? shop.accepts
              .map((a: { type?: string }) =>
                typeof a.type === 'string' ? a.type : undefined
              )
              .filter((t: string | undefined): t is string => !!t)
          : []
      );
      setSelectedFlags(
        Array.isArray(shop.flags)
          ? shop.flags.map((f: ShopFlag) => String(f))
          : []
      );
      setSelectedTradesWithFlags(
        Array.isArray(shop.tradesWithFlags)
          ? shop.tradesWithFlags.map((f: ShopTradesWith) => String(f))
          : []
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // The keeper is a (zone, id) pair; the dropdown value encodes both.
  const handleKeeperChange = (value: string) => {
    const [kz, ki] = value.split(':').map(v => parseInt(v, 10));
    setFormData(prev => ({
      ...prev,
      keeperId: ki != null && !Number.isNaN(ki) ? ki : null,
      keeperZoneId: kz != null && !Number.isNaN(kz) ? kz : null,
    }));
    if (generalError) setGeneralError('');
  };

  const keeperOptions = (() => {
    const byKey = new Map<
      string,
      { zoneId: number; id: number; name: string }
    >();
    const add = (m: { zoneId: number; id: number; name: string }) =>
      byKey.set(`${m.zoneId}:${m.id}`, m);
    // Always include the current keeper, even when it lives in another zone
    if (formData.keeperId != null && formData.keeperZoneId != null) {
      const k = data?.shop?.keeper;
      add({
        zoneId: formData.keeperZoneId,
        id: formData.keeperId,
        name: k?.name ?? 'Current keeper',
      });
    }
    mobsData?.mobsByZone?.forEach(add);
    keeperSearchData?.searchMobs?.forEach(add);
    return [...byKey.values()];
  })();

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

  const openAddItemModal = () => {
    setShowAddItemModal(true);
  };

  const closeAddItemModal = () => {
    setShowAddItemModal(false);
    setModalSelectedZoneId(0);
    setModalSelectedObjectId(0);
    setModalAmount(0);
  };

  // Reset modal state when opening
  useEffect(() => {
    if (showAddItemModal) {
      setModalSelectedZoneId(effectiveZoneId);
      setModalSelectedObjectId(0);
      setModalAmount(0);
    }
  }, [showAddItemModal, effectiveZoneId]);

  // Reset object selection when zone changes in modal
  useEffect(() => {
    if (showAddItemModal) {
      setModalSelectedObjectId(0);
    }
  }, [modalSelectedZoneId, showAddItemModal]);

  const confirmAddItem = () => {
    if (modalSelectedObjectId && modalSelectedZoneId) {
      setShopItems(prev => [
        ...prev,
        {
          amount: modalAmount,
          objectId: modalSelectedObjectId,
          objectZoneId: modalSelectedZoneId,
        },
      ]);
      closeAddItemModal();
    }
  };

  const removeShopItem = (index: number) => {
    setShopItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateShopItem = (
    index: number,
    field: keyof ShopItem,
    value: ShopItem[keyof ShopItem]
  ) => {
    setShopItems(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const validateForm = (): boolean => {
    // Use the real-time validation for final form validation
    return validateAllFields(formData);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const saveData = buildShopSavePayload(
        formData,
        selectedFlags,
        selectedTradesWithFlags,
        buyMessages,
        sellMessages,
        noSuchItemMessages,
        doNotBuyMessages,
        missingCashMessages,
        isNew ? undefined : initialKeeper
      );

      if (isNew) {
        if (formData.id == null) {
          setGeneralError('Shop ID is required for creation');
          return;
        }
        if (formData.keeperId == null) {
          setGeneralError('Keeper mob is required for creation');
          return;
        }
        const createResult = await createShop({
          variables: {
            data: {
              id: formData.id,
              ...saveData,
              keeperId: formData.keeperId,
              keeperZoneId: formData.keeperZoneId ?? formData.zoneId,
              zoneId: formData.zoneId,
            },
          },
        });
        const newId = createResult.data?.createShop?.id;
        if (newId && shopItems.length) {
          await updateInventory({
            variables: {
              id: newId,
              zoneId: formData.zoneId,
              items: shopItems.map(i => ({
                amount: i.amount,
                objectZoneId: i.objectZoneId,
                objectId: i.objectId,
              })),
            },
            optimisticResponse: {
              updateShopInventory: {
                id: newId,
                items: shopItems.map((i, idx) => ({
                  id: String(idx),
                  amount: i.amount,
                  objectId: i.objectId,
                  objectZoneId: i.objectZoneId,
                  object: null,
                  __typename: 'ShopItemDto',
                })),
                __typename: 'ShopDto',
              },
            },
          });
        }
      } else {
        // The record key comes from the URL, never from the (editable) form.
        const numericId = parseInt(shopId!);
        const recordZoneId = parseInt(zoneId!);
        await updateShop({
          variables: {
            id: numericId,
            zoneId: recordZoneId,
            data: saveData,
          },
        });
        // Batch replace inventory
        await updateInventory({
          variables: {
            id: numericId,
            zoneId: recordZoneId,
            items: shopItems.map(i => ({
              amount: i.amount,
              objectZoneId: i.objectZoneId,
              objectId: i.objectId,
            })),
          },
          optimisticResponse: {
            updateShopInventory: {
              id: numericId,
              items: shopItems.map((i, idx) => ({
                id: String(idx),
                amount: i.amount,
                objectId: i.objectId,
                objectZoneId: i.objectZoneId,
                object: null,
                __typename: 'ShopItemDto',
              })),
              __typename: 'ShopDto',
            },
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
  if (error) {
    const msg = (error as { message?: string })?.message || 'Unknown error';
    return <div className='p-4 text-destructive'>Error: {msg}</div>;
  }

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
          <h1 className='text-3xl font-bold text-foreground'>
            {isNew
              ? 'Create New Shop'
              : data?.shop?.keeper?.name
                ? `${data.shop.keeper.name}'s Shop`
                : formData.zoneId
                  ? `Shop: Zone ${formData.zoneId}, ID ${shopId}`
                  : `Shop ${shopId}`}
          </h1>
          <p className='text-muted-foreground mt-1'>
            Configure shop inventory, pricing, and trading policies
          </p>
        </div>
        <div className='flex gap-2'>
          <Link href={listHref}>
            <button className='inline-flex items-center px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-card hover:bg-accent'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Shops
            </button>
          </Link>
          <button
            onClick={handleSave}
            disabled={updateLoading || createLoading}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50'
          >
            <Save className='w-4 h-4 mr-2' />
            {isNew ? 'Create Shop' : 'Save Changes'}
          </button>
        </div>
      </div>

      {generalError && (
        <div className='bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4'>
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
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:border-input'
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
            <div className='bg-card shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-foreground mb-4'>
                Pricing & Profits
              </h3>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='buyProfit'
                    className='block text-sm font-medium text-muted-foreground mb-1'
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
                    className={`block w-full rounded-md shadow-sm focus:ring-ring focus:border-ring sm:text-sm ${
                      errors.buyProfit ? 'border-destructive' : 'border-input'
                    }`}
                  />
                  {errors.buyProfit && (
                    <p className='text-destructive text-xs mt-1'>
                      {errors.buyProfit}
                    </p>
                  )}
                  <p className='text-xs text-muted-foreground mt-1'>
                    Multiplier for buying from players (1.0 = 100%)
                  </p>
                </div>

                <div>
                  <label
                    htmlFor='sellProfit'
                    className='block text-sm font-medium text-muted-foreground mb-1'
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
                    className={`block w-full rounded-md shadow-sm focus:ring-ring focus:border-ring sm:text-sm ${
                      errors.sellProfit ? 'border-destructive' : 'border-input'
                    }`}
                  />
                  {errors.sellProfit && (
                    <p className='text-destructive text-xs mt-1'>
                      {errors.sellProfit}
                    </p>
                  )}
                  <p className='text-xs text-muted-foreground mt-1'>
                    Multiplier for selling to players (1.0 = 100%)
                  </p>
                </div>

                <div>
                  <label
                    htmlFor='temper'
                    className='block text-sm font-medium text-muted-foreground mb-1'
                  >
                    Shopkeeper Temper
                  </label>
                  <input
                    type='number'
                    id='temper'
                    min='0'
                    max='100'
                    value={formData.temper}
                    onChange={e =>
                      handleInputChange('temper', parseInt(e.target.value) || 0)
                    }
                    className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    0 = calm, 100 = very aggressive
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-card shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-foreground mb-4'>
                Shop Details
              </h3>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='id'
                    className='block text-sm font-medium text-muted-foreground mb-1'
                  >
                    Shop ID *
                  </label>
                  <input
                    type='number'
                    id='id'
                    value={formData.id}
                    onChange={e =>
                      handleInputChange('id', parseInt(e.target.value) || 0)
                    }
                    disabled={!isNew}
                    className={`block w-full rounded-md shadow-sm focus:ring-ring focus:border-ring sm:text-sm ${errors.id ? 'border-destructive' : 'border-input'}`}
                  />
                  {errors.id && (
                    <p className='text-destructive text-xs mt-1'>{errors.id}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor='keeperId'
                    className='block text-sm font-medium text-muted-foreground mb-1'
                  >
                    Shopkeeper
                  </label>
                  <input
                    type='search'
                    aria-label='Search mobs in any zone'
                    placeholder='Search mobs in any zone...'
                    value={keeperSearch}
                    onChange={e => setKeeperSearch(e.target.value)}
                    className='mb-2 block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                  />
                  <select
                    id='keeperId'
                    value={
                      formData.keeperId != null && formData.keeperZoneId != null
                        ? `${formData.keeperZoneId}:${formData.keeperId}`
                        : ''
                    }
                    onChange={e => handleKeeperChange(e.target.value)}
                    className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                  >
                    <option value=''>No shopkeeper</option>
                    {keeperOptions.map(mob => (
                      <option
                        key={`${mob.zoneId}:${mob.id}`}
                        value={`${mob.zoneId}:${mob.id}`}
                      >
                        {mob.name} (#{mob.zoneId}:{mob.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor='zoneId'
                    className='block text-sm font-medium text-muted-foreground mb-1'
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
                    disabled={!isNew}
                    className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className='space-y-6'>
            <div className='bg-card shadow rounded-lg p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-medium text-foreground'>
                  Shop Inventory
                </h3>
                <button
                  onClick={openAddItemModal}
                  className='inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90'
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
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
                        Object
                      </label>
                      <select
                        value={`${item.objectZoneId}:${item.objectId}`}
                        onChange={e => {
                          const parts = e.target.value.split(':');
                          const zoneId = parts[0] ?? '0';
                          const objId = parts[1] ?? '0';
                          const newItems = [...shopItems];
                          const existing = newItems[index];
                          newItems[index] = {
                            ...existing,
                            amount: existing?.amount ?? 0, // preserve required amount
                            objectZoneId: parseInt(zoneId) || 0,
                            objectId: parseInt(objId) || 0,
                          };
                          setShopItems(newItems);
                        }}
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                      >
                        <option value='0:0'>Select object</option>
                        {objectsData?.objectsByZone?.map(
                          (obj: (typeof objectsData.objectsByZone)[number]) => (
                            <option
                              key={`${obj.zoneId}-${obj.id}`}
                              value={`${obj.zoneId}:${obj.id}`}
                            >
                              {obj.name} (#{obj.zoneId}:{obj.id}) - {obj.cost}cp
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className='w-24'>
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                      />
                    </div>

                    <button
                      onClick={() => removeShopItem(index)}
                      className='text-destructive hover:text-destructive/90 p-2'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                ))}

                {shopItems.length === 0 && (
                  <div className='text-center py-8 text-muted-foreground'>
                    No items in inventory. Click "Add Item" to start.
                  </div>
                )}
              </div>
            </div>

            <div className='bg-card shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-foreground mb-4'>
                Accepted Item Types
              </h3>
              <p className='text-sm text-muted-foreground mb-4'>
                Select which types of objects this shop will buy from players.
              </p>
              <div className='grid grid-cols-3 gap-2'>
                {OBJECT_TYPES.map(type => (
                  <label key={type} className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={acceptedTypes.includes(type)}
                      onChange={() => handleAcceptedTypeToggle(type)}
                      className='rounded border-input text-primary shadow-sm focus:border-ring focus:ring focus:ring-ring/20 focus:ring-opacity-50'
                    />
                    <span className='ml-2 text-sm text-muted-foreground'>
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
            <div className='bg-card shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-foreground mb-4'>
                Shop Flags
              </h3>
              <div className='space-y-2'>
                {SHOP_FLAGS.map(flag => (
                  <label key={flag} className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={selectedFlags.includes(flag)}
                      onChange={() => handleFlagToggle(flag, 'shop')}
                      className='rounded border-input text-primary shadow-sm focus:border-ring focus:ring focus:ring-ring/20 focus:ring-opacity-50'
                    />
                    <span className='ml-2 text-sm text-muted-foreground'>
                      {flag.replace('_', ' ').toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className='bg-card shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-foreground mb-4'>
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
                      className='rounded border-input text-primary shadow-sm focus:border-ring focus:ring focus:ring-ring/20 focus:ring-opacity-50'
                    />
                    <span className='ml-2 text-sm text-muted-foreground'>
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
          <div className='bg-card shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-foreground mb-4'>
              Shop Messages
            </h3>
            <p className='text-sm text-muted-foreground mb-4'>
              Add, edit, or remove messages. Empty lines will be ignored when
              saving.
            </p>
            <div className='grid grid-cols-2 gap-8'>
              <div className='space-y-6'>
                <MessageList
                  title='Buy Messages'
                  values={buyMessages}
                  setValues={setBuyMessages}
                  placeholder='Message when shopkeeper buys from player'
                />
                <MessageList
                  title='Sell Messages'
                  values={sellMessages}
                  setValues={setSellMessages}
                  placeholder='Message when shopkeeper sells to player'
                />
                <MessageList
                  title='No Such Item Messages'
                  values={noSuchItemMessages}
                  setValues={setNoSuchItemMessages}
                  placeholder='Message when item not found'
                />
              </div>
              <div className='space-y-6'>
                <MessageList
                  title='Missing Cash Messages'
                  values={missingCashMessages}
                  setValues={setMissingCashMessages}
                  placeholder='Message when player lacks funds'
                />
                <MessageList
                  title='Do Not Buy Messages'
                  values={doNotBuyMessages}
                  setValues={setDoNotBuyMessages}
                  placeholder='Message when refusing to buy item'
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-semibold text-foreground'>
                Add Item to Inventory
              </h2>
              <button
                onClick={closeAddItemModal}
                className='text-muted-foreground hover:text-muted-foreground'
              >
                <X className='w-6 h-6' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-muted-foreground mb-2'>
                  Select Zone
                </label>
                <select
                  value={modalSelectedZoneId}
                  onChange={e =>
                    setModalSelectedZoneId(parseInt(e.target.value))
                  }
                  className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                >
                  <option value={0}>Select a zone</option>
                  {zonesData?.zones?.map(
                    (zone: (typeof zonesData.zones)[number]) => (
                      <option key={zone.id} value={zone.id}>
                        Zone {zone.id}: {zone.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {modalSelectedZoneId > 0 && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-muted-foreground mb-2'>
                      Select Object
                    </label>
                    <select
                      value={modalSelectedObjectId}
                      onChange={e =>
                        setModalSelectedObjectId(parseInt(e.target.value))
                      }
                      className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                    >
                      <option value={0}>Select an object</option>
                      {modalObjectsData?.objectsByZone?.map(
                        (
                          obj: (typeof modalObjectsData.objectsByZone)[number]
                        ) => (
                          <option
                            key={`${obj.zoneId}-${obj.id}`}
                            value={obj.id}
                          >
                            {obj.name} (#{obj.zoneId}:{obj.id}) - {obj.cost}cp
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-muted-foreground mb-2'>
                      Initial Stock Amount
                    </label>
                    <input
                      type='number'
                      min='0'
                      value={modalAmount}
                      onChange={e =>
                        setModalAmount(parseInt(e.target.value) || 0)
                      }
                      className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                    />
                  </div>
                </>
              )}
            </div>

            <div className='flex justify-end gap-3 mt-6'>
              <button
                onClick={closeAddItemModal}
                className='px-4 py-2 border border-input rounded-md text-sm font-medium text-muted-foreground hover:bg-accent'
              >
                Cancel
              </button>
              <button
                onClick={confirmAddItem}
                disabled={!modalSelectedObjectId || !modalSelectedZoneId}
                className='px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed'
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
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
