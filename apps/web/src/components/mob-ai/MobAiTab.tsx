'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DeleteMobAiRuleDocument,
  GetMobAiRulesDocument,
  ReorderMobAiRulesDocument,
  SaveMobAiRuleDocument,
  type GetMobAiRulesQuery,
  type MobAiTarget,
} from '@/generated/graphql';
import { normalizeAiTarget } from '@/lib/mob-ai-conditions';
import { useMutation, useQuery } from '@apollo/client/react';
import { Plus, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AiHelp } from './AiHelp';
import { RuleDialog } from './RuleDialog';
import { RuleTable, moveWithin } from './RuleTable';
import type { AiRuleRow, AiRuleValues } from './types';

type MobRule = GetMobAiRulesQuery['mobAiRules'][number];

function toRow(r: MobRule): AiRuleRow {
  return {
    id: r.id,
    abilityId: r.abilityId,
    abilityName: r.ability.name,
    abilityType: r.ability.abilityType,
    priority: r.priority,
    chancePct: r.chancePct,
    cooldownS: r.cooldownS,
    conditions: r.conditions,
    target: normalizeAiTarget(r.target),
    enabled: r.enabled,
  };
}

const MODES = [
  {
    value: 'CLASS',
    label: 'Class',
    help: "Uses the shared rules of the mob's class (set on the Class AI page).",
  },
  {
    value: 'CUSTOM',
    label: 'Custom',
    help: "Uses only this mob's own rules, listed below.",
  },
  {
    value: 'NONE',
    label: 'None',
    help: 'No spell or skill AI at all.',
  },
] as const;

interface Props {
  zoneId: number;
  mobId: number;
  /** Current (unsaved) aiMode from the mob form. */
  aiMode: string;
  onAiModeChange: (mode: string) => void;
  /** Mob's class, to link to its shared rules. */
  classId?: number | null;
  canEdit: boolean;
}

/**
 * AI tab of the mob editor. The mode is part of the mob form (saved with the
 * mob); the rule list saves immediately, like the default-effects tab.
 */
export function MobAiTab({
  zoneId,
  mobId,
  aiMode,
  onAiModeChange,
  classId,
  canEdit,
}: Props) {
  const custom = aiMode === 'CUSTOM';
  const { data, error, refetch } = useQuery(GetMobAiRulesDocument, {
    variables: { zoneId, mobId },
    fetchPolicy: 'cache-and-network',
  });
  const rules = useMemo(
    () =>
      [...(data?.mobAiRules ?? [])]
        .sort((a, b) => a.priority - b.priority || a.id - b.id)
        .map(toRow),
    [data]
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AiRuleRow | null>(null);
  const [deleting, setDeleting] = useState<AiRuleRow | null>(null);
  const [dialogError, setDialogError] = useState('');
  const [actionError, setActionError] = useState('');

  const [saveRule, { loading: saving }] = useMutation(SaveMobAiRuleDocument);
  const [deleteRule, { loading: deletingNow }] = useMutation(
    DeleteMobAiRuleDocument
  );
  const [reorderRules, { loading: reordering }] = useMutation(
    ReorderMobAiRulesDocument
  );
  const busy = saving || deletingNow || reordering;
  const reason = (e: unknown) =>
    e instanceof Error ? e.message : 'Request failed';

  const submit = async (v: AiRuleValues) => {
    setDialogError('');
    if (!editing && rules.some(r => r.abilityId === v.abilityId)) {
      setDialogError(
        'This mob already has a rule for that ability. Edit the existing rule instead.'
      );
      return;
    }
    try {
      await saveRule({
        variables: {
          zoneId,
          mobId,
          data: {
            abilityId: v.abilityId,
            chancePct: v.chancePct,
            cooldownS: v.cooldownS,
            conditions: v.conditions,
            target: v.target as MobAiTarget,
            enabled: v.enabled,
          },
        },
      });
      setDialogOpen(false);
      setActionError('');
      await refetch();
    } catch (e) {
      setDialogError(reason(e));
    }
  };

  const toggle = async (rule: AiRuleRow, enabled: boolean) => {
    try {
      await saveRule({
        variables: {
          zoneId,
          mobId,
          data: { abilityId: rule.abilityId, enabled },
        },
      });
      setActionError('');
      await refetch();
    } catch (e) {
      setActionError(reason(e));
    }
  };

  const move = async (rule: AiRuleRow, direction: -1 | 1) => {
    const ids = moveWithin(rules, rule, direction);
    if (!ids) return;
    const byId = new Map(rules.map(r => [r.id, r.abilityId]));
    try {
      await reorderRules({
        variables: {
          zoneId,
          mobId,
          abilityIds: ids.map(id => byId.get(id)!),
        },
      });
      setActionError('');
      await refetch();
    } catch (e) {
      setActionError(reason(e));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteRule({
        variables: { zoneId, mobId, abilityId: deleting.abilityId },
      });
      setActionError('');
      await refetch();
    } catch (e) {
      setActionError(reason(e));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='bg-card shadow rounded-lg p-6'>
        <h3 className='text-lg font-medium text-card-foreground mb-4'>
          Spell &amp; Skill AI
        </h3>
        <AiHelp />
        <label
          htmlFor='aiMode'
          className='block text-sm font-medium text-muted-foreground mb-1'
        >
          AI mode
        </label>
        <select
          id='aiMode'
          value={aiMode}
          disabled={!canEdit}
          onChange={e => onAiModeChange(e.target.value)}
          className='block w-64 rounded-md border border-input bg-background shadow-sm focus:ring-ring focus:border-ring sm:text-sm'
        >
          {MODES.map(m => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <p className='text-sm text-muted-foreground mt-2'>
          {MODES.find(m => m.value === aiMode)?.help} The mode is saved with
          &quot;Save Changes&quot;.
        </p>
        {aiMode === 'CLASS' && (
          <p className='text-sm mt-2'>
            <Link
              className='underline'
              href={
                classId
                  ? `/dashboard/class-ai?classId=${classId}`
                  : '/dashboard/class-ai'
              }
            >
              {classId ? "Edit this mob's class rules" : 'Edit class rules'}
            </Link>
            {!classId && (
              <span className='text-muted-foreground'>
                {' '}
                (this mob has no class, so class rules do not apply)
              </span>
            )}
          </p>
        )}
      </div>

      {custom && (
        <div className='bg-card shadow rounded-lg p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-medium text-card-foreground'>
              This mob&apos;s rules
            </h3>
            {canEdit && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setDialogError('');
                  setDialogOpen(true);
                }}
              >
                <Plus className='h-4 w-4 mr-2' />
                Add rule
              </Button>
            )}
          </div>
          {(error || actionError) && (
            <Alert className='mb-4 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'>
              <XCircle className='h-4 w-4 text-red-600' />
              <AlertDescription>
                {actionError || `Error loading rules: ${error?.message}`}
              </AlertDescription>
            </Alert>
          )}
          <p className='text-xs text-muted-foreground mb-3'>
            Rule changes are saved immediately. One rule per ability; to change
            an ability, delete the rule and add another.
          </p>
          <RuleTable
            rules={rules}
            kind='mob'
            canEdit={canEdit}
            busy={busy}
            onEdit={r => {
              setEditing(r);
              setDialogError('');
              setDialogOpen(true);
            }}
            onDelete={setDeleting}
            onToggle={toggle}
            onMove={move}
          />
        </div>
      )}

      {!custom && rules.length > 0 && (
        <p className='text-sm text-muted-foreground'>
          This mob has {rules.length} stored custom rule
          {rules.length === 1 ? '' : 's'}; they are ignored while the mode is
          not Custom.
        </p>
      )}

      <RuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editing}
        kind='mob'
        lockAbilityOnEdit
        saving={saving}
        error={dialogError}
        onSubmit={submit}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={o => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this rule?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.abilityName} will be removed from this mob&apos;s
              rules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
