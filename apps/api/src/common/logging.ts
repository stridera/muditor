import { Logger } from '@nestjs/common';

// Central application logger instance
export const AppLogger = new Logger('App');

// Unified error logging helper that preserves stack traces when available
export function logError(message: string, error?: unknown, context?: string) {
  if (error instanceof Error) {
    AppLogger.error(message, error.stack, context);
  } else if (error !== undefined) {
    AppLogger.error(`${message} | ${String(error)}`, undefined, context);
  } else {
    AppLogger.error(message, undefined, context);
  }
}
