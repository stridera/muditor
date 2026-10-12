'use client';

import {
  getTypeValue,
  NO_KEY,
  readObjectRef,
  type ObjectRef,
  type RecallRooms,
  type ValueField,
} from '@/lib/objectTypeValues';
import { useEffect, useState } from 'react';

const INPUT_CLASS =
  'block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground';

export type TypeValue =
  | string
  | number
  | boolean
  | string[]
  | ObjectRef
  | RecallRooms
  | null;

interface TypeValueInputProps {
  field: ValueField;
  values: Record<string, unknown>;
  onChange: (key: string, value: TypeValue) => void;
}

/** Comma-separated list that only commits on blur, so typing "a, " is not eaten. */
function ListInput({
  field,
  current,
  onChange,
}: {
  field: ValueField;
  current: string[];
  onChange: (key: string, value: string[]) => void;
}) {
  const joined = Array.isArray(current) ? current.join(', ') : '';
  const [text, setText] = useState(joined);
  useEffect(() => setText(joined), [joined]);
  return (
    <input
      type='text'
      aria-label={field.label}
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={() =>
        onChange(
          field.key,
          text
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)
        )
      }
      className={INPUT_CLASS}
    />
  );
}

/**
 * Composite (zone, id) reference. Always writes `{zone, id}`; a legacy vnum
 * integer is only shown (with a warning) and is replaced once both boxes are
 * filled in. Both boxes empty writes the no-reference sentinel.
 */
function ObjectRefInput({
  field,
  current,
  onChange,
}: {
  field: ValueField;
  current: unknown;
  onChange: (key: string, value: TypeValue) => void;
}) {
  const read = readObjectRef(current);
  const storedZone = read && 'ref' in read ? String(read.ref.zone) : '';
  const storedId = read && 'ref' in read ? String(read.ref.id) : '';
  const [zone, setZone] = useState(storedZone);
  const [id, setId] = useState(storedId);
  useEffect(() => {
    setZone(storedZone);
    setId(storedId);
  }, [storedZone, storedId]);

  const commit = (z: string, i: string) => {
    if (z.trim() === '' && i.trim() === '') {
      onChange(field.key, NO_KEY);
      return;
    }
    const zn = Number(z);
    const idn = Number(i);
    if (
      z.trim() !== '' &&
      i.trim() !== '' &&
      Number.isInteger(zn) &&
      Number.isInteger(idn) &&
      zn >= 0 &&
      idn >= 0
    ) {
      onChange(field.key, { zone: zn, id: idn });
    }
  };

  const incomplete = (zone.trim() === '') !== (id.trim() === '');
  return (
    <div>
      <div className='grid grid-cols-2 gap-2'>
        <input
          type='number'
          aria-label={`${field.label} zone`}
          placeholder='zone'
          min={0}
          step={1}
          value={zone}
          onChange={e => {
            setZone(e.target.value);
            commit(e.target.value, id);
          }}
          className={INPUT_CLASS}
        />
        <input
          type='number'
          aria-label={`${field.label} id`}
          placeholder='id'
          min={0}
          step={1}
          value={id}
          onChange={e => {
            setId(e.target.value);
            commit(zone, e.target.value);
          }}
          className={INPUT_CLASS}
        />
      </div>
      {read && 'legacy' in read ? (
        <p role='alert' className='mt-1 text-xs text-destructive'>
          Stored as legacy number {read.legacy}. Enter the key's zone and id to
          replace it; the old number cannot be saved.
        </p>
      ) : incomplete ? (
        <p className='mt-1 text-xs text-muted-foreground'>
          Enter both zone and id (or clear both for no key).
        </p>
      ) : null}
    </div>
  );
}

interface RecallRow {
  cls: string;
  zone: string;
  id: string;
}

const isRef = (v: unknown): v is ObjectRef =>
  !!v &&
  typeof v === 'object' &&
  Number.isInteger((v as ObjectRef).zone) &&
  Number.isInteger((v as ObjectRef).id);

function rowsFrom(current: unknown): {
  zone: string;
  id: string;
  rows: RecallRow[];
} {
  const rr = (current && typeof current === 'object' ? current : {}) as {
    default?: unknown;
    classes?: Record<string, unknown>;
  };
  const def = isRef(rr.default) ? rr.default : null;
  const rows = Object.entries(rr.classes ?? {})
    .filter(([, v]) => isRef(v))
    .map(([cls, v]) => ({
      cls,
      zone: String((v as ObjectRef).zone),
      id: String((v as ObjectRef).id),
    }));
  return {
    zone: def ? String(def.zone) : '',
    id: def ? String(def.id) : '',
    rows,
  };
}

const wholeNumber = (t: string): number | null =>
  t.trim() !== '' && Number.isInteger(Number(t)) && Number(t) >= 0
    ? Number(t)
    : null;

/**
 * Recall scroll destinations: one default room plus optional per-class rooms
 * (`{"default": {zone, id}, "classes": {"sorcerer": {zone, id}}}`). Only
 * complete rows are written; clearing everything writes null.
 */
function RecallRoomsInput({
  field,
  current,
  onChange,
}: {
  field: ValueField;
  current: unknown;
  onChange: (key: string, value: TypeValue) => void;
}) {
  const stored = rowsFrom(current);
  const storedKey = JSON.stringify(stored);
  const [zone, setZone] = useState(stored.zone);
  const [id, setId] = useState(stored.id);
  const [rows, setRows] = useState<RecallRow[]>(stored.rows);

  const build = (z: string, i: string, r: RecallRow[]): RecallRooms | null => {
    const out: RecallRooms = {};
    const dz = wholeNumber(z);
    const di = wholeNumber(i);
    if (dz !== null && di !== null) out.default = { zone: dz, id: di };
    const classes: Record<string, ObjectRef> = {};
    for (const row of r) {
      const rz = wholeNumber(row.zone);
      const ri = wholeNumber(row.id);
      const name = row.cls.trim().toLowerCase();
      if (name && rz !== null && ri !== null) {
        classes[name] = { zone: rz, id: ri };
      }
    }
    if (Object.keys(classes).length > 0) out.classes = classes;
    return out.default || out.classes ? out : null;
  };

  // Follow outside changes (load, reset) but never overwrite a half-filled
  // row: skip when what the boxes would write already equals what is stored.
  useEffect(() => {
    const s = JSON.parse(storedKey) as ReturnType<typeof rowsFrom>;
    const stash = JSON.stringify(build(s.zone, s.id, s.rows));
    const local = JSON.stringify(build(zone, id, rows));
    if (stash !== local) {
      setZone(s.zone);
      setId(s.id);
      setRows(s.rows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedKey]);

  const commit = (z: string, i: string, r: RecallRow[]) =>
    onChange(field.key, build(z, i, r));

  const setRow = (index: number, patch: Partial<RecallRow>) => {
    const next = rows.map((row, n) =>
      n === index ? { ...row, ...patch } : row
    );
    setRows(next);
    commit(zone, id, next);
  };

  return (
    <div className='space-y-2'>
      <div className='grid grid-cols-2 gap-2'>
        <input
          type='number'
          aria-label='Recall default room zone'
          placeholder='default zone'
          min={0}
          value={zone}
          onChange={e => {
            setZone(e.target.value);
            commit(e.target.value, id, rows);
          }}
          className={INPUT_CLASS}
        />
        <input
          type='number'
          aria-label='Recall default room id'
          placeholder='default room id'
          min={0}
          value={id}
          onChange={e => {
            setId(e.target.value);
            commit(zone, e.target.value, rows);
          }}
          className={INPUT_CLASS}
        />
      </div>
      {rows.map((row, n) => (
        <div key={n} className='grid grid-cols-[1fr_5rem_5rem_auto] gap-2'>
          <input
            type='text'
            aria-label={`Recall class ${n + 1}`}
            placeholder='class, e.g. sorcerer'
            value={row.cls}
            onChange={e => setRow(n, { cls: e.target.value })}
            className={INPUT_CLASS}
          />
          <input
            type='number'
            aria-label={`Recall class ${n + 1} zone`}
            placeholder='zone'
            min={0}
            value={row.zone}
            onChange={e => setRow(n, { zone: e.target.value })}
            className={INPUT_CLASS}
          />
          <input
            type='number'
            aria-label={`Recall class ${n + 1} room`}
            placeholder='id'
            min={0}
            value={row.id}
            onChange={e => setRow(n, { id: e.target.value })}
            className={INPUT_CLASS}
          />
          <button
            type='button'
            aria-label={`Remove recall class ${n + 1}`}
            className='text-sm text-destructive'
            onClick={() => {
              const next = rows.filter((_, i) => i !== n);
              setRows(next);
              commit(zone, id, next);
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type='button'
        className='text-sm text-primary'
        onClick={() => setRows([...rows, { cls: '', zone: '', id: '' }])}
      >
        Add class room
      </button>
    </div>
  );
}

/**
 * One editable field of the type-specific `values` JSON. Writes under the
 * field's exact game key (e.g. "Capacity", "Weight Reduction").
 */
export function TypeValueInput({
  field,
  values,
  onChange,
}: TypeValueInputProps) {
  const label = (
    <label className='block text-sm font-medium text-muted-foreground mb-1'>
      {field.label}
      {field.help ? (
        <span className='ml-2 text-xs font-normal'>({field.help})</span>
      ) : null}
    </label>
  );

  switch (field.kind) {
    case 'int':
    case 'number': {
      const value = getTypeValue<number | string>(values, field);
      return (
        <div>
          {label}
          <input
            type='number'
            aria-label={field.label}
            value={value}
            min={field.min}
            max={field.max}
            step={field.kind === 'number' ? 'any' : 1}
            onChange={e => {
              const n =
                field.kind === 'int'
                  ? parseInt(e.target.value, 10)
                  : parseFloat(e.target.value);
              onChange(
                field.key,
                Number.isFinite(n) ? n : Number(field.fallback)
              );
            }}
            className={INPUT_CLASS}
          />
        </div>
      );
    }
    case 'bool': {
      const value = getTypeValue<boolean | string>(values, field);
      const on = value === true || String(value).toLowerCase() === 'true';
      return (
        <div>
          {label}
          <select
            aria-label={field.label}
            value={on ? 'true' : 'false'}
            onChange={e => onChange(field.key, e.target.value === 'true')}
            className={INPUT_CLASS}
          >
            <option value='false'>No</option>
            <option value='true'>Yes</option>
          </select>
        </div>
      );
    }
    case 'select': {
      const value = String(getTypeValue<string>(values, field));
      // Keep a stored value that isn't in the list selectable instead of
      // silently replacing it with the first option.
      const options = field.options?.includes(value)
        ? field.options
        : [value, ...(field.options ?? [])];
      return (
        <div>
          {label}
          <select
            aria-label={field.label}
            value={value}
            onChange={e => onChange(field.key, e.target.value)}
            className={INPUT_CLASS}
          >
            {options.map(o => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      );
    }
    case 'flags': {
      const selected = getTypeValue<string[]>(values, field);
      const list = Array.isArray(selected) ? selected : [];
      return (
        <div className='col-span-2'>
          {label}
          <div className='grid grid-cols-2 gap-2'>
            {field.options?.map(flag => (
              <label key={flag} className='flex items-center'>
                <input
                  type='checkbox'
                  checked={list.includes(flag)}
                  onChange={e =>
                    onChange(
                      field.key,
                      e.target.checked
                        ? [...list, flag]
                        : list.filter(f => f !== flag)
                    )
                  }
                  className='rounded border-input text-primary shadow-sm focus:border-ring focus:ring focus:ring-ring focus:ring-opacity-50'
                />
                <span className='ml-2 text-sm text-foreground'>{flag}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }
    case 'objectRef':
      return (
        <div>
          {label}
          <ObjectRefInput
            field={field}
            current={values?.[field.key]}
            onChange={onChange}
          />
        </div>
      );
    case 'recallRooms':
      return (
        <div className='col-span-2'>
          {label}
          <RecallRoomsInput
            field={field}
            current={values?.[field.key]}
            onChange={onChange}
          />
        </div>
      );
    case 'list':
      return (
        <div className='col-span-2'>
          {label}
          <ListInput
            field={field}
            current={getTypeValue<string[]>(values, field)}
            onChange={onChange}
          />
        </div>
      );
    case 'text':
    default:
      return (
        <div>
          {label}
          <input
            type='text'
            aria-label={field.label}
            value={String(getTypeValue<string>(values, field))}
            onChange={e => onChange(field.key, e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      );
  }
}
