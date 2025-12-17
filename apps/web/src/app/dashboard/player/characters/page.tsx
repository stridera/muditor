'use client';

import { CharacterCard } from '@/components/characters/character-card';
import { CharacterCreationForm } from '@/components/characters/character-creation-form';
import { CharacterLinkingForm } from '@/components/characters/character-linking-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GetMyCharactersDocument,
  type GetMyCharactersQuery,
} from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';
import { Gamepad2, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type MyCharactersQueryResult = GetMyCharactersQuery;

export default function PlayerCharactersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my-characters');
  const { data, loading, error, refetch } = useQuery<MyCharactersQueryResult>(
    GetMyCharactersDocument,
    { pollInterval: 30000 }
  );

  const characters = data?.myCharacters || [];

  const handleCharacterLinked = () => {
    refetch();
  };

  const handleCharacterClick = (characterId: string) => {
    // Find the character name for the URL
    const character = characters.find(c => c.id === characterId);
    if (character) {
      router.push(
        `/dashboard/player/characters/${encodeURIComponent(character.name)}`
      );
    }
  };

  if (error) {
    console.error('Error loading characters:', error);
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>My Characters</h1>
          <p className='text-muted-foreground'>
            Manage your game characters and link existing ones to your account
          </p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => setActiveTab('create-character')}>
            <Plus className='h-4 w-4 mr-2' />
            Create Character
          </Button>
          <Button
            variant='outline'
            onClick={() => setActiveTab('link-character')}
          >
            <Users className='h-4 w-4 mr-2' />
            Link Character
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger
            value='my-characters'
            className='flex items-center gap-2'
          >
            <Gamepad2 className='h-4 w-4' />
            My Characters ({characters.length})
          </TabsTrigger>
          <TabsTrigger
            value='create-character'
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Create Character
          </TabsTrigger>
          <TabsTrigger
            value='link-character'
            className='flex items-center gap-2'
          >
            <Users className='h-4 w-4' />
            Link Character
          </TabsTrigger>
        </TabsList>

        <TabsContent value='my-characters' className='space-y-6'>
          {loading && characters.length === 0 ? (
            <div className='flex items-center justify-center p-12'>
              <div className='text-center'>
                <div className='text-muted-foreground mb-2'>
                  Loading characters...
                </div>
              </div>
            </div>
          ) : characters.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Gamepad2 className='h-5 w-5' />
                  No Characters Found
                </CardTitle>
                <CardDescription>
                  You don't have any characters linked to your account yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-center py-6'>
                  <p className='text-muted-foreground mb-4'>
                    Create a new character or link your existing game characters
                    to manage them through this interface.
                  </p>
                  <div className='flex gap-2 justify-center'>
                    <Button onClick={() => setActiveTab('create-character')}>
                      Create New Character
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => setActiveTab('link-character')}
                    >
                      Link Existing Character
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-medium'>
                  Your Characters ({characters.length})
                </h3>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    onClick={() => setActiveTab('create-character')}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Character
                  </Button>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {characters.map(character => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    showFullDetails={true}
                    onCharacterClick={handleCharacterClick}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value='create-character' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Plus className='h-5 w-5' />
                Create New Character
              </CardTitle>
              <CardDescription>
                Create a brand new character with custom stats and appearance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CharacterCreationForm
                onCharacterCreated={handleCharacterLinked}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='link-character' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5' />
                Link Existing Character
              </CardTitle>
              <CardDescription>
                Connect an existing game character to your account to manage it
                here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CharacterLinkingForm onCharacterLinked={handleCharacterLinked} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
