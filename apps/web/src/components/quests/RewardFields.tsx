'use client';

import { HelpButton } from '@/components/help/HelpButton';
import { QUESTS_HELP_ANCHORS as HELP } from '@/components/help/help-topics';
import type { QuestRewardType } from '@/generated/graphql';
import { AbilityPicker } from './AbilityPicker';
import { EntityAutocomplete } from './EntityAutocomplete';
import { REWARD_TYPES, UNGRANTED_REWARD_TYPES } from './quest-constants';
import type { RewardFormData } from './quest-form';

interface RewardFieldsProps {
  reward: RewardFormData;
  /** Persist a partial change (one mutation per call). */
  onChange: (patch: Partial<RewardFormData>) => void;
}

const LABEL = 'block text-xs font-medium text-muted-foreground mb-1';
const INPUT =
  'block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm';

/**
 * The editable body of one reward. Fields depend on the reward type:
 * Experience, Gold and Skill Points take an amount; Item takes an item and a
 * quantity; Ability takes a skill/spell; Housing takes nothing and is flagged
 * as not yet granted by the game. Choice group and condition apply to all.
 */
export function RewardFields({ reward, onChange }: RewardFieldsProps) {
  const type = reward.rewardType;
  const takesAmount =
    type === 'EXPERIENCE' || type === 'GOLD' || type === 'SKILL_POINTS';
  const ungranted = UNGRANTED_REWARD_TYPES.includes(type);

  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-4 gap-3'>
        <div>
          <label className={LABEL}>
            Type
            <select
              aria-label='Reward type'
              value={type}
              onChange={e =>
                onChange({ rewardType: e.target.value as QuestRewardType })
              }
              className={`${INPUT} mt-1`}
            >
              {REWARD_TYPES.map(t => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {takesAmount && (
          <div>
            <label className={LABEL}>
              Amount
              <input
                aria-label='Amount'
                type='number'
                value={reward.amount ?? ''}
                onChange={e =>
                  onChange({
                    amount: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder='Amount'
                className={`${INPUT} mt-1`}
              />
            </label>
          </div>
        )}

        {type === 'ITEM' && (
          <>
            <div className='col-span-2'>
              <span className={LABEL}>Item</span>
              <EntityAutocomplete
                entityType='object'
                value={{ zoneId: reward.objectZoneId, id: reward.objectId }}
                onChange={({ zoneId, id }) =>
                  onChange({ objectZoneId: zoneId, objectId: id })
                }
                placeholder='Search item...'
              />
            </div>
            <div>
              <label className={LABEL}>
                Quantity
                <input
                  aria-label='Quantity'
                  type='number'
                  min={1}
                  value={reward.quantity}
                  onChange={e =>
                    onChange({ quantity: parseInt(e.target.value) || 1 })
                  }
                  className={`${INPUT} mt-1`}
                />
              </label>
            </div>
          </>
        )}

        {type === 'ABILITY' && (
          <div className='col-span-2'>
            <span className={LABEL}>Skill or spell taught</span>
            <AbilityPicker
              value={reward.abilityId}
              onChange={abilityId => onChange({ abilityId })}
            />
          </div>
        )}

        <div>
          <label className={`${LABEL} flex items-center gap-1`}>
            Choice Group
            <HelpButton
              topic='quests'
              anchor={HELP.rewards}
              variant='icon'
              tip='Rewards sharing a group are pick-one, claimed with qreward'
            />
          </label>
          <input
            aria-label='Choice group'
            type='number'
            value={reward.choiceGroup ?? ''}
            onChange={e =>
              onChange({
                choiceGroup: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            placeholder='Group'
            title='Same group = player chooses one'
            className={INPUT}
          />
        </div>
      </div>

      {ungranted && (
        <p className='text-xs text-amber-600 dark:text-amber-400'>
          Not yet granted: the game announces a Housing reward but does not give
          the player anything.
        </p>
      )}

      <div>
        <label className={`${LABEL} flex items-center gap-1`}>
          Condition (Lua, optional)
          <HelpButton
            topic='quests'
            anchor={HELP.availability}
            variant='icon'
            tip='A Lua expression like the availability requirement. A reward with a condition is claimed with qreward, and only if the expression is true'
          />
        </label>
        <textarea
          aria-label='Reward condition'
          value={reward.condition}
          onChange={e => onChange({ condition: e.target.value })}
          placeholder="e.g. actor.class == 'paladin'"
          rows={2}
          className={`${INPUT} font-mono`}
        />
      </div>
    </div>
  );
}
