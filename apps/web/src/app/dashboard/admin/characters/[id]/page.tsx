'use client';

import { CharacterDetails } from '@/components/characters/character-details';
import { useRouter } from 'next/navigation';

export default function AdminCharacterDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const characterId = params.id;

  const handleBackToList = () => {
    router.push('/dashboard/admin/characters');
  };

  return (
    <CharacterDetails characterId={characterId} onBack={handleBackToList} />
  );
}
