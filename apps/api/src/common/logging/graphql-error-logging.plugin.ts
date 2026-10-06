import { Plugin } from '@nestjs/apollo';
import { HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { randomUUID } from 'crypto';
import type { GraphQLError } from 'graphql';
import { LoggingService } from './logging.service';

export const GQL_ERROR_PREFIX = '[gql-error]';
export const GQL_ERROR_CONTEXT = 'GraphQL';

/** Error codes caused by the caller (bad input / auth), logged at WARN. */
const CLIENT_CLASS_CODES = new Set([
  'GRAPHQL_VALIDATION_FAILED',
  'GRAPHQL_PARSE_FAILED',
  'BAD_USER_INPUT',
  'BAD_REQUEST',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'PERSISTED_QUERY_NOT_FOUND',
  'PERSISTED_QUERY_NOT_SUPPORTED',
  'OPERATION_RESOLUTION_FAILURE',
]);

const HTTP_STATUS_CODES: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'BAD_USER_INPUT',
};

/**
 * Nest turns HttpExceptions into Apollo error codes only when formatting the
 * response (after didEncounterErrors), so derive the code from the original
 * exception when Apollo has not set a specific one.
 */
export function resolveErrorCode(error: GraphQLError): string {
  const code = error.extensions?.['code'];
  if (typeof code === 'string' && code !== 'INTERNAL_SERVER_ERROR') {
    return code;
  }
  const original: unknown = error.originalError;
  if (original instanceof HttpException) {
    const status = original.getStatus();
    return (
      HTTP_STATUS_CODES[status] ??
      (status < 500 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR')
    );
  }
  return typeof code === 'string' ? code : 'INTERNAL_SERVER_ERROR';
}

export function isClientClassError(code: string): boolean {
  return CLIENT_CLASS_CODES.has(code);
}

interface RequestLike {
  headers?: Record<string, string | string[] | undefined>;
  user?: { id?: string; role?: string } | null;
}

function headerValue(
  req: RequestLike | undefined,
  name: string
): string | undefined {
  const value = req?.headers?.[name];
  const first = Array.isArray(value) ? value[0] : value;
  return first ? first : undefined;
}

/** Strip control characters/newlines so a client cannot forge log lines. */
function clean(value: string, max = 300): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]+/g, ' ').slice(0, max);
}

/**
 * Logs every GraphQL error (including parse/validation failures, which never
 * reach a resolver or exception filter) as one greppable `[gql-error]` line.
 *
 * Variable VALUES are never logged, only their names.
 */
@Plugin()
export class GraphQLErrorLoggingPlugin implements ApolloServerPlugin {
  constructor(
    private readonly logging: LoggingService,
    private readonly jwt: JwtService
  ) {}

  requestDidStart(): Promise<GraphQLRequestListener<Record<string, unknown>>> {
    return Promise.resolve({
      didEncounterErrors: ctx => {
        const req = (ctx.contextValue as { req?: RequestLike } | undefined)
          ?.req;
        const identity = this.identify(req);
        const requestId =
          headerValue(req, 'x-request-id') ?? randomUUID().slice(0, 8);
        const route = headerValue(req, 'x-client-route');
        const variableNames = Object.keys(ctx.request.variables ?? {});
        const operationName =
          ctx.operationName ?? ctx.request.operationName ?? 'anonymous';

        for (const error of ctx.errors) {
          const code = resolveErrorCode(error);
          const clientClass = isClientClassError(code);
          const parts = [
            GQL_ERROR_PREFIX,
            `op=${clean(String(operationName), 80)}`,
            `code=${code}`,
            `path=${error.path ? clean(error.path.join('.'), 120) : '-'}`,
            `user=${identity}`,
            `req=${clean(requestId, 64)}`,
            `route=${route ? clean(route, 200) : '-'}`,
            `vars=[${variableNames.map(n => clean(n, 40)).join(',')}]`,
            `msg=${JSON.stringify(clean(error.message))}`,
          ];
          const line = parts.join(' ');
          if (clientClass) {
            void this.logging.logWarn(line, GQL_ERROR_CONTEXT);
          } else {
            const original: unknown = error.originalError;
            const stack =
              (original instanceof Error ? original.stack : undefined) ??
              error.stack;
            void this.logging.logError(
              line,
              GQL_ERROR_CONTEXT,
              undefined,
              stack
            );
          }
        }
        return Promise.resolve();
      },
    });
  }

  /**
   * Prefer the user attached by the auth guard. Parse/validation failures
   * happen before any guard runs, so fall back to decoding the bearer token.
   */
  private identify(req: RequestLike | undefined): string {
    if (req?.user?.id) return `${req.user.id}/${req.user.role ?? '?'}`;
    const auth = headerValue(req, 'authorization');
    if (!auth?.startsWith('Bearer ')) return 'anonymous';
    try {
      const payload = this.jwt.verify<{ sub?: string; role?: string }>(
        auth.slice(7)
      );
      return payload.sub
        ? `${payload.sub}/${payload.role ?? '?'}`
        : 'anonymous';
    } catch {
      return 'anonymous';
    }
  }
}
