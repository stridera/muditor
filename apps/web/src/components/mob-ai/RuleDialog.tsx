'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AI_TARGET_OPTIONS,
  normalizeAiTarget,
  RULE_LIMITS,
  type ConditionsJson,
} from '@/lib/mob-ai-conditions';
import { useEffect, useState } from 'react';
import { AbilityPicker, type PickedAbility } from './AbilityPicker';
import { ConditionEditor } from './ConditionEditor';
import type { AiRuleRow, AiRuleValues } from './types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = adding a new rule. */
  rule: AiRuleRow | null;
  /** Class rules have a level gate; per-mob rules do not. */
  kind: 'class' | 'mob';
  /** Per-mob rules are keyed by ability, so it cannot change when editing. */
  lockAbilityOnEdit?: boolean;
  saving?: boolean;
  /** Error returned by the API for the last submit. */
  error?: string;
  onSubmit: (values: AiRuleValues) => void;
}

function intIn(
  raw: string,
  label: string,
  range: { min: number; max: number }
): number | string {
  const n = Number(raw);
  if (
    raw.trim() === '' ||
    !Number.isInteger(n) ||
    n < range.min ||
    n > range.max
  ) {
    return `${label} must be a whole number from ${range.min} to ${range.max}`;
  }
  return n;
}

export function RuleDialog({
  open,
  onOpenChange,
  rule,
  kind,
  lockAbilityOnEdit,
  saving,
  error,
  onSubmit,
}: Props) {
  const [ability, setAbility] = useState<PickedAbility | null>(null);
  const [chance, setChance] = useState('100');
  const [cooldown, setCooldown] = useState('0');
  const [target, setTarget] = useState('AUTO');
  const [minLevel, setMinLevel] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [conditions, setConditions] = useState<ConditionsJson | null>(null);
  const [problem, setProblem] = useState('');

  useEffect(() => {
    if (!open) return;
    setAbility(
      rule
        ? {
            id: rule.abilityId,
            name: rule.abilityName,
            abilityType: rule.abilityType,
          }
        : null
    );
    setChance(String(rule?.chancePct ?? 100));
    setCooldown(String(rule?.cooldownS ?? 0));
    setTarget(normalizeAiTarget(rule?.target));
    setMinLevel(rule?.minLevel != null ? String(rule.minLevel) : '');
    setEnabled(rule?.enabled ?? true);
    // Edits merge into the stored object, so start from it untouched.
    setConditions(
      rule?.conditions && typeof rule.conditions === 'object'
        ? (rule.conditions as ConditionsJson)
        : null
    );
    setProblem('');
  }, [open, rule]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ability) return setProblem('Pick an ability');
    const c = intIn(chance, 'Chance', RULE_LIMITS.chancePct);
    if (typeof c === 'string') return setProblem(c);
    const cd = intIn(cooldown, 'Cooldown', RULE_LIMITS.cooldownS);
    if (typeof cd === 'string') return setProblem(cd);
    let level: number | null = null;
    if (kind === 'class' && minLevel.trim() !== '') {
      const l = intIn(minLevel, 'Minimum level', RULE_LIMITS.minLevel);
      if (typeof l === 'string') return setProblem(l);
      level = l;
    }
    setProblem('');
    onSubmit({
      abilityId: ability.id,
      chancePct: c,
      cooldownS: cd,
      conditions,
      target,
      minLevel: level,
      enabled,
    });
  };

  const abilityLocked = !!rule && !!lockAbilityOnEdit;
  const shownError = problem || error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <form onSubmit={submit} className='space-y-5'>
          <DialogHeader>
            <DialogTitle>{rule ? 'Edit AI rule' : 'Add AI rule'}</DialogTitle>
            <DialogDescription>
              Rules are tried from the lowest priority number down; the first
              one whose conditions hold and whose roll succeeds fires.
            </DialogDescription>
          </DialogHeader>

          {shownError && (
            <Alert className='bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'>
              <AlertDescription className='text-red-800 dark:text-red-300'>
                {shownError}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label className='mb-1 block'>Ability</Label>
            <AbilityPicker
              value={ability}
              onChange={setAbility}
              disabled={abilityLocked}
            />
          </div>

          <div className='grid grid-cols-3 gap-3'>
            <div>
              <Label htmlFor='rule-chance'>Chance (%)</Label>
              <Input
                id='rule-chance'
                type='number'
                min={RULE_LIMITS.chancePct.min}
                max={RULE_LIMITS.chancePct.max}
                value={chance}
                onChange={e => setChance(e.target.value)}
              />
              <p className='text-xs text-muted-foreground mt-1'>
                Roll each time the rule is considered.
              </p>
            </div>
            <div>
              <Label htmlFor='rule-cooldown'>Cooldown (seconds)</Label>
              <Input
                id='rule-cooldown'
                type='number'
                min={RULE_LIMITS.cooldownS.min}
                max={RULE_LIMITS.cooldownS.max}
                value={cooldown}
                onChange={e => setCooldown(e.target.value)}
              />
              <p className='text-xs text-muted-foreground mt-1'>
                Minimum gap between uses by one mob.
              </p>
            </div>
            {kind === 'class' ? (
              <div>
                <Label htmlFor='rule-minlevel'>Minimum mob level</Label>
                <Input
                  id='rule-minlevel'
                  type='number'
                  min={RULE_LIMITS.minLevel.min}
                  max={RULE_LIMITS.minLevel.max}
                  placeholder='any'
                  value={minLevel}
                  onChange={e => setMinLevel(e.target.value)}
                />
              </div>
            ) : (
              <div />
            )}
          </div>

          <div>
            <Label htmlFor='rule-target'>Target</Label>
            <select
              id='rule-target'
              className='block w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm shadow-sm'
              value={target}
              onChange={e => setTarget(e.target.value)}
            >
              {AI_TARGET_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className='flex items-center gap-2'>
            <Checkbox
              id='rule-enabled'
              checked={enabled}
              onCheckedChange={c => setEnabled(c === true)}
            />
            <Label htmlFor='rule-enabled'>Enabled</Label>
          </div>

          <div>
            <Label className='mb-2 block'>Conditions</Label>
            <ConditionEditor value={conditions} onChange={setConditions} />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={saving}>
              {saving ? 'Saving...' : rule ? 'Save rule' : 'Add rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
