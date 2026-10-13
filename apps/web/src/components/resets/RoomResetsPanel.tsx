'use client';

import {
  addMobEquipment,
  addMobEquipmentContent,
  addObjectContent,
  createMobReset,
  createObjectReset,
  deleteMobEquipment,
  deleteMobEquipmentContent,
  deleteMobReset,
  deleteObjectContent,
  deleteObjectReset,
  describeResetError,
  loadRoomResets,
  updateMobEquipment,
  updateMobEquipmentContent,
  updateMobReset,
  updateObjectContent,
  updateObjectReset,
  type MobReset,
  type MobResetEquipment,
  type ObjectReset,
  type PickableEntity,
} from '@/lib/reset-api';
import { useCallback, useEffect, useState } from 'react';
import { ContentTree } from './ContentTree';
import { EntityPicker } from './EntityPicker';

const SMALL_INPUT =
  'w-16 rounded border border-input bg-background text-foreground px-1 py-0.5 text-xs';

/**
 * Where gear goes on the mob. These are the slot labels the game reads from
 * `MobResetEquipment.wear_location`; "carried" is no wear location (NULL).
 */
export const WEAR_LOCATIONS: readonly string[] = [
  'WIELD',
  'HOLD',
  'LIGHT',
  'HEAD',
  'FACE',
  'EYES',
  'EAR_LEFT',
  'EAR_RIGHT',
  'NECK',
  'NECK_2',
  'BODY',
  'ABOUT',
  'ARMS',
  'WRIST_LEFT',
  'WRIST_RIGHT',
  'HANDS',
  'FINGER_LEFT',
  'FINGER_RIGHT',
  'WAIST',
  'BELT',
  'LEGS',
  'FEET',
  'BADGE',
  'HOVER',
];

const slotLabel = (w: string) => w.toLowerCase().replace(/_/g, ' ');

/** Slot options for a select, keeping a legacy label the row already holds. */
const slotOptions = (current?: string | null): string[] =>
  current && !WEAR_LOCATIONS.includes(current)
    ? [current, ...WEAR_LOCATIONS]
    : [...WEAR_LOCATIONS];

export interface RoomResetsSummary {
  mobs: Array<{ id: number; zoneId: number; name: string }>;
  objects: Array<{ id: number; zoneId: number; name: string }>;
}

interface RoomResetsPanelProps {
  roomZoneId: number;
  roomId: number;
  canEdit: boolean;
  /** Called after every change with what now spawns in the room. */
  onChanged?: (summary: RoomResetsSummary) => void;
  /** Bump to reload from the server (e.g. after a palette placement). */
  refreshKey?: number;
}

type Picker =
  | { kind: 'mob' }
  | { kind: 'object' }
  | { kind: 'gear'; resetId: string }
  | null;

/** A 0..1 chance shown and edited as a whole percent. */
function ChanceInput({
  label,
  value,
  disabled,
  onCommit,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onCommit: (chance: number) => void;
}) {
  const pct = Math.round(value * 100);
  const [text, setText] = useState(String(pct));
  useEffect(() => setText(String(pct)), [pct]);
  return (
    <input
      type='number'
      min={0}
      max={100}
      aria-label={label}
      className={SMALL_INPUT}
      value={text}
      disabled={disabled}
      onChange={e => setText(e.target.value)}
      onBlur={() => {
        const n = Number(text);
        if (Number.isFinite(n) && n >= 0 && n <= 100 && n !== pct)
          onCommit(n / 100);
        else setText(String(pct));
      }}
    />
  );
}

function MaxInput({
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

export function summarizeResets(
  mobResets: MobReset[],
  objectResets: ObjectReset[]
): RoomResetsSummary {
  const uniq = <T extends { id: number; zoneId: number }>(rows: T[]): T[] => {
    const seen = new Set<string>();
    return rows.filter(r => {
      const key = `${r.zoneId}:${r.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  return {
    mobs: uniq(
      mobResets.map(r => ({
        id: r.mobId,
        zoneId: r.mobZoneId,
        name: r.mob?.name ?? `Mob ${r.mobZoneId}:${r.mobId}`,
      }))
    ),
    objects: uniq(
      objectResets.map(r => ({
        id: r.object.id,
        zoneId: r.object.zoneId,
        name: r.object.name,
      }))
    ),
  };
}

/**
 * What spawns in one room: mobs (with their gear, including items inside
 * carried containers) and objects (including container contents). Lists,
 * creates, edits and deletes through the zone-scoped reset mutations.
 */
export function RoomResetsPanel({
  roomZoneId,
  roomId,
  canEdit,
  onChanged,
  refreshKey = 0,
}: RoomResetsPanelProps) {
  const [mobResets, setMobResets] = useState<MobReset[]>([]);
  const [objectResets, setObjectResets] = useState<ObjectReset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [picker, setPicker] = useState<Picker>(null);
  const [gearSlot, setGearSlot] = useState<string>('');

  const refresh = useCallback(
    async (notify: boolean) => {
      try {
        const { mobResets: mobs, objectResets: objects } = await loadRoomResets(
          roomZoneId,
          roomId
        );
        setMobResets(mobs);
        setObjectResets(objects);
        if (notify) onChanged?.(summarizeResets(mobs, objects));
      } catch (e) {
        setError(describeResetError(e, roomZoneId));
      } finally {
        setLoading(false);
      }
    },
    [roomZoneId, roomId, onChanged]
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPicker(null);
    void refresh(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomZoneId, roomId, refreshKey]);

  /** Run a mutation, then reload; failures show in the panel, not the console. */
  const act = useCallback(
    async (fn: () => Promise<unknown>) => {
      setError(null);
      try {
        await fn();
      } catch (e) {
        setError(describeResetError(e, roomZoneId));
        return;
      }
      await refresh(true);
    },
    [refresh, roomZoneId]
  );

  const placeMob = (e: PickableEntity) => {
    setPicker(null);
    return act(() =>
      createMobReset({
        zoneId: roomZoneId,
        mobZoneId: e.zoneId,
        mobId: e.id,
        roomZoneId,
        roomId,
        maxInstances: 1,
        probability: 1,
      })
    );
  };

  const placeObject = (e: PickableEntity) => {
    setPicker(null);
    return act(() =>
      createObjectReset({
        zoneId: roomZoneId,
        objectZoneId: e.zoneId,
        objectId: e.id,
        roomZoneId,
        roomId,
        maxInstances: 1,
        probability: 1,
      })
    );
  };

  const addGear = (resetId: string, e: PickableEntity) => {
    const slot = gearSlot;
    setPicker(null);
    return act(() =>
      addMobEquipment(resetId, {
        objectZoneId: e.zoneId,
        objectId: e.id,
        wearLocation: slot || null,
        maxInstances: 1,
        probability: 1,
      })
    );
  };

  const renderGear = (reset: MobReset, eq: MobResetEquipment) => (
    <li key={eq.id} className='py-1'>
      <div className='flex flex-wrap items-center gap-2 text-xs text-foreground'>
        <select
          aria-label={`Wear location of ${eq.object.name}`}
          value={eq.wearLocation ?? ''}
          disabled={!canEdit}
          onChange={ev =>
            act(() =>
              updateMobEquipment(eq.id, {
                wearLocation: ev.target.value || null,
              })
            )
          }
          className='rounded border border-input bg-background text-foreground px-1 py-0.5'
        >
          <option value=''>carried</option>
          {slotOptions(eq.wearLocation).map(w => (
            <option key={w} value={w}>
              {slotLabel(w)}
            </option>
          ))}
        </select>
        <span className='flex-1 truncate'>
          {eq.object.name}{' '}
          <span className='text-muted-foreground'>
            {eq.objectZoneId}:{eq.objectId}
          </span>
        </span>
        <label className='flex items-center gap-1'>
          chance %
          <ChanceInput
            label={`Chance of ${eq.object.name}`}
            value={eq.probability}
            disabled={!canEdit}
            onCommit={p =>
              act(() => updateMobEquipment(eq.id, { probability: p }))
            }
          />
        </label>
        <label className='flex items-center gap-1'>
          <input
            type='checkbox'
            checked={eq.decorative}
            disabled={!canEdit}
            aria-label={`${eq.object.name} is decorative`}
            onChange={ev =>
              act(() =>
                updateMobEquipment(eq.id, { decorative: ev.target.checked })
              )
            }
          />
          decorative
        </label>
        {canEdit ? (
          <button
            type='button'
            aria-label={`Remove ${eq.object.name} from ${reset.mob?.name ?? 'mob'}`}
            className='text-destructive'
            onClick={() => act(() => deleteMobEquipment(eq.id))}
          >
            Remove
          </button>
        ) : null}
      </div>
      <ContentTree
        contents={eq.contents}
        containerType={eq.object.type}
        containerName={eq.object.name}
        zoneId={roomZoneId}
        canEdit={canEdit}
        onAdd={input => act(() => addMobEquipmentContent(eq.id, input))}
        onUpdate={(id, patch) =>
          act(() => updateMobEquipmentContent(id, patch))
        }
        onDelete={id => act(() => deleteMobEquipmentContent(id))}
      />
    </li>
  );

  const renderMob = (reset: MobReset) => {
    const mobName = reset.mob?.name ?? `Mob ${reset.mobZoneId}:${reset.mobId}`;
    return (
      <li
        key={reset.id}
        className='rounded-md border border-border bg-card p-2 space-y-1'
      >
        <div className='flex flex-wrap items-center gap-2 text-sm text-foreground'>
          <span className='flex-1 font-medium truncate'>
            {mobName}{' '}
            <span className='text-xs font-normal text-muted-foreground'>
              {reset.mobZoneId}:{reset.mobId}
            </span>
          </span>
          <label className='flex items-center gap-1 text-xs'>
            max
            <MaxInput
              label={`Max instances of ${mobName}`}
              value={reset.maxInstances}
              disabled={!canEdit}
              onCommit={n =>
                act(() => updateMobReset(reset.id, { maxInstances: n }))
              }
            />
          </label>
          <label className='flex items-center gap-1 text-xs'>
            chance %
            <ChanceInput
              label={`Chance of ${mobName}`}
              value={reset.probability}
              disabled={!canEdit}
              onCommit={p =>
                act(() => updateMobReset(reset.id, { probability: p }))
              }
            />
          </label>
          {canEdit ? (
            <button
              type='button'
              aria-label={`Delete reset of ${mobName}`}
              className='text-xs text-destructive'
              onClick={() => act(() => deleteMobReset(reset.id))}
            >
              Delete
            </button>
          ) : null}
        </div>
        <ul className='divide-y divide-border'>
          {reset.equipment.map(eq => renderGear(reset, eq))}
        </ul>
        {reset.equipment.length === 0 ? (
          <p className='text-xs text-muted-foreground'>No gear</p>
        ) : null}
        {canEdit ? (
          picker?.kind === 'gear' && picker.resetId === reset.id ? (
            <div className='space-y-1'>
              <label className='flex items-center gap-2 text-xs text-foreground'>
                Worn on
                <select
                  aria-label='Worn on'
                  value={gearSlot}
                  onChange={ev => setGearSlot(ev.target.value)}
                  className='rounded border border-input bg-background text-foreground px-1 py-0.5'
                >
                  <option value=''>carried</option>
                  {WEAR_LOCATIONS.map(w => (
                    <option key={w} value={w}>
                      {slotLabel(w)}
                    </option>
                  ))}
                </select>
              </label>
              <EntityPicker
                kind='object'
                zoneId={roomZoneId}
                title={`Give gear to ${mobName}`}
                onPick={e => addGear(reset.id, e)}
                onCancel={() => setPicker(null)}
              />
            </div>
          ) : (
            <button
              type='button'
              className='text-xs text-primary'
              onClick={() => {
                setGearSlot('');
                setPicker({ kind: 'gear', resetId: reset.id });
              }}
            >
              Add gear to {mobName}
            </button>
          )
        ) : null}
      </li>
    );
  };

  const renderObject = (reset: ObjectReset) => (
    <li
      key={reset.id}
      className='rounded-md border border-border bg-card p-2 space-y-1'
    >
      <div className='flex flex-wrap items-center gap-2 text-sm text-foreground'>
        <span className='flex-1 font-medium truncate'>
          {reset.object.name}{' '}
          <span className='text-xs font-normal text-muted-foreground'>
            {reset.objectZoneId}:{reset.objectId} {reset.object.type}
          </span>
        </span>
        <label className='flex items-center gap-1 text-xs'>
          max
          <MaxInput
            label={`Max instances of ${reset.object.name}`}
            value={reset.maxInstances}
            disabled={!canEdit}
            onCommit={n =>
              act(() => updateObjectReset(reset.id, { maxInstances: n }))
            }
          />
        </label>
        <label className='flex items-center gap-1 text-xs'>
          chance %
          <ChanceInput
            label={`Chance of ${reset.object.name}`}
            value={reset.probability}
            disabled={!canEdit}
            onCommit={p =>
              act(() => updateObjectReset(reset.id, { probability: p }))
            }
          />
        </label>
        {canEdit ? (
          <button
            type='button'
            aria-label={`Delete reset of ${reset.object.name}`}
            className='text-xs text-destructive'
            onClick={() => act(() => deleteObjectReset(reset.id))}
          >
            Delete
          </button>
        ) : null}
      </div>
      <ContentTree
        contents={reset.contents}
        containerType={reset.object.type}
        containerName={reset.object.name}
        zoneId={roomZoneId}
        canEdit={canEdit}
        onAdd={input => act(() => addObjectContent(reset.id, input))}
        onUpdate={(id, patch) => act(() => updateObjectContent(id, patch))}
        onDelete={id => act(() => deleteObjectContent(id))}
      />
    </li>
  );

  return (
    <div className='space-y-4' data-testid='room-resets-panel'>
      {error ? (
        <p role='alert' className='text-sm text-destructive'>
          {error}
        </p>
      ) : null}
      {loading ? (
        <p className='text-sm text-muted-foreground'>Loading resets...</p>
      ) : null}

      <section aria-label='Mob resets' className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h4 className='text-sm font-medium text-foreground'>
            Mobs ({mobResets.length})
          </h4>
          {canEdit ? (
            <button
              type='button'
              className='text-xs text-primary'
              onClick={() => setPicker({ kind: 'mob' })}
            >
              Place mob
            </button>
          ) : null}
        </div>
        {picker?.kind === 'mob' ? (
          <EntityPicker
            kind='mob'
            zoneId={roomZoneId}
            title='Place a mob in this room'
            onPick={placeMob}
            onCancel={() => setPicker(null)}
          />
        ) : null}
        {!loading && mobResets.length === 0 ? (
          <p className='text-xs text-muted-foreground'>
            No mobs spawn in this room.
          </p>
        ) : null}
        <ul className='space-y-2'>{mobResets.map(renderMob)}</ul>
      </section>

      <section aria-label='Object resets' className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h4 className='text-sm font-medium text-foreground'>
            Objects ({objectResets.length})
          </h4>
          {canEdit ? (
            <button
              type='button'
              className='text-xs text-primary'
              onClick={() => setPicker({ kind: 'object' })}
            >
              Place object
            </button>
          ) : null}
        </div>
        {picker?.kind === 'object' ? (
          <EntityPicker
            kind='object'
            zoneId={roomZoneId}
            title='Place an object in this room'
            onPick={placeObject}
            onCancel={() => setPicker(null)}
          />
        ) : null}
        {!loading && objectResets.length === 0 ? (
          <p className='text-xs text-muted-foreground'>
            No objects spawn in this room.
          </p>
        ) : null}
        <ul className='space-y-2'>{objectResets.map(renderObject)}</ul>
      </section>
    </div>
  );
}
