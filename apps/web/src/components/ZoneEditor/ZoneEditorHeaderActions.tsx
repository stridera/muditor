'use client';

import { usePermissions } from '@/hooks/use-permissions';
import Link from 'next/link';

const linkClass =
  'text-sm px-3 py-1 rounded transition-colors text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
const createClass =
  'text-sm px-3 py-1 rounded transition-colors text-white bg-green-600 hover:bg-green-700';

/** Zone-scoped create targets: the standalone editors pre-fill from `?zone=`. */
export const CREATE_ENTITY_LINKS = [
  { key: 'mob', label: 'Mob', href: '/dashboard/mobs/editor' },
  { key: 'object', label: 'Object', href: '/dashboard/objects/editor' },
  { key: 'shop', label: 'Shop', href: '/dashboard/shops/editor' },
] as const;

interface ZoneEditorHeaderActionsProps {
  /** Selected zone, or null on the world map. */
  zoneId: number | null;
  /**
   * Open the new-room dialog. The editor owns the dialog so it can place the
   * new room on the canvas and select it.
   */
  onAddRoom: () => void;
}

/**
 * Right-hand header actions of the visual zone editor: a clear way back to the
 * zone page, create actions for room / mob / object / shop, and the zone list.
 */
export function ZoneEditorHeaderActions({
  zoneId,
  onAddRoom,
}: ZoneEditorHeaderActionsProps) {
  const { canEditZone } = usePermissions();
  const canCreate = zoneId != null && canEditZone(zoneId);

  return (
    <div className='flex items-center gap-3'>
      {zoneId != null && (
        <Link
          href={`/dashboard/zones/${zoneId}`}
          className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors'
          title='Leave the visual editor and go back to the zone page'
        >
          ← Back to zone {zoneId}
        </Link>
      )}
      {canCreate && (
        <div
          className='flex items-center gap-2'
          role='group'
          aria-label='Create in this zone'
        >
          <span className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Create
          </span>
          <button type='button' className={createClass} onClick={onAddRoom}>
            + Room
          </button>
          {CREATE_ENTITY_LINKS.map(link => (
            <Link
              key={link.key}
              href={`${link.href}?zone=${zoneId}`}
              className={createClass}
            >
              + {link.label}
            </Link>
          ))}
        </div>
      )}
      <Link href='/dashboard/zones' className={linkClass}>
        📋 All Zones
      </Link>
    </div>
  );
}
