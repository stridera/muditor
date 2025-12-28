'use client';

import { gql } from '@apollo/client';
import { useMutation, useQuery, useSubscription } from '@apollo/client/react';

// Queries
export const ONLINE_PLAYERS_QUERY = gql`
  query GetOnlinePlayers {
    onlinePlayers {
      name
      level
      class
      race
      roomId
      godLevel
      isLinkdead
    }
  }
`;

export const SERVER_STATUS_QUERY = gql`
  query GetServerStatus {
    serverStatus {
      stats {
        uptimeSeconds
        totalConnections
        currentConnections
        peakConnections
        totalCommands
        failedCommands
        totalLogins
        failedLogins
        commandsPerSecond
      }
      server {
        name
        port
        tlsPort
        maintenanceMode
        running
      }
    }
  }
`;

export const GAME_SERVER_CONNECTED_QUERY = gql`
  query IsGameServerConnected {
    gameServerConnected
  }
`;

// Mutations
export const EXECUTE_GAME_COMMAND_MUTATION = gql`
  mutation ExecuteGameCommand($command: String!, $executor: String) {
    executeGameCommand(command: $command, executor: $executor) {
      success
      message
      executor
      note
    }
  }
`;

export const BROADCAST_MESSAGE_MUTATION = gql`
  mutation BroadcastMessage($message: String!, $sender: String) {
    broadcastMessage(message: $message, sender: $sender) {
      success
      message
      recipientCount
    }
  }
`;

export const KICK_PLAYER_MUTATION = gql`
  mutation KickPlayer($playerName: String!, $reason: String) {
    kickPlayer(playerName: $playerName, reason: $reason) {
      success
      message
      reason
    }
  }
`;

// Subscriptions
export const GAME_EVENTS_SUBSCRIPTION = gql`
  subscription GameEvents {
    gameEvents {
      type
      timestamp
      playerName
      zoneId
      roomVnum
      message
      targetPlayer
      metadata
    }
  }
`;

export const CHAT_MESSAGES_SUBSCRIPTION = gql`
  subscription ChatMessages {
    chatMessages {
      type
      timestamp
      playerName
      message
      metadata
    }
  }
`;

export const PLAYER_ACTIVITY_SUBSCRIPTION = gql`
  subscription PlayerActivity {
    playerActivity {
      type
      timestamp
      playerName
      zoneId
      message
      metadata
    }
  }
`;

export const ADMIN_ALERTS_SUBSCRIPTION = gql`
  subscription AdminAlerts {
    adminAlerts {
      type
      timestamp
      message
      metadata
    }
  }
`;

export const WORLD_EVENTS_SUBSCRIPTION = gql`
  subscription WorldEvents {
    worldEvents {
      type
      timestamp
      zoneId
      roomVnum
      message
      metadata
    }
  }
`;

// Types
export interface OnlinePlayer {
  name: string;
  level: number;
  class: string;
  race: string;
  roomId: number;
  godLevel: number;
  isLinkdead: boolean;
}

export interface ServerStats {
  uptimeSeconds: number;
  totalConnections: number;
  currentConnections: number;
  peakConnections: number;
  totalCommands: number;
  failedCommands: number;
  totalLogins: number;
  failedLogins: number;
  commandsPerSecond: number;
}

export interface ServerInfo {
  name: string;
  port: number;
  tlsPort: number;
  maintenanceMode: boolean;
  running: boolean;
}

export interface ServerStatus {
  stats: ServerStats;
  server: ServerInfo;
}

export interface CommandResult {
  success: boolean;
  message: string;
  executor?: string;
  note?: string;
}

export interface BroadcastResult {
  success: boolean;
  message: string;
  recipientCount: number;
}

export interface KickResult {
  success: boolean;
  message: string;
  reason: string;
}

export interface GameEvent {
  type: string;
  timestamp: string;
  playerName?: string;
  zoneId?: number;
  roomVnum?: number;
  message: string;
  targetPlayer?: string;
  metadata?: Record<string, unknown>;
}

// Query result types
interface OnlinePlayersQueryResult {
  onlinePlayers: OnlinePlayer[];
}

interface ServerStatusQueryResult {
  serverStatus: ServerStatus;
}

interface GameServerConnectedQueryResult {
  gameServerConnected: boolean;
}

// Hooks
export function useOnlinePlayers() {
  const { data, loading, error, refetch } = useQuery<OnlinePlayersQueryResult>(
    ONLINE_PLAYERS_QUERY,
    {
      pollInterval: 10000, // Poll every 10 seconds
      fetchPolicy: 'network-only',
    }
  );

  return {
    players: data?.onlinePlayers || [],
    loading,
    error,
    refetch,
  };
}

export function useServerStatus() {
  const { data, loading, error, refetch } = useQuery<ServerStatusQueryResult>(
    SERVER_STATUS_QUERY,
    {
      pollInterval: 30000, // Poll every 30 seconds
      fetchPolicy: 'network-only',
    }
  );

  return {
    status: data?.serverStatus,
    loading,
    error,
    refetch,
  };
}

export function useGameServerConnected() {
  const { data, loading, error, refetch } =
    useQuery<GameServerConnectedQueryResult>(GAME_SERVER_CONNECTED_QUERY, {
      pollInterval: 60000, // Poll every minute
    });

  return {
    connected: data?.gameServerConnected ?? false,
    loading,
    error,
    refetch,
  };
}

export function useGameAdminMutations() {
  const [executeCommandMutation, { loading: commandLoading }] = useMutation<{
    executeGameCommand: CommandResult;
  }>(EXECUTE_GAME_COMMAND_MUTATION);

  const [broadcastMessageMutation, { loading: broadcastLoading }] =
    useMutation<{
      broadcastMessage: BroadcastResult;
    }>(BROADCAST_MESSAGE_MUTATION);

  const [kickPlayerMutation, { loading: kickLoading }] = useMutation<{
    kickPlayer: KickResult;
  }>(KICK_PLAYER_MUTATION);

  const executeCommand = async (
    command: string,
    executor?: string
  ): Promise<CommandResult> => {
    try {
      const result = await executeCommandMutation({
        variables: { command, executor },
      });
      return (
        result.data?.executeGameCommand || {
          success: false,
          message: 'No response from server',
        }
      );
    } catch (error) {
      console.error('Failed to execute command:', error);
      throw error;
    }
  };

  const broadcastMessage = async (
    message: string,
    sender?: string
  ): Promise<BroadcastResult> => {
    try {
      const result = await broadcastMessageMutation({
        variables: { message, sender },
      });
      return (
        result.data?.broadcastMessage || {
          success: false,
          message: 'No response from server',
          recipientCount: 0,
        }
      );
    } catch (error) {
      console.error('Failed to broadcast message:', error);
      throw error;
    }
  };

  const kickPlayer = async (
    playerName: string,
    reason?: string
  ): Promise<KickResult> => {
    try {
      const result = await kickPlayerMutation({
        variables: { playerName, reason },
        refetchQueries: [{ query: ONLINE_PLAYERS_QUERY }],
      });
      return (
        result.data?.kickPlayer || {
          success: false,
          message: 'No response from server',
          reason: '',
        }
      );
    } catch (error) {
      console.error('Failed to kick player:', error);
      throw error;
    }
  };

  return {
    executeCommand,
    broadcastMessage,
    kickPlayer,
    commandLoading,
    broadcastLoading,
    kickLoading,
  };
}

export function useGameEvents() {
  const { data, loading, error } = useSubscription<{ gameEvents: GameEvent }>(
    GAME_EVENTS_SUBSCRIPTION
  );

  return {
    event: data?.gameEvents,
    loading,
    error,
  };
}

export function useChatMessages() {
  const { data, loading, error } = useSubscription<{ chatMessages: GameEvent }>(
    CHAT_MESSAGES_SUBSCRIPTION
  );

  return {
    message: data?.chatMessages,
    loading,
    error,
  };
}

export function usePlayerActivity() {
  const { data, loading, error } = useSubscription<{
    playerActivity: GameEvent;
  }>(PLAYER_ACTIVITY_SUBSCRIPTION);

  return {
    activity: data?.playerActivity,
    loading,
    error,
  };
}

export function useAdminAlerts() {
  const { data, loading, error } = useSubscription<{ adminAlerts: GameEvent }>(
    ADMIN_ALERTS_SUBSCRIPTION
  );

  return {
    alert: data?.adminAlerts,
    loading,
    error,
  };
}

export function useWorldEvents() {
  const { data, loading, error } = useSubscription<{ worldEvents: GameEvent }>(
    WORLD_EVENTS_SUBSCRIPTION
  );

  return {
    event: data?.worldEvents,
    loading,
    error,
  };
}
