'use client';

export const dynamic = 'force-dynamic';

import { PermissionGuard } from '@/components/auth/permission-guard';
import {
  CreateMobDocument,
  GetMobDocument,
  UpdateMobDocument,
  type Composition,
  type DamageType,
  type Gender,
  type GetMobQuery,
  type LifeForce,
  type MobRole,
  type Position,
  type Race,
  type Size,
  type Stance,
} from '@/generated/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import MobEquipmentManager from '../../../../components/mob-equipment-manager';
import type { ValidationRules } from '../../../../hooks/useRealTimeValidation';
import {
  useRealTimeValidation,
  ValidationHelpers,
} from '../../../../hooks/useRealTimeValidation';
import { DiceInput } from '../../../../components/dice-input';
import { NumberSpinner } from '../../../../components/number-spinner';
import { generateMobStats } from '../../../../utils/mob-stat-generator';
import { MobCombatStatsTab } from '../../../../components/mob-combat-stats-tab';

interface MobFormData {
  keywords: string;
  mobClass: string;
  name: string;
  roomDescription: string;
  examineDescription: string;
  alignment: number;
  level: number;
  role: string;
  armorClass: number;
  hitRoll: number;
  accuracy: number;
  attackPower: number;
  spellPower: number;
  penetrationFlat: number;
  penetrationPercent: number;
  evasion: number;
  armorRating: number;
  damageReductionPercent: number;
  soak: number;
  hardness: number;
  wardPercent: number;
  resistanceFire: number;
  resistanceCold: number;
  resistanceLightning: number;
  resistanceAcid: number;
  resistancePoison: number;
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
  race: string;
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
    field: 'name',
    validate: ValidationHelpers.required('Name is required'),
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
  const zoneId = searchParams.get('zone');
  const isNew = !mobId || !zoneId;

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<MobFormData>({
    keywords: '',
    mobClass: 'warrior',
    name: '',
    roomDescription: '',
    examineDescription: '',
    alignment: 0,
    level: 1,
    role: 'NORMAL',
    armorClass: 0,
    hitRoll: 0,
    accuracy: 0,
    attackPower: 0,
    spellPower: 0,
    penetrationFlat: 0,
    penetrationPercent: 0,
    evasion: 0,
    armorRating: 0,
    damageReductionPercent: 0,
    soak: 0,
    hardness: 0,
    wardPercent: 0,
    resistanceFire: 0,
    resistanceCold: 0,
    resistanceLightning: 0,
    resistanceAcid: 0,
    resistancePoison: 0,
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
    race: 'HUMAN',
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

  const { loading, error, data } = useQuery(GetMobDocument, {
    variables: {
      zoneId: parseInt(zoneId || '0'),
      id: parseInt(mobId || '0'),
    },
    skip: isNew,
  });

  const [updateMob, { loading: updateLoading }] =
    useMutation(UpdateMobDocument);
  const [createMob, { loading: createLoading }] =
    useMutation(CreateMobDocument);

  // Helper function to parse dice notation (accepts undefined/null safely)
  const parseDice = (diceStr: string | undefined | null) => {
    const safe = diceStr ?? '';
    const match = safe.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) return { num: 1, size: 8, bonus: 0 };
    const [, numStr, sizeStr, bonusStr] = match as [
      string,
      string,
      string,
      string?,
    ];
    return {
      num: parseInt(numStr, 10),
      size: parseInt(sizeStr, 10),
      bonus: bonusStr ? parseInt(bonusStr, 10) : 0,
    };
  };

  useEffect(() => {
    const typedData = data as GetMobQuery | undefined;
    if (typedData?.mob) {
      const mob = typedData.mob;
      const hpDice = parseDice(mob.hpDice ?? '1d8+0');
      const damageDice = parseDice(mob.damageDice ?? '1d4+0');

      setFormData({
        keywords: mob.keywords.join(' '),
        mobClass: 'warrior', // Not in schema
        name: mob.name,
        roomDescription: mob.roomDescription,
        examineDescription: mob.examineDescription,
        alignment: mob.alignment,
        level: mob.level,
        role: mob.role || 'NORMAL',
        armorClass: mob.armorClass,
        hitRoll: mob.hitRoll,
        accuracy: mob.accuracy || 0,
        attackPower: mob.attackPower || 0,
        spellPower: mob.spellPower || 0,
        penetrationFlat: mob.penetrationFlat || 0,
        penetrationPercent: mob.penetrationPercent || 0,
        evasion: mob.evasion || 0,
        armorRating: mob.armorRating || 0,
        damageReductionPercent: mob.damageReductionPercent || 0,
        soak: mob.soak || 0,
        hardness: mob.hardness || 0,
        wardPercent: mob.wardPercent || 0,
        resistanceFire: mob.resistanceFire || 0,
        resistanceCold: mob.resistanceCold || 0,
        resistanceLightning: mob.resistanceLightning || 0,
        resistanceAcid: mob.resistanceAcid || 0,
        resistancePoison: mob.resistancePoison || 0,
        move: 0, // Not in schema
        hpDiceNum: hpDice.num,
        hpDiceSize: hpDice.size,
        hpDiceBonus: hpDice.bonus,
        damageDiceNum: damageDice.num,
        damageDiceSize: damageDice.size,
        damageDiceBonus: damageDice.bonus,
        copper: 0, // Not in schema
        silver: 0, // Not in schema
        gold: 0, // Not in schema
        platinum: 0, // Not in schema
        strength: mob.strength,
        intelligence: mob.intelligence,
        wisdom: mob.wisdom,
        dexterity: mob.dexterity,
        constitution: mob.constitution,
        charisma: mob.charisma,
        perception: mob.perception,
        concealment: mob.concealment,
        zoneId: mob.zoneId,
        race: mob.race,
        position: mob.position,
        defaultPosition: mob.position || 'STANDING', // Use position since defaultPosition doesn't exist
        gender: mob.gender,
        size: mob.size,
        lifeForce: mob.lifeForce,
        composition: mob.composition,
        stance: mob.stance,
        damageType: mob.damageType,
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
      // Convert form data to backend format
      const saveData = {
        keywords: formData.keywords.split(/\s+/).filter(k => k.length > 0),
        name: formData.name,
        roomDescription: formData.roomDescription,
        examineDescription: formData.examineDescription,
        level: formData.level,
        role: formData.role as MobRole,
        alignment: formData.alignment,
        hitRoll: formData.hitRoll,
        armorClass: formData.armorClass,
        accuracy: formData.accuracy,
        attackPower: formData.attackPower,
        spellPower: formData.spellPower,
        penetrationFlat: formData.penetrationFlat,
        penetrationPercent: formData.penetrationPercent,
        evasion: formData.evasion,
        armorRating: formData.armorRating,
        damageReductionPercent: formData.damageReductionPercent,
        soak: formData.soak,
        hardness: formData.hardness,
        wardPercent: formData.wardPercent,
        resistanceFire: formData.resistanceFire,
        resistanceCold: formData.resistanceCold,
        resistanceLightning: formData.resistanceLightning,
        resistanceAcid: formData.resistanceAcid,
        resistancePoison: formData.resistancePoison,
        hpDice: `${formData.hpDiceNum}d${formData.hpDiceSize}${formData.hpDiceBonus >= 0 ? '+' : ''}${formData.hpDiceBonus}`,
        damageDice: `${formData.damageDiceNum}d${formData.damageDiceSize}${formData.damageDiceBonus >= 0 ? '+' : ''}${formData.damageDiceBonus}`,
        damageType: formData.damageType as DamageType,
        strength: formData.strength,
        intelligence: formData.intelligence,
        wisdom: formData.wisdom,
        dexterity: formData.dexterity,
        constitution: formData.constitution,
        charisma: formData.charisma,
        perception: formData.perception,
        concealment: formData.concealment,
        race: formData.race as Race,
        position: formData.position as Position,
        gender: formData.gender as Gender,
        size: formData.size as Size,
        lifeForce: formData.lifeForce as LifeForce,
        composition: formData.composition as Composition,
        stance: formData.stance as Stance,
      };

      if (isNew) {
        await createMob({
          variables: {
            data: {
              ...saveData,
              id: parseInt(mobId || '1'), // Use provided ID or default to 1 for new mobs
              zoneId: formData.zoneId,
            },
          },
        });
      } else {
        await updateMob({
          variables: {
            zoneId: parseInt(zoneId!),
            id: parseInt(mobId!),
            data: saveData, // saveData now conforms to expected input shape
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

  const handleGenerateStats = () => {
    // Generate stats based on current level and role
    const generatedStats = generateMobStats(
      formData.level,
      formData.role as any, // Type assertion for role
      formData.mobClass.toUpperCase() as any, // Type assertion for class
      formData.race,
      formData.lifeForce as any, // Type assertion for lifeforce
      formData.composition as any, // Type assertion for composition
      formData.hitRoll,
      formData.armorClass
    );

    // Update form data with generated stats
    setFormData({
      ...formData,
      accuracy: generatedStats.accuracy,
      attackPower: generatedStats.attackPower,
      spellPower: generatedStats.spellPower,
      penetrationFlat: generatedStats.penetrationFlat,
      penetrationPercent: generatedStats.penetrationPercent,
      evasion: generatedStats.evasion,
      armorRating: generatedStats.armorRating,
      damageReductionPercent: generatedStats.damageReductionPercent,
      soak: generatedStats.soak,
      hardness: generatedStats.hardness,
      wardPercent: generatedStats.wardPercent,
      resistanceFire: generatedStats.resistanceFire,
      resistanceCold: generatedStats.resistanceCold,
      resistanceLightning: generatedStats.resistanceLightning,
      resistanceAcid: generatedStats.resistanceAcid,
      resistancePoison: generatedStats.resistancePoison,
      hpDiceNum: generatedStats.hpDiceNum,
      hpDiceSize: generatedStats.hpDiceSize,
      hpDiceBonus: generatedStats.hpDiceBonus,
      damageDiceNum: generatedStats.damageDiceNum,
      damageDiceSize: generatedStats.damageDiceSize,
      damageDiceBonus: generatedStats.damageDiceBonus,
    });
  };

  // Show loading state while query is running
  if (loading)
    return <div className='p-4 text-foreground'>Loading mob data...</div>;

  // Show error if query failed
  if (error) {
    console.error('GraphQL Error:', error);
    return (
      <div className='p-4 text-destructive'>
        Error loading mob: {error.message}
      </div>
    );
  }

  // If we have params but no data, the mob might not exist
  if (!isNew && !loading && !data?.mob) {
    return (
      <div className='p-4 text-destructive'>
        Mob not found (Zone: {zoneId}, ID: {mobId}). It may not exist in the
        database.
      </div>
    );
  }

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
          <h1 className='text-3xl font-bold text-foreground'>
            {isNew
              ? 'Create New Mob'
              : formData.name
                ? `Edit Mob: ${formData.name}`
                : `Edit Mob - Zone ${zoneId}, ID ${mobId}`}
          </h1>
          <p className='text-muted-foreground mt-1'>
            {isNew
              ? 'Create a new mob with custom stats, appearance, and behavior'
              : data?.mob?.name || 'Loading mob details...'}
          </p>
        </div>
        <div className='flex gap-2'>
          <Link href='/dashboard/mobs'>
            <button className='inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Mobs
            </button>
          </Link>
          <button
            onClick={handleSave}
            disabled={updateLoading || createLoading}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
          >
            <Save className='w-4 h-4 mr-2' />
            {isNew ? 'Create Mob' : 'Save Changes'}
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
          <div className='bg-card shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-card-foreground mb-4'>
              Basic Information
            </h3>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='keywords'
                    className='block text-sm font-medium text-card-foreground mb-1'
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
                    className={`block w-full rounded-md border bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm ${
                      errors.keywords ? 'border-destructive' : 'border-input'
                    }`}
                  />
                  {errors.keywords && (
                    <p className='text-destructive text-xs mt-1'>
                      {errors.keywords}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='mobClass'
                    className='block text-sm font-medium text-card-foreground mb-1'
                  >
                    Class
                  </label>
                  <select
                    id='mobClass'
                    value={formData.mobClass}
                    onChange={e =>
                      handleInputChange('mobClass', e.target.value)
                    }
                    className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
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
                  htmlFor='name'
                  className='block text-sm font-medium text-card-foreground mb-1'
                >
                  Name *
                </label>
                <input
                  type='text'
                  id='name'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder='e.g., a burly orc warrior'
                  className={`block w-full rounded-md border bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm ${
                    errors.name ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.name && (
                  <p className='text-destructive text-xs mt-1'>{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor='roomDescription'
                  className='block text-sm font-medium text-card-foreground mb-1'
                >
                  Room Description
                </label>
                <textarea
                  id='roomDescription'
                  rows={4}
                  value={formData.roomDescription}
                  onChange={e =>
                    handleInputChange('roomDescription', e.target.value)
                  }
                  placeholder='How the mob appears in the room'
                  className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                />
              </div>

              <div>
                <label
                  htmlFor='examineDescription'
                  className='block text-sm font-medium text-card-foreground mb-1'
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
                  placeholder='Detailed appearance when examined'
                  className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                />
              </div>
            </div>
          </div>
        )}

        {/* Combat Stats Tab */}
        {activeTab === 'stats' && (
          <MobCombatStatsTab
            formData={formData}
            onFieldChange={handleInputChange}
            onGenerateStats={handleGenerateStats}
            errors={errors}
          />
        )}

        {/* Attributes Tab */}
        {activeTab === 'attributes' && (
          <div className='grid grid-cols-2 gap-6'>
            <div className='bg-card shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-card-foreground mb-4'>
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
                      className='block text-sm font-medium text-card-foreground mb-1'
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
                      className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-card shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-card-foreground mb-4'>
                Special Attributes
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='perception'
                    className='block text-sm font-medium text-card-foreground mb-1'
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
                    className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                  />
                </div>

                <div>
                  <label
                    htmlFor='concealment'
                    className='block text-sm font-medium text-card-foreground mb-1'
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
                    className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                  />
                </div>

                <div>
                  <label
                    htmlFor='alignment'
                    className='block text-sm font-medium text-card-foreground mb-1'
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
                    className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                  />
                </div>

                <div>
                  <label
                    htmlFor='zoneId'
                    className='block text-sm font-medium text-card-foreground mb-1'
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
                    className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Equipment Tab */}
        {activeTab === 'equipment' && !isNew && (
          <div className='bg-card shadow rounded-lg p-6'>
            <MobEquipmentManager
              mobId={parseInt(mobId!)}
              zoneId={formData.zoneId}
            />
          </div>
        )}

        {/* Equipment Tab - New Mob Warning */}
        {activeTab === 'equipment' && isNew && (
          <div className='bg-card shadow rounded-lg p-6'>
            <div className='text-center py-8'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent'>
                <svg
                  className='h-6 w-6 text-accent-foreground'
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
              <h3 className='mt-2 text-sm font-medium text-card-foreground'>
                Save mob first
              </h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                You need to save this mob before you can configure its equipment
                and spawn locations.
              </p>
              <div className='mt-6'>
                <button
                  onClick={handleSave}
                  disabled={updateLoading || createLoading}
                  className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
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
            <div className='bg-card shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-card-foreground mb-4'>
                Physical Properties
              </h3>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='race'
                      className='block text-sm font-medium text-card-foreground mb-1'
                    >
                      Race
                    </label>
                    <select
                      id='race'
                      value={formData.race}
                      onChange={e => handleInputChange('race', e.target.value)}
                      className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
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
                      className='block text-sm font-medium text-card-foreground mb-1'
                    >
                      Gender
                    </label>
                    <select
                      id='gender'
                      value={formData.gender}
                      onChange={e =>
                        handleInputChange('gender', e.target.value)
                      }
                      className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
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
                      className='block text-sm font-medium text-card-foreground mb-1'
                    >
                      Size
                    </label>
                    <select
                      id='size'
                      value={formData.size}
                      onChange={e => handleInputChange('size', e.target.value)}
                      className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
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
                      className='block text-sm font-medium text-card-foreground mb-1'
                    >
                      Composition
                    </label>
                    <select
                      id='composition'
                      value={formData.composition}
                      onChange={e =>
                        handleInputChange('composition', e.target.value)
                      }
                      className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
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

            <div className='bg-card shadow rounded-lg p-6'>
              <h3 className='text-lg font-medium text-card-foreground mb-4'>
                Treasure
              </h3>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='copper'
                      className='block text-sm font-medium text-card-foreground mb-1'
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
                      className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='silver'
                      className='block text-sm font-medium text-card-foreground mb-1'
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
                      className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='gold'
                      className='block text-sm font-medium text-card-foreground mb-1'
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
                      className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='platinum'
                      className='block text-sm font-medium text-card-foreground mb-1'
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
                      className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                    />
                  </div>
                </div>

                <div className='mt-4 p-4 bg-muted rounded-lg'>
                  <p className='text-sm font-medium text-card-foreground'>
                    Total Treasure Value:
                  </p>
                  <p className='text-lg font-bold text-primary'>
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
