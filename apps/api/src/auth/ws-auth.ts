import * as jwt from 'jsonwebtoken';
import type { AuthService } from './auth.service';
import { getJwtSecret } from './jwt-secret';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

/** Stored on the graphql-ws connection (`ctx.extra`) after a successful handshake. */
export interface WsConnectionAuth {
  authorization: string;
}

function readAuthorization(
  connectionParams: Record<string, unknown> | undefined
): string | undefined {
  const raw =
    connectionParams?.['Authorization'] ?? connectionParams?.['authorization'];
  return typeof raw === 'string' ? raw : undefined;
}

/**
 * graphql-ws `onConnect`: accept the socket only for a logged-in user whose
 * token is valid, unexpired, current (tokenVersion), not banned and not
 * deleted. This is the same check REST/GraphQL requests get via
 * `AuthService.validateJwtPayload`. Returning false makes graphql-ws close
 * the socket with 4403 before any operation is accepted.
 */
export function createWsOnConnect(
  authService: Pick<AuthService, 'validateJwtPayload'>
) {
  return async (ctx: {
    connectionParams?: Readonly<Record<string, unknown>> | undefined;
    extra: unknown;
  }): Promise<boolean> => {
    const authorization = readAuthorization(
      ctx.connectionParams as Record<string, unknown> | undefined
    );
    const [type, token] = authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) return false;

    try {
      const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
      await authService.validateJwtPayload(payload);
    } catch {
      return false;
    }

    (ctx.extra as Partial<WsConnectionAuth>).authorization = authorization!;
    return true;
  };
}

/**
 * Builds the GraphQL context for a graphql-ws operation. The Authorization
 * header is replayed from the handshake so GraphQLJwtAuthGuard re-validates
 * the user (and attaches `req.user`) for every subscription, exactly as it
 * does for HTTP requests.
 */
export function wsContext(ctx: { extra?: unknown }): {
  req: { headers: { authorization: string | undefined } };
} {
  const extra = (ctx.extra ?? {}) as Partial<WsConnectionAuth>;
  return { req: { headers: { authorization: extra.authorization } } };
}

/** graphql-ws passes its own Context; HTTP passes { req, res }. */
export function isWsContext(
  arg: unknown
): arg is { connectionParams?: unknown; extra: unknown } {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'extra' in arg &&
    'connectionParams' in arg
  );
}
