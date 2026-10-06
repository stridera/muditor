import { Injectable, Logger } from '@nestjs/common';
import type { PublicServerStatusDto } from './server-status.dto';

const FETCH_TIMEOUT_MS = 1500;
const CACHE_TTL_MS = 15_000;
const DEFAULT_ADMIN_URL = 'http://127.0.0.1:8080';

interface LiveStatus {
  online: boolean;
  playersOnline: number | null;
  uptimeSeconds: number | null;
  tick: number | null;
}

function toInt(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.trunc(value)
    : null;
}

function envInt(name: string, fallback: number): number {
  const parsed = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

@Injectable()
export class ServerStatusService {
  private readonly logger = new Logger(ServerStatusService.name);
  private cache: { expiresAt: number; value: LiveStatus } | null = null;
  private inflight: Promise<LiveStatus> | null = null;

  async getStatus(): Promise<PublicServerStatusDto> {
    const live = await this.getLiveStatus();
    return {
      ...live,
      host: process.env.MUD_PUBLIC_HOST || 'fierymud.org',
      port: envInt('MUD_PUBLIC_PORT', 4003),
      tlsPort: envInt('MUD_PUBLIC_TLS_PORT', 4443),
    };
  }

  private async getLiveStatus(): Promise<LiveStatus> {
    const now = Date.now();
    if (this.cache && this.cache.expiresAt > now) {
      return this.cache.value;
    }
    // Collapse concurrent cache misses into a single upstream request.
    this.inflight ??= this.fetchLiveStatus()
      .then(value => {
        this.cache = { expiresAt: Date.now() + CACHE_TTL_MS, value };
        return value;
      })
      .finally(() => {
        this.inflight = null;
      });
    return this.inflight;
  }

  /**
   * Query the Rust server's admin HTTP API. Response shape:
   * { paused, pending_forced_ticks, tick, online_players, mobs, items }
   * The server does not report uptime, so uptimeSeconds is always null.
   */
  private async fetchLiveStatus(): Promise<LiveStatus> {
    const offline: LiveStatus = {
      online: false,
      playersOnline: null,
      uptimeSeconds: null,
      tick: null,
    };
    const base = (
      process.env.FIERYMUD_ADMIN_URL ||
      process.env.MUD_ADMIN_URL ||
      DEFAULT_ADMIN_URL
    ).replace(/\/+$/, '');
    const token = process.env.FIERYMUD_ADMIN_TOKEN || process.env.ADMIN_TOKEN;

    try {
      const response = await fetch(`${base}/api/admin/world/status`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!response.ok) {
        this.logger.debug(`Status probe returned HTTP ${response.status}`);
        return offline;
      }
      const json = (await response.json()) as Record<string, unknown>;
      return {
        online: true,
        playersOnline: toInt(json.online_players),
        uptimeSeconds: toInt(json.uptime_seconds),
        tick: toInt(json.tick),
      };
    } catch (error) {
      this.logger.debug(
        `Status probe failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return offline;
    }
  }
}
