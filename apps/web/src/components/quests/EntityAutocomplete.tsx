'use client';

import { Input } from '@/components/ui/input';
import { useZone } from '@/contexts/zone-context';
import {
  SearchMobsDocument,
  SearchObjectsDocument,
  GetRoomsByZoneDocument,
  type SearchMobsQuery,
  type SearchObjectsQuery,
  type GetRoomsByZoneQuery,
} from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';
import { Loader2, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type EntityType = 'mob' | 'object' | 'room';

export interface EntityResult {
  zoneId: number;
  id: number;
  name: string;
  plainName?: string;
  displayText: string;
  level?: number;
  type?: string;
}

interface EntityAutocompleteProps {
  entityType: EntityType;
  value: { zoneId: number | null; id: number | null };
  onChange: (value: { zoneId: number | null; id: number | null }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Parse input syntax: "helena", "30:helena", "30:01"
function parseSearchInput(input: string): {
  zoneId: number | null;
  searchTerm: string;
  isDirectVnum: boolean;
} {
  const colonIndex = input.indexOf(':');
  if (colonIndex === -1) {
    return { zoneId: null, searchTerm: input, isDirectVnum: false };
  }

  const zoneStr = input.substring(0, colonIndex);
  const afterColon = input.substring(colonIndex + 1);
  const zoneId = parseInt(zoneStr, 10);

  if (isNaN(zoneId)) {
    return { zoneId: null, searchTerm: input, isDirectVnum: false };
  }

  // Check if afterColon is a number (direct vnum lookup)
  const possibleVnum = parseInt(afterColon, 10);
  if (!isNaN(possibleVnum) && afterColon.match(/^\d+$/)) {
    return { zoneId, searchTerm: afterColon, isDirectVnum: true };
  }

  return { zoneId, searchTerm: afterColon, isDirectVnum: false };
}

export function EntityAutocomplete({
  entityType,
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
}: EntityAutocompleteProps) {
  const { selectedZone } = useZone();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse the current input
  const parsed = parseSearchInput(debouncedSearch);
  const effectiveZoneId = parsed.zoneId ?? selectedZone;

  // Mob search query
  const { data: mobData, loading: mobLoading } = useQuery<SearchMobsQuery>(
    SearchMobsDocument,
    {
      variables: {
        search: parsed.searchTerm,
        limit: 10,
        zoneId: effectiveZoneId,
      },
      skip:
        entityType !== 'mob' ||
        !debouncedSearch ||
        parsed.searchTerm.length < 1,
    }
  );

  // Object search query
  const { data: objectData, loading: objectLoading } =
    useQuery<SearchObjectsQuery>(SearchObjectsDocument, {
      variables: {
        search: parsed.searchTerm,
        limit: 10,
        zoneId: effectiveZoneId,
      },
      skip:
        entityType !== 'object' ||
        !debouncedSearch ||
        parsed.searchTerm.length < 1,
    });

  // Room search - use zone query with client-side filtering
  const { data: roomData, loading: roomLoading } =
    useQuery<GetRoomsByZoneQuery>(GetRoomsByZoneDocument, {
      variables: {
        zoneId: effectiveZoneId || 0,
      },
      skip: entityType !== 'room' || !effectiveZoneId || !debouncedSearch,
    });

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input when value changes externally
  useEffect(() => {
    if (value.zoneId !== null && value.id !== null) {
      setInputValue(`${value.zoneId}:${value.id}`);
    } else {
      setInputValue('');
    }
  }, [value.zoneId, value.id]);

  // Build results based on entity type
  const getResults = useCallback((): EntityResult[] => {
    const searchLower = parsed.searchTerm.toLowerCase();

    if (entityType === 'mob' && mobData?.searchMobs) {
      return mobData.searchMobs.map(mob => ({
        zoneId: mob.zoneId,
        id: mob.id,
        name: mob.name,
        plainName: mob.plainName,
        displayText: `[${mob.zoneId}:${mob.id}] ${mob.plainName || mob.name} (L${mob.level})`,
        level: mob.level,
      }));
    }

    if (entityType === 'object' && objectData?.searchObjects) {
      return objectData.searchObjects.map(obj => ({
        zoneId: obj.zoneId,
        id: obj.id,
        name: obj.name,
        plainName: obj.plainName,
        displayText: `[${obj.zoneId}:${obj.id}] ${obj.plainName || obj.name} (${obj.type})`,
        type: obj.type,
        level: obj.level,
      }));
    }

    if (entityType === 'room' && roomData?.roomsByZone) {
      // Client-side filtering for rooms
      return roomData.roomsByZone
        .filter(room => {
          if (parsed.isDirectVnum) {
            return room.id === parseInt(parsed.searchTerm, 10);
          }
          const name = room.name?.toLowerCase() || '';
          return (
            name.includes(searchLower) ||
            room.id.toString().includes(parsed.searchTerm)
          );
        })
        .slice(0, 10)
        .map(room => ({
          zoneId: room.zoneId,
          id: room.id,
          name: room.name || `Room ${room.id}`,
          displayText: `[${room.zoneId}:${room.id}] ${room.name || 'Unnamed Room'}`,
        }));
    }

    return [];
  }, [entityType, mobData, objectData, roomData, parsed]);

  const results = getResults();
  const isLoading = mobLoading || objectLoading || roomLoading;

  const handleSelect = (result: EntityResult) => {
    onChange({ zoneId: result.zoneId, id: result.id });
    setInputValue(`${result.zoneId}:${result.id}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange({ zoneId: null, id: null });
    setInputValue('');
    setDebouncedSearch('');
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);

    // If input matches zone:id pattern exactly, update value
    const match = newValue.match(/^(\d+):(\d+)$/);
    if (match && match[1] && match[2]) {
      const zoneId = parseInt(match[1], 10);
      const id = parseInt(match[2], 10);
      onChange({ zoneId, id });
    } else if (newValue === '') {
      onChange({ zoneId: null, id: null });
    }
  };

  const getEntityLabel = () => {
    switch (entityType) {
      case 'mob':
        return 'mob';
      case 'object':
        return 'object';
      case 'room':
        return 'room';
      default:
        return 'entity';
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
        <Input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={
            placeholder ||
            `Search ${getEntityLabel()}... (e.g., "helena" or "30:5")`
          }
          disabled={disabled}
          className='pl-10 pr-10'
        />
        {inputValue && !disabled && (
          <button
            type='button'
            onClick={handleClear}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>

      {isOpen && debouncedSearch && (
        <div className='absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto'>
          {isLoading ? (
            <div className='flex items-center justify-center p-4'>
              <Loader2 className='w-4 h-4 animate-spin mr-2' />
              <span className='text-sm text-muted-foreground'>
                Searching...
              </span>
            </div>
          ) : results.length === 0 ? (
            <div className='p-4 text-center text-sm text-muted-foreground'>
              No {getEntityLabel()}s found
            </div>
          ) : (
            <ul className='py-1'>
              {results.map(result => (
                <li key={`${result.zoneId}-${result.id}`}>
                  <button
                    type='button'
                    onClick={() => handleSelect(result)}
                    className='w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                  >
                    <span className='font-mono text-xs text-muted-foreground'>
                      [{result.zoneId}:{result.id}]
                    </span>{' '}
                    <span>{result.plainName || result.name}</span>
                    {result.level !== undefined && (
                      <span className='ml-2 text-xs text-muted-foreground'>
                        L{result.level}
                      </span>
                    )}
                    {result.type && (
                      <span className='ml-2 text-xs text-muted-foreground'>
                        {result.type}
                      </span>
                    )}
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
