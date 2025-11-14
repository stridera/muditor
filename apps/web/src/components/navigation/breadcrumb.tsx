'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useZoneContext } from '@/hooks/use-zone-context';

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

  // Auto-generate breadcrumbs based on zone context if not provided
  const items: BreadcrumbItem[] = customItems || (() => {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard', icon: <Home className="h-4 w-4" /> },
    ];

    if (isInZoneContext && zoneId) {
      // Add "Zones" link to zone list
      breadcrumbs.push({ label: 'Zones', href: '/dashboard/zones' });

      // Add specific zone
      breadcrumbs.push({
        label: `Zone ${zoneId}`,
        href: `/dashboard/zones/${zoneId}`
      });

      // Don't add entity type to breadcrumbs since it's already shown in the tabs
      // The tabs provide the same navigation information in a more visual way
    }

    return breadcrumbs;
  })();

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600" />
            )}

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
              <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-100">
                {item.icon}
                <span>{item.label}</span>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
