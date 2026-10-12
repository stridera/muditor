'use client';

import {
  listZoneMobs,
  listZoneObjects,
  searchMobs,
  searchObjects,
  type PickableEntity,
} from '@/lib/reset-api';
import { useEffect, useMemo, useState } from 'react';

const INPUT_CLASS =
  'block w-full rounded-md border border-input shadow-sm sm:text-sm bg-background text-foreground px-2 py-1';

interface EntityPickerProps {
  kind: 'mob' | 'object';
  /** The zone listed first (usually the room's zone) */
  zoneId: number;
  onPick: (entity: PickableEntity) => void;
  onCancel: () => void;
  /** Only offer these object types (e.g. containers for nesting). */
  objectTypes?: readonly string[];
  /** Short word for the heading: "Place mob", "Add item" ... */
  title?: string;
}

const MIN_SEARCH = 2;

/**
 * Chooser for a mob or object: every entity of one zone (this zone by
 * default) or a search across all zones the builder can read.
 */
export function EntityPicker({
  kind,
  zoneId,
  onPick,
  onCancel,
  objectTypes,
  title,
}: EntityPickerProps) {
  const [scope, setScope] = useState<'zone' | 'all'>('zone');
  const [text, setText] = useState('');
  const [zoneList, setZoneList] = useState<PickableEntity[]>([]);
  const [found, setFound] = useState<PickableEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const noun = kind === 'mob' ? 'mob' : 'object';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (kind === 'mob' ? listZoneMobs(zoneId) : listZoneObjects(zoneId))
      .then(list => {
        if (!cancelled) setZoneList(list);
      })
      .catch(e => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind, zoneId]);

  useEffect(() => {
    if (scope !== 'all' || text.trim().length < MIN_SEARCH) {
      setFound([]);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(() => {
      setLoading(true);
      setError(null);
      (kind === 'mob' ? searchMobs(text.trim()) : searchObjects(text.trim()))
        .then(list => {
          if (!cancelled) setFound(list);
        })
        .catch(e => {
          if (!cancelled) setError(e instanceof Error ? e.message : String(e));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [kind, scope, text]);

  const shown = useMemo(() => {
    const q = text.trim().toLowerCase();
    const base =
      scope === 'zone'
        ? zoneList.filter(
            e =>
              !q ||
              e.name.toLowerCase().includes(q) ||
              `${e.zoneId}:${e.id}` === q ||
              String(e.id) === q
          )
        : found;
    return objectTypes
      ? base.filter(e => e.type && objectTypes.includes(e.type))
      : base;
  }, [scope, text, zoneList, found, objectTypes]);

  return (
    <div
      className='rounded-md border border-border bg-card p-3 space-y-2'
      role='dialog'
      aria-label={title ?? `Choose a ${noun}`}
    >
      <div className='flex items-center justify-between'>
        <h5 className='text-sm font-medium text-foreground'>
          {title ?? `Choose a ${noun}`}
        </h5>
        <button
          type='button'
          onClick={onCancel}
          className='text-xs text-muted-foreground hover:text-foreground'
        >
          Cancel
        </button>
      </div>
      <div className='flex gap-2'>
        <select
          aria-label='Where to look'
          value={scope}
          onChange={e => setScope(e.target.value as 'zone' | 'all')}
          className={INPUT_CLASS}
        >
          <option value='zone'>Zone {zoneId}</option>
          <option value='all'>All zones (search)</option>
        </select>
        <input
          type='text'
          aria-label={`Search ${noun}s`}
          placeholder={
            scope === 'all'
              ? `Search ${noun}s by name or keyword (${MIN_SEARCH}+ letters)`
              : `Filter ${noun}s by name or id`
          }
          value={text}
          onChange={e => setText(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>
      {error ? (
        <p role='alert' className='text-xs text-destructive'>
          {error}
        </p>
      ) : null}
      <ul className='max-h-48 overflow-y-auto divide-y divide-border'>
        {shown.map(e => (
          <li key={`${e.zoneId}:${e.id}`}>
            <button
              type='button'
              onClick={() => onPick(e)}
              className='w-full text-left px-2 py-1 text-sm hover:bg-accent text-foreground'
            >
              {e.name}{' '}
              <span className='text-xs text-muted-foreground'>
                {e.zoneId}:{e.id}
                {e.type ? ` ${e.type}` : ''}
                {e.level != null ? ` L${e.level}` : ''}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {!loading && shown.length === 0 ? (
        <p className='text-xs text-muted-foreground'>
          {scope === 'all' && text.trim().length < MIN_SEARCH
            ? `Type at least ${MIN_SEARCH} letters to search every zone.`
            : `No ${noun}s found.`}
        </p>
      ) : null}
      {loading ? (
        <p className='text-xs text-muted-foreground'>Loading...</p>
      ) : null}
    </div>
  );
}
