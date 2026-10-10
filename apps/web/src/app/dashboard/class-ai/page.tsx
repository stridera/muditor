'use client';

import { AiHelp } from '@/components/mob-ai/AiHelp';
import { RuleDialog } from '@/components/mob-ai/RuleDialog';
import { RuleTable, moveWithin } from '@/components/mob-ai/RuleTable';
import type { AiRuleRow, AiRuleValues } from '@/components/mob-ai/types';
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
import { Label } from '@/components/ui/label';
import {
  CreateClassAiRuleDocument,
  DeleteClassAiRuleDocument,
  GetClassAiRulesDocument,
  ReorderClassAiRulesDocument,
  UpdateClassAiRuleDocument,
  type GetClassAiRulesQuery,
  type MobAiTarget,
} from '@/generated/graphql';
import { normalizeAiTarget } from '@/lib/mob-ai-conditions';
import { useClasses } from '@/hooks/use-classes';
import { usePermissions } from '@/hooks/use-permissions';
import { useMutation, useQuery } from '@apollo/client/react';
import { CheckCircle, Loader2, Plus, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

type ClassRule = GetClassAiRulesQuery['classAiRules'][number];

function toRow(r: ClassRule): AiRuleRow {
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
    minLevel: r.minLevel ?? null,
    enabled: r.enabled,
  };
}

function ClassAiContent() {
  const { isHeadBuilder } = usePermissions();
  const searchParams = useSearchParams();
  const { classes, loading: classesLoading } = useClasses();

  const [picked, setPicked] = useState<string>(
    searchParams.get('classId') ?? ''
  );
  const classId = picked || classes[0]?.id || '';
  const selected = classes.find(c => c.id === classId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AiRuleRow | null>(null);
  const [deleting, setDeleting] = useState<AiRuleRow | null>(null);
  const [dialogError, setDialogError] = useState('');
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const { data, loading, error, refetch } = useQuery(GetClassAiRulesDocument, {
    variables: { classId: Number(classId) },
    skip: !classId,
    fetchPolicy: 'cache-and-network',
  });

  const rules = useMemo(
    () =>
      [...(data?.classAiRules ?? [])]
        .sort((a, b) => a.priority - b.priority || a.id - b.id)
        .map(toRow),
    [data]
  );

  const [createRule, { loading: creating }] = useMutation(
    CreateClassAiRuleDocument
  );
  const [updateRule, { loading: updating }] = useMutation(
    UpdateClassAiRuleDocument
  );
  const [deleteRule, { loading: deletingNow }] = useMutation(
    DeleteClassAiRuleDocument
  );
  const [reorderRules, { loading: reordering }] = useMutation(
    ReorderClassAiRulesDocument
  );
  const busy = creating || updating || deletingNow || reordering;

  const ok = (text: string) => setNotice({ ok: true, text });
  const fail = (e: unknown) =>
    setNotice({
      ok: false,
      text: e instanceof Error ? e.message : 'Request failed',
    });

  const openAdd = () => {
    setEditing(null);
    setDialogError('');
    setDialogOpen(true);
  };
  const openEdit = (rule: AiRuleRow) => {
    setEditing(rule);
    setDialogError('');
    setDialogOpen(true);
  };

  const submit = async (v: AiRuleValues) => {
    setDialogError('');
    const common = {
      abilityId: v.abilityId,
      chancePct: v.chancePct,
      cooldownS: v.cooldownS,
      conditions: v.conditions,
      target: v.target as MobAiTarget,
      minLevel: v.minLevel,
      enabled: v.enabled,
    };
    try {
      if (editing) {
        await updateRule({ variables: { id: editing.id, data: common } });
      } else {
        await createRule({
          variables: { data: { classId: Number(classId), ...common } },
        });
      }
      setDialogOpen(false);
      ok(editing ? 'Rule saved' : 'Rule added');
      await refetch();
    } catch (e) {
      setDialogError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const toggle = async (rule: AiRuleRow, enabled: boolean) => {
    try {
      await updateRule({ variables: { id: rule.id, data: { enabled } } });
      await refetch();
    } catch (e) {
      fail(e);
    }
  };

  const move = async (rule: AiRuleRow, direction: -1 | 1) => {
    const ids = moveWithin(rules, rule, direction);
    if (!ids) return;
    try {
      await reorderRules({
        variables: { classId: Number(classId), ruleIds: ids },
      });
      await refetch();
    } catch (e) {
      fail(e);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteRule({ variables: { id: deleting.id } });
      ok('Rule deleted');
      await refetch();
    } catch (e) {
      fail(e);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-foreground mb-2'>Class AI</h1>
        <p className='text-muted-foreground'>
          Spell and skill rules shared by every mob of a class (mobs set to AI
          mode &quot;Class&quot;). Mobs can instead carry their own rules from
          the AI tab of the mob editor.
        </p>
      </div>

      <AiHelp />

      {notice && (
        <Alert
          className={`mb-4 ${
            notice.ok
              ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800'
              : 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'
          }`}
        >
          {notice.ok ? (
            <CheckCircle className='h-4 w-4 text-green-600' />
          ) : (
            <XCircle className='h-4 w-4 text-red-600' />
          )}
          <AlertDescription>{notice.text}</AlertDescription>
        </Alert>
      )}

      <div className='flex items-end justify-between gap-4 mb-4'>
        <div className='w-64'>
          <Label htmlFor='class-ai-class'>Class</Label>
          <select
            id='class-ai-class'
            className='block w-full rounded-md border border-input bg-background px-2 py-2 text-sm shadow-sm'
            value={classId}
            disabled={classesLoading}
            onChange={e => {
              setPicked(e.target.value);
              setNotice(null);
            }}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.plainName}
              </option>
            ))}
          </select>
        </div>
        {isHeadBuilder && classId && (
          <Button onClick={openAdd}>
            <Plus className='h-4 w-4 mr-2' />
            Add rule
          </Button>
        )}
      </div>

      {error ? (
        <Alert className='bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'>
          <XCircle className='h-4 w-4 text-red-600' />
          <AlertDescription>
            Error loading rules: {error.message}
          </AlertDescription>
        </Alert>
      ) : loading && !data ? (
        <div className='flex justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      ) : (
        <RuleTable
          rules={rules}
          kind='class'
          canEdit={isHeadBuilder}
          busy={busy}
          onEdit={openEdit}
          onDelete={setDeleting}
          onToggle={toggle}
          onMove={move}
        />
      )}

      <RuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editing}
        kind='class'
        saving={creating || updating}
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
              {deleting?.abilityName} will no longer be used by{' '}
              {selected?.plainName ?? 'this class'} mobs after the next game
              restart.
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

export default function ClassAiPage() {
  return (
    <Suspense fallback={null}>
      <ClassAiContent />
    </Suspense>
  );
}
