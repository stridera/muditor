'use client';

import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';

export const ONLINE_CHARACTERS_QUERY = gql`
  query OnlineCharacters($userId: ID) {
    onlineCharacters(userId: $userId) {
      id
      name
      level
      lastLogin
      isOnline
      raceType
      playerClass
      user {
        id
        username
        role
      }
    }
  }
`;

export const MY_ONLINE_CHARACTERS_QUERY = gql`
  query MyOnlineCharacters {
    myOnlineCharacters {
      id
      name
      level
      lastLogin
      isOnline
      raceType
      playerClass
      user {
        id
        username
        role
      }
    }
  }
`;

export const CHARACTER_SESSION_INFO_QUERY = gql`
  query CharacterSessionInfo($characterId: ID!) {
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

export const SET_CHARACTER_ONLINE_MUTATION = gql`
  mutation SetCharacterOnline($characterId: ID!) {
    setCharacterOnline(characterId: $characterId)
  }
`;

export const SET_CHARACTER_OFFLINE_MUTATION = gql`
  mutation SetCharacterOffline($characterId: ID!) {
    setCharacterOffline(characterId: $characterId)
  }
`;

export const UPDATE_CHARACTER_ACTIVITY_MUTATION = gql`
  mutation UpdateCharacterActivity($characterId: ID!) {
    updateCharacterActivity(characterId: $characterId)
  }
`;

export interface OnlineCharacter {
  id: string;
  name: string;
  level: number;
  lastLogin?: Date;
  isOnline: boolean;
  raceType?: string;
  playerClass?: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export interface CharacterSessionInfo {
  id: string;
  name: string;
  isOnline: boolean;
  lastLogin?: Date;
  totalTimePlayed: number;
  currentSessionTime: number;
}

// GraphQL query result types
interface OnlineCharactersQueryResult {
  onlineCharacters: OnlineCharacter[];
}

interface MyOnlineCharactersQueryResult {
  myOnlineCharacters: OnlineCharacter[];
}

interface CharacterSessionInfoQueryResult {
  characterSessionInfo: CharacterSessionInfo;
}

export function useOnlineCharacters(userId?: string) {
  const { data, loading, error, refetch } =
    useQuery<OnlineCharactersQueryResult>(ONLINE_CHARACTERS_QUERY, {
      variables: { userId },
      pollInterval: 30000, // Poll every 30 seconds for real-time updates
    });

  return {
    onlineCharacters: data?.onlineCharacters || [],
    loading,
    error,
    refetch,
  };
}

export function useMyOnlineCharacters() {
  const { data, loading, error, refetch } =
    useQuery<MyOnlineCharactersQueryResult>(MY_ONLINE_CHARACTERS_QUERY, {
      pollInterval: 15000, // Poll every 15 seconds for user's own characters
    });

  return {
    myOnlineCharacters: data?.myOnlineCharacters || [],
    loading,
    error,
    refetch,
  };
}

export function useCharacterSessionInfo(characterId: string) {
  const { data, loading, error, refetch } =
    useQuery<CharacterSessionInfoQueryResult>(CHARACTER_SESSION_INFO_QUERY, {
      variables: { characterId },
      skip: !characterId,
      pollInterval: 5000, // Poll every 5 seconds for session info
    });

  return {
    sessionInfo: data?.characterSessionInfo,
    loading,
    error,
    refetch,
  };
}

export function useCharacterStatusMutations() {
  const [setOnlineMutation] = useMutation(SET_CHARACTER_ONLINE_MUTATION);
  const [setOfflineMutation] = useMutation(SET_CHARACTER_OFFLINE_MUTATION);
  const [updateActivityMutation] = useMutation(
    UPDATE_CHARACTER_ACTIVITY_MUTATION
  );

  const setCharacterOnline = async (characterId: string) => {
    try {
      await setOnlineMutation({
        variables: { characterId },
        refetchQueries: [
          { query: ONLINE_CHARACTERS_QUERY },
          { query: MY_ONLINE_CHARACTERS_QUERY },
        ],
      });
    } catch (error) {
      console.error('Failed to set character online:', error);
      throw error;
    }
  };

  const setCharacterOffline = async (characterId: string) => {
    try {
      await setOfflineMutation({
        variables: { characterId },
        refetchQueries: [
          { query: ONLINE_CHARACTERS_QUERY },
          { query: MY_ONLINE_CHARACTERS_QUERY },
        ],
      });
    } catch (error) {
      console.error('Failed to set character offline:', error);
      throw error;
    }
  };

  const updateCharacterActivity = async (characterId: string) => {
    try {
      await updateActivityMutation({
        variables: { characterId },
      });
    } catch (error) {
      console.error('Failed to update character activity:', error);
      throw error;
    }
  };

  return {
    setCharacterOnline,
    setCharacterOffline,
    updateCharacterActivity,
  };
}
