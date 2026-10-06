'use client';

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const GET_CHARACTER_SESSION_INFO = gql`
  query GetCharacterSessionInfoPolling($characterId: ID!) {
    characterSessionInfo(characterId: $characterId) {
      id
      name
      lastLogin
      totalTimePlayed
      currentSessionTime
    }
  }
`;

interface CharacterSessionInfo {
  id: string;
  name: string;
  lastLogin: string | null;
  totalTimePlayed: number;
  currentSessionTime: number;
}

interface CharacterSessionInfoQueryResult {
  characterSessionInfo: CharacterSessionInfo | null;
}

interface CharacterSessionInfoProps {
  characterId: string;
}

export function CharacterSessionInfo({
  characterId,
}: CharacterSessionInfoProps) {
  const { data: sessionData } = useQuery<CharacterSessionInfoQueryResult>(
    GET_CHARACTER_SESSION_INFO,
    {
      variables: { characterId },
      pollInterval: 30000,
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: false,
    }
  );

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Activity className='h-5 w-5' />
          Session Info
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {sessionInfo?.lastLogin && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Last Login:</span>
              <span className='flex items-center gap-1'>
                <Clock className='h-4 w-4' />
                {formatDistanceToNow(new Date(sessionInfo.lastLogin), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}

          {sessionInfo?.totalTimePlayed != null && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Total Playtime:</span>
              <span>{formatPlayTime(sessionInfo.totalTimePlayed)}</span>
            </div>
          )}

          {sessionInfo?.currentSessionTime != null &&
            sessionInfo.currentSessionTime > 0 && (
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Current Session:</span>
                <span>{formatPlayTime(sessionInfo.currentSessionTime)}</span>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
