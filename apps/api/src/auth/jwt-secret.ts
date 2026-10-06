import type { JwtModuleOptions } from '@nestjs/jwt';

/**
 * Resolve the JWT signing secret. Throws when JWT_SECRET is unset or blank so
 * the API refuses to boot rather than signing tokens with a guessable default.
 *
 * Evaluated lazily (at Nest init time, after ConfigModule has loaded .env files)
 * rather than at module-import time.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    throw new Error(
      'JWT_SECRET environment variable must be set (refusing to start without a signing secret)'
    );
  }
  return secret;
}

export function jwtModuleOptionsFactory(): JwtModuleOptions {
  return {
    secret: getJwtSecret(),
    signOptions: {
      expiresIn: (process.env.JWT_EXPIRES_IN ||
        '7d') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    },
  };
}
