'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { summarizeConditions } from '@/lib/mob-ai-conditions';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import type { AiRuleRow } from './types';

interface Props {
  /** Already sorted by priority. */
  rules: AiRuleRow[];
  kind: 'class' | 'mob';
  canEdit: boolean;
  busy?: boolean;
  onEdit: (rule: AiRuleRow) => void;
  onDelete: (rule: AiRuleRow) => void;
  onToggle: (rule: AiRuleRow, enabled: boolean) => void;
  /** Move the rule one place up (-1) or down (+1). */
  onMove: (rule: AiRuleRow, direction: -1 | 1) => void;
}

function targetLabel(target: string | null): string {
  return (target ?? 'AUTO').toLowerCase().replace(/_/g, ' ');
}

export function RuleTable({
  rules,
  kind,
  canEdit,
  busy,
  onEdit,
  onDelete,
  onToggle,
  onMove,
}: Props) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-12'>On</TableHead>
            <TableHead className='w-14'>Prio</TableHead>
            <TableHead>Ability</TableHead>
            <TableHead>When</TableHead>
            <TableHead>Target</TableHead>
            <TableHead className='text-right'>Chance</TableHead>
            <TableHead className='text-right'>Cooldown</TableHead>
            {kind === 'class' && (
              <TableHead className='text-right'>Min lvl</TableHead>
            )}
            {canEdit && <TableHead className='text-right'>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className='text-center text-muted-foreground py-8'
              >
                No rules yet.
              </TableCell>
            </TableRow>
          ) : (
            rules.map((rule, i) => (
              <TableRow
                key={rule.id}
                className={rule.enabled ? '' : 'opacity-50'}
              >
                <TableCell>
                  <Checkbox
                    checked={rule.enabled}
                    disabled={!canEdit || busy}
                    aria-label={`${rule.enabled ? 'Disable' : 'Enable'} ${rule.abilityName}`}
                    onCheckedChange={c => onToggle(rule, c === true)}
                  />
                </TableCell>
                <TableCell className='font-mono text-xs'>
                  {rule.priority}
                </TableCell>
                <TableCell>
                  <span className='font-medium'>{rule.abilityName}</span>{' '}
                  <Badge variant='outline' className='text-[10px]'>
                    {rule.abilityType.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className='text-xs text-muted-foreground max-w-xs'>
                  {summarizeConditions(rule.conditions)}
                </TableCell>
                <TableCell className='text-xs'>
                  {targetLabel(rule.target)}
                </TableCell>
                <TableCell className='text-right'>{rule.chancePct}%</TableCell>
                <TableCell className='text-right'>{rule.cooldownS}s</TableCell>
                {kind === 'class' && (
                  <TableCell className='text-right'>
                    {rule.minLevel ?? '-'}
                  </TableCell>
                )}
                {canEdit && (
                  <TableCell className='text-right whitespace-nowrap'>
                    <Button
                      variant='ghost'
                      size='sm'
                      disabled={busy || i === 0}
                      title='Move up (runs earlier)'
                      onClick={() => onMove(rule, -1)}
                    >
                      <ArrowUp className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      disabled={busy || i === rules.length - 1}
                      title='Move down (runs later)'
                      onClick={() => onMove(rule, 1)}
                    >
                      <ArrowDown className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      disabled={busy}
                      title='Edit'
                      onClick={() => onEdit(rule)}
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      disabled={busy}
                      title='Delete'
                      onClick={() => onDelete(rule)}
                    >
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/** Ids in their new order after moving `rule` one place; null if it can't move. */
export function moveWithin<T extends { id: number }>(
  rules: T[],
  rule: T,
  direction: -1 | 1
): number[] | null {
  const i = rules.findIndex(r => r.id === rule.id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= rules.length) return null;
  const ids = rules.map(r => r.id);
  [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  return ids;
}
