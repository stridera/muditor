'use client';

export const dynamic = 'force-dynamic';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { TagInput } from '@/components/ui/tag-input';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
  useRealTimeValidation,
  ValidationHelpers,
  ValidationRules,
} from '../../../../hooks/useRealTimeValidation';

const GET_OBJECT = gql`
  query GetObject($id: Int!, $zoneId: Int!) {
    object(id: $id, zoneId: $zoneId) {
      id
      type
      keywords
      name
      examineDescription
      actionDesc
      weight
      cost
      timer
      decomposeTimer
      level
      concealment
      values
      zoneId
      flags
      effectFlags
      wearFlags
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_OBJECT = gql`
  mutation UpdateObject($id: Int!, $zoneId: Int!, $data: UpdateObjectInput!) {
    updateObject(id: $id, zoneId: $zoneId, data: $data) {
      id
      keywords
      name
      examineDescription
    }
  }
`;

const CREATE_OBJECT = gql`
  mutation CreateObject($data: CreateObjectInput!) {
    createObject(data: $data) {
      id
      keywords
      name
    }
  }
`;

interface ObjectFormData {
  type: string;
  keywords: string;
  name: string;
  examineDescription: string;
  actionDesc: string;
  weight: number;
  cost: number;
  timer: number;
  decomposeTimer: number;
  level: number;
  concealment: number;
  values: Record<string, any>;
  zoneId: number;
}

// Helper function to safely get values from formData.values
const getValueSafe = (
  values: Record<string, any>,
  key: string,
  defaultValue: any = ''
) => {
  return values?.[key] ?? defaultValue;
};

const OBJECT_TYPES = [
  'NOTHING',
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
  'DRINKCONTAINER',
  'KEY',
  'FOOD',
  'MONEY',
  'PEN',
  'BOAT',
  'FOUNTAIN',
  'PORTAL',
  'ROPE',
  'SPELLBOOK',
  'WALL',
  'TOUCHSTONE',
  'BOARD',
  'INSTRUMENT',
];

const WEAR_FLAGS = [
  'TAKE',
  'FINGER',
  'NECK',
  'BODY',
  'HEAD',
  'LEGS',
  'FEET',
  'HANDS',
  'ARMS',
  'SHIELD',
  'ABOUT',
  'WAIST',
  'WRIST',
  'WIELD',
  'HOLD',
  'BADGE',
  'EARS',
  'FACE',
  'ANKLE',
];

const OBJECT_FLAGS = [
  'GLOW',
  'HUM',
  'NORENT',
  'NODONATE',
  'NOINVIS',
  'INVISIBLE',
  'MAGIC',
  'NODROP',
  'BLESS',
  'ANTI_GOOD',
  'ANTI_EVIL',
  'ANTI_NEUTRAL',
  'ANTI_WIZARD',
  'ANTI_CLERIC',
  'ANTI_ROGUE',
  'ANTI_FIGHTER',
  'NOSELL',
  'ANTI_DRUID',
  'ANTI_BARD',
  'ANTI_RANGER',
  'ANTI_PALADIN',
  'ANTI_HUMAN',
  'ANTI_ELF',
  'ANTI_DWARF',
  'ANTI_GIANT',
  'ANTI_HALFLING',
  'ANTI_GNOME',
  'POISONED',
  'CRYOGAS',
];

// Define validation rules for object form
const objectValidationRules: ValidationRules<ObjectFormData> = [
  {
    field: 'keywords',
    validate: ValidationHelpers.required('Keywords are required'),
    debounceMs: 500,
  },
  {
    field: 'name',
    validate: ValidationHelpers.required('Name is required'),
    debounceMs: 500,
  },
  {
    field: 'weight',
    validate: ValidationHelpers.min(0, 'Weight cannot be negative'),
    debounceMs: 200,
  },
  {
    field: 'cost',
    validate: ValidationHelpers.min(0, 'Cost cannot be negative'),
    debounceMs: 200,
  },
  {
    field: 'level',
    validate: ValidationHelpers.range(
      1,
      100,
      'Level must be between 1 and 100'
    ),
    debounceMs: 200,
  },
];

function ObjectEditorContent() {
  const searchParams = useSearchParams();
  const objectId = searchParams.get('id');
  const zoneIdParam = searchParams.get('zone');
  const isNew = !objectId;

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<ObjectFormData>({
    type: 'NOTHING',
    keywords: '',
    name: '',
    examineDescription: '',
    actionDesc: '',
    weight: 0,
    cost: 0,
    timer: 0,
    decomposeTimer: 0,
    level: 1,
    concealment: 0,
    values: {},
    zoneId: 511,
  });

  // Initialize real-time validation
  const { errors, validateField, validateAllFields } =
    useRealTimeValidation<ObjectFormData>(objectValidationRules);

  // Separate state for general/save errors
  const [generalError, setGeneralError] = useState<string>('');
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [selectedWearFlags, setSelectedWearFlags] = useState<string[]>([]);

  const { loading, error, data } = useQuery(GET_OBJECT, {
    variables: {
      id: parseInt(objectId || '0'),
      zoneId: parseInt(zoneIdParam || '0'),
    },
    skip: isNew,
  });

  const [updateObject, { loading: updateLoading }] = useMutation(UPDATE_OBJECT);
  const [createObject, { loading: createLoading }] = useMutation(CREATE_OBJECT);

  useEffect(() => {
    const typedData = data as any;
    if (typedData?.object) {
      const object = typedData.object; // Use any for now since we don't have proper GraphQL codegen
      setFormData({
        type: object.type || 'NOTHING',
        keywords: object.keywords || '',
        name: object.name || '',
        examineDescription: object.examineDescription || '',
        actionDesc: object.actionDesc || '',
        weight: object.weight || 0,
        cost: object.cost || 0,
        timer: object.timer || 0,
        decomposeTimer: object.decomposeTimer || 0,
        level: object.level || 1,
        concealment: object.concealment || 0,
        values: object.values || {},
        zoneId: object.zoneId || 511,
      });
      setSelectedFlags(object.flags || []);
      setSelectedWearFlags(object.wearFlags || []);
    }
  }, [data]);

  const handleInputChange = (
    field: keyof ObjectFormData,
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

  const handleTypeValueChange = (
    key: string,
    value: string | number | boolean | any[]
  ) => {
    setFormData(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [key]: value,
      },
    }));
  };

  const handleFlagToggle = (flag: string, flagType: 'object' | 'wear') => {
    if (flagType === 'object') {
      setSelectedFlags(prev =>
        prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
      );
    } else {
      setSelectedWearFlags(prev =>
        prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
      );
    }
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
        wearFlags: selectedWearFlags,
      };

      if (isNew) {
        await createObject({
          variables: {
            data: saveData,
          },
        });
      } else {
        await updateObject({
          variables: {
            id: parseInt(objectId!),
            data: saveData,
          },
        });
      }

      // Redirect back to objects list
      window.location.href = '/dashboard/objects';
    } catch (err) {
      console.error('Error saving object:', err);
      setGeneralError('Failed to save object. Please try again.');
    }
  };

  if (loading) return <div className='p-4'>Loading object data...</div>;
  if (error)
    return <div className='p-4 text-red-600'>Error: {error.message}</div>;

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'properties', label: 'Properties' },
    { id: 'flags', label: 'Flags & Wear' },
    { id: 'values', label: 'Type Values' },
  ];

  return (
    <div className='container mx-auto p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            {isNew
              ? 'Create New Object'
              : formData.name
                ? `Edit Object: ${formData.name}`
                : `Edit Object ${objectId}`}
          </h1>
          <p className='text-gray-600 mt-1'>
            Configure object properties, flags, and type-specific values
          </p>
        </div>
        <div className='flex gap-2'>
          <Link href='/dashboard/objects'>
            <button className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Objects
            </button>
          </Link>
          <button
            onClick={handleSave}
            disabled={updateLoading || createLoading}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
          >
            <Save className='w-4 h-4 mr-2' />
            {isNew ? 'Create Object' : 'Save Changes'}
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
          <div className='bg-white shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Basic Information
            </h3>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='keywords'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Keywords *
                  </label>
                  <TagInput
                    value={formData.keywords}
                    onChange={value => handleInputChange('keywords', value)}
                    placeholder='e.g., sword iron long'
                    error={!!errors.keywords}
                  />
                  {errors.keywords && (
                    <p className='text-red-500 text-xs mt-1'>
                      {errors.keywords}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='type'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Object Type
                  </label>
                  <select
                    id='type'
                    value={formData.type}
                    onChange={e => handleInputChange('type', e.target.value)}
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  >
                    {OBJECT_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0) +
                          type.slice(1).toLowerCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Name *
                </label>
                <input
                  type='text'
                  id='name'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder='e.g., a long iron sword'
                  className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className='text-red-500 text-xs mt-1'>{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor='examineDescription'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Examine Description
                </label>
                <textarea
                  id='examineDescription'
                  rows={4}
                  value={formData.examineDescription}
                  onChange={e =>
                    handleInputChange('examineDescription', e.target.value)
                  }
                  placeholder='Detailed description when examined'
                  className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                />
              </div>

              <div>
                <label
                  htmlFor='actionDesc'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Action Description
                </label>
                <input
                  type='text'
                  id='actionDesc'
                  value={formData.actionDesc}
                  onChange={e =>
                    handleInputChange('actionDesc', e.target.value)
                  }
                  placeholder='Description when used/activated'
                  className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                />
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className='grid grid-cols-2 gap-6'>
            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Physical Properties
              </h3>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='weight'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Weight (lbs)
                  </label>
                  <input
                    type='number'
                    id='weight'
                    step='0.1'
                    value={formData.weight}
                    onChange={e =>
                      handleInputChange(
                        'weight',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    min='0'
                    className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.weight ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.weight && (
                    <p className='text-red-500 text-xs mt-1'>{errors.weight}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='cost'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Cost (copper pieces)
                  </label>
                  <input
                    type='number'
                    id='cost'
                    value={formData.cost}
                    onChange={e =>
                      handleInputChange('cost', parseInt(e.target.value) || 0)
                    }
                    min='0'
                    className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.cost ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.cost && (
                    <p className='text-red-500 text-xs mt-1'>{errors.cost}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='level'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Level
                  </label>
                  <input
                    type='number'
                    id='level'
                    value={formData.level}
                    onChange={e =>
                      handleInputChange('level', parseInt(e.target.value) || 1)
                    }
                    min='1'
                    max='100'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>
              </div>
            </div>

            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Special Properties
              </h3>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='timer'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Timer (minutes)
                  </label>
                  <input
                    type='number'
                    id='timer'
                    value={formData.timer}
                    onChange={e =>
                      handleInputChange('timer', parseInt(e.target.value) || 0)
                    }
                    min='0'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>

                <div>
                  <label
                    htmlFor='decomposeTimer'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Decompose Timer
                  </label>
                  <input
                    type='number'
                    id='decomposeTimer'
                    value={formData.decomposeTimer}
                    onChange={e =>
                      handleInputChange(
                        'decomposeTimer',
                        parseInt(e.target.value) || 0
                      )
                    }
                    min='0'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>

                <div>
                  <label
                    htmlFor='concealment'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Concealment
                  </label>
                  <input
                    type='number'
                    id='concealment'
                    value={formData.concealment}
                    onChange={e =>
                      handleInputChange(
                        'concealment',
                        parseInt(e.target.value) || 0
                      )
                    }
                    min='0'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
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
            </div>
          </div>
        )}

        {/* Flags Tab */}
        {activeTab === 'flags' && (
          <div className='grid grid-cols-2 gap-6'>
            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Object Flags
              </h3>
              <div className='grid grid-cols-2 gap-2'>
                {OBJECT_FLAGS.map(flag => (
                  <label key={flag} className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={selectedFlags.includes(flag)}
                      onChange={() => handleFlagToggle(flag, 'object')}
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
                Wear Locations
              </h3>
              <div className='grid grid-cols-2 gap-2'>
                {WEAR_FLAGS.map(flag => (
                  <label key={flag} className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={selectedWearFlags.includes(flag)}
                      onChange={() => handleFlagToggle(flag, 'wear')}
                      className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                    />
                    <span className='ml-2 text-sm text-gray-700'>
                      {flag.toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Type Values Tab */}
        {activeTab === 'values' && (
          <div className='bg-white shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Type-Specific Values for {formData.type}
            </h3>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-sm text-gray-600 mb-4'>
                Configure type-specific properties based on the object type
                selected. Different object types have different value
                requirements.
              </p>

              {/* Type-specific value editors */}
              <div className='space-y-4'>
                {formData.type === 'WEAPON' && (
                  <div className='grid grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Damage Dice Number
                      </label>
                      <input
                        type='number'
                        min='1'
                        value={getValueSafe(
                          formData.values,
                          'damageDiceNum',
                          1
                        )}
                        onChange={e =>
                          handleTypeValueChange(
                            'damageDiceNum',
                            parseInt(e.target.value) || 1
                          )
                        }
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Number of dice'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Damage Dice Size
                      </label>
                      <input
                        type='number'
                        min='1'
                        value={getValueSafe(
                          formData.values,
                          'damageDiceSize',
                          6
                        )}
                        onChange={e =>
                          handleTypeValueChange(
                            'damageDiceSize',
                            parseInt(e.target.value) || 6
                          )
                        }
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Dice size (e.g., 6 for d6)'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Damage Bonus
                      </label>
                      <input
                        type='number'
                        value={getValueSafe(formData.values, 'damageBonus', 0)}
                        onChange={e =>
                          handleTypeValueChange(
                            'damageBonus',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Damage bonus'
                      />
                    </div>
                    <div className='col-span-3 mt-2'>
                      <p className='text-sm text-gray-500'>
                        Average damage: ~
                        {Math.floor(
                          (getValueSafe(formData.values, 'damageDiceNum', 1) *
                            (getValueSafe(
                              formData.values,
                              'damageDiceSize',
                              6
                            ) +
                              1)) /
                            2 +
                            getValueSafe(formData.values, 'damageBonus', 0)
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {formData.type === 'ARMOR' && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Armor Class Bonus
                      </label>
                      <input
                        type='number'
                        value={getValueSafe(formData.values, 'armorClass', 0)}
                        onChange={e =>
                          handleTypeValueChange(
                            'armorClass',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='AC bonus (positive values)'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Max Dex Bonus
                      </label>
                      <input
                        type='number'
                        value={getValueSafe(formData.values, 'maxDexBonus', 10)}
                        onChange={e =>
                          handleTypeValueChange(
                            'maxDexBonus',
                            parseInt(e.target.value) || 10
                          )
                        }
                        min='0'
                        max='10'
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Max dexterity bonus'
                      />
                    </div>
                  </div>
                )}

                {formData.type === 'CONTAINER' && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Max Weight Capacity
                      </label>
                      <input
                        type='number'
                        min='0'
                        value={getValueSafe(formData.values, 'capacity', 0)}
                        onChange={e =>
                          handleTypeValueChange(
                            'capacity',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        step='0.1'
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Weight capacity in lbs'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Container Key ID (Optional)
                      </label>
                      <input
                        type='number'
                        value={getValueSafe(formData.values, 'keyId', '')}
                        onChange={e =>
                          handleTypeValueChange(
                            'keyId',
                            parseInt(e.target.value) || 0
                          )
                        }
                        min='0'
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Object ID of key (if locked)'
                      />
                    </div>
                    <div className='col-span-2'>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Container Flags
                      </label>
                      <div className='grid grid-cols-2 gap-2'>
                        {['CLOSEABLE', 'PICKPROOF', 'CLOSED', 'LOCKED'].map(
                          flag => (
                            <label key={flag} className='flex items-center'>
                              <input
                                type='checkbox'
                                checked={getValueSafe(
                                  formData.values,
                                  'containerFlags',
                                  []
                                ).includes(flag)}
                                onChange={e => {
                                  const flags = getValueSafe(
                                    formData.values,
                                    'containerFlags',
                                    []
                                  );
                                  if (e.target.checked) {
                                    handleTypeValueChange('containerFlags', [
                                      ...flags,
                                      flag,
                                    ]);
                                  } else {
                                    handleTypeValueChange(
                                      'containerFlags',
                                      flags.filter((f: any) => f !== flag)
                                    );
                                  }
                                }}
                                className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                              />
                              <span className='ml-2 text-sm text-gray-700'>
                                {flag}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {formData.type === 'LIGHT' && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Light Hours Remaining
                      </label>
                      <input
                        type='number'
                        min='0'
                        value={getValueSafe(formData.values, 'lightHours', 0)}
                        onChange={e =>
                          handleTypeValueChange(
                            'lightHours',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Hours of light (-1 for infinite)'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Light Brightness
                      </label>
                      <select
                        value={getValueSafe(
                          formData.values,
                          'brightness',
                          'normal'
                        )}
                        onChange={e =>
                          handleTypeValueChange('brightness', e.target.value)
                        }
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      >
                        <option value='dim'>Dim</option>
                        <option value='normal'>Normal</option>
                        <option value='bright'>Bright</option>
                        <option value='brilliant'>Brilliant</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.type === 'FOOD' && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Hours of Nourishment
                      </label>
                      <input
                        type='number'
                        min='0'
                        value={getValueSafe(formData.values, 'foodHours', 4)}
                        onChange={e =>
                          handleTypeValueChange(
                            'foodHours',
                            parseInt(e.target.value) || 4
                          )
                        }
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Hours of hunger satisfied'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Poisoned?
                      </label>
                      <select
                        value={
                          getValueSafe(formData.values, 'poisoned', false)
                            ? 'true'
                            : 'false'
                        }
                        onChange={e =>
                          handleTypeValueChange(
                            'poisoned',
                            e.target.value === 'true'
                          )
                        }
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      >
                        <option value='false'>Safe</option>
                        <option value='true'>Poisoned</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.type === 'LIQUID_CONTAINER' && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Liquid Capacity
                      </label>
                      <input
                        type='number'
                        min='0'
                        value={getValueSafe(
                          formData.values,
                          'liquidCapacity',
                          10
                        )}
                        onChange={e =>
                          handleTypeValueChange(
                            'liquidCapacity',
                            parseInt(e.target.value) || 10
                          )
                        }
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Maximum liquid units'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Current Liquid
                      </label>
                      <select
                        value={getValueSafe(
                          formData.values,
                          'liquidType',
                          'water'
                        )}
                        onChange={e =>
                          handleTypeValueChange('liquidType', e.target.value)
                        }
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      >
                        <option value='water'>Water</option>
                        <option value='beer'>Beer</option>
                        <option value='wine'>Wine</option>
                        <option value='ale'>Ale</option>
                        <option value='whisky'>Whisky</option>
                        <option value='milk'>Milk</option>
                        <option value='tea'>Tea</option>
                        <option value='coffee'>Coffee</option>
                        <option value='blood'>Blood</option>
                        <option value='salt water'>Salt Water</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.type === 'POTION' && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Spell Level
                      </label>
                      <input
                        type='number'
                        min='1'
                        max='9'
                        value={getValueSafe(formData.values, 'spellLevel', 1)}
                        onChange={e =>
                          handleTypeValueChange(
                            'spellLevel',
                            parseInt(e.target.value) || 1
                          )
                        }
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Spell level (1-9)'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Spell Name
                      </label>
                      <input
                        type='text'
                        value={getValueSafe(formData.values, 'spellName', '')}
                        onChange={e =>
                          handleTypeValueChange('spellName', e.target.value)
                        }
                        className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Name of spell effect'
                      />
                    </div>
                  </div>
                )}

                <div className='mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                  <p className='text-sm text-yellow-800'>
                    <strong>Note:</strong> Type-specific values are stored as
                    JSON and interpreted by the MUD server. Consult your MUD's
                    documentation for specific value requirements for each
                    object type.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ObjectEditor() {
  return (
    <PermissionGuard requireImmortal={true}>
      <Suspense fallback={<div className='p-6'>Loading object editor...</div>}>
        <ObjectEditorContent />
      </Suspense>
    </PermissionGuard>
  );
}
