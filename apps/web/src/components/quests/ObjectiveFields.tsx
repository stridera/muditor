'use client';

import { HelpButton } from '@/components/help/HelpButton';
import { QUESTS_HELP_ANCHORS as HELP } from '@/components/help/help-topics';
import type {
  QuestObjectiveScope,
  QuestObjectiveType,
} from '@/generated/graphql';
import type { ReactNode } from 'react';
import { AbilityPicker } from './AbilityPicker';
import { EntityAutocomplete } from './EntityAutocomplete';
import { OBJECTIVE_SCOPES, OBJECTIVE_TYPES } from './quest-constants';
import {
  OBJECTIVE_FIELDS,
  objectiveTypePatch,
  type ObjectiveFormData,
} from './quest-form';

interface ObjectiveFieldsProps {
  objective: ObjectiveFormData;
  /** Persist a partial change (one mutation per call). */
  onChange: (patch: Partial<ObjectiveFormData>) => void;
  /** Extra content shown for Talk to NPC objectives (the dialogue editor). */
  dialogueSlot?: ReactNode;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <div className='text-xs font-medium text-muted-foreground mb-1'>
      {children}
    </div>
  );
}

/**
 * The editable body of one objective. Which inputs appear depends on the
 * objective type (see OBJECTIVE_FIELDS): Kill Mob shows a mob picker, Deliver
 * Item shows an item and a recipient mob, Use Skill shows an ability picker,
 * and so on.
 */
export function ObjectiveFields({
  objective,
  onChange,
  dialogueSlot,
}: ObjectiveFieldsProps) {
  const fields = OBJECTIVE_FIELDS[objective.objectiveType];

  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-3 gap-3'>
        <div className='flex items-center gap-1'>
          <select
            aria-label='Objective type'
            value={objective.objectiveType}
            onChange={e =>
              onChange(
                objectiveTypePatch(e.target.value as QuestObjectiveType, {
                  scope: objective.scope,
                })
              )
            }
            className='rounded-md border border-input bg-background shadow-sm sm:text-sm'
          >
            {OBJECTIVE_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <HelpButton
            topic='quests'
            anchor={HELP.objectives}
            variant='icon'
            tip='What each objective type needs and how players complete it'
          />
        </div>
        <input
          aria-label='Required count'
          type='number'
          value={objective.requiredCount}
          onChange={e =>
            onChange({ requiredCount: parseInt(e.target.value) || 1 })
          }
          min={1}
          placeholder='Count'
          className='rounded-md border border-input bg-background shadow-sm sm:text-sm'
        />
        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={objective.showProgress}
            onChange={e => onChange({ showProgress: e.target.checked })}
            className='rounded border-input'
          />
          <span className='text-sm'>Show Progress</span>
        </label>
      </div>

      <input
        aria-label='Player-visible description'
        value={objective.playerDescription}
        onChange={e => onChange({ playerDescription: e.target.value })}
        placeholder='Player-visible description'
        className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm'
      />
      <input
        aria-label='Internal note'
        value={objective.internalNote}
        onChange={e => onChange({ internalNote: e.target.value })}
        placeholder='Internal note (builder only)'
        className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm text-muted-foreground'
      />

      {fields.targetMob && (
        <div>
          <FieldLabel>
            {objective.objectiveType === 'TALK_TO_NPC'
              ? 'Mob to talk to'
              : 'Target mob'}
          </FieldLabel>
          <EntityAutocomplete
            entityType='mob'
            value={{
              zoneId: objective.targetMobZoneId,
              id: objective.targetMobId,
            }}
            onChange={({ zoneId, id }) =>
              onChange({ targetMobZoneId: zoneId, targetMobId: id })
            }
            placeholder='Search target mob...'
          />
        </div>
      )}

      {fields.targetObject && (
        <div>
          <FieldLabel>
            {objective.objectiveType === 'DELIVER_ITEM'
              ? 'Item to deliver'
              : 'Target object'}
          </FieldLabel>
          <EntityAutocomplete
            entityType='object'
            value={{
              zoneId: objective.targetObjectZoneId,
              id: objective.targetObjectId,
            }}
            onChange={({ zoneId, id }) =>
              onChange({ targetObjectZoneId: zoneId, targetObjectId: id })
            }
            placeholder='Search target object...'
          />
        </div>
      )}

      {fields.deliverToMob && (
        <div>
          <FieldLabel>Deliver to mob</FieldLabel>
          <EntityAutocomplete
            entityType='mob'
            value={{
              zoneId: objective.deliverToMobZoneId,
              id: objective.deliverToMobId,
            }}
            onChange={({ zoneId, id }) =>
              onChange({ deliverToMobZoneId: zoneId, deliverToMobId: id })
            }
            placeholder='Search recipient mob...'
          />
          <p className='text-xs text-muted-foreground mt-1'>
            Players complete it with give &lt;item&gt; &lt;mob&gt; to a mob of
            this prototype.
          </p>
        </div>
      )}

      {fields.targetRoom && (
        <div>
          <FieldLabel>Target room</FieldLabel>
          <EntityAutocomplete
            entityType='room'
            value={{
              zoneId: objective.targetRoomZoneId,
              id: objective.targetRoomId,
            }}
            onChange={({ zoneId, id }) =>
              onChange({ targetRoomZoneId: zoneId, targetRoomId: id })
            }
            placeholder='Search target room...'
          />
        </div>
      )}

      {fields.targetAbility && (
        <div>
          <FieldLabel>Skill or spell to use</FieldLabel>
          <AbilityPicker
            value={objective.targetAbilityId}
            onChange={abilityId => onChange({ targetAbilityId: abilityId })}
          />
          <p className='text-xs text-muted-foreground mt-1'>
            Only a successful use counts.
          </p>
        </div>
      )}

      {fields.luaExpression && (
        <div className='space-y-1'>
          <div className='flex items-center gap-1 text-xs font-medium text-muted-foreground'>
            Lua expression
            <HelpButton
              topic='quests'
              anchor={HELP.customLua}
              variant='icon'
              tip='A boolean expression checked about once a minute; true adds 1 to the count'
            />
          </div>
          <textarea
            aria-label='Lua expression'
            value={objective.luaExpression}
            onChange={e => onChange({ luaExpression: e.target.value })}
            placeholder='e.g. actor.level >= 10 and actor:has_item(30, 12)'
            rows={3}
            className='block w-full rounded-md border border-input bg-background font-mono text-sm'
          />
        </div>
      )}

      {fields.scope && (
        <div>
          <FieldLabel>Who counts</FieldLabel>
          <select
            aria-label='Scope'
            value={objective.scope}
            onChange={e =>
              onChange({ scope: e.target.value as QuestObjectiveScope })
            }
            className='rounded-md border border-input bg-background shadow-sm sm:text-sm'
          >
            {OBJECTIVE_SCOPES.map(scope => (
              <option key={scope.value} value={scope.value}>
                {scope.label}
              </option>
            ))}
          </select>
          <p className='text-xs text-muted-foreground mt-1'>
            {
              OBJECTIVE_SCOPES.find(s => s.value === objective.scope)
                ?.description
            }
          </p>
        </div>
      )}

      {fields.dialogue && dialogueSlot}
    </div>
  );
}
