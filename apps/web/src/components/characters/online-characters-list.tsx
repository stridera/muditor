'use client';

import {
  useOnlineCharacters,
  useMyOnlineCharacters,
  OnlineCharacter,
} from '@/hooks/use-character-status';
import { CharacterStatusCard, OnlineStatus } from './online-status';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Gamepad2 } from 'lucide-react';
import { useState } from 'react';

interface OnlineCharactersListProps {
  showAllUsers?: boolean;
  userId?: string;
  title?: string;
  showActions?: boolean;
  maxHeight?: string;
}

export function OnlineCharactersList({
  showAllUsers = false,
  userId,
  title,
  showActions = true,
  maxHeight = '400px',
}: OnlineCharactersListProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    onlineCharacters,
    loading: allLoading,
    error: allError,
    refetch: refetchAll,
  } = useOnlineCharacters(showAllUsers ? undefined : userId);

  const {
    myOnlineCharacters,
    loading: myLoading,
    error: myError,
    refetch: refetchMy,
  } = useMyOnlineCharacters();

  const characters = showAllUsers ? onlineCharacters : myOnlineCharacters;
  const loading = showAllUsers ? allLoading : myLoading;
  const error = showAllUsers ? allError : myError;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (showAllUsers) {
        await refetchAll();
      } else {
        await refetchMy();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            {title || 'Online Characters'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-red-600 text-sm'>
            Error loading characters: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              {showAllUsers ? (
                <Users className='h-5 w-5' />
              ) : (
                <Gamepad2 className='h-5 w-5' />
              )}
              {title ||
                (showAllUsers ? 'Online Characters' : 'My Online Characters')}
              <Badge variant='secondary' className='text-xs'>
                {characters.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              {showAllUsers
                ? 'All characters currently online in the game'
                : 'Your characters that are currently online'}
            </CardDescription>
          </div>
          {showActions && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && characters.length === 0 ? (
          <div className='flex items-center justify-center p-8'>
            <div className='text-muted-foreground'>Loading characters...</div>
          </div>
        ) : characters.length === 0 ? (
          <div className='text-center py-8'>
            <div className='text-muted-foreground mb-2'>
              No characters online
            </div>
            <div className='text-sm text-gray-500'>
              {showAllUsers
                ? 'No players are currently connected to the game.'
                : 'None of your characters are currently online.'}
            </div>
          </div>
        ) : (
          <div className='space-y-3 overflow-y-auto' style={{ maxHeight }}>
            {characters.map((character: OnlineCharacter) => (
              <CharacterStatusCard
                key={character.id}
                character={character}
                showUser={showAllUsers}
                showActions={showActions}
                onCharacterClick={id => {
                  // Could navigate to character detail page
                  console.log('Character clicked:', id);
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface OnlineStatsProps {
  showMyStats?: boolean;
}

export function OnlineStats({ showMyStats = false }: OnlineStatsProps) {
  const { onlineCharacters } = useOnlineCharacters();
  const { myOnlineCharacters } = useMyOnlineCharacters();

  if (showMyStats) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Gamepad2 className='h-4 w-4' />
              My Characters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {
                myOnlineCharacters.filter((c: OnlineCharacter) => c.isOnline)
                  .length
              }
            </div>
            <p className='text-xs text-muted-foreground'>
              of {myOnlineCharacters.length} characters online
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate some stats
  const totalOnline = onlineCharacters.length;
  const uniqueUsers = new Set(
    onlineCharacters.map((c: OnlineCharacter) => c.user.id)
  ).size;
  const roleStats = onlineCharacters.reduce(
    (acc: Record<string, number>, char: OnlineCharacter) => {
      acc[char.user.role] = (acc[char.user.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium flex items-center gap-2'>
            <Users className='h-4 w-4' />
            Characters Online
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalOnline}</div>
          <p className='text-xs text-muted-foreground'>
            {uniqueUsers} unique users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium'>
            Role Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-1'>
            {Object.entries(roleStats).map(([role, count]) => (
              <div
                key={role}
                className='flex items-center justify-between text-sm'
              >
                <span className='capitalize'>{role.toLowerCase()}</span>
                <Badge variant='outline' className='text-xs'>
                  {count as number}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium'>Activity Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-2'>
            <OnlineStatus isOnline={totalOnline > 0} showText={false} />
            <span className='text-sm'>
              {totalOnline > 0 ? 'Game Active' : 'No Activity'}
            </span>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            Last updated: just now
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
