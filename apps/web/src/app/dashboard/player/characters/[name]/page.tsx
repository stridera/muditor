'use client';

import { CharacterDetails } from '@/components/characters/character-details';
import {
  GetMyCharactersDocument,
  type GetMyCharactersQuery,
} from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';

type MyCharactersQueryResult = GetMyCharactersQuery;

export default function PlayerCharacterDetailsPage({
  params,
}: {
  params: { name: string };
}) {
  const router = useRouter();
  const characterName = decodeURIComponent(params.name);

  const { data, loading, error } = useQuery<MyCharactersQueryResult>(
    GetMyCharactersDocument,
    { pollInterval: 30000 }
  );

  const characters = data?.myCharacters || [];
  const character = characters.find(c => c.name === characterName);

  const handleBackToList = () => {
    router.push('/dashboard/player/characters');
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-12'>
        <div className='text-center'>
          <div className='text-muted-foreground mb-2'>
            Loading character details...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading character:', error);
    return (
      <div className='flex items-center justify-center p-12'>
        <div className='text-center'>
          <div className='text-red-600 mb-2'>
            Error loading character details
          </div>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className='flex items-center justify-center p-12'>
        <div className='text-center'>
          <div className='text-muted-foreground mb-2'>
            Character "{characterName}" not found or not accessible.
          </div>
          <button
            onClick={handleBackToList}
            className='text-blue-600 hover:underline'
          >
            Back to My Characters
          </button>
        </div>
      </div>
    );
  }

  return (
    <CharacterDetails characterId={character.id} onBack={handleBackToList} />
  );
}
