'use client';

import { Input } from '@/components/ui/input';
import { SearchAbilitiesForAiDocument } from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';

export interface PickedAbility {
  id: number;
  name: string;
  abilityType: string;
}

interface Props {
  value: PickedAbility | null;
  onChange: (ability: PickedAbility) => void;
  disabled?: boolean | undefined;
  /** Hide the "Selected" line (for pickers that add to a list). */
  hideSelected?: boolean | undefined;
}

/** Search-as-you-type ability picker (name search, 20 results). */
export function AbilityPicker({
  value,
  onChange,
  disabled,
  hideSelected,
}: Props) {
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearch(text.trim()), 250);
    return () => clearTimeout(t);
  }, [text]);

  const { data, loading } = useQuery(SearchAbilitiesForAiDocument, {
    variables: { search, take: 20 },
    skip: search.length < 2,
  });
  const results = data?.abilities ?? [];

  return (
    <div className='space-y-2'>
      {!hideSelected && (
        <div className='text-sm'>
          Selected:{' '}
          {value ? (
            <span className='font-medium'>
              {value.name}{' '}
              <span className='text-xs text-muted-foreground'>
                ({value.abilityType.toLowerCase()})
              </span>
            </span>
          ) : (
            <span className='text-muted-foreground'>none</span>
          )}
        </div>
      )}
      {!disabled && (
        <>
          <Input
            placeholder='Search abilities by name...'
            value={text}
            onChange={e => setText(e.target.value)}
            aria-label='Search abilities'
          />
          {search.length >= 2 && (
            <ul className='max-h-40 overflow-y-auto rounded-md border divide-y'>
              {loading && results.length === 0 && (
                <li className='px-3 py-2 text-xs text-muted-foreground'>
                  Searching...
                </li>
              )}
              {!loading && results.length === 0 && (
                <li className='px-3 py-2 text-xs text-muted-foreground'>
                  No abilities match.
                </li>
              )}
              {results.map(a => (
                <li key={a.id}>
                  <button
                    type='button'
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-accent ${
                      value?.id === Number(a.id) ? 'bg-accent' : ''
                    }`}
                    onClick={() =>
                      onChange({
                        id: Number(a.id),
                        name: a.name,
                        abilityType: a.abilityType,
                      })
                    }
                  >
                    {a.name}{' '}
                    <span className='text-xs text-muted-foreground'>
                      ({a.abilityType.toLowerCase()})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
