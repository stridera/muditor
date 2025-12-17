'use client';

import { AdminCharactersList } from '@/components/characters/admin-characters-list';
import { useRouter } from 'next/navigation';

export default function AdminCharactersPage() {
  const router = useRouter();

  const handleCharacterClick = (characterId: string) => {
    router.push(`/dashboard/admin/characters/${characterId}`);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Character Management</h1>
          <p className='text-muted-foreground'>
            View and manage all characters in the game system
          </p>
        </div>
      </div>

      <AdminCharactersList onCharacterClick={handleCharacterClick} />
    </div>
  );
}
