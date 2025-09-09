'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PermissionGuard } from '@/components/auth/permission-guard';
import MobEquipmentManager from '../../../../components/mob-equipment-manager';
import {
  useRealTimeValidation,
  ValidationHelpers,
  ValidationRules,
} from '../../../../hooks/useRealTimeValidation';

const GET_MOB = gql`
  query GetMob($id: Int!) {
    mob(id: $id) {
      id
      keywords
      mobClass
      shortDesc
      longDesc
      desc
      alignment
      level
      armorClass
      hitRoll
      move
      hpDiceNum
      hpDiceSize
      hpDiceBonus
      damageDiceNum
      damageDiceSize
      damageDiceBonus
      copper
      silver
      gold
      platinum
      raceAlign
      strength
      intelligence
      wisdom
      dexterity
      constitution
      charisma
      perception
      concealment
      zoneId
      classId
      raceId
      raceLegacy
      mobFlags
      effectFlags
      position
      defaultPosition
      gender
      size
      lifeForce
      composition
      stance
      damageType
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_MOB = gql`
  mutation UpdateMob($id: Int!, $data: UpdateMobInput!) {
    updateMob(id: $id, data: $data) {
      id
      keywords
      shortDesc
      longDesc
      desc
    }
  }
`;

const CREATE_MOB = gql`
  mutation CreateMob($data: CreateMobInput!) {
    createMob(data: $data) {
      id
      keywords
      shortDesc
    }
  }
`;

interface MobFormData {
  keywords: string;
  mobClass: string;
  shortDesc: string;
  longDesc: string;
  desc: string;
  alignment: number;
  level: number;
  armorClass: number;
  hitRoll: number;
  move: number;
  hpDiceNum: number;
  hpDiceSize: number;
  hpDiceBonus: number;
  damageDiceNum: number;
  damageDiceSize: number;
  damageDiceBonus: number;
  copper: number;
  silver: number;
  gold: number;
  platinum: number;
  strength: number;
  intelligence: number;
  wisdom: number;
  dexterity: number;
  constitution: number;
  charisma: number;
  perception: number;
  concealment: number;
  zoneId: number;
  raceLegacy: string;
  position: string;
  defaultPosition: string;
  gender: string;
  size: string;
  lifeForce: string;
  composition: string;
  stance: string;
  damageType: string;
}

// Define validation rules for mob form
const mobValidationRules: ValidationRules<MobFormData> = [
  {
    field: 'keywords',
    validate: ValidationHelpers.required('Keywords are required'),
    debounceMs: 500, // Longer debounce for text fields
  },
  {
    field: 'shortDesc',
    validate: ValidationHelpers.required('Short description is required'),
    debounceMs: 500,
  },
  {
    field: 'level',
    validate: ValidationHelpers.range(
      1,
      100,
      'Level must be between 1 and 100'
    ),
    debounceMs: 200, // Shorter debounce for numbers
  },
  {
    field: 'hpDiceNum',
    validate: ValidationHelpers.min(1, 'HP dice number must be at least 1'),
    debounceMs: 200,
  },
  {
    field: 'hpDiceSize',
    validate: ValidationHelpers.min(1, 'HP dice size must be at least 1'),
    debounceMs: 200,
  },
  {
    field: 'damageDiceNum',
    validate: ValidationHelpers.min(1, 'Damage dice number must be at least 1'),
    debounceMs: 200,
  },
  {
    field: 'damageDiceSize',
    validate: ValidationHelpers.min(1, 'Damage dice size must be at least 1'),
    debounceMs: 200,
  },
];

function MobEditorContent() {
  const searchParams = useSearchParams();
  const mobId = searchParams.get('id');
  const isNew = !mobId;

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<MobFormData>({
    keywords: '',
    mobClass: 'warrior',
    shortDesc: '',
    longDesc: '',
    desc: '',
    alignment: 0,
    level: 1,
    armorClass: 0,
    hitRoll: 0,
    move: 0,
    hpDiceNum: 1,
    hpDiceSize: 8,
    hpDiceBonus: 0,
    damageDiceNum: 1,
    damageDiceSize: 4,
    damageDiceBonus: 0,
    copper: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
    strength: 13,
    intelligence: 13,
    wisdom: 13,
    dexterity: 13,
    constitution: 13,
    charisma: 13,
    perception: 0,
    concealment: 0,
    zoneId: 511,
    raceLegacy: 'HUMAN',
    position: 'STANDING',
    defaultPosition: 'STANDING',
    gender: 'NEUTRAL',
    size: 'MEDIUM',
    lifeForce: 'LIFE',
    composition: 'FLESH',
    stance: 'ALERT',
    damageType: 'HIT',
  });

  // Initialize real-time validation
  const { errors, validateField, validateAllFields } =
    useRealTimeValidation<MobFormData>(mobValidationRules);

  // Separate state for general/save errors
  const [generalError, setGeneralError] = useState<string>('');

  const { loading, error, data } = useQuery(GET_MOB, {
    variables: { id: parseInt(mobId || '0') },
    skip: isNew,
  });

  const [updateMob, { loading: updateLoading }] = useMutation(UPDATE_MOB);
  const [createMob, { loading: createLoading }] = useMutation(CREATE_MOB);

  useEffect(() => {
    const typedData = data as any;
    if (typedData?.mob) {
      const mob = typedData.mob; // Use any for now since we don't have proper GraphQL codegen
      setFormData({
        keywords: mob.keywords || '',
        mobClass: mob.mobClass || 'warrior',
        shortDesc: mob.shortDesc || '',
        longDesc: mob.longDesc || '',
        desc: mob.desc || '',
        alignment: mob.alignment || 0,
        level: mob.level || 1,
        armorClass: mob.armorClass || 0,
        hitRoll: mob.hitRoll || 0,
        move: mob.move || 0,
        hpDiceNum: mob.hpDiceNum || 1,
        hpDiceSize: mob.hpDiceSize || 8,
        hpDiceBonus: mob.hpDiceBonus || 0,
        damageDiceNum: mob.damageDiceNum || 1,
        damageDiceSize: mob.damageDiceSize || 4,
        damageDiceBonus: mob.damageDiceBonus || 0,
        copper: mob.copper || 0,
        silver: mob.silver || 0,
        gold: mob.gold || 0,
        platinum: mob.platinum || 0,
        strength: mob.strength || 13,
        intelligence: mob.intelligence || 13,
        wisdom: mob.wisdom || 13,
        dexterity: mob.dexterity || 13,
        constitution: mob.constitution || 13,
        charisma: mob.charisma || 13,
        perception: mob.perception || 0,
        concealment: mob.concealment || 0,
        zoneId: mob.zoneId || 511,
        raceLegacy: mob.raceLegacy || 'HUMAN',
        position: mob.position || 'STANDING',
        defaultPosition: mob.defaultPosition || 'STANDING',
        gender: mob.gender || 'NEUTRAL',
        size: mob.size || 'MEDIUM',
        lifeForce: mob.lifeForce || 'LIFE',
        composition: mob.composition || 'FLESH',
        stance: mob.stance || 'ALERT',
        damageType: mob.damageType || 'HIT',
      });
    }
  }, [data]);

  const handleInputChange = (
    field: keyof MobFormData,
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

  const validateForm = (): boolean => {
    // Use the real-time validation for final form validation
    return validateAllFields(formData);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (isNew) {
        await createMob({
          variables: {
            data: formData,
          },
        });
      } else {
        await updateMob({
          variables: {
            id: parseInt(mobId!),
            data: formData,
          },
        });
      }

      // Redirect back to mobs list
      window.location.href = '/dashboard/mobs';
    } catch (err) {
      console.error('Error saving mob:', err);
      setGeneralError('Failed to save mob. Please try again.');
    }
  };

  const calculateHP = () => {
    const average = (formData.hpDiceSize + 1) / 2;
    return Math.floor(formData.hpDiceNum * average + formData.hpDiceBonus);
  };

  const calculateDamage = () => {
    const average = (formData.damageDiceSize + 1) / 2;
    return Math.floor(
      formData.damageDiceNum * average + formData.damageDiceBonus
    );
  };

  if (loading) return <div className='p-4'>Loading mob data...</div>;
  if (error)
    return <div className='p-4 text-red-600'>Error: {error.message}</div>;

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'stats', label: 'Combat Stats' },
    { id: 'attributes', label: 'Attributes' },
    { id: 'equipment', label: 'Equipment & Resets' },
    { id: 'advanced', label: 'Advanced' },
  ];

  return (
    <div className='container mx-auto p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            {isNew ? 'Create New Mob' : `Edit Mob ${mobId}`}
          </h1>
          <p className='text-gray-600 mt-1'>
            Configure mob stats, appearance, and behavior
          </p>
        </div>
        <div className='flex gap-2'>
          <Link href='/dashboard/mobs'>
            <button className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Mobs
            </button>
          </Link>
          <button
            onClick={handleSave}
            disabled={updateLoading || createLoading}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
          >
            <Save className='w-4 h-4 mr-2' />
            {isNew ? 'Create Mob' : 'Save Changes'}
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
                  <input
                    type='text'
                    id='keywords'
                    value={formData.keywords}
                    onChange={e =>
                      handleInputChange('keywords', e.target.value)
                    }
                    placeholder='e.g., orc warrior guard'
                    className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.keywords ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.keywords && (
                    <p className='text-red-500 text-xs mt-1'>
                      {errors.keywords}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='mobClass'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Class
                  </label>
                  <select
                    id='mobClass'
                    value={formData.mobClass}
                    onChange={e =>
                      handleInputChange('mobClass', e.target.value)
                    }
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  >
                    <option value='warrior'>Warrior</option>
                    <option value='wizard'>Wizard</option>
                    <option value='cleric'>Cleric</option>
                    <option value='rogue'>Rogue</option>
                    <option value='ranger'>Ranger</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor='shortDesc'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Short Description *
                </label>
                <input
                  type='text'
                  id='shortDesc'
                  value={formData.shortDesc}
                  onChange={e => handleInputChange('shortDesc', e.target.value)}
                  placeholder='e.g., a burly orc warrior'
                  className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.shortDesc ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.shortDesc && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.shortDesc}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor='longDesc'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Long Description
                </label>
                <textarea
                  id='longDesc'
                  rows={4}
                  value={formData.longDesc}
                  onChange={e => handleInputChange('longDesc', e.target.value)}
                  placeholder='Detailed appearance when examined'
                  className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                />
              </div>

              <div>
                <label
                  htmlFor='desc'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Room Description
                </label>
                <textarea
                  id='desc'
                  rows={4}
                  value={formData.desc}
                  onChange={e => handleInputChange('desc', e.target.value)}
                  placeholder='How the mob appears in the room'
                  className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                />
              </div>
            </div>
          </div>
        )}

        {/* Combat Stats Tab */}
        {activeTab === 'stats' && (
          <div className='grid grid-cols-2 gap-6'>
            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Combat Statistics
              </h3>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='level'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Level *
                    </label>
                    <input
                      type='number'
                      id='level'
                      value={formData.level}
                      onChange={e =>
                        handleInputChange(
                          'level',
                          parseInt(e.target.value) || 1
                        )
                      }
                      min='1'
                      max='100'
                      className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.level ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.level && (
                      <p className='text-red-500 text-xs mt-1'>
                        {errors.level}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='armorClass'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Armor Class
                    </label>
                    <input
                      type='number'
                      id='armorClass'
                      value={formData.armorClass}
                      onChange={e =>
                        handleInputChange(
                          'armorClass',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='hitRoll'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Hit Roll
                    </label>
                    <input
                      type='number'
                      id='hitRoll'
                      value={formData.hitRoll}
                      onChange={e =>
                        handleInputChange(
                          'hitRoll',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='move'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Movement
                    </label>
                    <input
                      type='number'
                      id='move'
                      value={formData.move}
                      onChange={e =>
                        handleInputChange('move', parseInt(e.target.value) || 0)
                      }
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Hit Points & Damage
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Hit Points Dice
                  </label>
                  <div className='grid grid-cols-3 gap-2'>
                    <input
                      type='number'
                      placeholder='Num'
                      value={formData.hpDiceNum}
                      onChange={e =>
                        handleInputChange(
                          'hpDiceNum',
                          parseInt(e.target.value) || 1
                        )
                      }
                      min='1'
                      className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.hpDiceNum ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <input
                      type='number'
                      placeholder='Size'
                      value={formData.hpDiceSize}
                      onChange={e =>
                        handleInputChange(
                          'hpDiceSize',
                          parseInt(e.target.value) || 8
                        )
                      }
                      min='1'
                      className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.hpDiceSize ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <input
                      type='number'
                      placeholder='Bonus'
                      value={formData.hpDiceBonus}
                      onChange={e =>
                        handleInputChange(
                          'hpDiceBonus',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    />
                  </div>
                  <p className='text-sm text-gray-500 mt-1'>
                    {formData.hpDiceNum}d{formData.hpDiceSize}+
                    {formData.hpDiceBonus} (avg: ~{calculateHP()})
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Damage Dice
                  </label>
                  <div className='grid grid-cols-3 gap-2'>
                    <input
                      type='number'
                      placeholder='Num'
                      value={formData.damageDiceNum}
                      onChange={e =>
                        handleInputChange(
                          'damageDiceNum',
                          parseInt(e.target.value) || 1
                        )
                      }
                      min='1'
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    />
                    <input
                      type='number'
                      placeholder='Size'
                      value={formData.damageDiceSize}
                      onChange={e =>
                        handleInputChange(
                          'damageDiceSize',
                          parseInt(e.target.value) || 4
                        )
                      }
                      min='1'
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    />
                    <input
                      type='number'
                      placeholder='Bonus'
                      value={formData.damageDiceBonus}
                      onChange={e =>
                        handleInputChange(
                          'damageDiceBonus',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    />
                  </div>
                  <p className='text-sm text-gray-500 mt-1'>
                    {formData.damageDiceNum}d{formData.damageDiceSize}+
                    {formData.damageDiceBonus} (avg: ~{calculateDamage()})
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attributes Tab */}
        {activeTab === 'attributes' && (
          <div className='grid grid-cols-2 gap-6'>
            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Primary Attributes
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                {[
                  'strength',
                  'intelligence',
                  'wisdom',
                  'dexterity',
                  'constitution',
                  'charisma',
                ].map(attr => (
                  <div key={attr}>
                    <label
                      htmlFor={attr}
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      {attr.charAt(0).toUpperCase() + attr.slice(1)}
                    </label>
                    <input
                      type='number'
                      id={attr}
                      value={formData[attr as keyof MobFormData] as number}
                      onChange={e =>
                        handleInputChange(
                          attr as keyof MobFormData,
                          parseInt(e.target.value) || 13
                        )
                      }
                      min='3'
                      max='25'
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Special Attributes
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='perception'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Perception
                  </label>
                  <input
                    type='number'
                    id='perception'
                    value={formData.perception}
                    onChange={e =>
                      handleInputChange(
                        'perception',
                        parseInt(e.target.value) || 0
                      )
                    }
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
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>

                <div>
                  <label
                    htmlFor='alignment'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Alignment
                  </label>
                  <input
                    type='number'
                    id='alignment'
                    value={formData.alignment}
                    onChange={e =>
                      handleInputChange(
                        'alignment',
                        parseInt(e.target.value) || 0
                      )
                    }
                    min='-1000'
                    max='1000'
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

        {/* Equipment Tab */}
        {activeTab === 'equipment' && !isNew && (
          <div className='bg-white shadow rounded-lg p-6'>
            <MobEquipmentManager
              mobId={parseInt(mobId!)}
              zoneId={formData.zoneId}
            />
          </div>
        )}

        {/* Equipment Tab - New Mob Warning */}
        {activeTab === 'equipment' && isNew && (
          <div className='bg-white shadow rounded-lg p-6'>
            <div className='text-center py-8'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100'>
                <svg
                  className='h-6 w-6 text-yellow-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>
              <h3 className='mt-2 text-sm font-medium text-gray-900'>
                Save mob first
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                You need to save this mob before you can configure its equipment
                and spawn locations.
              </p>
              <div className='mt-6'>
                <button
                  onClick={handleSave}
                  disabled={updateLoading || createLoading}
                  className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                >
                  <Save className='w-4 h-4 mr-2' />
                  Save Mob First
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className='grid grid-cols-2 gap-6'>
            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Physical Properties
              </h3>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='raceLegacy'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Race
                    </label>
                    <select
                      id='raceLegacy'
                      value={formData.raceLegacy}
                      onChange={e =>
                        handleInputChange('raceLegacy', e.target.value)
                      }
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    >
                      <option value='HUMAN'>Human</option>
                      <option value='ELF'>Elf</option>
                      <option value='DWARF'>Dwarf</option>
                      <option value='HALFLING'>Halfling</option>
                      <option value='ORC'>Orc</option>
                      <option value='GOBLIN'>Goblin</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor='gender'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Gender
                    </label>
                    <select
                      id='gender'
                      value={formData.gender}
                      onChange={e =>
                        handleInputChange('gender', e.target.value)
                      }
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    >
                      <option value='NEUTRAL'>Neutral</option>
                      <option value='MALE'>Male</option>
                      <option value='FEMALE'>Female</option>
                    </select>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='size'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Size
                    </label>
                    <select
                      id='size'
                      value={formData.size}
                      onChange={e => handleInputChange('size', e.target.value)}
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    >
                      <option value='TINY'>Tiny</option>
                      <option value='SMALL'>Small</option>
                      <option value='MEDIUM'>Medium</option>
                      <option value='LARGE'>Large</option>
                      <option value='HUGE'>Huge</option>
                      <option value='GIGANTIC'>Gigantic</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor='composition'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Composition
                    </label>
                    <select
                      id='composition'
                      value={formData.composition}
                      onChange={e =>
                        handleInputChange('composition', e.target.value)
                      }
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    >
                      <option value='FLESH'>Flesh</option>
                      <option value='BONE'>Bone</option>
                      <option value='STONE'>Stone</option>
                      <option value='METAL'>Metal</option>
                      <option value='PLANT'>Plant</option>
                      <option value='WATER'>Water</option>
                      <option value='FIRE'>Fire</option>
                      <option value='AIR'>Air</option>
                      <option value='EARTH'>Earth</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Treasure
              </h3>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='copper'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Copper
                    </label>
                    <input
                      type='number'
                      id='copper'
                      value={formData.copper}
                      onChange={e =>
                        handleInputChange(
                          'copper',
                          parseInt(e.target.value) || 0
                        )
                      }
                      min='0'
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='silver'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Silver
                    </label>
                    <input
                      type='number'
                      id='silver'
                      value={formData.silver}
                      onChange={e =>
                        handleInputChange(
                          'silver',
                          parseInt(e.target.value) || 0
                        )
                      }
                      min='0'
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='gold'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Gold
                    </label>
                    <input
                      type='number'
                      id='gold'
                      value={formData.gold}
                      onChange={e =>
                        handleInputChange('gold', parseInt(e.target.value) || 0)
                      }
                      min='0'
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='platinum'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Platinum
                    </label>
                    <input
                      type='number'
                      id='platinum'
                      value={formData.platinum}
                      onChange={e =>
                        handleInputChange(
                          'platinum',
                          parseInt(e.target.value) || 0
                        )
                      }
                      min='0'
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    />
                  </div>
                </div>

                <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                  <p className='text-sm font-medium text-gray-700'>
                    Total Treasure Value:
                  </p>
                  <p className='text-lg font-bold text-green-600'>
                    {formData.platinum}pp {formData.gold}gp {formData.silver}sp{' '}
                    {formData.copper}cp
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

export default function MobEditor() {
  return (
    <PermissionGuard requireImmortal={true}>
      <Suspense fallback={<div className='p-6'>Loading mob editor...</div>}>
        <MobEditorContent />
      </Suspense>
    </PermissionGuard>
  );
}
