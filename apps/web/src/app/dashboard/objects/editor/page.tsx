'use client';

export const dynamic = 'force-dynamic';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { TagInput } from '@/components/ui/tag-input';
import { ColoredTextEditor } from '@/components/ColoredTextEditor';
import { ColoredTextInline } from '@/components/ColoredTextViewer';
import {
  type ElementType,
  GetEffectsDocument,
  UpdateObjectEffectsDocument,
  UpdateObjectResistancesDocument,
  UpdateConsumableEffectsDocument,
  type WearFlag,
} from '@/generated/graphql';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import type { ValidationRules } from '../../../../hooks/useRealTimeValidation';
import {
  useRealTimeValidation,
  ValidationHelpers,
} from '../../../../hooks/useRealTimeValidation';

const GET_OBJECT = gql`
  query GetObjectInline($id: Int!, $zoneId: Int!) {
    object(id: $id, zoneId: $zoneId) {
      id
      type
      keywords
      name
      examineDescription
      actionDescription
      weight
      cost
      timer
      decomposeTimer
      level
      concealment
      values
      zoneId
      flags
      wearFlags
      restrictions
      restrictedClassIds
      restrictedAlignments
      restrictedRaces
      allowedRaces
      minSize
      maxSize
      passengerCapacity
      presenceOverride
      grantedEffects {
        id
        effectId
        strength
        modifierData
        wearLocation
        effect {
          id
          name
          effectType
        }
      }
      objectResistances {
        id
        element
        value
        allowAbsorption
      }
      consumableEffects {
        id
        effectId
        chance
        level
        duration
        effect {
          id
          name
          effectType
        }
      }
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_OBJECT = gql`
  mutation UpdateObjectInline(
    $id: Int!
    $zoneId: Int!
    $data: UpdateObjectInput!
  ) {
    updateObject(id: $id, zoneId: $zoneId, data: $data) {
      id
      keywords
      name
      examineDescription
    }
  }
`;

const CREATE_OBJECT = gql`
  mutation CreateObjectInline($data: CreateObjectInput!) {
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
  actionDescription: string;
  weight: number;
  cost: number;
  timer: number;
  decomposeTimer: number;
  level: number;
  concealment: number;
  values: Record<string, unknown>;
  zoneId: number;
}

// Helper function to safely get typed values from formData.values
const getValueSafe = <T,>(
  values: Record<string, unknown>,
  key: string,
  defaultValue: T
): T => {
  const raw = values?.[key];
  return (raw as T) ?? defaultValue;
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
  // Jewelry
  'FINGER',
  'NECK',
  'EAR',
  'WRIST',
  // Head/Face
  'HEAD',
  'EYES',
  'FACE',
  // Body
  'BODY',
  'ABOUT',
  'ARMS',
  'HANDS',
  'WAIST',
  'BELT',
  // Lower body
  'LEGS',
  'FEET',
  'TAIL',
  // Weapons/Held
  'MAINHAND',
  'OFFHAND',
  'TWOHAND',
  // Special
  'BADGE',
  'HOVER',
  'DISGUISE',
];

// Object intrinsic properties
const OBJECT_FLAGS = [
  'GLOW', // Emits light
  'HUM', // Makes sound
  'INVISIBLE', // Invisible by default
  'MAGIC', // Magical item
  'PERMANENT', // Doesn't decay
  'TEMPORARY', // Vanishes on logout
  'DECOMPOSING', // Actively decaying
  'FLOAT', // Floats in air
  'BUOYANT', // Floats in water
  'VEHICLE', // Can carry passengers
  'SOULBOUND', // Cannot trade/drop
];

// Object behavioral restrictions
const OBJECT_RESTRICTIONS = [
  'NO_DROP', // Cannot be dropped
  'NO_TAKE', // Cannot be picked up
  'NO_SELL', // Cannot be sold
  'NO_BURN', // Immune to fire
  'NO_LOCATE', // Cannot be located
  'NO_INVISIBLE', // Cannot be made invisible
];

const ELEMENT_TYPES = [
  'FIRE',
  'COLD',
  'LIGHTNING',
  'ACID',
  'POISON',
  'HOLY',
  'UNHOLY',
  'SHADOW',
  'RADIANT',
  'NECROTIC',
  'FORCE',
  'SONIC',
  'MENTAL',
  'NATURE',
  'WATER',
  'AIR',
  'EARTH',
  'PHYSICAL',
  'SLASH',
  'PIERCE',
  'CRUSH',
  'BLEED',
  'HEAL',
  'SHOCK',
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
    actionDescription: '',
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
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(
    []
  );
  const [restrictedAlignments, setRestrictedAlignments] = useState<string[]>(
    []
  );
  const [restrictedRaces, setRestrictedRaces] = useState<string[]>([]);
  const [allowedRaces, setAllowedRaces] = useState<string[]>([]);
  const [restrictedClassIds, setRestrictedClassIds] = useState<number[]>([]);
  const [minSize, setMinSize] = useState<string>('');
  const [maxSize, setMaxSize] = useState<string>('');
  const [passengerCapacity, setPassengerCapacity] = useState<number>(0);
  const [presenceOverride, setPresenceOverride] = useState<string>('');

  const { loading, error, data } = useQuery(GET_OBJECT, {
    variables: {
      id: parseInt(objectId || '0'),
      zoneId: parseInt(zoneIdParam || '0'),
    },
    skip: isNew,
  });

  const [updateObject, { loading: updateLoading }] = useMutation(UPDATE_OBJECT);
  const [createObject, { loading: createLoading }] = useMutation(CREATE_OBJECT);
  const [updateObjectEffects] = useMutation(UpdateObjectEffectsDocument);
  const [updateObjectResistances] = useMutation(
    UpdateObjectResistancesDocument
  );
  const [updateConsumableEffects] = useMutation(
    UpdateConsumableEffectsDocument
  );

  // Effects state (saved via dedicated mutations, separate from main form)
  interface GrantedEffect {
    effectId: number;
    strength: number;
    modifierData: any;
    wearLocation: string;
    effectName: string;
    effectType: string;
  }
  interface Resistance {
    element: string;
    value: number;
    allowAbsorption: boolean;
  }
  interface ConsumableEff {
    effectId: number;
    chance: number;
    level: number;
    duration: number;
    effectName: string;
    effectType: string;
  }
  const [grantedEffects, setGrantedEffects] = useState<GrantedEffect[]>([]);
  const [objectResistances, setObjectResistances] = useState<Resistance[]>([]);
  const [consumableEffects, setConsumableEffects] = useState<ConsumableEff[]>(
    []
  );
  const [effectsDirty, setEffectsDirty] = useState(false);
  const [resistancesDirty, setResistancesDirty] = useState(false);
  const [consumablesDirty, setConsumablesDirty] = useState(false);

  // Fetch available effects for picker
  const { data: effectsData } = useQuery(GetEffectsDocument, {
    variables: { take: 500 },
  });

  useEffect(() => {
    const typedData = data as
      | {
          object?: Partial<ObjectFormData> & {
            flags?: string[];
            wearFlags?: string[];
            restrictions?: string[];
            restrictedAlignments?: string[];
            restrictedRaces?: string[];
            allowedRaces?: string[];
            restrictedClassIds?: number[];
            minSize?: string | null;
            maxSize?: string | null;
            passengerCapacity?: number | null;
            presenceOverride?: string | null;
            values?: Record<string, unknown>;
            grantedEffects?: Array<{
              effectId: number;
              strength: number;
              modifierData: any;
              wearLocation?: string | null;
              effect: { id: string; name: string; effectType: string };
            }>;
            objectResistances?: Array<{
              element: string;
              value: number;
              allowAbsorption: boolean;
            }>;
            consumableEffects?: Array<{
              effectId: number;
              chance: number;
              level: number;
              duration?: number | null;
              effect: { id: string; name: string; effectType: string };
            }>;
          };
        }
      | undefined;
    if (typedData?.object) {
      const object = typedData.object;
      setFormData({
        type: object.type || 'NOTHING',
        keywords: object.keywords || '',
        name: object.name || '',
        examineDescription: object.examineDescription || '',
        actionDescription: object.actionDescription || '',
        weight: object.weight || 0,
        cost: object.cost || 0,
        timer: object.timer || 0,
        decomposeTimer: object.decomposeTimer || 0,
        level: object.level || 1,
        concealment: object.concealment || 0,
        values: object.values || {},
        zoneId: object.zoneId ?? 511,
      });
      setSelectedFlags(object.flags || []);
      setSelectedWearFlags(object.wearFlags || []);
      setSelectedRestrictions(object.restrictions || []);
      setRestrictedAlignments(object.restrictedAlignments || []);
      setRestrictedRaces(object.restrictedRaces || []);
      setAllowedRaces(object.allowedRaces || []);
      setRestrictedClassIds(object.restrictedClassIds || []);
      setMinSize(object.minSize || '');
      setMaxSize(object.maxSize || '');
      setPassengerCapacity(object.passengerCapacity || 0);
      setPresenceOverride(object.presenceOverride || '');

      // Load granted effects
      setGrantedEffects(
        (object.grantedEffects || []).map(ge => ({
          effectId: parseInt(String(ge.effect.id)),
          strength: ge.strength,
          modifierData: ge.modifierData,
          wearLocation: ge.wearLocation || '',
          effectName: ge.effect.name,
          effectType: ge.effect.effectType,
        }))
      );

      // Load resistances
      setObjectResistances(
        (object.objectResistances || []).map(r => ({
          element: r.element,
          value: r.value,
          allowAbsorption: r.allowAbsorption,
        }))
      );

      // Load consumable effects
      setConsumableEffects(
        (object.consumableEffects || []).map(ce => ({
          effectId: parseInt(String(ce.effect.id)),
          chance: ce.chance,
          level: ce.level,
          duration: ce.duration ?? 0,
          effectName: ce.effect.name,
          effectType: ce.effect.effectType,
        }))
      );
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
    value: string | number | boolean | string[] | number[]
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
        restrictions: selectedRestrictions,
        restrictedAlignments,
        restrictedRaces,
        allowedRaces,
        restrictedClassIds,
        ...(minSize ? { minSize } : {}),
        ...(maxSize ? { maxSize } : {}),
        ...(passengerCapacity > 0 ? { passengerCapacity } : {}),
        ...(presenceOverride ? { presenceOverride } : {}),
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
            zoneId: saveData.zoneId,
            data: saveData,
          },
        });
      }

      // Redirect back to objects list
      window.location.href = '/dashboard/objects';
    } catch (err) {
      void err; // LoggingService.error('Error saving object', { error: err, objectId });
      setGeneralError('Failed to save object. Please try again.');
    }
  };

  if (loading) return <div className='p-4'>Loading object data...</div>;
  if (error)
    return <div className='p-4 text-destructive'>Error: {error.message}</div>;

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'properties', label: 'Properties' },
    { id: 'flags', label: 'Flags & Wear' },
    { id: 'restrictions', label: 'Restrictions' },
    { id: 'effects', label: 'Effects' },
    { id: 'values', label: 'Type Values' },
  ];

  return (
    <div className='container mx-auto p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>
            {isNew ? (
              'Create New Object'
            ) : formData.name ? (
              <>
                Edit Object: <ColoredTextInline markup={formData.name} />
              </>
            ) : (
              `Edit Object ${objectId}`
            )}
          </h1>
          <p className='text-muted-foreground mt-1'>
            Configure object properties, flags, and type-specific values
          </p>
        </div>
        <div className='flex gap-2'>
          <Link href='/dashboard/objects'>
            <button className='inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Objects
            </button>
          </Link>
          <button
            onClick={handleSave}
            disabled={updateLoading || createLoading}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
          >
            <Save className='w-4 h-4 mr-2' />
            {isNew ? 'Create Object' : 'Save Changes'}
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
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
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
          <div className='bg-card shadow rounded-lg p-6 border border-border'>
            <h3 className='text-lg font-medium text-foreground mb-4'>
              Basic Information
            </h3>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='keywords'
                    className='block text-sm font-medium text-muted-foreground mb-1'
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
                    <p className='text-destructive text-xs mt-1'>
                      {errors.keywords}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='type'
                    className='block text-sm font-medium text-muted-foreground mb-1'
                  >
                    Object Type
                  </label>
                  <select
                    id='type'
                    value={formData.type}
                    onChange={e => handleInputChange('type', e.target.value)}
                    className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
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
                  className='block text-sm font-medium text-muted-foreground mb-1'
                >
                  Name *
                </label>
                <ColoredTextEditor
                  value={formData.name}
                  onChange={value => handleInputChange('name', value)}
                  placeholder='e.g., a long iron sword'
                  maxLength={80}
                  showPreview={true}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className='text-destructive text-xs mt-1'>{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor='examineDescription'
                  className='block text-sm font-medium text-muted-foreground mb-1'
                >
                  Examine Description
                </label>
                <ColoredTextEditor
                  value={formData.examineDescription}
                  onChange={value =>
                    handleInputChange('examineDescription', value)
                  }
                  placeholder='Detailed description when examined'
                  showPreview={true}
                />
              </div>

              <div>
                <label
                  htmlFor='actionDescription'
                  className='block text-sm font-medium text-muted-foreground mb-1'
                >
                  Action Description
                </label>
                <ColoredTextEditor
                  value={formData.actionDescription}
                  onChange={value =>
                    handleInputChange('actionDescription', value)
                  }
                  placeholder='Description when used/activated'
                  maxLength={200}
                  showPreview={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className='grid grid-cols-2 gap-6'>
            <div className='bg-card shadow rounded-lg p-6 border border-border'>
              <h3 className='text-lg font-medium text-foreground mb-4'>
                Physical Properties
              </h3>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='weight'
                    className='block text-sm font-medium text-muted-foreground mb-1'
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
                    className={`block w-full rounded-md shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground ${
                      errors.weight ? 'border-destructive' : 'border-input'
                    }`}
                  />
                  {errors.weight && (
                    <p className='text-destructive text-xs mt-1'>
                      {errors.weight}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='cost'
                    className='block text-sm font-medium text-muted-foreground mb-1'
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
                    className={`block w-full rounded-md shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground ${
                      errors.cost ? 'border-destructive' : 'border-input'
                    }`}
                  />
                  {errors.cost && (
                    <p className='text-destructive text-xs mt-1'>
                      {errors.cost}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='level'
                    className='block text-sm font-medium text-muted-foreground mb-1'
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
                    className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                  />
                </div>
              </div>
            </div>

            <div className='bg-card shadow rounded-lg p-6 border border-border'>
              <h3 className='text-lg font-medium text-foreground mb-4'>
                Special Properties
              </h3>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='timer'
                    className='block text-sm font-medium text-muted-foreground mb-1'
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
                    className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                  />
                </div>

                <div>
                  <label
                    htmlFor='decomposeTimer'
                    className='block text-sm font-medium text-muted-foreground mb-1'
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
                    className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                  />
                </div>

                <div>
                  <label
                    htmlFor='concealment'
                    className='block text-sm font-medium text-muted-foreground mb-1'
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
                    className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                  />
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
                    className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flags Tab */}
        {activeTab === 'flags' && (
          <div className='grid grid-cols-2 gap-6'>
            <div className='bg-card shadow rounded-lg p-6 border border-border'>
              <h3 className='text-lg font-medium text-foreground mb-4'>
                Object Flags
              </h3>
              <div className='grid grid-cols-2 gap-2'>
                {OBJECT_FLAGS.map(flag => (
                  <label key={flag} className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={selectedFlags.includes(flag)}
                      onChange={() => handleFlagToggle(flag, 'object')}
                      className='rounded border-input text-primary shadow-sm focus:border-ring focus:ring focus:ring-ring focus:ring-opacity-50'
                    />
                    <span className='ml-2 text-sm text-foreground'>
                      {flag.replace('_', ' ').toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className='bg-card shadow rounded-lg p-6 border border-border'>
              <h3 className='text-lg font-medium text-foreground mb-4'>
                Wear Locations
              </h3>
              <div className='grid grid-cols-2 gap-2'>
                {WEAR_FLAGS.map(flag => (
                  <label key={flag} className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={selectedWearFlags.includes(flag)}
                      onChange={() => handleFlagToggle(flag, 'wear')}
                      className='rounded border-input text-primary shadow-sm focus:border-ring focus:ring focus:ring-ring focus:ring-opacity-50'
                    />
                    <span className='ml-2 text-sm text-foreground'>
                      {flag.toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Restrictions Tab */}
        {activeTab === 'restrictions' && (
          <div className='space-y-6'>
            {/* Object Restrictions */}
            <div className='bg-card shadow rounded-lg p-6 border border-border'>
              <h3 className='text-lg font-medium text-foreground mb-1'>
                Object Restrictions
              </h3>
              <p className='text-sm text-muted-foreground mb-4'>
                Behavioral restrictions on this object
              </p>
              <div className='grid grid-cols-3 sm:grid-cols-4 gap-3'>
                {OBJECT_RESTRICTIONS.map(flag => (
                  <label
                    key={flag}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={selectedRestrictions.includes(flag)}
                      onChange={e => {
                        setSelectedRestrictions(prev =>
                          e.target.checked
                            ? [...prev, flag]
                            : prev.filter(f => f !== flag)
                        );
                      }}
                      className='rounded border-input'
                    />
                    <span className='text-sm text-foreground'>
                      {flag.replace(/_/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Alignment Restrictions */}
            <div className='bg-card shadow rounded-lg p-6 border border-border'>
              <h3 className='text-lg font-medium text-foreground mb-1'>
                Alignment Restrictions
              </h3>
              <p className='text-sm text-muted-foreground mb-4'>
                Only characters with these alignments can use this object
              </p>
              <div className='grid grid-cols-3 gap-3'>
                {(['GOOD', 'NEUTRAL', 'EVIL'] as const).map(align => (
                  <label
                    key={align}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={restrictedAlignments.includes(align)}
                      onChange={e => {
                        setRestrictedAlignments(prev =>
                          e.target.checked
                            ? [...prev, align]
                            : prev.filter(a => a !== align)
                        );
                      }}
                      className='rounded border-input'
                    />
                    <span className='text-sm text-foreground'>
                      {align.charAt(0) + align.slice(1).toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Race Restrictions */}
            <div className='grid grid-cols-2 gap-6'>
              <div className='bg-card shadow rounded-lg p-6 border border-border'>
                <h3 className='text-lg font-medium text-foreground mb-1'>
                  Restricted Races
                </h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  Races that CANNOT use this object
                </p>
                <div className='grid grid-cols-2 gap-2 max-h-64 overflow-y-auto'>
                  {(
                    [
                      'HUMAN',
                      'ELF',
                      'HALF_ELF',
                      'DROW',
                      'DWARF',
                      'DUERGAR',
                      'GNOME',
                      'SVERFNEBLIN',
                      'HALFLING',
                      'ORC',
                      'OGRE',
                      'TROLL',
                      'GOBLIN',
                      'GOLIATH',
                      'BROWNIE',
                      'NYMPH',
                      'ARBOREAN',
                      'DRAGONBORN_FIRE',
                      'DRAGONBORN_FROST',
                      'DRAGONBORN_ACID',
                      'DRAGONBORN_LIGHTNING',
                      'DRAGONBORN_GAS',
                      'FAERIE_SEELIE',
                      'FAERIE_UNSEELIE',
                      'GIANT',
                      'DEMON',
                    ] as const
                  ).map(race => (
                    <label
                      key={race}
                      className='flex items-center gap-2 cursor-pointer'
                    >
                      <input
                        type='checkbox'
                        checked={restrictedRaces.includes(race)}
                        onChange={e => {
                          setRestrictedRaces(prev =>
                            e.target.checked
                              ? [...prev, race]
                              : prev.filter(r => r !== race)
                          );
                        }}
                        className='rounded border-input'
                      />
                      <span className='text-xs text-foreground'>
                        {race.replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className='bg-card shadow rounded-lg p-6 border border-border'>
                <h3 className='text-lg font-medium text-foreground mb-1'>
                  Allowed Races
                </h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  Only these races CAN use this object (empty = all allowed)
                </p>
                <div className='grid grid-cols-2 gap-2 max-h-64 overflow-y-auto'>
                  {(
                    [
                      'HUMAN',
                      'ELF',
                      'HALF_ELF',
                      'DROW',
                      'DWARF',
                      'DUERGAR',
                      'GNOME',
                      'SVERFNEBLIN',
                      'HALFLING',
                      'ORC',
                      'OGRE',
                      'TROLL',
                      'GOBLIN',
                      'GOLIATH',
                      'BROWNIE',
                      'NYMPH',
                      'ARBOREAN',
                      'DRAGONBORN_FIRE',
                      'DRAGONBORN_FROST',
                      'DRAGONBORN_ACID',
                      'DRAGONBORN_LIGHTNING',
                      'DRAGONBORN_GAS',
                      'FAERIE_SEELIE',
                      'FAERIE_UNSEELIE',
                      'GIANT',
                      'DEMON',
                    ] as const
                  ).map(race => (
                    <label
                      key={race}
                      className='flex items-center gap-2 cursor-pointer'
                    >
                      <input
                        type='checkbox'
                        checked={allowedRaces.includes(race)}
                        onChange={e => {
                          setAllowedRaces(prev =>
                            e.target.checked
                              ? [...prev, race]
                              : prev.filter(r => r !== race)
                          );
                        }}
                        className='rounded border-input'
                      />
                      <span className='text-xs text-foreground'>
                        {race.replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Size Restrictions & Other */}
            <div className='bg-card shadow rounded-lg p-6 border border-border'>
              <h3 className='text-lg font-medium text-foreground mb-4'>
                Size & Other
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-1'>
                    Minimum Size
                  </label>
                  <select
                    value={minSize}
                    onChange={e => setMinSize(e.target.value)}
                    className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                  >
                    <option value=''>No minimum</option>
                    {[
                      'TINY',
                      'SMALL',
                      'MEDIUM',
                      'LARGE',
                      'HUGE',
                      'GIANT',
                      'GARGANTUAN',
                      'COLOSSAL',
                      'MOUNTAINOUS',
                      'TITANIC',
                    ].map(s => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-1'>
                    Maximum Size
                  </label>
                  <select
                    value={maxSize}
                    onChange={e => setMaxSize(e.target.value)}
                    className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                  >
                    <option value=''>No maximum</option>
                    {[
                      'TINY',
                      'SMALL',
                      'MEDIUM',
                      'LARGE',
                      'HUGE',
                      'GIANT',
                      'GARGANTUAN',
                      'COLOSSAL',
                      'MOUNTAINOUS',
                      'TITANIC',
                    ].map(s => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-1'>
                    Passenger Capacity
                  </label>
                  <input
                    type='number'
                    value={passengerCapacity}
                    onChange={e =>
                      setPassengerCapacity(parseInt(e.target.value) || 0)
                    }
                    min='0'
                    className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    For vehicles — how many passengers it can carry
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-1'>
                    Presence Override
                  </label>
                  <input
                    type='text'
                    value={presenceOverride}
                    onChange={e => setPresenceOverride(e.target.value)}
                    placeholder='e.g., is parked here'
                    className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    Custom room presence text for this object
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && !isNew && (
          <div className='space-y-6'>
            {/* Granted Effects (worn/held) */}
            <div className='bg-card shadow rounded-lg p-6 border border-border'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h3 className='text-lg font-medium text-foreground'>
                    Granted Effects
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Effects applied when this object is worn or held
                  </p>
                </div>
                {effectsDirty && (
                  <button
                    onClick={async () => {
                      try {
                        await updateObjectEffects({
                          variables: {
                            zoneId: parseInt(zoneIdParam || '0'),
                            id: parseInt(objectId || '0'),
                            effects: grantedEffects.map(e => ({
                              effectId: e.effectId,
                              strength: e.strength,
                              modifierData: e.modifierData || {},
                              ...(e.wearLocation
                                ? { wearLocation: e.wearLocation as WearFlag }
                                : {}),
                            })),
                          },
                        });
                        setEffectsDirty(false);
                      } catch (err) {
                        console.error('Error saving effects:', err);
                        setGeneralError('Failed to save granted effects.');
                      }
                    }}
                    className='inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90'
                  >
                    <Save className='w-4 h-4 mr-1' />
                    Save Effects
                  </button>
                )}
              </div>

              {grantedEffects.length > 0 && (
                <table className='w-full text-sm mb-4'>
                  <thead>
                    <tr className='border-b border-border'>
                      <th className='text-left py-2 text-foreground'>Effect</th>
                      <th className='text-left py-2 text-foreground'>Type</th>
                      <th className='text-left py-2 text-foreground w-24'>
                        Strength
                      </th>
                      <th className='text-left py-2 text-foreground w-32'>
                        Wear Loc
                      </th>
                      <th className='text-right py-2 text-foreground w-16'></th>
                    </tr>
                  </thead>
                  <tbody>
                    {grantedEffects.map((eff, idx) => (
                      <tr key={idx} className='border-b border-border'>
                        <td className='py-2 text-foreground'>
                          {eff.effectName}
                        </td>
                        <td className='py-2 text-muted-foreground'>
                          {eff.effectType}
                        </td>
                        <td className='py-2'>
                          <input
                            type='number'
                            value={eff.strength}
                            onChange={e => {
                              setGrantedEffects(
                                grantedEffects.map((item, i) =>
                                  i === idx
                                    ? {
                                        effectId: eff.effectId,
                                        strength: parseInt(e.target.value) || 1,
                                        modifierData: eff.modifierData,
                                        wearLocation: eff.wearLocation,
                                        effectName: eff.effectName,
                                        effectType: eff.effectType,
                                      }
                                    : item
                                )
                              );
                              setEffectsDirty(true);
                            }}
                            min={1}
                            className='w-20 rounded-md border border-input bg-background shadow-sm text-sm'
                          />
                        </td>
                        <td className='py-2'>
                          <select
                            value={eff.wearLocation}
                            onChange={e => {
                              setGrantedEffects(
                                grantedEffects.map((item, i) =>
                                  i === idx
                                    ? {
                                        effectId: eff.effectId,
                                        strength: eff.strength,
                                        modifierData: eff.modifierData,
                                        wearLocation: e.target.value,
                                        effectName: eff.effectName,
                                        effectType: eff.effectType,
                                      }
                                    : item
                                )
                              );
                              setEffectsDirty(true);
                            }}
                            className='w-28 rounded-md border border-input bg-background shadow-sm text-sm'
                          >
                            <option value=''>Any</option>
                            {WEAR_FLAGS.map(wf => (
                              <option key={wf} value={wf}>
                                {wf.toLowerCase()}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className='py-2 text-right'>
                          <button
                            onClick={() => {
                              setGrantedEffects(
                                grantedEffects.filter((_, i) => i !== idx)
                              );
                              setEffectsDirty(true);
                            }}
                            className='text-destructive hover:text-destructive/80 text-sm'
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className='flex gap-2 items-end'>
                <div className='flex-1'>
                  <label className='block text-sm font-medium text-foreground mb-1'>
                    Add Effect
                  </label>
                  <select
                    id='granted-effect-picker'
                    className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                    defaultValue=''
                  >
                    <option value='' disabled>
                      Select an effect...
                    </option>
                    {(effectsData?.effects || [])
                      .filter(
                        e =>
                          !grantedEffects.some(
                            ge => ge.effectId === parseInt(String(e.id))
                          )
                      )
                      .map(e => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.effectType})
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    const select = document.getElementById(
                      'granted-effect-picker'
                    ) as HTMLSelectElement;
                    if (!select?.value) return;
                    const effectId = parseInt(select.value);
                    const effect = effectsData?.effects?.find(
                      e => parseInt(String(e.id)) === effectId
                    );
                    if (!effect) return;
                    setGrantedEffects([
                      ...grantedEffects,
                      {
                        effectId,
                        strength: 1,
                        modifierData: {},
                        wearLocation: '',
                        effectName: effect.name,
                        effectType: effect.effectType,
                      },
                    ]);
                    setEffectsDirty(true);
                    select.value = '';
                  }}
                  className='px-3 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm'
                >
                  Add
                </button>
              </div>
            </div>

            {/* Object Resistances */}
            <div className='bg-card shadow rounded-lg p-6 border border-border'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h3 className='text-lg font-medium text-foreground'>
                    Resistances
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Elemental resistances granted by this object
                  </p>
                </div>
                {resistancesDirty && (
                  <button
                    onClick={async () => {
                      try {
                        await updateObjectResistances({
                          variables: {
                            zoneId: parseInt(zoneIdParam || '0'),
                            id: parseInt(objectId || '0'),
                            resistances: objectResistances.map(r => ({
                              element: r.element as ElementType,
                              value: r.value,
                              allowAbsorption: r.allowAbsorption,
                            })),
                          },
                        });
                        setResistancesDirty(false);
                      } catch (err) {
                        console.error('Error saving resistances:', err);
                        setGeneralError('Failed to save resistances.');
                      }
                    }}
                    className='inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90'
                  >
                    <Save className='w-4 h-4 mr-1' />
                    Save Resistances
                  </button>
                )}
              </div>

              {objectResistances.length > 0 && (
                <table className='w-full text-sm mb-4'>
                  <thead>
                    <tr className='border-b border-border'>
                      <th className='text-left py-2 text-foreground'>
                        Element
                      </th>
                      <th className='text-left py-2 text-foreground w-24'>
                        Value
                      </th>
                      <th className='text-left py-2 text-foreground w-32'>
                        Absorb
                      </th>
                      <th className='text-right py-2 text-foreground w-16'></th>
                    </tr>
                  </thead>
                  <tbody>
                    {objectResistances.map((res, idx) => (
                      <tr key={idx} className='border-b border-border'>
                        <td className='py-2 text-foreground'>
                          {res.element.charAt(0) +
                            res.element.slice(1).toLowerCase()}
                        </td>
                        <td className='py-2'>
                          <input
                            type='number'
                            value={res.value}
                            onChange={e => {
                              setObjectResistances(
                                objectResistances.map((item, i) =>
                                  i === idx
                                    ? {
                                        element: res.element,
                                        value: parseInt(e.target.value) || 0,
                                        allowAbsorption: res.allowAbsorption,
                                      }
                                    : item
                                )
                              );
                              setResistancesDirty(true);
                            }}
                            className='w-20 rounded-md border border-input bg-background shadow-sm text-sm'
                          />
                        </td>
                        <td className='py-2'>
                          <input
                            type='checkbox'
                            checked={res.allowAbsorption}
                            onChange={e => {
                              setObjectResistances(
                                objectResistances.map((item, i) =>
                                  i === idx
                                    ? {
                                        element: res.element,
                                        value: res.value,
                                        allowAbsorption: e.target.checked,
                                      }
                                    : item
                                )
                              );
                              setResistancesDirty(true);
                            }}
                            className='rounded border-input'
                          />
                        </td>
                        <td className='py-2 text-right'>
                          <button
                            onClick={() => {
                              setObjectResistances(
                                objectResistances.filter((_, i) => i !== idx)
                              );
                              setResistancesDirty(true);
                            }}
                            className='text-destructive hover:text-destructive/80 text-sm'
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className='flex gap-2 items-end'>
                <div className='flex-1'>
                  <label className='block text-sm font-medium text-foreground mb-1'>
                    Add Resistance
                  </label>
                  <select
                    id='resistance-picker'
                    className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                    defaultValue=''
                  >
                    <option value='' disabled>
                      Select an element...
                    </option>
                    {ELEMENT_TYPES.filter(
                      el => !objectResistances.some(r => r.element === el)
                    ).map(el => (
                      <option key={el} value={el}>
                        {el.charAt(0) + el.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    const select = document.getElementById(
                      'resistance-picker'
                    ) as HTMLSelectElement;
                    if (!select?.value) return;
                    setObjectResistances([
                      ...objectResistances,
                      {
                        element: select.value,
                        value: 0,
                        allowAbsorption: false,
                      },
                    ]);
                    setResistancesDirty(true);
                    select.value = '';
                  }}
                  className='px-3 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm'
                >
                  Add
                </button>
              </div>
            </div>

            {/* Consumable Effects */}
            <div className='bg-card shadow rounded-lg p-6 border border-border'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h3 className='text-lg font-medium text-foreground'>
                    Consumable Effects
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Effects applied when this object is consumed (food, potions,
                    drinks)
                  </p>
                </div>
                {consumablesDirty && (
                  <button
                    onClick={async () => {
                      try {
                        await updateConsumableEffects({
                          variables: {
                            zoneId: parseInt(zoneIdParam || '0'),
                            id: parseInt(objectId || '0'),
                            effects: consumableEffects.map(e => ({
                              effectId: e.effectId,
                              chance: e.chance,
                              level: e.level,
                              ...(e.duration > 0
                                ? { duration: e.duration }
                                : {}),
                            })),
                          },
                        });
                        setConsumablesDirty(false);
                      } catch (err) {
                        console.error('Error saving consumable effects:', err);
                        setGeneralError('Failed to save consumable effects.');
                      }
                    }}
                    className='inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90'
                  >
                    <Save className='w-4 h-4 mr-1' />
                    Save Consumables
                  </button>
                )}
              </div>

              {consumableEffects.length > 0 && (
                <table className='w-full text-sm mb-4'>
                  <thead>
                    <tr className='border-b border-border'>
                      <th className='text-left py-2 text-foreground'>Effect</th>
                      <th className='text-left py-2 text-foreground'>Type</th>
                      <th className='text-left py-2 text-foreground w-20'>
                        Chance%
                      </th>
                      <th className='text-left py-2 text-foreground w-20'>
                        Level
                      </th>
                      <th className='text-left py-2 text-foreground w-24'>
                        Duration
                      </th>
                      <th className='text-right py-2 text-foreground w-16'></th>
                    </tr>
                  </thead>
                  <tbody>
                    {consumableEffects.map((eff, idx) => (
                      <tr key={idx} className='border-b border-border'>
                        <td className='py-2 text-foreground'>
                          {eff.effectName}
                        </td>
                        <td className='py-2 text-muted-foreground'>
                          {eff.effectType}
                        </td>
                        <td className='py-2'>
                          <input
                            type='number'
                            value={eff.chance}
                            onChange={e => {
                              setConsumableEffects(
                                consumableEffects.map((item, i) =>
                                  i === idx
                                    ? {
                                        effectId: eff.effectId,
                                        chance: parseInt(e.target.value) || 0,
                                        level: eff.level,
                                        duration: eff.duration,
                                        effectName: eff.effectName,
                                        effectType: eff.effectType,
                                      }
                                    : item
                                )
                              );
                              setConsumablesDirty(true);
                            }}
                            min={0}
                            max={100}
                            className='w-16 rounded-md border border-input bg-background shadow-sm text-sm'
                          />
                        </td>
                        <td className='py-2'>
                          <input
                            type='number'
                            value={eff.level}
                            onChange={e => {
                              setConsumableEffects(
                                consumableEffects.map((item, i) =>
                                  i === idx
                                    ? {
                                        effectId: eff.effectId,
                                        chance: eff.chance,
                                        level: parseInt(e.target.value) || 1,
                                        duration: eff.duration,
                                        effectName: eff.effectName,
                                        effectType: eff.effectType,
                                      }
                                    : item
                                )
                              );
                              setConsumablesDirty(true);
                            }}
                            min={1}
                            className='w-16 rounded-md border border-input bg-background shadow-sm text-sm'
                          />
                        </td>
                        <td className='py-2'>
                          <input
                            type='number'
                            value={eff.duration}
                            onChange={e => {
                              setConsumableEffects(
                                consumableEffects.map((item, i) =>
                                  i === idx
                                    ? {
                                        effectId: eff.effectId,
                                        chance: eff.chance,
                                        level: eff.level,
                                        duration: parseInt(e.target.value) || 0,
                                        effectName: eff.effectName,
                                        effectType: eff.effectType,
                                      }
                                    : item
                                )
                              );
                              setConsumablesDirty(true);
                            }}
                            min={0}
                            placeholder='rounds'
                            className='w-20 rounded-md border border-input bg-background shadow-sm text-sm'
                          />
                        </td>
                        <td className='py-2 text-right'>
                          <button
                            onClick={() => {
                              setConsumableEffects(
                                consumableEffects.filter((_, i) => i !== idx)
                              );
                              setConsumablesDirty(true);
                            }}
                            className='text-destructive hover:text-destructive/80 text-sm'
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className='flex gap-2 items-end'>
                <div className='flex-1'>
                  <label className='block text-sm font-medium text-foreground mb-1'>
                    Add Consumable Effect
                  </label>
                  <select
                    id='consumable-effect-picker'
                    className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
                    defaultValue=''
                  >
                    <option value='' disabled>
                      Select an effect...
                    </option>
                    {(effectsData?.effects || [])
                      .filter(
                        e =>
                          !consumableEffects.some(
                            ce => ce.effectId === parseInt(String(e.id))
                          )
                      )
                      .map(e => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.effectType})
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    const select = document.getElementById(
                      'consumable-effect-picker'
                    ) as HTMLSelectElement;
                    if (!select?.value) return;
                    const effectId = parseInt(select.value);
                    const effect = effectsData?.effects?.find(
                      e => parseInt(String(e.id)) === effectId
                    );
                    if (!effect) return;
                    setConsumableEffects([
                      ...consumableEffects,
                      {
                        effectId,
                        chance: 100,
                        level: 1,
                        duration: 0,
                        effectName: effect.name,
                        effectType: effect.effectType,
                      },
                    ]);
                    setConsumablesDirty(true);
                    select.value = '';
                  }}
                  className='px-3 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm'
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Effects Tab - New Object Warning */}
        {activeTab === 'effects' && isNew && (
          <div className='bg-card shadow rounded-lg p-6 border border-border'>
            <div className='text-center py-8'>
              <h3 className='text-sm font-medium text-foreground'>
                Save object first
              </h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                You need to save this object before you can configure its
                effects and resistances.
              </p>
            </div>
          </div>
        )}

        {/* Type Values Tab */}
        {activeTab === 'values' && (
          <div className='bg-card shadow rounded-lg p-6 border border-border'>
            <h3 className='text-lg font-medium text-foreground mb-4'>
              Type-Specific Values for {formData.type}
            </h3>
            <div className='bg-muted p-4 rounded-lg'>
              <p className='text-sm text-muted-foreground mb-4'>
                Configure type-specific properties based on the object type
                selected. Different object types have different value
                requirements.
              </p>

              {/* Type-specific value editors */}
              <div className='space-y-4'>
                {formData.type === 'WEAPON' && (
                  <div className='grid grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                        placeholder='Number of dice'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                        placeholder='Dice size (e.g., 6 for d6)'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                        placeholder='Damage bonus'
                      />
                    </div>
                    <div className='col-span-3 mt-2'>
                      <p className='text-sm text-muted-foreground'>
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
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                        placeholder='AC bonus (positive values)'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                        placeholder='Max dexterity bonus'
                      />
                    </div>
                  </div>
                )}

                {formData.type === 'CONTAINER' && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                        placeholder='Weight capacity in lbs'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                        placeholder='Object ID of key (if locked)'
                      />
                    </div>
                    <div className='col-span-2'>
                      <label className='block text-sm font-medium text-muted-foreground mb-2'>
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
                                  [] as string[]
                                ).includes(flag)}
                                onChange={e => {
                                  const flags = getValueSafe(
                                    formData.values,
                                    'containerFlags',
                                    [] as string[]
                                  );
                                  if (e.target.checked) {
                                    handleTypeValueChange('containerFlags', [
                                      ...flags,
                                      flag,
                                    ]);
                                  } else {
                                    handleTypeValueChange(
                                      'containerFlags',
                                      flags.filter((f: string) => f !== flag)
                                    );
                                  }
                                }}
                                className='rounded border-input text-primary shadow-sm focus:border-ring focus:ring focus:ring-ring focus:ring-opacity-50'
                              />
                              <span className='ml-2 text-sm text-foreground'>
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
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                        placeholder='Hours of light (-1 for infinite)'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
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
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                        placeholder='Hours of hunger satisfied'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
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
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                        placeholder='Maximum liquid units'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
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
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
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
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                        placeholder='Spell level (1-9)'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-muted-foreground mb-1'>
                        Spell Name
                      </label>
                      <input
                        type='text'
                        value={getValueSafe(formData.values, 'spellName', '')}
                        onChange={e =>
                          handleTypeValueChange('spellName', e.target.value)
                        }
                        className='block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground'
                        placeholder='Name of spell effect'
                      />
                    </div>
                  </div>
                )}

                <div className='mt-6 p-4 bg-muted border border-border rounded-lg'>
                  <p className='text-sm text-muted-foreground'>
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
