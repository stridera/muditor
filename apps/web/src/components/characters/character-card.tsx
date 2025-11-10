'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { CharacterDto } from '@/generated/graphql';
import { formatDistanceToNow } from 'date-fns';
import {
  Clock,
  Coins,
  Eye,
  Heart,
  MapPin,
  Settings,
  Shield,
  User,
  Zap,
} from 'lucide-react';
import { OnlineStatus } from './online-status';

// Use a narrowed subset of CharacterDto for display (all selected via fragment)
type Character = Pick<
  CharacterDto,
  | 'id'
  | 'name'
  | 'level'
  | 'raceType'
  | 'playerClass'
  | 'lastLogin'
  | 'isOnline'
  | 'timePlayed'
  | 'hitPoints'
  | 'hitPointsMax'
  | 'movement'
  | 'movementMax'
  | 'alignment'
  | 'strength'
  | 'intelligence'
  | 'wisdom'
  | 'dexterity'
  | 'constitution'
  | 'charisma'
  | 'luck'
  | 'experience'
  | 'copper'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'description'
  | 'title'
  | 'currentRoom'
>;

interface CharacterCardProps {
  character: Character;
  showFullDetails?: boolean;
  showActions?: boolean;
  onCharacterClick?: (characterId: string) => void;
}

export function CharacterCard({
  character,
  showFullDetails = false,
  showActions = true,
  onCharacterClick,
}: CharacterCardProps) {
  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    } else if (hours > 0) {
      return `${hours}h ${Math.floor((seconds % 3600) / 60)}m`;
    } else {
      return `${Math.floor(seconds / 60)}m`;
    }
  };

  const formatCurrency = () => {
    if (character.platinum > 0)
      return `${character.platinum}p ${character.gold}g`;
    if (character.gold > 0) return `${character.gold}g ${character.silver}s`;
    if (character.silver > 0)
      return `${character.silver}s ${character.copper}c`;
    return `${character.copper}c`;
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

  return (
    <Card
      className={`${onCharacterClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`}
      onClick={() => onCharacterClick?.(character.id)}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <User className='h-4 w-4' />
              {character.name}
              <OnlineStatus
                isOnline={character.isOnline}
                lastLogin={character.lastLogin}
                size='sm'
              />
            </CardTitle>
            <CardDescription className='flex items-center gap-2 mt-1'>
              <span>Level {character.level}</span>
              {character.raceType && (
                <>
                  <span>•</span>
                  <span>{character.raceType}</span>
                </>
              )}
              {character.playerClass && (
                <>
                  <span>•</span>
                  <span>{character.playerClass}</span>
                </>
              )}
            </CardDescription>
            {character.title && (
              <div className='text-xs text-muted-foreground italic mt-1'>
                "{character.title}"
              </div>
            )}
          </div>
          <Badge variant='outline' className='text-xs'>
            Level {character.level}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Health and Movement */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex items-center gap-2'>
            <Heart className='h-4 w-4 text-red-500' />
            <span className='text-sm'>
              {character.hitPoints}/{character.hitPointsMax}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Zap className='h-4 w-4 text-blue-500' />
            <span className='text-sm'>
              {character.movement}/{character.movementMax}
            </span>
          </div>
        </div>

        {showFullDetails && (
          <>
            {/* Core Stats */}
            <div className='space-y-2'>
              <h4 className='text-sm font-medium text-gray-700'>Core Stats</h4>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className='flex justify-between p-1 rounded hover:bg-gray-50'>
                      <span>STR</span>
                      <span>{character.strength}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Strength: Affects carrying capacity and melee damage
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className='flex justify-between p-1 rounded hover:bg-gray-50'>
                      <span>INT</span>
                      <span>{character.intelligence}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Intelligence: Affects spell power</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className='flex justify-between p-1 rounded hover:bg-gray-50'>
                      <span>WIS</span>
                      <span>{character.wisdom}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Wisdom: Affects spell resistance</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className='flex justify-between p-1 rounded hover:bg-gray-50'>
                      <span>DEX</span>
                      <span>{character.dexterity}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Dexterity: Affects armor class and hit chance</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className='flex justify-between p-1 rounded hover:bg-gray-50'>
                      <span>CON</span>
                      <span>{character.constitution}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Constitution: Affects hit points and health regeneration
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className='flex justify-between p-1 rounded hover:bg-gray-50'>
                      <span>CHA</span>
                      <span>{character.charisma}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Charisma: Affects social interactions and leadership
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className='flex justify-between p-1 rounded hover:bg-gray-50'>
                      <span>LCK</span>
                      <span>{character.luck}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Luck: Affects critical hits and random events</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className='flex justify-between p-1'>
                  <span>EXP</span>
                  <span>{character.experience.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Wealth */}
            <div className='flex items-center gap-2'>
              <Coins className='h-4 w-4 text-yellow-500' />
              <span className='text-sm'>{formatCurrency()}</span>
            </div>

            {/* Alignment */}
            <div className='flex items-center gap-2'>
              <Shield
                className={`h-4 w-4 ${getAlignmentColor(character.alignment)}`}
              />
              <span
                className={`text-sm ${getAlignmentColor(character.alignment)}`}
              >
                {getAlignmentText(character.alignment)} ({character.alignment})
              </span>
            </div>
          </>
        )}

        {/* Session Info */}
        <div className='space-y-2 pt-2 border-t'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Clock className='h-3 w-3' />
            <span>Played: {formatPlayTime(character.timePlayed)}</span>
          </div>

          {character.lastLogin && !character.isOnline && (
            <div className='text-xs text-muted-foreground'>
              Last seen{' '}
              {formatDistanceToNow(new Date(character.lastLogin), {
                addSuffix: true,
              })}
            </div>
          )}

          {character.currentRoom && (
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <MapPin className='h-3 w-3' />
              <span>Room {character.currentRoom}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {character.description && (
          <div className='pt-2 border-t'>
            <p className='text-xs text-muted-foreground italic'>
              {character.description.length > 100
                ? `${character.description.substring(0, 100)}...`
                : character.description}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className='flex gap-2 pt-2 border-t'>
            <Button
              variant='outline'
              size='sm'
              className='flex-1'
              onClick={e => {
                e.stopPropagation();
                onCharacterClick?.(character.id);
              }}
            >
              <Eye className='h-3 w-3 mr-1' />
              View Details
            </Button>
            <Button variant='outline' size='sm'>
              <Settings className='h-3 w-3' />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
