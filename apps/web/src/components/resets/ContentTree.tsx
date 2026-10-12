'use client';

import {
  nestContents,
  type ContentInput,
  type ContentPatch,
  type PickableEntity,
  type ResetContent,
} from '@/lib/reset-api';
import { useEffect, useState } from 'react';
import { EntityPicker } from './EntityPicker';

const SMALL_INPUT =
  'w-14 rounded border border-input bg-background text-foreground px-1 py-0.5 text-xs';

export const CONTAINER_TYPE = 'CONTAINER';

/** Whole-number cell that writes on blur, only when the value really changed. */
function CountInput({
  label,
  value,
  disabled,
  onCommit,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onCommit: (n: number) => void;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  return (
    <input
      type='number'
      min={1}
      aria-label={label}
      className={SMALL_INPUT}
      value={text}
      disabled={disabled}
      onChange={e => setText(e.target.value)}
      onBlur={() => {
        const n = Number(text);
        if (Number.isInteger(n) && n >= 1 && n !== value) onCommit(n);
        else setText(String(value));
      }}
    />
  );
}

interface ContentTreeProps {
  contents: ResetContent[];
  /** Type of the container the contents sit in (only CONTAINER can hold items) */
  containerType: string;
  containerName: string;
  /** Zone listed first in the item picker */
  zoneId: number;
  canEdit: boolean;
  onAdd: (input: ContentInput) => Promise<void>;
  onUpdate: (id: string, patch: ContentPatch) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

/**
 * Items spawned inside a container (a container on the floor, or one a mob
 * carries or wears), nested to any depth: "Add inside" on a nested container
 * puts the item in that container.
 */
export function ContentTree({
  contents,
  containerType,
  containerName,
  zoneId,
  canEdit,
  onAdd,
  onUpdate,
  onDelete,
}: ContentTreeProps) {
  // 'root' = directly in the container, number = inside that content row
  const [adding, setAdding] = useState<'root' | number | null>(null);
  const rows = nestContents(contents);

  if (containerType !== CONTAINER_TYPE && rows.length === 0) return null;

  const pick = async (entity: PickableEntity) => {
    const parent = adding;
    setAdding(null);
    await onAdd({
      objectZoneId: entity.zoneId,
      objectId: entity.id,
      quantity: 1,
      maxInstances: 1,
      ...(typeof parent === 'number' ? { parentContentId: parent } : {}),
    });
  };

  return (
    <div className='mt-1 ml-2 border-l border-border pl-2 space-y-1'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-medium text-muted-foreground'>
          Inside {containerName}
        </span>
        {canEdit && containerType === CONTAINER_TYPE ? (
          <button
            type='button'
            className='text-xs text-primary'
            onClick={() => setAdding('root')}
          >
            Add item
          </button>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <p className='text-xs text-muted-foreground'>Empty</p>
      ) : null}
      {rows.map(({ item, depth }) => (
        <div key={item.id} style={{ marginLeft: depth * 16 }}>
          <div className='flex items-center gap-2 text-xs text-foreground'>
            <span className='flex-1 truncate'>
              {item.object.name}{' '}
              <span className='text-muted-foreground'>
                {item.object.zoneId}:{item.object.id}
              </span>
            </span>
            <label className='flex items-center gap-1'>
              qty
              <CountInput
                label={`Quantity of ${item.object.name}`}
                value={item.quantity}
                disabled={!canEdit}
                onCommit={n => onUpdate(item.id, { quantity: n })}
              />
            </label>
            <label className='flex items-center gap-1'>
              max
              <CountInput
                label={`Max copies of ${item.object.name}`}
                value={item.maxInstances}
                disabled={!canEdit}
                onCommit={n => onUpdate(item.id, { maxInstances: n })}
              />
            </label>
            {canEdit && item.object.type === CONTAINER_TYPE ? (
              <button
                type='button'
                className='text-primary'
                onClick={() => setAdding(Number(item.id))}
              >
                Add inside
              </button>
            ) : null}
            {canEdit ? (
              <button
                type='button'
                aria-label={`Remove ${item.object.name}`}
                className='text-destructive'
                onClick={() => onDelete(item.id)}
              >
                Remove
              </button>
            ) : null}
          </div>
          {adding === Number(item.id) ? (
            <EntityPicker
              kind='object'
              zoneId={zoneId}
              title={`Put in ${item.object.name}`}
              onPick={pick}
              onCancel={() => setAdding(null)}
            />
          ) : null}
        </div>
      ))}
      {adding === 'root' ? (
        <EntityPicker
          kind='object'
          zoneId={zoneId}
          title={`Put in ${containerName}`}
          onPick={pick}
          onCancel={() => setAdding(null)}
        />
      ) : null}
    </div>
  );
}
