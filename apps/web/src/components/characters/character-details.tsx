'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { formatDistanceToNow } from 'date-fns';
import { formatRace, formatClass } from '@/lib/utils';
import {
  Activity,
  Backpack,
  Clock,
  Coins,
  Edit,
  Heart,
  MapPin,
  Shield,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { CharacterDeleteDialog } from './character-delete-dialog';
import { CharacterEditForm } from './character-edit-form';
import { OnlineStatus } from './online-status';
import { ColoredText } from '@/lib/color-codes';
import { CharacterSessionInfo } from './character-session-info';

const GET_CHARACTER_DETAILS = gql`
  query GetCharacterDetailsInline($id: ID!) {
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
      characterItems {
        id
        equippedLocation
        condition
        charges
        objects {
          id
          zoneId
          name
          type
          examineDescription
          weight
          cost
          level
          values
          flags
          effectFlags
          wearFlags
          objectAffects {
            location
            modifier
          }
        }
      }
      characterEffects {
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

interface CharacterDetailsProps {
  characterId: string;
  onBack?: () => void;
}

interface CharacterDetailsQueryResult {
  character: any;
}

export function CharacterDetails({
  characterId,
  onBack,
}: CharacterDetailsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data, loading, error, refetch } =
    useQuery<CharacterDetailsQueryResult>(GET_CHARACTER_DETAILS, {
      variables: { id: characterId },
    });

  const handleCharacterUpdated = () => {
    setEditDialogOpen(false);
    refetch();
  };

  const handleCharacterDeleted = () => {
    setDeleteDialogOpen(false);
    if (onBack) {
      onBack();
    }
  };

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

  const equippedItems = (character.characterItems || []).filter(
    (item: any) => item.equippedLocation
  );

  // Group inventory items by object ID and name
  const inventoryItems = (character.characterItems || []).filter(
    (item: any) => !item.equippedLocation
  );

  const groupedInventory = inventoryItems.reduce((acc: any[], item: any) => {
    const key = `${item.objects.zoneId}-${item.objects.id}`;
    const existing = acc.find(g => g.key === key);

    if (existing) {
      existing.quantity += 1;
      existing.items.push(item);
    } else {
      acc.push({
        key,
        quantity: 1,
        items: [item],
        objects: item.objects,
        // Use best condition from the stack
        condition: item.condition,
        charges: item.charges,
      });
    }

    return acc;
  }, []);
  const activeEffects = (character.characterEffects || []).filter(
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
              Level {character.level}
              {character.raceType && ` ${formatRace(character.raceType)}`}
              {character.playerClass &&
                ` ${formatClass(character.playerClass)}`}
              {character.title && (
                <>
                  <span className='ml-2'>•</span>
                  <span className='italic'>"{character.title}"</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => setEditDialogOpen(true)}
            disabled={character.isOnline}
          >
            <Edit className='h-4 w-4 mr-2' />
            Edit Character
          </Button>
          <Button
            variant='destructive'
            onClick={() => setDeleteDialogOpen(true)}
            disabled={character.isOnline}
          >
            <Trash2 className='h-4 w-4 mr-2' />
            Delete
          </Button>
          <Badge variant='outline' className='text-lg px-3 py-1'>
            Level {character.level}
          </Badge>
        </div>
      </div>

      {character.isOnline && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800'>
          ⚠️ This character is currently online. You cannot edit or delete while
          the character is in the game.
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
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
            <CharacterSessionInfo
              characterId={character.id}
              isOnline={character.isOnline}
            />
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
                        className='flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-accent transition-colors'
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className='flex-1'>
                          <div className='font-medium'>
                            <ColoredText text={item.objects.name} />
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
                  Inventory ({inventoryItems.length} items,{' '}
                  {groupedInventory.length} unique)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupedInventory.length > 0 ? (
                  <div className='space-y-3'>
                    {groupedInventory.map((group: any) => (
                      <div
                        key={group.key}
                        className='flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-accent transition-colors'
                        onClick={() => setSelectedItem(group.items[0])}
                      >
                        <div className='flex-1'>
                          <div className='font-medium'>
                            <ColoredText text={group.objects.name} />
                            {group.quantity > 1 && (
                              <span className='ml-2 text-sm text-muted-foreground'>
                                × {group.quantity}
                              </span>
                            )}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            Condition: {group.condition}%
                          </div>
                        </div>
                        {group.charges > 0 && (
                          <Badge variant='secondary'>
                            {group.charges} charges
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Character: {character.name}</DialogTitle>
            <DialogDescription>
              Update your character's stats, appearance, and other details.
            </DialogDescription>
          </DialogHeader>
          <CharacterEditForm
            character={character}
            onCharacterUpdated={handleCharacterUpdated}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <CharacterDeleteDialog
        characterId={character.id}
        characterName={character.name}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onCharacterDeleted={handleCharacterDeleted}
      />

      {/* Item Detail Dialog */}
      {selectedItem && (
        <Dialog
          open={!!selectedItem}
          onOpenChange={() => setSelectedItem(null)}
        >
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>
                <ColoredText text={selectedItem.objects.name} />
              </DialogTitle>
              <DialogDescription>
                {selectedItem.objects.type}
                {selectedItem.objects.level
                  ? ` • Level ${selectedItem.objects.level}`
                  : ''}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              {/* Description */}
              {selectedItem.objects.examineDescription && (
                <div>
                  <h4 className='font-semibold mb-2'>Description</h4>
                  <p className='text-sm text-muted-foreground'>
                    <ColoredText
                      text={selectedItem.objects.examineDescription}
                    />
                  </p>
                </div>
              )}

              {/* Basic Stats */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h4 className='font-semibold mb-2'>Basic Information</h4>
                  <div className='space-y-1 text-sm'>
                    {selectedItem.objects.weight != null && (
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Weight:</span>
                        <span>{selectedItem.objects.weight} lbs</span>
                      </div>
                    )}
                    {selectedItem.objects.cost != null && (
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Cost:</span>
                        <span>{selectedItem.objects.cost} coins</span>
                      </div>
                    )}
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Zone/ID:</span>
                      <span>
                        {selectedItem.objects.zoneId}:{selectedItem.objects.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className='font-semibold mb-2'>Item Condition</h4>
                  <div className='space-y-1 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Condition:</span>
                      <span>{selectedItem.condition}%</span>
                    </div>
                    {selectedItem.charges > 0 && (
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Charges:</span>
                        <span>{selectedItem.charges}</span>
                      </div>
                    )}
                    {selectedItem.equippedLocation && (
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Slot:</span>
                        <span>{selectedItem.equippedLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stat Modifiers */}
              {selectedItem.objects.objectAffects &&
                selectedItem.objects.objectAffects.length > 0 && (
                  <div>
                    <h4 className='font-semibold mb-2'>Stat Bonuses</h4>
                    <div className='grid grid-cols-2 gap-2'>
                      {selectedItem.objects.objectAffects.map(
                        (affect: any, index: number) => (
                          <div
                            key={index}
                            className='flex justify-between text-sm p-2 bg-muted rounded'
                          >
                            <span>{affect.location}:</span>
                            <span
                              className={
                                affect.modifier > 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {affect.modifier > 0 ? '+' : ''}
                              {affect.modifier}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Flags */}
              {((selectedItem.objects.flags &&
                selectedItem.objects.flags.length > 0) ||
                (selectedItem.objects.wearFlags &&
                  selectedItem.objects.wearFlags.length > 0)) && (
                <div className='grid grid-cols-2 gap-4'>
                  {selectedItem.objects.flags &&
                    selectedItem.objects.flags.length > 0 && (
                      <div>
                        <h4 className='font-semibold mb-2'>Object Flags</h4>
                        <div className='flex flex-wrap gap-1'>
                          {selectedItem.objects.flags.map((flag: string) => (
                            <Badge
                              key={flag}
                              variant='outline'
                              className='text-xs'
                            >
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {selectedItem.objects.wearFlags &&
                    selectedItem.objects.wearFlags.length > 0 && (
                      <div>
                        <h4 className='font-semibold mb-2'>Wear Slots</h4>
                        <div className='flex flex-wrap gap-1'>
                          {selectedItem.objects.wearFlags.map(
                            (flag: string) => (
                              <Badge
                                key={flag}
                                variant='secondary'
                                className='text-xs'
                              >
                                {flag}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex justify-end gap-2 pt-4'>
                <Button variant='outline' onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    window.open(
                      `/dashboard/objects/view?zone=${selectedItem.objects.zoneId}&id=${selectedItem.objects.id}`,
                      '_blank'
                    );
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
