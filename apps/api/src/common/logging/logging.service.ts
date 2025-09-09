import { Injectable, Logger, LogLevel } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface LogEntry {
  level: 'log' | 'error' | 'warn' | 'debug' | 'verbose';
  timestamp: string;
  context?: string;
  message: string;
  data?: any;
  stack?: string;
}

@Injectable()
export class LoggingService {
  private readonly logger = new Logger(LoggingService.name);
  private readonly logDir: string;
  private readonly maxLogFiles = 10;
  private readonly maxLogSize = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Log an error with full context to file and console
   */
  async logError(
    message: string,
    context?: string,
    data?: any,
    stack?: string
  ) {
    const entry: LogEntry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      context,
      message,
      data: this.sanitizeData(data),
      stack,
    };

    await this.writeToFile('error', entry);
    this.logger.error(message, context);
  }

  /**
   * Log a warning with context
   */
  async logWarn(message: string, context?: string, data?: any) {
    const entry: LogEntry = {
      level: 'warn',
      timestamp: new Date().toISOString(),
      context,
      message,
      data: this.sanitizeData(data),
    };

    await this.writeToFile('warn', entry);
    this.logger.warn(message, context);
  }

  /**
   * Log general information
   */
  async logInfo(message: string, context?: string, data?: any) {
    const entry: LogEntry = {
      level: 'log',
      timestamp: new Date().toISOString(),
      context,
      message,
      data: this.sanitizeData(data),
    };

    await this.writeToFile('info', entry);
    this.logger.log(message, context);
  }

  /**
   * Log debug information (only in development)
   */
  async logDebug(message: string, context?: string, data?: any) {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const entry: LogEntry = {
      level: 'debug',
      timestamp: new Date().toISOString(),
      context,
      message,
      data: this.sanitizeData(data),
    };

    await this.writeToFile('debug', entry);
    this.logger.debug(message, context);
  }

  /**
   * Get recent log entries for debugging
   */
  async getRecentLogs(level?: string, limit = 100): Promise<LogEntry[]> {
    try {
      const logFile = level ? `${level}.log` : 'error.log';
      const logPath = path.join(this.logDir, logFile);

      if (!fs.existsSync(logPath)) {
        return [];
      }

      const content = fs.readFileSync(logPath, 'utf-8');
      const lines = content
        .trim()
        .split('\n')
        .filter(line => line.trim());

      return lines.slice(-limit).map(line => {
        try {
          return JSON.parse(line) as LogEntry;
        } catch {
          // Handle non-JSON log lines
          return {
            level: 'log' as const,
            timestamp: new Date().toISOString(),
            message: line,
          };
        }
      });
    } catch (error) {
      this.logger.error('Failed to read log file:', error);
      return [];
    }
  }

  /**
   * Clear old log files to prevent disk space issues
   */
  async cleanupLogs() {
    try {
      const files = fs.readdirSync(this.logDir);
      const logFiles = files
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logDir, file),
          stats: fs.statSync(path.join(this.logDir, file)),
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Remove old files if we exceed the limit
      if (logFiles.length > this.maxLogFiles) {
        const filesToRemove = logFiles.slice(this.maxLogFiles);
        for (const file of filesToRemove) {
          fs.unlinkSync(file.path);
          this.logger.log(`Removed old log file: ${file.name}`);
        }
      }

      // Rotate large files
      for (const file of logFiles) {
        if (file.stats.size > this.maxLogSize) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const archivedName = file.name.replace('.log', `-${timestamp}.log`);
          const archivedPath = path.join(this.logDir, archivedName);

          fs.renameSync(file.path, archivedPath);
          this.logger.log(
            `Rotated large log file: ${file.name} -> ${archivedName}`
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup logs:', error);
    }
  }

  private async writeToFile(level: string, entry: LogEntry) {
    try {
      const filename = `${level}.log`;
      const filepath = path.join(this.logDir, filename);
      const logLine = JSON.stringify(entry) + '\n';

      fs.appendFileSync(filepath, logLine);

      // Also write to combined log
      const combinedPath = path.join(this.logDir, 'combined.log');
      fs.appendFileSync(combinedPath, logLine);
    } catch (error) {
      this.logger.error('Failed to write to log file:', error);
    }
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = JSON.parse(JSON.stringify(data));
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'key',
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
      'jwt',
      'refresh_token',
    ];

    const sanitizeObject = (obj: any) => {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }

      if (obj && typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (
            sensitiveFields.some(field =>
              key.toLowerCase().includes(field.toLowerCase())
            )
          ) {
            result[key] = '[REDACTED]';
          } else {
            result[key] = sanitizeObject(value);
          }
        }
        return result;
      }

      return obj;
    };

    return sanitizeObject(sanitized);
  }
}
