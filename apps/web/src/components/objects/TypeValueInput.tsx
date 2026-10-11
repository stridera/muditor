'use client';

import {
  getTypeValue,
  NO_KEY,
  readObjectRef,
  type ObjectRef,
  type ValueField,
} from '@/lib/objectTypeValues';
import { useEffect, useState } from 'react';

const INPUT_CLASS =
  'block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground';

export type TypeValue = string | number | boolean | string[] | ObjectRef;

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
