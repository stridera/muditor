import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Online player information from FieryMUD
 */
export interface OnlinePlayer {
  name: string;
  level: number;
  class: string;
  race: string;
  roomId: number;
  godLevel: number;
  isLinkdead: boolean;
}

/**
 * Server statistics from FieryMUD
 */
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

/**
 * Server information from FieryMUD
 */
export interface ServerInfo {
  name: string;
  port: number;
  tlsPort: number;
  maintenanceMode: boolean;
  running: boolean;
}

/**
 * Command execution result
 */
export interface CommandResult {
  success: boolean;
  message: string;
  executor: string | undefined;
  note: string | undefined;
}

/**
 * Kick player result
 */
export interface KickResult {
  success: boolean;
  message: string;
  reason: string;
}

/**
 * Broadcast result
 */
export interface BroadcastResult {
  success: boolean;
  message: string;
  recipientCount: number;
}

/**
 * Service for communicating with FieryMUD's admin API
 *
 * Endpoints:
 * - GET /api/admin/players - List online players
 * - POST /api/admin/command - Execute a god command
 * - POST /api/admin/broadcast - Send message to all players
 * - POST /api/admin/kick - Disconnect a player
 * - GET /api/admin/stats - Server statistics
 */
@Injectable()
export class GameAdminService implements OnModuleInit {
  private readonly logger = new Logger(GameAdminService.name);
  private readonly baseUrl: string;
  private readonly adminToken: string;

  constructor(private readonly configService: ConfigService) {
    // Default to localhost:8080 for development
    this.baseUrl =
      this.configService.get<string>('FIERYMUD_ADMIN_URL') ??
      'http://localhost:8080';
    this.adminToken =
      this.configService.get<string>('FIERYMUD_ADMIN_TOKEN') ?? '';
  }

  onModuleInit() {
    this.logger.log(`GameAdminService initialized with URL: ${this.baseUrl}`);
    if (!this.adminToken) {
      this.logger.warn(
        'FIERYMUD_ADMIN_TOKEN not set - admin API calls will fail authentication'
      );
    }
  }

  /**
   * Make an authenticated request to the FieryMUD admin API
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.adminToken) {
      headers['Authorization'] = `Bearer ${this.adminToken}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          `Failed to connect to FieryMUD admin API at ${this.baseUrl}`
        );
      }
      throw error;
    }
  }

  /**
   * Get list of online players
   */
  async getOnlinePlayers(): Promise<OnlinePlayer[]> {
    interface PlayersResponse {
      success: boolean;
      player_count: number;
      players: Array<{
        name: string;
        level: number;
        class: string;
        race: string;
        room_id: number;
        god_level: number;
        is_linkdead: boolean;
      }>;
    }

    const response = await this.makeRequest<PlayersResponse>(
      'GET',
      '/api/admin/players'
    );

    return response.players.map(p => ({
      name: p.name,
      level: p.level,
      class: p.class,
      race: p.race,
      roomId: p.room_id,
      godLevel: p.god_level,
      isLinkdead: p.is_linkdead,
    }));
  }

  /**
   * Execute a god command on the game server
   */
  async executeCommand(
    command: string,
    executor?: string
  ): Promise<CommandResult> {
    interface CommandResponse {
      success: boolean;
      message: string;
      executor?: string;
      note?: string;
    }

    const response = await this.makeRequest<CommandResponse>(
      'POST',
      '/api/admin/command',
      { command, executor }
    );

    return {
      success: response.success,
      message: response.message,
      executor: response.executor,
      note: response.note,
    };
  }

  /**
   * Broadcast a message to all online players
   */
  async broadcastMessage(
    message: string,
    sender?: string
  ): Promise<BroadcastResult> {
    interface BroadcastResponse {
      success: boolean;
      message: string;
      recipient_count: number;
    }

    const response = await this.makeRequest<BroadcastResponse>(
      'POST',
      '/api/admin/broadcast',
      { message, sender }
    );

    return {
      success: response.success,
      message: response.message,
      recipientCount: response.recipient_count,
    };
  }

  /**
   * Kick a player from the game server
   */
  async kickPlayer(playerName: string, reason?: string): Promise<KickResult> {
    interface KickResponse {
      success: boolean;
      message: string;
      reason: string;
    }

    const response = await this.makeRequest<KickResponse>(
      'POST',
      '/api/admin/kick',
      { player_name: playerName, reason }
    );

    return {
      success: response.success,
      message: response.message,
      reason: response.reason,
    };
  }

  /**
   * Get server statistics
   */
  async getServerStats(): Promise<{ stats: ServerStats; server: ServerInfo }> {
    interface StatsResponse {
      success: boolean;
      stats: {
        uptime_seconds: number;
        total_connections: number;
        current_connections: number;
        peak_connections: number;
        total_commands: number;
        failed_commands: number;
        total_logins: number;
        failed_logins: number;
        commands_per_second: number;
      };
      server: {
        name: string;
        port: number;
        tls_port: number;
        maintenance_mode: boolean;
        running: boolean;
      };
    }

    const response = await this.makeRequest<StatsResponse>(
      'GET',
      '/api/admin/stats'
    );

    return {
      stats: {
        uptimeSeconds: response.stats.uptime_seconds,
        totalConnections: response.stats.total_connections,
        currentConnections: response.stats.current_connections,
        peakConnections: response.stats.peak_connections,
        totalCommands: response.stats.total_commands,
        failedCommands: response.stats.failed_commands,
        totalLogins: response.stats.total_logins,
        failedLogins: response.stats.failed_logins,
        commandsPerSecond: response.stats.commands_per_second,
      },
      server: {
        name: response.server.name,
        port: response.server.port,
        tlsPort: response.server.tls_port,
        maintenanceMode: response.server.maintenance_mode,
        running: response.server.running,
      },
    };
  }

  /**
   * Check if the admin API is reachable
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.getServerStats();
      return true;
    } catch {
      return false;
    }
  }
}
