'use client';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { DualInterface } from '@/components/dashboard/dual-interface';
import { CharacterCard } from '@/components/characters/character-card';
import { CharacterLinkingForm } from '@/components/characters/character-linking-form';
import { CharacterCreationForm } from '@/components/characters/character-creation-form';
import { CharacterDetails } from '@/components/characters/character-details';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Gamepad2 } from 'lucide-react';
import { useState } from 'react';

const GET_MY_CHARACTERS = gql`
  query GetMyCharacters {
    myCharacters {
      id
      name
      level
      raceType
      playerClass
      lastLogin
      isOnline
      timePlayed
      hitPoints
      hitPointsMax
      movement
      movementMax
      alignment
      strength
      intelligence
      wisdom
      dexterity
      constitution
      charisma
      luck
      experience
      copper
      silver
      gold
      platinum
      description
      title
      currentRoom
    }
  }
`;

interface Character {
  id: string;
  name: string;
  level: number;
  raceType?: string;
  playerClass?: string;
  lastLogin?: Date;
  isOnline: boolean;
  timePlayed: number;
  hitPoints: number;
  hitPointsMax: number;
  movement: number;
  movementMax: number;
  alignment: number;
  strength: number;
  intelligence: number;
  wisdom: number;
  dexterity: number;
  constitution: number;
  charisma: number;
  luck: number;
  experience: number;
  copper: number;
  silver: number;
  gold: number;
  platinum: number;
  description?: string;
  title?: string;
  currentRoom?: number;
}

interface MyCharactersQueryResult {
  myCharacters: Character[];
}

export default function CharactersPage() {
  const [activeTab, setActiveTab] = useState('my-characters');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    null
  );
  const { data, loading, error, refetch } = useQuery<MyCharactersQueryResult>(
    GET_MY_CHARACTERS,
    {
      pollInterval: 30000, // Poll every 30 seconds for updates
    }
  );

  const characters = data?.myCharacters || [];

  const handleCharacterLinked = () => {
    refetch();
  };

  const handleCharacterClick = (characterId: string) => {
    setSelectedCharacterId(characterId);
  };

  const handleBackToList = () => {
    setSelectedCharacterId(null);
  };

  if (error) {
    console.error('Error loading characters:', error);
  }

  // If a character is selected, show the details view
  if (selectedCharacterId) {
    return (
      <DualInterface
        title='Character Details'
        description='Detailed character information and management'
        playerView={
          <CharacterDetails
            characterId={selectedCharacterId}
            onBack={handleBackToList}
          />
        }
        adminView={
          <CharacterDetails
            characterId={selectedCharacterId}
            onBack={handleBackToList}
          />
        }
      >
        <div></div>
      </DualInterface>
    );
  }

  const playerView = (
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
                  <div className='flex gap-2'>
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

  // Admin view shows all characters in the system
  const adminView = (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Character Management</h1>
          <p className='text-muted-foreground'>
            View and manage all characters in the game system
          </p>
        </div>
      </div>

      {/* Admin character management would go here */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            System Characters
          </CardTitle>
          <CardDescription>
            Advanced character management features for administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>
              Advanced admin character management features coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DualInterface
      title='Characters'
      description='Character management and linking system'
      playerView={playerView}
      adminView={adminView}
    >
      <div></div>
    </DualInterface>
  );
}
