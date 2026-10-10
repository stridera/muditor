'use client';

import { getTypeValue, type ValueField } from '@/lib/objectTypeValues';
import { useEffect, useState } from 'react';

const INPUT_CLASS =
  'block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground';

export type TypeValue = string | number | boolean | string[];

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
