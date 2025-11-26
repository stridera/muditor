'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useZonesForSelector, type Zone } from '@/hooks/use-zones-for-selector';

export function ZoneSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch zones using custom hook
  const { zones, loading, error } = useZonesForSelector();

  // Fuzzy search filter (searches both name and ID)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredZones(zones.slice(0, 10)); // Show first 10 when no query
      setSelectedIndex(0);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = zones
      .filter(zone => {
        const name = zone.name.toLowerCase();
        const id = zone.id.toString();

        // Check if ID starts with or contains the query (exact match for numbers)
        if (id.includes(query)) {
          return true;
        }

        // Simple fuzzy match on name: check if all query characters appear in order
        let queryIndex = 0;
        for (let i = 0; i < name.length && queryIndex < query.length; i++) {
          if (name[i] === query[queryIndex]) {
            queryIndex++;
          }
        }
        return queryIndex === query.length;
      })
      .slice(0, 10); // Limit to 10 results

    setFilteredZones(filtered);
    setSelectedIndex(0);
  }, [searchQuery, zones]);

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

  // Modal keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredZones.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredZones[selectedIndex]) {
          selectZone(filteredZones[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredZones, selectedIndex]);

  const selectZone = useCallback(
    (zone: Zone) => {
      // Determine the appropriate route based on current page
      let targetPath = '';

      if (pathname.includes('/zones/editor')) {
        // Visual editor - maintain editor view
        targetPath = `/dashboard/zones/editor?zone=${zone.id}`;
      } else if (pathname.includes('/zones/')) {
        // Zone detail page
        targetPath = `/dashboard/zones/${zone.id}`;
      } else if (pathname.includes('/rooms')) {
        // Rooms page - filter by zone
        targetPath = `/dashboard/rooms?zone=${zone.id}`;
      } else if (pathname.includes('/mobs')) {
        // Mobs page - filter by zone
        targetPath = `/dashboard/mobs?zone=${zone.id}`;
      } else if (pathname.includes('/objects')) {
        // Objects page - filter by zone
        targetPath = `/dashboard/objects?zone=${zone.id}`;
      } else {
        // Default to zone detail page
        targetPath = `/dashboard/zones/${zone.id}`;
      }

      router.push(targetPath);
      setIsOpen(false);
      setSearchQuery('');
    },
    [pathname, router]
  );

  if (!isOpen) return null;

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
          <input
            type='text'
            placeholder='Search zones by name or ID...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full px-4 py-2 text-lg bg-transparent border-none outline-none'
            autoFocus
          />
          <div className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
            <kbd className='px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded'>
              ↑↓
            </kbd>{' '}
            Navigate{' '}
            <kbd className='px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded ml-2'>
              Enter
            </kbd>{' '}
            Select{' '}
            <kbd className='px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded ml-2'>
              Esc
            </kbd>{' '}
            Close
          </div>
        </div>

        {/* Results List */}
        <div className='max-h-96 overflow-y-auto'>
          {loading ? (
            <div className='p-8 text-center text-gray-500 dark:text-gray-400'>
              Loading zones...
            </div>
          ) : error ? (
            <div className='p-8 text-center text-red-500'>
              Failed to load zones. Please try again.
            </div>
          ) : filteredZones.length === 0 ? (
            <div className='p-8 text-center text-gray-500 dark:text-gray-400'>
              No zones found
            </div>
          ) : (
            filteredZones.map((zone, index) => (
              <button
                key={zone.id}
                onClick={() => selectZone(zone)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                    : ''
                }`}
              >
                <div className='font-medium'>{zone.name}</div>
                <div className='text-sm text-gray-500 dark:text-gray-400'>
                  Zone {zone.id}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
