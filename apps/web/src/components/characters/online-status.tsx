'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { Circle, Clock, User } from 'lucide-react';
import { memo } from 'react';
import { formatRace, formatClass } from '@/lib/utils';

export interface OnlineStatusProps {
  isOnline: boolean;
  lastLogin?: Date | string; // optional: omit key entirely when unknown
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const OnlineStatusComponent = ({
  isOnline,
  lastLogin,
  showText = true,
  size = 'md',
}: OnlineStatusProps) => {
  const iconSize = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  }[size];

  const badgeSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  const lastLoginDate = lastLogin ? new Date(lastLogin) : null;
  const lastSeenText = lastLoginDate
    ? `Last seen ${formatDistanceToNow(lastLoginDate, { addSuffix: true })}`
    : 'Never seen online';

  if (showText) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={isOnline ? 'default' : 'secondary'}
              className={`flex items-center gap-1 ${badgeSize}`}
            >
              <Circle
                className={`${iconSize} fill-current ${isOnline ? 'text-green-500' : 'text-gray-400'}`}
              />
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isOnline ? 'Currently online' : lastSeenText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Circle
            className={`${iconSize} fill-current ${isOnline ? 'text-green-500' : 'text-gray-400'}`}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{isOnline ? 'Currently online' : lastSeenText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Memoize to prevent re-renders when session data polls but status hasn't changed
export const OnlineStatus = memo(
  OnlineStatusComponent,
  (prevProps, nextProps) =>
    prevProps.isOnline === nextProps.isOnline &&
    prevProps.lastLogin === nextProps.lastLogin &&
    prevProps.showText === nextProps.showText &&
    prevProps.size === nextProps.size
);

interface PlayTimeDisplayProps {
  totalSeconds: number;
  currentSessionSeconds?: number;
  showCurrentSession?: boolean;
}

const PlayTimeDisplayComponent = ({
  totalSeconds,
  currentSessionSeconds = 0,
  showCurrentSession = false,
}: PlayTimeDisplayProps) => {
  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='flex items-center gap-1 text-sm text-muted-foreground'>
            <Clock className='h-3 w-3' />
            <span>{formatPlayTime(totalSeconds)}</span>
            {showCurrentSession && currentSessionSeconds > 0 && (
              <span className='text-green-600 font-medium'>
                (+{formatPlayTime(currentSessionSeconds)})
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className='text-center'>
            <p>Total play time: {formatPlayTime(totalSeconds)}</p>
            {showCurrentSession && currentSessionSeconds > 0 && (
              <p>Current session: {formatPlayTime(currentSessionSeconds)}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Memoize to prevent re-renders when session data polls
export const PlayTimeDisplay = memo(
  PlayTimeDisplayComponent,
  (prevProps, nextProps) =>
    prevProps.totalSeconds === nextProps.totalSeconds &&
    prevProps.currentSessionSeconds === nextProps.currentSessionSeconds &&
    prevProps.showCurrentSession === nextProps.showCurrentSession
);

interface CharacterStatusCardProps {
  character: {
    id: string;
    name: string;
    level: number;
    isOnline: boolean;
    lastLogin?: Date | string;
    raceType?: string;
    playerClass?: string;
    user?: {
      username: string;
      role: string;
    };
  };
  showUser?: boolean;
  showActions?: boolean;
  onCharacterClick?: (characterId: string) => void;
}

export function CharacterStatusCard({
  character,
  showUser = false,
  onCharacterClick,
}: CharacterStatusCardProps) {
  return (
    <div
      className={`p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors ${
        onCharacterClick ? 'cursor-pointer' : ''
      }`}
      onClick={() => onCharacterClick?.(character.id)}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-2'>
            <h3 className='font-medium text-gray-900'>{character.name}</h3>
            <OnlineStatus
              isOnline={character.isOnline}
              size='sm'
              {...(character.lastLogin
                ? { lastLogin: character.lastLogin }
                : {})}
            />
          </div>

          <div className='text-sm text-gray-600 space-y-1'>
            <div className='flex items-center gap-2'>
              <span>Level {character.level}</span>
              {character.raceType && (
                <>
                  <span>•</span>
                  <span>{formatRace(character.raceType)}</span>
                </>
              )}
              {character.playerClass && (
                <>
                  <span>•</span>
                  <span>{formatClass(character.playerClass)}</span>
                </>
              )}
            </div>

            {showUser && character.user && (
              <div className='flex items-center gap-1 text-xs'>
                <User className='h-3 w-3' />
                <span>{character.user.username}</span>
                <Badge variant='outline' className='text-xs'>
                  {character.user.role}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
