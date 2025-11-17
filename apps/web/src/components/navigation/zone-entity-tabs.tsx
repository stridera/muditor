'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Box, Map, ShoppingBag, Users2 } from 'lucide-react';
import { useZoneContext } from '@/hooks/use-zone-context';
import { usePathname } from 'next/navigation';

export function ZoneEntityTabs() {
  const { zoneId, entityType } = useZoneContext();
  const pathname = usePathname();

  // Visual Editor tab - always show (world view when no zone selected)
  const visualEditorTab = {
    id: 'visual-editor',
    label: 'Visual Editor',
    icon: <Map className='h-4 w-4' />,
    href: zoneId
      ? `/dashboard/zones/editor?zone_id=${zoneId}`
      : '/dashboard/zones/editor',
  };

  // Other tabs - only show when zone is selected
  const zoneTabs = zoneId
    ? [
        {
          id: 'rooms',
          label: 'Rooms',
          icon: <Box className='h-4 w-4' />,
          href: `/dashboard/rooms?zone=${zoneId}`,
        },
        {
          id: 'mobs',
          label: 'Mobs',
          icon: <Users2 className='h-4 w-4' />,
          href: `/dashboard/mobs?zone=${zoneId}`,
        },
        {
          id: 'objects',
          label: 'Objects',
          icon: <Box className='h-4 w-4' />,
          href: `/dashboard/objects?zone=${zoneId}`,
        },
        {
          id: 'shops',
          label: 'Shops',
          icon: <ShoppingBag className='h-4 w-4' />,
          href: `/dashboard/shops?zone=${zoneId}`,
        },
      ]
    : [];

  // Combine tabs - Visual Editor always first, then zone-specific tabs
  const tabs = [visualEditorTab, ...zoneTabs];

  return (
    <div className='flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-4'>
      {tabs.map(tab => {
        const isActive =
          (tab.id === 'visual-editor' && pathname.includes('/zones/editor')) ||
          tab.id === entityType;

        return (
          <Link key={tab.id} href={tab.href}>
            <Button
              variant={isActive ? 'default' : 'ghost'}
              size='sm'
              className={`flex items-center gap-2 transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.icon}
              <span className='hidden lg:inline'>{tab.label}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
