'use client';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnlineStatus } from './online-status';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  Zap,
  Shield,
  Coins,
  MapPin,
  Clock,
  User,
  Backpack,
  Sparkles,
  TrendingUp,
  Activity,
} from 'lucide-react';

const GET_CHARACTER_DETAILS = gql`
  query GetCharacterDetails($id: ID!) {
    character(id: $id) {
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
      skillPoints
      copper
      silver
      gold
      platinum
      bankCopper
      bankSilver
      bankGold
      bankPlatinum
      description
      title
      currentRoom
      saveRoom
      homeRoom
      hunger
      thirst
      hitRoll
      damageRoll
      armorClass
      playerFlags
      effectFlags
      privilegeFlags
      invisLevel
      birthTime
      items {
        id
        equippedLocation
        condition
        charges
        objectPrototype {
          id
          shortDesc
          type
        }
      }
      effects {
        id
        effectName
        effectType
        duration
        strength
        appliedAt
        expiresAt
      }
    }
  }
`;

const GET_CHARACTER_SESSION_INFO = gql`
  query GetCharacterSessionInfo($characterId: ID!) {
    characterSessionInfo(characterId: $characterId) {
      id
      name
      isOnline
      lastLogin
      totalTimePlayed
      currentSessionTime
    }
  }
`;

interface CharacterDetailsProps {
  characterId: string;
  onBack?: () => void;
}

interface CharacterDetailsQueryResult {
  character: any;
}

interface CharacterSessionInfoQueryResult {
  characterSessionInfo: any;
}

export function CharacterDetails({
  characterId,
  onBack,
}: CharacterDetailsProps) {
  const { data, loading, error } = useQuery<CharacterDetailsQueryResult>(
    GET_CHARACTER_DETAILS,
    {
      variables: { id: characterId },
      pollInterval: 30000,
    }
  );

  const { data: sessionData } = useQuery<CharacterSessionInfoQueryResult>(
    GET_CHARACTER_SESSION_INFO,
    {
      variables: { characterId },
      pollInterval: 5000,
      skip: !data?.character?.isOnline,
    }
  );

  if (loading) {
    return (
      <div className='flex items-center justify-center p-12'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading character details...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.character) {
    return (
      <div className='text-center p-12'>
        <p className='text-muted-foreground mb-4'>
          Failed to load character details
        </p>
        {onBack && <Button onClick={onBack}>← Back to Characters</Button>}
      </div>
    );
  }

  const character = data.character;
  const sessionInfo = sessionData?.characterSessionInfo;

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
      return `${days} days, ${remainingHours} hours`;
    } else if (hours > 0) {
      return `${hours} hours, ${Math.floor((seconds % 3600) / 60)} minutes`;
    } else {
      return `${Math.floor(seconds / 60)} minutes`;
    }
  };

  const formatCurrency = (
    copper: number,
    silver: number,
    gold: number,
    platinum: number
  ) => {
    const parts = [];
    if (platinum > 0) parts.push(`${platinum.toLocaleString()}p`);
    if (gold > 0) parts.push(`${gold.toLocaleString()}g`);
    if (silver > 0) parts.push(`${silver.toLocaleString()}s`);
    if (copper > 0) parts.push(`${copper.toLocaleString()}c`);
    return parts.join(' ') || '0c';
  };

  const getAlignmentText = (alignment: number) => {
    if (alignment > 350) return 'Saintly';
    if (alignment > 200) return 'Good';
    if (alignment > 50) return 'Neutral Good';
    if (alignment > -50) return 'Neutral';
    if (alignment > -200) return 'Neutral Evil';
    if (alignment > -350) return 'Evil';
    return 'Demonic';
  };

  const getAlignmentColor = (alignment: number) => {
    if (alignment > 200) return 'text-blue-600';
    if (alignment > 50) return 'text-green-600';
    if (alignment > -50) return 'text-gray-600';
    if (alignment > -200) return 'text-orange-600';
    return 'text-red-600';
  };

  const equippedItems = character.items.filter(
    (item: any) => item.equippedLocation
  );
  const inventoryItems = character.items.filter(
    (item: any) => !item.equippedLocation
  );
  const activeEffects = character.effects.filter(
    (effect: any) =>
      !effect.expiresAt || new Date(effect.expiresAt) > new Date()
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          {onBack && (
            <Button variant='outline' onClick={onBack}>
              ← Back
            </Button>
          )}
          <div>
            <h1 className='text-2xl font-bold flex items-center gap-2'>
              <User className='h-6 w-6' />
              {character.name}
              <OnlineStatus
                isOnline={character.isOnline}
                lastLogin={character.lastLogin}
              />
            </h1>
            <p className='text-muted-foreground flex items-center gap-2'>
              Level {character.level} {character.raceType}{' '}
              {character.playerClass}
              {character.title && (
                <>
                  <span>•</span>
                  <span className='italic'>"{character.title}"</span>
                </>
              )}
            </p>
          </div>
        </div>
        <Badge variant='outline' className='text-lg px-3 py-1'>
          Level {character.level}
        </Badge>
      </div>

      <Tabs defaultValue='overview' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='stats'>Stats & Skills</TabsTrigger>
          <TabsTrigger value='equipment'>Equipment</TabsTrigger>
          <TabsTrigger value='effects'>Effects</TabsTrigger>
          <TabsTrigger value='wealth'>Wealth</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {/* Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Heart className='h-4 w-4 text-red-500' />
                    <span>Health</span>
                  </div>
                  <span className='font-mono'>
                    {character.hitPoints}/{character.hitPointsMax}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Zap className='h-4 w-4 text-blue-500' />
                    <span>Movement</span>
                  </div>
                  <span className='font-mono'>
                    {character.movement}/{character.movementMax}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Shield className='h-4 w-4 text-gray-500' />
                    <span>Armor Class</span>
                  </div>
                  <span className='font-mono'>{character.armorClass}</span>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='h-5 w-5' />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {character.currentRoom && (
                  <div className='flex items-center justify-between'>
                    <span>Current Room</span>
                    <span className='font-mono'>#{character.currentRoom}</span>
                  </div>
                )}
                {character.saveRoom && (
                  <div className='flex items-center justify-between'>
                    <span>Save Room</span>
                    <span className='font-mono'>#{character.saveRoom}</span>
                  </div>
                )}
                {character.homeRoom && (
                  <div className='flex items-center justify-between'>
                    <span>Home Room</span>
                    <span className='font-mono'>#{character.homeRoom}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Clock className='h-5 w-5' />
                  Session Info
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span>Total Played</span>
                  <span>{formatPlayTime(character.timePlayed)}</span>
                </div>
                {sessionInfo && character.isOnline && (
                  <div className='flex items-center justify-between'>
                    <span>Current Session</span>
                    <span>
                      {formatPlayTime(sessionInfo.currentSessionTime)}
                    </span>
                  </div>
                )}
                {character.lastLogin && (
                  <div className='flex items-center justify-between'>
                    <span>Last Login</span>
                    <span>
                      {formatDistanceToNow(new Date(character.lastLogin), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}
                <div className='flex items-center justify-between'>
                  <span>Created</span>
                  <span>
                    {formatDistanceToNow(new Date(character.birthTime), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Character Description */}
          {character.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm leading-relaxed'>
                  {character.description}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='stats' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Core Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Core Attributes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex justify-between p-2 rounded hover:bg-gray-50'>
                    <span>Strength</span>
                    <span className='font-mono'>{character.strength}</span>
                  </div>
                  <div className='flex justify-between p-2 rounded hover:bg-gray-50'>
                    <span>Intelligence</span>
                    <span className='font-mono'>{character.intelligence}</span>
                  </div>
                  <div className='flex justify-between p-2 rounded hover:bg-gray-50'>
                    <span>Wisdom</span>
                    <span className='font-mono'>{character.wisdom}</span>
                  </div>
                  <div className='flex justify-between p-2 rounded hover:bg-gray-50'>
                    <span>Dexterity</span>
                    <span className='font-mono'>{character.dexterity}</span>
                  </div>
                  <div className='flex justify-between p-2 rounded hover:bg-gray-50'>
                    <span>Constitution</span>
                    <span className='font-mono'>{character.constitution}</span>
                  </div>
                  <div className='flex justify-between p-2 rounded hover:bg-gray-50'>
                    <span>Charisma</span>
                    <span className='font-mono'>{character.charisma}</span>
                  </div>
                  <div className='flex justify-between p-2 rounded hover:bg-gray-50'>
                    <span>Luck</span>
                    <span className='font-mono'>{character.luck}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Combat & Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Combat & Progress</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex justify-between'>
                  <span>Hit Roll</span>
                  <span className='font-mono'>+{character.hitRoll}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Damage Roll</span>
                  <span className='font-mono'>+{character.damageRoll}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Experience</span>
                  <span className='font-mono'>
                    {character.experience.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Skill Points</span>
                  <span className='font-mono'>
                    {character.skillPoints.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span>Alignment</span>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`${getAlignmentColor(character.alignment)}`}
                    >
                      {getAlignmentText(character.alignment)}
                    </span>
                    <span className='font-mono text-muted-foreground'>
                      ({character.alignment})
                    </span>
                  </div>
                </div>
                <div className='flex justify-between'>
                  <span>Hunger</span>
                  <span className='font-mono'>{character.hunger}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Thirst</span>
                  <span className='font-mono'>{character.thirst}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='equipment' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Equipped Items */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Shield className='h-5 w-5' />
                  Equipped Items ({equippedItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {equippedItems.length > 0 ? (
                  <div className='space-y-3'>
                    {equippedItems.map((item: any) => (
                      <div
                        key={item.id}
                        className='flex items-center justify-between p-2 border rounded'
                      >
                        <div className='flex-1'>
                          <div className='font-medium'>
                            {item.objectPrototype.shortDesc}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {item.equippedLocation} • Condition:{' '}
                            {item.condition}%
                          </div>
                        </div>
                        {item.charges > 0 && (
                          <Badge variant='secondary'>
                            {item.charges} charges
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-muted-foreground text-center py-4'>
                    No equipped items
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Backpack className='h-5 w-5' />
                  Inventory ({inventoryItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inventoryItems.length > 0 ? (
                  <div className='space-y-3'>
                    {inventoryItems.map((item: any) => (
                      <div
                        key={item.id}
                        className='flex items-center justify-between p-2 border rounded'
                      >
                        <div className='flex-1'>
                          <div className='font-medium'>
                            {item.objectPrototype.shortDesc}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            Condition: {item.condition}%
                          </div>
                        </div>
                        {item.charges > 0 && (
                          <Badge variant='secondary'>
                            {item.charges} charges
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-muted-foreground text-center py-4'>
                    No inventory items
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='effects' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5' />
                Active Effects ({activeEffects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeEffects.length > 0 ? (
                <div className='space-y-3'>
                  {activeEffects.map((effect: any) => (
                    <div
                      key={effect.id}
                      className='flex items-center justify-between p-3 border rounded'
                    >
                      <div className='flex-1'>
                        <div className='font-medium'>{effect.effectName}</div>
                        <div className='text-sm text-muted-foreground'>
                          Strength: {effect.strength}
                          {effect.effectType && ` • Type: ${effect.effectType}`}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          Applied{' '}
                          {formatDistanceToNow(new Date(effect.appliedAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                      <div className='text-right'>
                        {effect.expiresAt ? (
                          <div className='text-sm'>
                            Expires{' '}
                            {formatDistanceToNow(new Date(effect.expiresAt), {
                              addSuffix: true,
                            })}
                          </div>
                        ) : (
                          <Badge variant='secondary'>Permanent</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground text-center py-4'>
                  No active effects
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='wealth' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Carried Wealth */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Coins className='h-5 w-5 text-yellow-500' />
                  Carried Wealth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex justify-between text-lg'>
                    <span>Total</span>
                    <span className='font-mono'>
                      {formatCurrency(
                        character.copper,
                        character.silver,
                        character.gold,
                        character.platinum
                      )}
                    </span>
                  </div>
                  <div className='border-t pt-3 space-y-2'>
                    <div className='flex justify-between'>
                      <span>Platinum</span>
                      <span className='font-mono'>
                        {character.platinum.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Gold</span>
                      <span className='font-mono'>
                        {character.gold.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Silver</span>
                      <span className='font-mono'>
                        {character.silver.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Copper</span>
                      <span className='font-mono'>
                        {character.copper.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banked Wealth */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5 text-green-500' />
                  Banked Wealth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex justify-between text-lg'>
                    <span>Total</span>
                    <span className='font-mono'>
                      {formatCurrency(
                        character.bankCopper,
                        character.bankSilver,
                        character.bankGold,
                        character.bankPlatinum
                      )}
                    </span>
                  </div>
                  <div className='border-t pt-3 space-y-2'>
                    <div className='flex justify-between'>
                      <span>Platinum</span>
                      <span className='font-mono'>
                        {character.bankPlatinum.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Gold</span>
                      <span className='font-mono'>
                        {character.bankGold.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Silver</span>
                      <span className='font-mono'>
                        {character.bankSilver.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Copper</span>
                      <span className='font-mono'>
                        {character.bankCopper.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
