'use client';

import { Sparkles } from 'lucide-react';
import { DiceInput } from './dice-input';
import { NumberSpinner } from './number-spinner';

interface MobFormData {
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
  onGenerateStats: () => void;
  errors: Partial<Record<keyof MobFormData, string>>;
}

export function MobCombatStatsTab({
  formData,
  onFieldChange,
  onGenerateStats,
  errors,
}: CombatStatsTabProps) {
  return (
    <div className='space-y-6'>
      {/* Generate Stats Button */}
      <div className='bg-card shadow rounded-lg p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-medium text-card-foreground'>
              Combat Statistics
            </h3>
            <p className='text-sm text-muted-foreground mt-1'>
              Generate intelligent defaults based on level ({formData.level})
              and role ({formData.role})
            </p>
          </div>
          <button
            onClick={onGenerateStats}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/80 transition-colors'
          >
            <Sparkles className='w-4 h-4 mr-2' />
            Generate Stats
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-6'>
        {/* Left Column */}
        <div className='space-y-6'>
          {/* Basic Combat Info */}
          <div className='bg-card shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-card-foreground mb-4'>
              Basic Info
            </h3>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <NumberSpinner
                  label='Level *'
                  value={formData.level}
                  onChange={v => onFieldChange('level', v)}
                  min={1}
                  max={100}
                  error={errors.level}
                  helpText='Mob level (1-100)'
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
                    className='block w-full rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
                  >
                    <option value='TRASH'>Trash</option>
                    <option value='NORMAL'>Normal</option>
                    <option value='ELITE'>Elite</option>
                    <option value='MINIBOSS'>Miniboss</option>
                    <option value='BOSS'>Boss</option>
                    <option value='RAID_BOSS'>Raid Boss</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Health & Damage */}
          <div className='bg-card shadow rounded-lg p-6'>
            <h3 className='text-lg font-medium text-card-foreground mb-4'>
              Health & Damage
            </h3>
            <div className='space-y-4'>
              <DiceInput
                label='Hit Points'
                num={formData.hpDiceNum}
                size={formData.hpDiceSize}
                bonus={formData.hpDiceBonus}
                onNumChange={v => onFieldChange('hpDiceNum', v)}
                onSizeChange={v => onFieldChange('hpDiceSize', v)}
                onBonusChange={v => onFieldChange('hpDiceBonus', v)}
                numError={errors.hpDiceNum}
                sizeError={errors.hpDiceSize}
                minNum={1}
                minSize={1}
                helpText='HP rolled at mob spawn time'
              />

              <DiceInput
                label='Damage'
                num={formData.damageDiceNum}
                size={formData.damageDiceSize}
                bonus={formData.damageDiceBonus}
                onNumChange={v => onFieldChange('damageDiceNum', v)}
                onSizeChange={v => onFieldChange('damageDiceSize', v)}
                onBonusChange={v => onFieldChange('damageDiceBonus', v)}
                minNum={1}
                minSize={1}
                helpText='Base damage per attack'
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
