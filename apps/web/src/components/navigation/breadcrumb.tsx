'use client';

import Link from 'next/link';
import { ChevronDown, ChevronRight, Home, Map, X } from 'lucide-react';
import { useZoneContext } from '@/hooks/use-zone-context';
import { useZonesForSelector } from '@/hooks/use-zones-for-selector';
import { useZone } from '@/contexts/zone-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const GET_CHARACTER_NAME = gql`
  query GetCharacterNameForBreadcrumb($id: ID!) {
    character(id: $id) {
      id
      name
    }
  }
`;

interface CharacterNameQueryResult {
  character: {
    id: string;
    name: string;
  } | null;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

// Pages that support zone filtering
const ZONE_FILTERABLE_PAGES = [
  '/dashboard/rooms',
  '/dashboard/mobs',
  '/dashboard/objects',
  '/dashboard/shops',
];

function ZonePicker() {
  const { zoneId, isInZoneContext } = useZoneContext();
  const { setSelectedZone } = useZone();
  const { zones, loading } = useZonesForSelector();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const filteredZones = useMemo(() => {
    if (!search) return zones;
    const q = search.toLowerCase();
    return zones.filter(
      z => z.name.toLowerCase().includes(q) || z.id.toString().includes(q)
    );
  }, [zones, search]);

  const getEntityPath = () => {
    for (const page of ZONE_FILTERABLE_PAGES) {
      if (pathname.startsWith(page)) return page;
    }
    return pathname;
  };

  const handleSelectZone = (zId: number) => {
    setSelectedZone(zId);
    setOpen(false);
    setSearch('');
    router.push(`${getEntityPath()}?zone=${zId}`);
  };

  const handleClearZone = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedZone(null);
    setOpen(false);
    setSearch('');
    router.push(getEntityPath());
  };

  const currentZoneName = useMemo(() => {
    if (!zoneId) return null;
    const zone = zones.find(z => z.id === zoneId);
    return zone ? zone.name : `Zone ${zoneId}`;
  }, [zoneId, zones]);

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-colors ${
          isInZoneContext
            ? 'text-primary font-medium hover:bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
      >
        <Map className='h-3.5 w-3.5' />
        {isInZoneContext ? (
          <>
            <span className='max-w-[160px] truncate'>
              Zone {zoneId}: {currentZoneName}
            </span>
            <button
              onClick={handleClearZone}
              className='ml-0.5 p-0.5 rounded hover:bg-accent'
              title='Clear zone filter'
            >
              <X className='h-3 w-3' />
            </button>
          </>
        ) : (
          <>
            <span>All Zones</span>
            <ChevronDown className='h-3 w-3' />
          </>
        )}
      </button>

      {open && (
        <div className='absolute top-full left-0 mt-1 w-72 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in'>
          {/* Search */}
          <div className='p-2 border-b border-border'>
            <input
              ref={inputRef}
              type='text'
              placeholder='Search zones...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-full px-2.5 py-1.5 text-sm bg-muted rounded-md border-none outline-none placeholder:text-muted-foreground/60'
            />
          </div>

          {/* "All zones" option */}
          <div className='max-h-64 overflow-y-auto'>
            {isInZoneContext && (
              <button
                onClick={() => {
                  handleClearZone({
                    stopPropagation: () => {},
                  } as React.MouseEvent);
                }}
                className='w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors text-muted-foreground'
              >
                Show all (no zone filter)
              </button>
            )}

            {loading ? (
              <div className='px-3 py-4 text-sm text-muted-foreground text-center'>
                Loading zones...
              </div>
            ) : filteredZones.length === 0 ? (
              <div className='px-3 py-4 text-sm text-muted-foreground text-center'>
                No zones found
              </div>
            ) : (
              filteredZones.map(zone => (
                <button
                  key={zone.id}
                  onClick={() => handleSelectZone(zone.id)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between ${
                    zone.id === zoneId
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground'
                  }`}
                >
                  <span className='truncate'>{zone.name}</span>
                  <span className='text-xs text-muted-foreground ml-2 flex-shrink-0'>
                    #{zone.id}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Breadcrumb({ items: customItems }: BreadcrumbProps) {
  const { zoneId, isInZoneContext } = useZoneContext();
  const { setSelectedZone } = useZone();
  const router = useRouter();
  const pathname = usePathname();

  // Extract character ID from admin path if present
  const adminCharacterMatch = pathname.match(
    /\/dashboard\/admin\/characters\/([^/]+)$/
  );
  const characterId = adminCharacterMatch ? adminCharacterMatch[1] : null;

  // Fetch character name for admin pages
  const { data: characterData } = useQuery<CharacterNameQueryResult>(
    GET_CHARACTER_NAME,
    {
      variables: { id: characterId },
      skip: !characterId,
    }
  );

  // Read view mode from localStorage (same as Navigation component)
  const [viewMode, setViewMode] = useState<'player' | 'admin'>('admin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('muditor-view-preference');
      setViewMode((saved as 'player' | 'admin') || 'admin');
    }
  }, []);

  // Determine if we're on a zone-filterable page
  const isZoneFilterablePage = ZONE_FILTERABLE_PAGES.some(page =>
    pathname.startsWith(page)
  );

  // Auto-generate breadcrumbs based on current path and zone context if not provided
  const items: BreadcrumbItem[] =
    customItems ||
    (() => {
      const breadcrumbs: BreadcrumbItem[] = [
        {
          label: 'Dashboard',
          href: '/dashboard',
          icon: <Home className='h-4 w-4' />,
        },
      ];

      // Game Systems pages
      if (pathname.startsWith('/dashboard/classes')) {
        breadcrumbs.push({ label: 'Game Systems', href: '/dashboard' });
        breadcrumbs.push({ label: 'Classes', href: '/dashboard/classes' });
      } else if (pathname.startsWith('/dashboard/races')) {
        breadcrumbs.push({ label: 'Game Systems', href: '/dashboard' });
        breadcrumbs.push({ label: 'Races', href: '/dashboard/races' });
      } else if (pathname.startsWith('/dashboard/abilities')) {
        breadcrumbs.push({ label: 'Game Systems', href: '/dashboard' });
        breadcrumbs.push({ label: 'Abilities', href: '/dashboard/abilities' });
      }
      // Player character pages
      else if (pathname.startsWith('/dashboard/player/characters')) {
        breadcrumbs.push({
          label: 'My Characters',
          href: '/dashboard/player/characters',
        });

        // Check for individual character name in path
        const characterMatch = pathname.match(
          /\/dashboard\/player\/characters\/([^/]+)$/
        );
        if (characterMatch && characterMatch[1]) {
          const characterName = decodeURIComponent(characterMatch[1]);
          breadcrumbs.push({ label: characterName });
        }
      }
      // Admin character pages
      else if (pathname.startsWith('/dashboard/admin/characters')) {
        breadcrumbs.push({
          label: 'All Characters',
          href: '/dashboard/admin/characters',
        });

        // Check for individual character ID in path
        if (characterId) {
          const characterName = characterData?.character?.name || 'Loading...';
          breadcrumbs.push({ label: characterName });
        }
      }
      // Legacy characters page (for backward compatibility)
      else if (pathname.startsWith('/dashboard/characters')) {
        const label =
          viewMode === 'player' ? 'My Characters' : 'All Characters';
        breadcrumbs.push({ label, href: '/dashboard/characters' });
      }
      // Admin pages
      else if (pathname.startsWith('/dashboard/users')) {
        breadcrumbs.push({
          label: 'User Management',
          href: '/dashboard/users',
        });
      }
      // Zone context paths (when zone is selected via zone detail, not entity pages)
      else if (isInZoneContext && zoneId && !isZoneFilterablePage) {
        breadcrumbs.push({ label: 'Zones', href: '/dashboard/zones' });
        breadcrumbs.push({
          label: `Zone ${zoneId}`,
          href: `/dashboard/zones/${zoneId}`,
        });
      }
      // Zone-filterable entity pages — the zone picker handles zone display
      else if (pathname.startsWith('/dashboard/rooms')) {
        breadcrumbs.push({ label: 'Rooms', href: '/dashboard/rooms' });
      } else if (pathname.startsWith('/dashboard/mobs')) {
        breadcrumbs.push({ label: 'Mobs', href: '/dashboard/mobs' });
      } else if (pathname.startsWith('/dashboard/objects')) {
        breadcrumbs.push({ label: 'Objects', href: '/dashboard/objects' });
      } else if (pathname.startsWith('/dashboard/shops')) {
        breadcrumbs.push({ label: 'Shops', href: '/dashboard/shops' });
      }
      // Other world building pages
      else if (pathname.startsWith('/dashboard/zones')) {
        breadcrumbs.push({ label: 'Zones', href: '/dashboard/zones' });
      } else if (pathname.startsWith('/dashboard/scripts')) {
        breadcrumbs.push({ label: 'Scripts', href: '/dashboard/scripts' });
      }

      return breadcrumbs;
    })();

  return (
    <nav className='flex items-center gap-2 text-sm text-muted-foreground'>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isZoneItem =
          item.label.startsWith('Zone ') &&
          isInZoneContext &&
          !isZoneFilterablePage;

        return (
          <div key={index} className='flex items-center gap-2'>
            {index > 0 && (
              <ChevronRight className='h-4 w-4 text-muted-foreground/50' />
            )}

            <div className='flex items-center gap-1'>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`flex items-center gap-1.5 transition-colors ${
                    isLast && !isZoneFilterablePage
                      ? 'font-medium text-foreground'
                      : 'hover:text-primary'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <div className='flex items-center gap-1.5 font-medium text-foreground'>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              )}

              {/* Add X button for zone breadcrumb item (non-entity pages) */}
              {isZoneItem && (
                <button
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedZone(null);
                    if (pathname.includes('/mobs'))
                      router.push('/dashboard/mobs');
                    else if (pathname.includes('/objects'))
                      router.push('/dashboard/objects');
                    else router.push('/dashboard/zones');
                  }}
                  className='ml-1 p-0.5 rounded hover:bg-accent transition-colors'
                  title='View all zones'
                  aria-label='Clear zone filter'
                >
                  <X className='h-3 w-3' />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Zone picker for entity pages */}
      {isZoneFilterablePage && (
        <>
          <ChevronRight className='h-4 w-4 text-muted-foreground/50' />
          <ZonePicker />
        </>
      )}
    </nav>
  );
}
