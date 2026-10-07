'use client';

import { Input } from '@/components/ui/input';
import {
  GetAbilityNameDocument,
  GetAbilityOptionsDocument,
} from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';
import { Loader2, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AbilityPickerProps {
  value: number | null;
  onChange: (abilityId: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Search-and-pick control for a skill/spell (Ability). Stores the numeric
 * ability id; shows "[id] name" once chosen.
 */
export function AbilityPicker({
  value,
  onChange,
  placeholder = 'Search skill or spell...',
  disabled = false,
}: AbilityPickerProps) {
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(input.trim()), 250);
    return () => clearTimeout(timer);
  }, [input]);

  const { data: nameData } = useQuery(GetAbilityNameDocument, {
    variables: { id: String(value) },
    skip: value === null,
  });

  const { data: results, loading } = useQuery(GetAbilityOptionsDocument, {
    variables: { search, take: 12 },
    skip: value !== null || search.length < 1,
  });

  if (value !== null) {
    const name = nameData?.ability?.name;
    return (
      <div className='flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm'>
        <span>
          <span className='font-mono text-xs text-muted-foreground'>
            [{value}]
          </span>{' '}
          {name ?? 'Loading...'}
        </span>
        {!disabled && (
          <button
            type='button'
            aria-label='Clear ability'
            onClick={() => {
              onChange(null);
              setInput('');
              setSearch('');
            }}
            className='text-muted-foreground hover:text-foreground'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>
    );
  }

  const abilities = results?.abilities ?? [];

  return (
    <div className='relative'>
      <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
      <Input
        type='text'
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className='pl-10'
      />
      {search.length > 0 && (
        <div className='absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto'>
          {loading ? (
            <div className='flex items-center justify-center p-4'>
              <Loader2 className='w-4 h-4 animate-spin mr-2' />
              <span className='text-sm text-muted-foreground'>
                Searching...
              </span>
            </div>
          ) : abilities.length === 0 ? (
            <div className='p-4 text-center text-sm text-muted-foreground'>
              No abilities found
            </div>
          ) : (
            <ul className='py-1'>
              {abilities.map(ability => (
                <li key={ability.id}>
                  <button
                    type='button'
                    onClick={() => {
                      onChange(Number(ability.id));
                      setInput('');
                      setSearch('');
                    }}
                    className='w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground'
                  >
                    <span className='font-mono text-xs text-muted-foreground'>
                      [{ability.id}]
                    </span>{' '}
                    {ability.name}
                    <span className='ml-2 text-xs text-muted-foreground'>
                      {ability.abilityType}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
