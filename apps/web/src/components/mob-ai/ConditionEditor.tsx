'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AI_ALIGNS,
  AI_LIFEFORCES,
  RULE_LIMITS,
  applyConditionEdits,
  conditionsToForm,
  extraConditionKeys,
  removeConditionKey,
  asConditionsObject,
  type CombatState,
  type ConditionForm,
  type ConditionsJson,
} from '@/lib/mob-ai-conditions';
import { X } from 'lucide-react';

const selectClass =
  'block w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm shadow-sm';

interface Props {
  /** Stored conditions JSON (the editor merges edits into it). */
  value: unknown;
  onChange: (next: ConditionsJson | null) => void;
  disabled?: boolean | undefined;
}

function PercentField({
  id,
  label,
  help,
  value,
  onSet,
  disabled,
}: {
  id: string;
  label: string;
  help: string;
  value: number | undefined;
  onSet: (v: number | undefined) => void;
  disabled?: boolean | undefined;
}) {
  return (
    <div>
      <Label htmlFor={id} className='text-xs'>
        {label}
      </Label>
      <Input
        id={id}
        type='number'
        min={0}
        max={100}
        placeholder='any'
        value={value ?? ''}
        disabled={disabled}
        onChange={e => {
          const raw = e.target.value;
          if (raw === '') return onSet(undefined);
          const n = Math.round(Number(raw));
          if (Number.isFinite(n)) onSet(Math.min(100, Math.max(0, n)));
        }}
      />
      <p className='text-xs text-muted-foreground mt-1'>{help}</p>
    </div>
  );
}

/**
 * Structured editor for a rule's `conditions`: one control per known key.
 * Keys it does not model are listed (read-only) and kept on save.
 */
export function ConditionEditor({ value, onChange, disabled }: Props) {
  const form = conditionsToForm(value);
  const extras = extraConditionKeys(value);
  const stored = asConditionsObject(value);

  const set = (patch: Partial<ConditionForm>) =>
    onChange(applyConditionEdits(value, { ...form, ...patch }));

  const flag = (
    id: string,
    label: string,
    help: string,
    checked: boolean,
    key: keyof ConditionForm
  ) => (
    <div className='flex items-start gap-2'>
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={c => set({ [key]: c === true })}
      />
      <div>
        <Label htmlFor={id} className='text-sm'>
          {label}
        </Label>
        <p className='text-xs text-muted-foreground'>{help}</p>
      </div>
    </div>
  );

  return (
    <div className='space-y-4' data-testid='condition-editor'>
      <p className='text-xs text-muted-foreground'>
        Every condition that is set must hold for the rule to fire. Leave a
        field blank for no restriction.
      </p>

      <div className='grid grid-cols-2 gap-3'>
        <div>
          <Label htmlFor='cond-combat' className='text-xs'>
            Combat state
          </Label>
          <select
            id='cond-combat'
            className={selectClass}
            value={form.combat}
            disabled={disabled}
            onChange={e => set({ combat: e.target.value as CombatState })}
          >
            <option value='any'>Any</option>
            <option value='in'>Only while in combat</option>
            <option value='out'>Only while out of combat</option>
          </select>
        </div>
        <div>
          <Label htmlFor='cond-grouped' className='text-xs'>
            Enemies engaged (at least)
          </Label>
          <Input
            id='cond-grouped'
            type='number'
            min={RULE_LIMITS.groupedTargets.min}
            max={RULE_LIMITS.groupedTargets.max}
            placeholder='any'
            value={form.groupedTargets ?? ''}
            disabled={disabled}
            onChange={e => {
              const raw = e.target.value;
              if (raw === '') return set({ groupedTargets: undefined });
              const n = Math.round(Number(raw));
              if (Number.isFinite(n)) {
                set({
                  groupedTargets: Math.min(
                    RULE_LIMITS.groupedTargets.max,
                    Math.max(RULE_LIMITS.groupedTargets.min, n)
                  ),
                });
              }
            }}
          />
        </div>
        <PercentField
          id='cond-self-hp'
          label='Own HP below (%)'
          help='Heals, escapes, desperation moves.'
          value={form.selfHpBelow}
          disabled={disabled}
          onSet={v => set({ selfHpBelow: v })}
        />
        <PercentField
          id='cond-target-hp'
          label='Target HP below (%)'
          help='Finishers.'
          value={form.targetHpBelow}
          disabled={disabled}
          onSet={v => set({ targetHpBelow: v })}
        />
        <PercentField
          id='cond-ally-hp'
          label='Some ally HP below (%)'
          help='Group heals.'
          value={form.allyHpBelow}
          disabled={disabled}
          onSet={v => set({ allyHpBelow: v })}
        />
        <div />
        <div>
          <Label htmlFor='cond-lifeforce' className='text-xs'>
            Target life force
          </Label>
          <select
            id='cond-lifeforce'
            className={selectClass}
            value={form.targetLifeforce ?? ''}
            disabled={disabled}
            onChange={e =>
              set({ targetLifeforce: e.target.value || undefined })
            }
          >
            <option value=''>Any</option>
            {AI_LIFEFORCES.map(lf => (
              <option key={lf} value={lf}>
                {lf.charAt(0) + lf.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor='cond-align' className='text-xs'>
            Mob alignment
          </Label>
          <select
            id='cond-align'
            className={selectClass}
            value={form.align ?? ''}
            disabled={disabled}
            onChange={e => set({ align: e.target.value || undefined })}
          >
            <option value=''>Any</option>
            {AI_ALIGNS.map(a => (
              <option key={a} value={a}>
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        {flag(
          'cond-casting',
          'Target is casting',
          'Interrupts and counters.',
          form.targetCasting,
          'targetCasting'
        )}
        {flag(
          'cond-buff',
          'Target has a buff',
          'Dispels.',
          form.targetHasBuff,
          'targetHasBuff'
        )}
        {flag(
          'cond-debuff',
          'Mob has a debuff',
          'Cures.',
          form.selfHasDebuff,
          'selfHasDebuff'
        )}
        {flag(
          'cond-telegraph',
          'Telegraph',
          'Warn the room one round before it fires (breath, area attacks).',
          form.telegraph,
          'telegraph'
        )}
      </div>

      {extras.length > 0 && (
        <div className='rounded-md border border-dashed p-3'>
          <p className='text-xs font-medium mb-2'>
            Other condition keys (kept as they are)
          </p>
          <ul className='space-y-1'>
            {extras.map(k => (
              <li
                key={k}
                className='flex items-center justify-between gap-2 text-xs'
              >
                <code className='font-mono'>
                  {k}: {JSON.stringify(stored[k])}
                </code>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  disabled={disabled}
                  title={`Remove ${k}`}
                  onClick={() => onChange(removeConditionKey(value, k))}
                >
                  <X className='h-3 w-3' />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
