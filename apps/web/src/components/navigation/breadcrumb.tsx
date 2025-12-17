'use client';

import Link from 'next/link';
import { ChevronRight, Home, X } from 'lucide-react';
import { useZoneContext } from '@/hooks/use-zone-context';
import { useZone } from '@/contexts/zone-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
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
  const { data: characterData } = useQuery(GET_CHARACTER_NAME, {
    variables: { id: characterId },
    skip: !characterId,
  });

  // Read view mode from localStorage (same as Navigation component)
  const [viewMode, setViewMode] = useState<'player' | 'admin'>('admin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('muditor-view-preference');
      setViewMode((saved as 'player' | 'admin') || 'admin');
    }
  }, []);

  // Handle clearing zone context
  const handleClearZone = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear zone from context (this also clears localStorage)
    setSelectedZone(null);

    // Determine where to navigate based on current path
    if (pathname.includes('/mobs')) {
      router.push('/dashboard/mobs');
    } else if (pathname.includes('/objects')) {
      router.push('/dashboard/objects');
    } else {
      router.push('/dashboard/zones');
    }
  };

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
        if (characterMatch) {
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
      // Zone context paths
      else if (isInZoneContext && zoneId) {
        // Add "Zones" link to zone list
        breadcrumbs.push({ label: 'Zones', href: '/dashboard/zones' });

        // Add specific zone (will have X button added in render)
        breadcrumbs.push({
          label: `Zone ${zoneId}`,
          href: `/dashboard/zones/${zoneId}`,
        });

        // Don't add entity type to breadcrumbs since it's already shown in the tabs
        // The tabs provide the same navigation information in a more visual way
      }
      // Other world building pages
      else if (pathname.startsWith('/dashboard/zones')) {
        breadcrumbs.push({ label: 'Zones', href: '/dashboard/zones' });
      } else if (pathname.startsWith('/dashboard/rooms')) {
        breadcrumbs.push({ label: 'Rooms', href: '/dashboard/rooms' });
      } else if (pathname.startsWith('/dashboard/mobs')) {
        breadcrumbs.push({ label: 'Mobs', href: '/dashboard/mobs' });
      } else if (pathname.startsWith('/dashboard/objects')) {
        breadcrumbs.push({ label: 'Objects', href: '/dashboard/objects' });
      } else if (pathname.startsWith('/dashboard/shops')) {
        breadcrumbs.push({ label: 'Shops', href: '/dashboard/shops' });
      } else if (pathname.startsWith('/dashboard/scripts')) {
        breadcrumbs.push({ label: 'Scripts', href: '/dashboard/scripts' });
      }

      return breadcrumbs;
    })();

  return (
    <nav className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isZoneItem = item.label.startsWith('Zone ') && isInZoneContext;

        return (
          <div key={index} className='flex items-center gap-2'>
            {index > 0 && (
              <ChevronRight className='h-4 w-4 text-gray-400 dark:text-gray-600' />
            )}

            <div className='flex items-center gap-1'>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`flex items-center gap-1.5 transition-colors ${
                    isLast
                      ? 'font-medium text-gray-900 dark:text-gray-100'
                      : 'hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <div className='flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-100'>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              )}

              {/* Add X button for zone breadcrumb item */}
              {isZoneItem && (
                <button
                  onClick={handleClearZone}
                  className='ml-1 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
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
    </nav>
  );
}
