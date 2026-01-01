'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { useZone } from '@/contexts/zone-context';
import { useZonesForSelector, type Zone } from '@/hooks/use-zones-for-selector';
import {
  SearchMobsDocument,
  SearchObjectsDocument,
  type SearchMobsQuery,
  type SearchObjectsQuery,
} from '@/generated/graphql';

type SearchMode = 'zones' | 'mobs' | 'objects';

interface ParsedInput {
  mode: SearchMode;
  query: string;
  zoneId?: number;
}

interface SearchResult {
  type: 'zone' | 'mob' | 'object';
  id: number;
  zoneId: number;
  name: string;
  displayName: string;
  description?: string;
}

function parseSearchInput(input: string): ParsedInput {
  const trimmed = input.trim();

  // Pattern: "30 o sword" or "30 m orc" (zone-scoped search)
  const zoneScopedMatch = trimmed.match(/^(\d+)\s+([mo])\s+(.+)$/i);
  if (
    zoneScopedMatch &&
    zoneScopedMatch[1] &&
    zoneScopedMatch[2] &&
    zoneScopedMatch[3]
  ) {
    const zoneIdStr = zoneScopedMatch[1];
    const modeChar = zoneScopedMatch[2];
    const query = zoneScopedMatch[3];
    const zoneId = parseInt(zoneIdStr, 10);
    const mode = modeChar.toLowerCase() === 'm' ? 'mobs' : 'objects';
    return { mode, query, zoneId };
  }

  // Pattern: "m orc" or "o sword" (global search)
  if (trimmed.toLowerCase().startsWith('m ')) {
    return { mode: 'mobs', query: trimmed.slice(2).trim() };
  }
  if (trimmed.toLowerCase().startsWith('o ')) {
    return { mode: 'objects', query: trimmed.slice(2).trim() };
  }

  // Default to zones (backward compatible)
  return { mode: 'zones', query: trimmed };
}

export function EnhancedCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { selectedZone, setSelectedZone } = useZone();

  // Fetch zones using custom hook
  const {
    zones,
    loading: zonesLoading,
    error: zonesError,
  } = useZonesForSelector();

  // GraphQL lazy queries for entity search
  const [searchMobsQuery, { data: mobsData, loading: mobsLoading }] =
    useLazyQuery<SearchMobsQuery>(SearchMobsDocument);

  const [searchObjectsQuery, { data: objectsData, loading: objectsLoading }] =
    useLazyQuery<SearchObjectsQuery>(SearchObjectsDocument);

  const parsedInput = useMemo(
    () => parseSearchInput(searchQuery),
    [searchQuery]
  );

  // Create zone name lookup
  const zoneNameMap = useMemo(() => {
    const map = new Map<number, string>();
    zones.forEach(zone => map.set(zone.id, zone.name));
    return map;
  }, [zones]);

  // Execute search based on mode
  useEffect(() => {
    const { mode, query } = parsedInput;

    // Clear results if no query
    if (!query.trim()) {
      if (mode === 'zones') {
        // Show first 10 zones when no query
        const zoneResults: SearchResult[] = zones.slice(0, 10).map(zone => ({
          type: 'zone' as const,
          id: zone.id,
          zoneId: zone.id,
          name: zone.name,
          displayName: zone.name,
          description: `Zone ${zone.id}`,
        }));
        setResults(zoneResults);
      } else {
        setResults([]);
      }
      setSelectedIndex(0);
      return;
    }

    if (mode === 'zones') {
      // Fuzzy search zones (same logic as ZoneSearchModal)
      const queryLower = query.toLowerCase();
      const filtered = zones
        .filter(zone => {
          const name = zone.name.toLowerCase();
          const id = zone.id.toString();

          if (id.includes(queryLower)) {
            return true;
          }

          // Fuzzy match on name
          let queryIndex = 0;
          for (
            let i = 0;
            i < name.length && queryIndex < queryLower.length;
            i++
          ) {
            if (name[i] === queryLower[queryIndex]) {
              queryIndex++;
            }
          }
          return queryIndex === queryLower.length;
        })
        .slice(0, 10);

      const zoneResults: SearchResult[] = filtered.map(zone => ({
        type: 'zone' as const,
        id: zone.id,
        zoneId: zone.id,
        name: zone.name,
        displayName: zone.name,
        description: `Zone ${zone.id}`,
      }));

      setResults(zoneResults);
      setSelectedIndex(0);
    } else if (mode === 'mobs') {
      // Clear old results immediately, then search mobs (globally or zone-scoped)
      setResults([]);
      setSelectedIndex(0);
      searchMobsQuery({
        variables: {
          search: query,
          limit: 10,
          ...(parsedInput.zoneId != null && { zoneId: parsedInput.zoneId }),
        },
      });
    } else if (mode === 'objects') {
      // Clear old results immediately, then search objects (globally or zone-scoped)
      setResults([]);
      setSelectedIndex(0);
      searchObjectsQuery({
        variables: {
          search: query,
          limit: 10,
          ...(parsedInput.zoneId != null && { zoneId: parsedInput.zoneId }),
        },
      });
    }
  }, [parsedInput, zones, selectedZone, searchMobsQuery, searchObjectsQuery]);

  // Update results when mob/object data arrives
  useEffect(() => {
    if (parsedInput.mode === 'mobs' && mobsData?.searchMobs) {
      const mobResults: SearchResult[] = mobsData.searchMobs.map(mob => ({
        type: 'mob' as const,
        id: mob.id,
        zoneId: mob.zoneId,
        name: mob.name,
        displayName: mob.plainName,
        description: `Zone ${mob.zoneId}${
          zoneNameMap.has(mob.zoneId) ? `: ${zoneNameMap.get(mob.zoneId)}` : ''
        } • Mob ${mob.zoneId}:${mob.id} • Level ${mob.level}`,
      }));
      setResults(mobResults);
      setSelectedIndex(0);
    }
  }, [mobsData, parsedInput.mode, zoneNameMap]);

  useEffect(() => {
    if (parsedInput.mode === 'objects' && objectsData?.searchObjects) {
      const objectResults: SearchResult[] = objectsData.searchObjects.map(
        obj => ({
          type: 'object' as const,
          id: obj.id,
          zoneId: obj.zoneId,
          name: obj.name,
          displayName: obj.plainName,
          description: `Zone ${obj.zoneId}${
            zoneNameMap.has(obj.zoneId)
              ? `: ${zoneNameMap.get(obj.zoneId)}`
              : ''
          } • Object ${obj.zoneId}:${obj.id} • ${obj.type} • Level ${obj.level}`,
        })
      );
      setResults(objectResults);
      setSelectedIndex(0);
    }
  }, [objectsData, parsedInput.mode, zoneNameMap]);

  // Keyboard shortcut: Cmd+K (Mac) / Ctrl+K (Windows/Linux)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Modal keyboard navigation (only handle navigation keys, not typing)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle events if user is typing in the input
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT';

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        if (results[selectedIndex]) {
          selectResult(results[selectedIndex]!);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const selectResult = useCallback(
    (result: SearchResult) => {
      let targetPath = '';

      if (result.type === 'zone') {
        setSelectedZone(result.id);

        if (pathname.includes('/zones/editor')) {
          targetPath = `/dashboard/zones/editor?zone=${result.id}`;
        } else if (pathname.includes('/zones/')) {
          targetPath = `/dashboard/zones/${result.id}`;
        } else if (pathname.includes('/rooms')) {
          targetPath = `/dashboard/rooms?zone=${result.id}`;
        } else if (pathname.includes('/mobs')) {
          targetPath = `/dashboard/mobs?zone=${result.id}`;
        } else if (pathname.includes('/objects')) {
          targetPath = `/dashboard/objects?zone=${result.id}`;
        } else {
          targetPath = `/dashboard/zones/${result.id}`;
        }
      } else if (result.type === 'mob') {
        setSelectedZone(result.zoneId);
        targetPath = `/dashboard/mobs/view?zone=${result.zoneId}&id=${result.id}`;
      } else if (result.type === 'object') {
        setSelectedZone(result.zoneId);
        targetPath = `/dashboard/objects/view?zone=${result.zoneId}&id=${result.id}`;
      }

      router.push(targetPath);
      setIsOpen(false);
      setSearchQuery('');
    },
    [pathname, router, setSelectedZone]
  );

  const loading = zonesLoading || mobsLoading || objectsLoading;
  const error = zonesError;

  if (!isOpen) return null;

  const modeLabel =
    parsedInput.mode === 'mobs'
      ? 'Mobs'
      : parsedInput.mode === 'objects'
        ? 'Objects'
        : 'Zones';

  // Context info shows zone-scoped or global search
  const contextInfo = parsedInput.zoneId
    ? `Searching in Zone ${parsedInput.zoneId}${
        zoneNameMap.has(parsedInput.zoneId)
          ? `: ${zoneNameMap.get(parsedInput.zoneId)}`
          : ''
      }`
    : 'Searching all zones';

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50'
      onClick={() => setIsOpen(false)}
    >
      <div
        className='bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl mx-4'
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
          {/* Mode badge */}
          {parsedInput.mode !== 'zones' && (
            <div className='mb-2'>
              <span className='inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded'>
                {parsedInput.mode === 'mobs' ? '🧙 ' : '📦 '}
                {modeLabel}
              </span>
              <span className='ml-2 text-xs text-gray-500 dark:text-gray-400'>
                {contextInfo}
              </span>
            </div>
          )}

          <input
            type='text'
            placeholder="'m orc' (global), '30 m orc' (zone 30), 'o sword', or zone name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full px-4 py-2 text-lg bg-transparent border-none outline-none'
            autoFocus
          />

          <div className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
            <kbd className='px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded'>
              m &lt;name&gt;
            </kbd>{' '}
            Mobs{' '}
            <kbd className='px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded ml-2'>
              o &lt;name&gt;
            </kbd>{' '}
            Objects{' '}
            <kbd className='px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded ml-2'>
              &lt;name&gt;
            </kbd>{' '}
            Zones
          </div>
        </div>

        {/* Results List */}
        <div className='max-h-96 overflow-y-auto'>
          {loading ? (
            <div className='p-8 text-center text-gray-500 dark:text-gray-400'>
              Loading...
            </div>
          ) : error ? (
            <div className='p-8 text-center text-red-500'>
              Failed to load results. Please try again.
            </div>
          ) : results.length === 0 ? (
            <div className='p-8 text-center text-gray-500 dark:text-gray-400'>
              No results found
            </div>
          ) : (
            results.map((result, index) => (
              <button
                key={`${result.type}-${result.zoneId}-${result.id}-${index}`}
                onClick={() => selectResult(result)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                    : ''
                }`}
              >
                <div className='font-medium'>{result.displayName}</div>
                {result.description && (
                  <div className='text-sm text-gray-500 dark:text-gray-400'>
                    {result.description}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
