'use client';

import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { DiceDisplay } from './dice-display';
import { NumberSpinner } from './number-spinner';
import { MobStatPreviewModal } from './mob-stat-preview-modal';
import { useRaces } from '@/hooks/use-races';

interface MobFormData {
  level: number;
  role: string;
  mobClass: string;
  race: string;
  lifeForce: string;
  composition: string;
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
  hpDiceNum: number;
  hpDiceSize: number;
  hpDiceBonus: number;
  damageDiceNum: number;
  damageDiceSize: number;
  damageDiceBonus: number;
}

interface CombatStatsTabProps {
  formData: MobFormData;
  onFieldChange: (field: keyof MobFormData, value: number) => void;
  onGenerateStats: () => any; // Returns generated stats
  onClearErrors?: (fields: string[]) => void; // Clear validation errors
  errors: Partial<Record<keyof MobFormData, string>>;
}

export function MobCombatStatsTab({
  formData,
  onFieldChange,
  onGenerateStats,
  onClearErrors,
  errors,
}: CombatStatsTabProps) {
  // Fetch races dynamically
  const { races, loading: racesLoading } = useRaces();

  const [showPreview, setShowPreview] = useState(false);
  const [previewStats, setPreviewStats] = useState<any>(null);

  const handleOpenPreview = () => {
    const generated = onGenerateStats();
    setPreviewStats(generated);
    setShowPreview(true);
  };

  const handleApplyStats = (selectedFields: string[]) => {
    if (!previewStats) return;

    // Collect all fields that will be updated (for clearing errors)
    const fieldsToUpdate: string[] = [];

    // Apply only selected fields
    selectedFields.forEach(field => {
      if (field === 'hpDice') {
        // Apply all three HP dice components
        onFieldChange('hpDiceNum', previewStats.hpDiceNum);
        onFieldChange('hpDiceSize', previewStats.hpDiceSize);
        onFieldChange('hpDiceBonus', previewStats.hpDiceBonus);
        fieldsToUpdate.push('hpDiceNum', 'hpDiceSize', 'hpDiceBonus');
      } else if (field === 'damageDice') {
        // Apply all three damage dice components
        onFieldChange('damageDiceNum', previewStats.damageDiceNum);
        onFieldChange('damageDiceSize', previewStats.damageDiceSize);
        onFieldChange('damageDiceBonus', previewStats.damageDiceBonus);
        fieldsToUpdate.push(
          'damageDiceNum',
          'damageDiceSize',
          'damageDiceBonus'
        );
      } else if (field in previewStats) {
        // Regular stat field
        onFieldChange(field as keyof MobFormData, previewStats[field]);
        fieldsToUpdate.push(field);
      }
    });

    // Clear validation errors for all updated fields
    if (onClearErrors && fieldsToUpdate.length > 0) {
      onClearErrors(fieldsToUpdate);
    }
  };

  const formatDice = (num: number, size: number, bonus: number): string => {
    const sign = bonus >= 0 ? '+' : '';
    return `${num}d${size}${sign}${bonus}`;
  };

  const buildComparisons = () => {
    if (!previewStats) return [];

    const statConfigs: Array<{
      field: keyof MobFormData | 'hpDice' | 'damageDice';
      label: string;
      category: 'offensive' | 'defensive' | 'health' | 'resistance';
      isDice?: boolean;
    }> = [
      // Offensive
      { field: 'accuracy', label: 'Accuracy', category: 'offensive' },
      { field: 'attackPower', label: 'Attack Power', category: 'offensive' },
      { field: 'spellPower', label: 'Spell Power', category: 'offensive' },
      {
        field: 'penetrationFlat',
        label: 'Penetration (Flat)',
        category: 'offensive',
      },
      {
        field: 'penetrationPercent',
        label: 'Penetration (%)',
        category: 'offensive',
      },
      // Defensive
      { field: 'evasion', label: 'Evasion', category: 'defensive' },
      { field: 'armorRating', label: 'Armor Rating', category: 'defensive' },
      {
        field: 'damageReductionPercent',
        label: 'Damage Reduction (%)',
        category: 'defensive',
      },
      { field: 'soak', label: 'Soak', category: 'defensive' },
      { field: 'hardness', label: 'Hardness', category: 'defensive' },
      { field: 'wardPercent', label: 'Ward (%)', category: 'defensive' },
      // Health & Damage (combined as dice expressions)
      {
        field: 'hpDice',
        label: 'Hit Points',
        category: 'health',
        isDice: true,
      },
      {
        field: 'damageDice',
        label: 'Damage',
        category: 'health',
        isDice: true,
      },
      // Resistances
      {
        field: 'resistanceFire',
        label: 'Fire Resistance',
        category: 'resistance',
      },
      {
        field: 'resistanceCold',
        label: 'Cold Resistance',
        category: 'resistance',
      },
      {
        field: 'resistanceLightning',
        label: 'Lightning Resistance',
        category: 'resistance',
      },
      {
        field: 'resistanceAcid',
        label: 'Acid Resistance',
        category: 'resistance',
      },
      {
        field: 'resistancePoison',
        label: 'Poison Resistance',
        category: 'resistance',
      },
    ];

    return statConfigs.map(config => {
      if (config.isDice) {
        // Handle dice expressions specially
        if (config.field === 'hpDice') {
          return {
            field: 'hpDice',
            label: config.label,
            current: formatDice(
              formData.hpDiceNum,
              formData.hpDiceSize,
              formData.hpDiceBonus
            ),
            generated: formatDice(
              previewStats.hpDiceNum,
              previewStats.hpDiceSize,
              previewStats.hpDiceBonus
            ),
            category: config.category,
            isDice: true,
          };
        } else {
          // damageDice
          return {
            field: 'damageDice',
            label: config.label,
            current: formatDice(
              formData.damageDiceNum,
              formData.damageDiceSize,
              formData.damageDiceBonus
            ),
            generated: formatDice(
              previewStats.damageDiceNum,
              previewStats.damageDiceSize,
              previewStats.damageDiceBonus
            ),
            category: config.category,
            isDice: true,
          };
        }
      }

      // Regular stats
      return {
        field: config.field as string,
        label: config.label,
        current: formData[config.field as keyof MobFormData],
        generated:
          previewStats[config.field as keyof MobFormData] ??
          formData[config.field as keyof MobFormData],
        category: config.category,
        isDice: false,
      };
    });
  };

  return (
    <div className='space-y-6'>
      {/* Preview Modal */}
      <MobStatPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onApply={handleApplyStats}
        comparisons={buildComparisons()}
      />

      {/* Stat Generator Section */}
      <div className='bg-card shadow rounded-lg p-6'>
        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-medium text-card-foreground'>
              Combat Statistics Generator
            </h3>
            <p className='text-sm text-muted-foreground mt-1'>
              Configure level and role, then generate intelligent stat defaults
            </p>
          </div>

          {/* Generation Input Fields - Primary */}
          <div className='grid grid-cols-5 gap-3'>
            <NumberSpinner
              label='Level *'
              value={formData.level}
              onChange={v => onFieldChange('level', v)}
              min={1}
              max={100}
              error={errors.level}
              helpText='Primary scaling'
            />

            <div>
              <label
                htmlFor='role'
                className='block text-sm font-medium text-card-foreground mb-1'
              >
                Role
              </label>
              <select
                id='role'
                value={formData.role}
                onChange={e =>
                  onFieldChange('role' as any, e.target.value as any)
                }
                className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm h-[38px]'
              >
                <option value='TRASH'>Trash (0.5x)</option>
                <option value='NORMAL'>Normal (1.0x)</option>
                <option value='ELITE'>Elite (1.5x)</option>
                <option value='MINIBOSS'>Miniboss (2.5x)</option>
                <option value='BOSS'>Boss (4.0x)</option>
                <option value='RAID_BOSS'>Raid Boss (5.0x)</option>
              </select>
              <p className='text-xs text-muted-foreground mt-1'>
                Stat multiplier
              </p>
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
                  onFieldChange('mobClass' as any, e.target.value as any)
                }
                className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm h-[38px]'
              >
                <option value='warrior'>Warrior</option>
                <option value='sorcerer'>Sorcerer</option>
                <option value='cleric'>Cleric</option>
                <option value='druid'>Druid</option>
                <option value='ranger'>Ranger</option>
                <option value='thief'>Thief</option>
                <option value='shaman'>Shaman</option>
                <option value='layman'>Layman</option>
              </select>
              <p className='text-xs text-muted-foreground mt-1'>
                Attack/spell power
              </p>
            </div>

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
                onChange={e =>
                  onFieldChange('race' as any, e.target.value as any)
                }
                className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm h-[38px]'
                disabled={racesLoading}
              >
                {races.map(race => (
                  <option key={race.race} value={race.race}>
                    {race.displayName}
                  </option>
                ))}
              </select>
              <p className='text-xs text-muted-foreground mt-1'>Resistances</p>
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
                  onFieldChange('composition' as any, e.target.value as any)
                }
                className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm h-[38px]'
              >
                <option value='FLESH'>Flesh</option>
                <option value='BONE'>Bone</option>
                <option value='STONE'>Stone</option>
                <option value='METAL'>Metal</option>
                <option value='CRYSTAL'>Crystal</option>
                <option value='GAS'>Gas</option>
                <option value='LIQUID'>Liquid</option>
                <option value='PLANT'>Plant</option>
                <option value='WATER'>Water</option>
                <option value='FIRE'>Fire</option>
                <option value='AIR'>Air</option>
                <option value='EARTH'>Earth</option>
              </select>
              <p className='text-xs text-muted-foreground mt-1'>
                Soak/hardness
              </p>
            </div>
          </div>

          {/* Generation Button Row */}
          <div className='flex items-center justify-between'>
            <p className='text-xs text-muted-foreground italic'>
              These fields determine generated stat values. Click Preview to see
              results before applying.
            </p>

            <div className='flex gap-2'>
              <button
                onClick={handleOpenPreview}
                className='inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/80 transition-colors h-[38px]'
              >
                <Sparkles className='w-4 h-4 mr-2' />
                Preview Generated Stats
              </button>

              {/* Info Tooltip */}
              <div className='relative group'>
                <button
                  type='button'
                  className='h-[38px] w-[38px] rounded-md border border-input bg-background hover:bg-muted transition-colors flex items-center justify-center'
                  aria-label='How stats are generated'
                >
                  <svg
                    className='w-5 h-5 text-muted-foreground'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </button>

                {/* Tooltip */}
                <div className='absolute right-0 top-full mt-2 w-[480px] bg-popover text-popover-foreground rounded-lg shadow-lg border border-border p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
                  <div className='space-y-3'>
                    <div>
                      <h4 className='text-sm font-semibold mb-1.5'>
                        How Stats Are Generated
                      </h4>
                      <ul className='text-xs space-y-1'>
                        <li>
                          • <strong>HP & Damage</strong>: Scaled by level using
                          FieryMUD combat formulas with realistic dice
                          distributions
                        </li>
                        <li>
                          • <strong>Offense/Defense</strong>: Derived from
                          legacy AC/hitroll with modern accuracy, evasion, and
                          armor rating
                        </li>
                        <li>
                          • <strong>Resistances</strong>: Based on race (e.g.,
                          Fire Dragons get +75% fire resistance) and composition
                        </li>
                        <li>
                          • <strong>Role Multiplier</strong>: Applied to all
                          stats (Trash 0.5x → Raid Boss 5.0x) with boss-specific
                          low variance
                        </li>
                        <li>
                          • <strong>Advanced Stats</strong>: Attack/spell power,
                          soak, hardness, ward calculated from class and
                          lifeforce
                        </li>
                      </ul>
                    </div>

                    <div className='border-t border-border pt-2'>
                      <h4 className='text-sm font-semibold mb-1.5 text-accent'>
                        ⚠️ Important: How These Stats Are Used In-Game
                      </h4>
                      <div className='text-xs space-y-1.5'>
                        <p>
                          <strong>Generated stats are FINAL values</strong> used
                          directly in combat. The game engine does NOT apply
                          additional class/race/composition bonuses at runtime.
                        </p>
                        <p>
                          <strong>Why?</strong> All modifiers are already baked
                          in during generation:
                        </p>
                        <ul className='ml-3 space-y-0.5'>
                          <li>
                            → Class already affects attack/spell power,
                            penetration, ward
                          </li>
                          <li>→ Race already affects elemental resistances</li>
                          <li>
                            → Composition already affects soak and hardness
                          </li>
                        </ul>
                        <p className='mt-1.5'>
                          <strong>Result:</strong> What you see here is exactly
                          what players will fight. No double-dipping on bonuses!
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Arrow pointer */}
                  <div className='absolute -top-2 right-4 w-4 h-4 bg-popover border-l border-t border-border transform rotate-45'></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-6'>
        {/* Left Column */}
        <div className='space-y-6'>
          {/* Health & Damage */}
          <div className='bg-card shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-card-foreground mb-4'>
              Health & Damage
            </h3>
            <div className='space-y-4'>
              <DiceDisplay
                label='Hit Points'
                num={formData.hpDiceNum}
                size={formData.hpDiceSize}
                bonus={formData.hpDiceBonus}
                onNumChange={v => onFieldChange('hpDiceNum', v)}
                onSizeChange={v => onFieldChange('hpDiceSize', v)}
                onBonusChange={v => onFieldChange('hpDiceBonus', v)}
                error={errors.hpDiceNum || errors.hpDiceSize}
                helpText='HP rolled at mob spawn time (click to edit)'
              />

              <DiceDisplay
                label='Damage'
                num={formData.damageDiceNum}
                size={formData.damageDiceSize}
                bonus={formData.damageDiceBonus}
                onNumChange={v => onFieldChange('damageDiceNum', v)}
                onSizeChange={v => onFieldChange('damageDiceSize', v)}
                onBonusChange={v => onFieldChange('damageDiceBonus', v)}
                error={errors.damageDiceNum || errors.damageDiceSize}
                helpText='Base damage per attack (click to edit)'
              />
            </div>
          </div>

          {/* Offensive Stats */}
          <div className='bg-card shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-card-foreground mb-4'>
              Offensive Stats
            </h3>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <NumberSpinner
                  label='Accuracy'
                  value={formData.accuracy}
                  onChange={v => onFieldChange('accuracy', v)}
                  helpText='Hit chance bonus'
                />

                <NumberSpinner
                  label='Attack Power'
                  value={formData.attackPower}
                  onChange={v => onFieldChange('attackPower', v)}
                  helpText='Physical damage multiplier'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <NumberSpinner
                  label='Spell Power'
                  value={formData.spellPower}
                  onChange={v => onFieldChange('spellPower', v)}
                  helpText='Magic damage multiplier'
                />

                <NumberSpinner
                  label='Penetration (Flat)'
                  value={formData.penetrationFlat}
                  onChange={v => onFieldChange('penetrationFlat', v)}
                  helpText='Armor bypass (flat)'
                />
              </div>

              <NumberSpinner
                label='Penetration (%)'
                value={formData.penetrationPercent}
                onChange={v => onFieldChange('penetrationPercent', v)}
                min={0}
                max={100}
                helpText='Armor bypass (percentage)'
              />
            </div>
          </div>

          {/* Legacy Stats */}
          <div className='bg-card shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-card-foreground mb-4'>
              Legacy Stats (Deprecated)
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <NumberSpinner
                label='Armor Class (Legacy)'
                value={formData.armorClass}
                onChange={v => onFieldChange('armorClass', v)}
                helpText='Old AC system'
              />

              <NumberSpinner
                label='Hit Roll (Legacy)'
                value={formData.hitRoll}
                onChange={v => onFieldChange('hitRoll', v)}
                helpText='Old hit bonus'
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          {/* Defensive Stats */}
          <div className='bg-card shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-card-foreground mb-4'>
              Defensive Stats
            </h3>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <NumberSpinner
                  label='Evasion'
                  value={formData.evasion}
                  onChange={v => onFieldChange('evasion', v)}
                  helpText='Dodge chance bonus'
                />

                <NumberSpinner
                  label='Armor Rating'
                  value={formData.armorRating}
                  onChange={v => onFieldChange('armorRating', v)}
                  helpText='Physical damage reduction'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <NumberSpinner
                  label='Damage Reduction (%)'
                  value={formData.damageReductionPercent}
                  onChange={v => onFieldChange('damageReductionPercent', v)}
                  min={0}
                  max={100}
                  helpText='% physical damage reduction'
                />

                <NumberSpinner
                  label='Soak'
                  value={formData.soak}
                  onChange={v => onFieldChange('soak', v)}
                  helpText='Flat damage reduction'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <NumberSpinner
                  label='Hardness'
                  value={formData.hardness}
                  onChange={v => onFieldChange('hardness', v)}
                  helpText='Critical hit reduction'
                />

                <NumberSpinner
                  label='Ward (%)'
                  value={formData.wardPercent}
                  onChange={v => onFieldChange('wardPercent', v)}
                  min={0}
                  max={100}
                  helpText='Magic damage reduction %'
                />
              </div>
            </div>
          </div>

          {/* Elemental Resistances */}
          <div className='bg-card shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-card-foreground mb-4'>
              Elemental Resistances
            </h3>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <NumberSpinner
                  label='Fire Resistance'
                  value={formData.resistanceFire}
                  onChange={v => onFieldChange('resistanceFire', v)}
                  min={-50}
                  max={100}
                  helpText='Fire damage resistance'
                />

                <NumberSpinner
                  label='Cold Resistance'
                  value={formData.resistanceCold}
                  onChange={v => onFieldChange('resistanceCold', v)}
                  min={-50}
                  max={100}
                  helpText='Cold damage resistance'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <NumberSpinner
                  label='Lightning Resistance'
                  value={formData.resistanceLightning}
                  onChange={v => onFieldChange('resistanceLightning', v)}
                  min={-50}
                  max={100}
                  helpText='Lightning damage resistance'
                />

                <NumberSpinner
                  label='Acid Resistance'
                  value={formData.resistanceAcid}
                  onChange={v => onFieldChange('resistanceAcid', v)}
                  min={-50}
                  max={100}
                  helpText='Acid damage resistance'
                />
              </div>

              <NumberSpinner
                label='Poison Resistance'
                value={formData.resistancePoison}
                onChange={v => onFieldChange('resistancePoison', v)}
                min={-50}
                max={100}
                helpText='Poison damage resistance'
              />
            </div>

            <div className='mt-4 p-3 bg-muted/50 rounded-md'>
              <p className='text-xs text-muted-foreground'>
                <strong>Note:</strong> Negative values indicate vulnerability.
                Range: -50 (very vulnerable) to 100 (immune)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
