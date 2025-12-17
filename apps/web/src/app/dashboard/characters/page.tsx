'use client';

import { usePermissions } from '@/hooks/use-permissions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Legacy character page - redirects to new routes based on user permissions
 *
 * Redirect Logic:
 * - Players → /dashboard/player/characters
 * - Admin (Immortal+) → /dashboard/admin/characters
 *
 * This maintains backward compatibility for old bookmarks/links
 */
export default function CharactersRedirectPage() {
  const router = useRouter();
  const { isImmortal } = usePermissions();

  useEffect(() => {
    // Redirect based on user role
    if (isImmortal) {
      router.replace('/dashboard/admin/characters');
    } else {
      router.replace('/dashboard/player/characters');
    }
  }, [isImmortal, router]);

  return (
    <div className='flex items-center justify-center p-12'>
      <div className='text-center'>
        <div className='text-muted-foreground mb-2'>Redirecting...</div>
      </div>
    </div>
  );
}
