'use client';

import { CharacterDetails } from '@/components/characters/character-details';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function AdminCharacterDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: characterId } = use(params);
  const router = useRouter();

  const handleBackToList = () => {
    router.push('/dashboard/admin/characters');
  };

  return (
    <CharacterDetails characterId={characterId} onBack={handleBackToList} />
  );
}
