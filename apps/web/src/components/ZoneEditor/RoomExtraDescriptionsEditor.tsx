'use client';

import {
  describeResetError,
  loadRoomExtraDescriptions,
  saveRoomExtraDescriptions,
  type ExtraDescription,
} from '@/lib/reset-api';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard';
import { useEffect, useState } from 'react';

interface Row {
  keywords: string;
  description: string;
}

const toRow = (e: ExtraDescription): Row => ({
  keywords: e.keywords.join(', '),
  description: e.description,
});

const parseKeywords = (text: string): string[] =>
  text
    .split(/[,\s]+/)
    .map(k => k.trim())
    .filter(Boolean);

interface Props {
  zoneId: number;
  roomId: number;
  canEdit: boolean;
}

/**
 * Extra descriptions of a room: the text shown for "look <keyword>". Saved
 * as a whole list with its own Save button (a separate mutation from the room
 * fields).
 */
export function RoomExtraDescriptionsEditor({
  zoneId,
  roomId,
  canEdit,
}: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  useUnsavedChangesGuard(dirty, 'Discard your unsaved extra descriptions?');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSaved(false);
    setDirty(false);
    loadRoomExtraDescriptions(zoneId, roomId)
      .then(list => {
        if (!cancelled) setRows(list.map(toRow));
      })
      .catch(e => {
        if (!cancelled) setError(describeResetError(e, zoneId));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [zoneId, roomId]);

  const edit = (index: number, patch: Partial<Row>) => {
    setRows(rs => rs.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    setDirty(true);
    setSaved(false);
  };

  const save = async () => {
    setError(null);
    const payload = rows.map(r => ({
      keywords: parseKeywords(r.keywords),
      description: r.description,
    }));
    const bad = payload.findIndex(
      p => p.keywords.length === 0 || !p.description.trim()
    );
    if (bad >= 0) {
      setError(
        `Extra description ${bad + 1} needs at least one keyword and some text.`
      );
      return;
    }
    setSaving(true);
    try {
      const result = await saveRoomExtraDescriptions(zoneId, roomId, payload);
      setRows(result.map(toRow));
      setDirty(false);
      setSaved(true);
    } catch (e) {
      setError(describeResetError(e, zoneId));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='p-3 rounded-lg border border-border bg-muted/50 space-y-2'>
      <div className='flex items-center justify-between'>
        <h5 className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          Extra Descriptions
        </h5>
        {canEdit ? (
          <button
            type='button'
            className='text-xs text-primary'
            onClick={() => {
              setRows(rs => [...rs, { keywords: '', description: '' }]);
              setDirty(true);
            }}
          >
            Add extra description
          </button>
        ) : null}
      </div>
      <p className='text-xs text-muted-foreground'>
        Text a player sees with <code>look &lt;keyword&gt;</code>.
      </p>
      {loading ? (
        <p className='text-xs text-muted-foreground'>Loading...</p>
      ) : null}
      {!loading && rows.length === 0 ? (
        <p className='text-xs text-muted-foreground'>None</p>
      ) : null}
      {rows.map((row, i) => (
        <div key={i} className='space-y-1 border-t border-border pt-2'>
          <input
            type='text'
            aria-label={`Extra description ${i + 1} keywords`}
            placeholder='keywords, e.g. mural painting'
            value={row.keywords}
            disabled={!canEdit}
            onChange={e => edit(i, { keywords: e.target.value })}
            className='w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground'
          />
          <textarea
            aria-label={`Extra description ${i + 1} text`}
            rows={3}
            value={row.description}
            disabled={!canEdit}
            onChange={e => edit(i, { description: e.target.value })}
            className='w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground'
          />
          {canEdit ? (
            <button
              type='button'
              aria-label={`Remove extra description ${i + 1}`}
              className='text-xs text-destructive'
              onClick={() => {
                setRows(rs => rs.filter((_, n) => n !== i));
                setDirty(true);
                setSaved(false);
              }}
            >
              Remove
            </button>
          ) : null}
        </div>
      ))}
      {error ? (
        <p role='alert' className='text-xs text-destructive'>
          {error}
        </p>
      ) : null}
      {canEdit ? (
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={save}
            disabled={saving || !dirty}
            className='px-3 py-1 text-xs bg-primary text-primary-foreground rounded disabled:opacity-50'
          >
            {saving ? 'Saving...' : 'Save extra descriptions'}
          </button>
          {saved ? (
            <span role='status' className='text-xs text-muted-foreground'>
              Saved
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
