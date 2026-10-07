'use client';

import { HelpButton } from '@/components/help/HelpButton';
import { QUESTS_HELP_ANCHORS as HELP } from '@/components/help/help-topics';
import { ColoredTextInline } from '@/components/ColoredTextViewer';
import {
  CreateQuestPrerequisiteDocument,
  DeleteQuestPrerequisiteDocument,
  GetQuestOptionsDocument,
} from '@/generated/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export interface PrerequisiteRow {
  id: number;
  prerequisiteQuestZoneId: number;
  prerequisiteQuestId: number;
  requireCompletion: boolean;
}

interface PrerequisitesEditorProps {
  questZoneId: number;
  questId: number;
  prerequisites: PrerequisiteRow[];
  onChange: (prerequisites: PrerequisiteRow[]) => void;
}

/**
 * Prior quests the player must have completed before accepting this one.
 * Level range lives on Basic Info and class/race on the availability
 * expression below; this list covers quest chains. Changes are saved at once.
 */
export function PrerequisitesEditor({
  questZoneId,
  questId,
  prerequisites,
  onChange,
}: PrerequisitesEditorProps) {
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');

  const { data } = useQuery(GetQuestOptionsDocument);
  const [createPrerequisite, { loading: adding }] = useMutation(
    CreateQuestPrerequisiteDocument
  );
  const [deletePrerequisite] = useMutation(DeleteQuestPrerequisiteDocument);

  const quests = data?.quests ?? [];
  const nameOf = (zoneId: number, id: number) =>
    quests.find(q => q.zoneId === zoneId && q.id === id)?.name;

  const taken = new Set(
    prerequisites.map(
      p => `${p.prerequisiteQuestZoneId}:${p.prerequisiteQuestId}`
    )
  );
  const needle = filter.trim().toLowerCase();
  const candidates = quests.filter(q => {
    if (q.zoneId === questZoneId && q.id === questId) return false;
    if (taken.has(`${q.zoneId}:${q.id}`)) return false;
    if (!needle) return true;
    return (
      q.name.toLowerCase().includes(needle) ||
      `${q.zoneId}:${q.id}`.includes(needle)
    );
  });

  const handleAdd = async () => {
    const [zone, id] = selected.split(':').map(n => parseInt(n, 10));
    if (zone === undefined || id === undefined || isNaN(zone) || isNaN(id)) {
      return;
    }
    setError('');
    try {
      const result = await createPrerequisite({
        variables: {
          data: {
            questZoneId,
            questId,
            prerequisiteQuestZoneId: zone,
            prerequisiteQuestId: id,
          },
        },
      });
      const created = result.data?.createQuestPrerequisite;
      if (created) {
        onChange([
          ...prerequisites,
          {
            id: created.id,
            prerequisiteQuestZoneId: created.prerequisiteQuestZoneId,
            prerequisiteQuestId: created.prerequisiteQuestId,
            requireCompletion: created.requireCompletion,
          },
        ]);
        setSelected('');
        setFilter('');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add prerequisite.'
      );
    }
  };

  const handleRemove = async (row: PrerequisiteRow) => {
    setError('');
    try {
      await deletePrerequisite({ variables: { id: row.id } });
      onChange(prerequisites.filter(p => p.id !== row.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to remove prerequisite.'
      );
    }
  };

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold flex items-center gap-2'>
        Prerequisite Quests
        <HelpButton
          topic='quests'
          anchor={HELP.requirements}
          variant='icon'
          tip='The player must have completed every listed quest before qaccept works'
        />
      </h2>
      <p className='text-muted-foreground text-sm'>
        The player must have <strong>completed</strong> every quest listed here
        before they can accept this one. Level range is set on Basic Info; class
        and race limits go in the availability expression below.
      </p>

      {error && (
        <div
          role='alert'
          className='bg-destructive/10 border border-destructive text-destructive px-3 py-2 rounded text-sm'
        >
          {error}
        </div>
      )}

      <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
        {prerequisites.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No prerequisites. Anyone who passes the other checks can accept this
            quest.
          </p>
        ) : (
          <ul className='space-y-2' aria-label='Prerequisites'>
            {prerequisites.map(row => {
              const name = nameOf(
                row.prerequisiteQuestZoneId,
                row.prerequisiteQuestId
              );
              return (
                <li
                  key={row.id}
                  className='flex items-center justify-between bg-background rounded border border-border px-3 py-2 text-sm'
                >
                  <span>
                    <span className='font-mono text-xs text-muted-foreground'>
                      [{row.prerequisiteQuestZoneId}:{row.prerequisiteQuestId}]
                    </span>{' '}
                    {name ? (
                      <ColoredTextInline markup={name} />
                    ) : (
                      'Unknown quest'
                    )}
                    {!row.requireCompletion && (
                      <span className='ml-2 text-xs text-amber-600 dark:text-amber-400'>
                        not enforced (completion not required)
                      </span>
                    )}
                  </span>
                  <button
                    type='button'
                    aria-label={`Remove prerequisite ${row.prerequisiteQuestZoneId}:${row.prerequisiteQuestId}`}
                    onClick={() => handleRemove(row)}
                    className='p-1 text-destructive hover:bg-destructive/10 rounded'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className='flex gap-2 items-end pt-2 border-t border-border'>
          <div className='flex-1'>
            <label className='block text-xs font-medium text-muted-foreground mb-1'>
              Add prerequisite
              <input
                aria-label='Filter quests'
                type='text'
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder='Filter by name or zone:id'
                className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm mt-1'
              />
            </label>
            <select
              aria-label='Prerequisite quest'
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className='block w-full rounded-md border border-input bg-background shadow-sm sm:text-sm mt-2'
            >
              <option value=''>Select a quest...</option>
              {candidates.slice(0, 200).map(q => (
                <option
                  key={`${q.zoneId}:${q.id}`}
                  value={`${q.zoneId}:${q.id}`}
                >
                  [{q.zoneId}:{q.id}] {q.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type='button'
            onClick={handleAdd}
            disabled={!selected || adding}
            className='inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
          >
            <Plus className='w-4 h-4 mr-1' />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
