import { ForbiddenException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import { GraphQLError } from 'graphql';
import { GraphQLErrorLoggingPlugin } from './graphql-error-logging.plugin';
import type { LoggingService } from './logging.service';

function setup(
  verify: () => unknown = () => ({ sub: 'u-9', role: 'BUILDER' })
) {
  const logging = {
    logWarn: jest.fn().mockResolvedValue(undefined),
    logError: jest.fn().mockResolvedValue(undefined),
  };
  const jwt = { verify: jest.fn(verify) };
  const plugin = new GraphQLErrorLoggingPlugin(
    logging as unknown as LoggingService,
    jwt as unknown as JwtService
  );
  return { plugin, logging, jwt };
}

async function run(
  plugin: GraphQLErrorLoggingPlugin,
  errors: GraphQLError[],
  opts: {
    variables?: Record<string, unknown>;
    headers?: Record<string, string>;
    user?: { id: string; role: string };
    operationName?: string;
  } = {}
) {
  const listener = await plugin.requestDidStart();
  await listener.didEncounterErrors?.({
    errors,
    operationName: opts.operationName ?? null,
    request: { variables: opts.variables },
    contextValue: { req: { headers: opts.headers ?? {}, user: opts.user } },
  } as never);
}

describe('GraphQLErrorLoggingPlugin', () => {
  it('logs a validation error at WARN with names only, never variable values', async () => {
    const { plugin, logging } = setup();
    const error = new GraphQLError(
      'Variable "$id" of non-null type "Int!" must not be null.',
      {
        extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
      }
    );
    await run(plugin, [error], {
      operationName: 'ZoneDetail',
      variables: { id: 4242, password: 'hunter2-secret' },
      headers: {
        'x-client-route': '/dashboard/zones/new',
        'x-request-id': 'req-1',
      },
      user: { id: 'u-1', role: 'IMPLEMENTOR' },
    });

    expect(logging.logError).not.toHaveBeenCalled();
    expect(logging.logWarn).toHaveBeenCalledTimes(1);
    const [line, context] = logging.logWarn.mock.calls[0];
    expect(context).toBe('GraphQL');
    expect(line).toContain('[gql-error]');
    expect(line).toContain('op=ZoneDetail');
    expect(line).toContain('code=GRAPHQL_VALIDATION_FAILED');
    expect(line).toContain('user=u-1/IMPLEMENTOR');
    expect(line).toContain('req=req-1');
    expect(line).toContain('route=/dashboard/zones/new');
    expect(line).toContain('vars=[id,password]');
    expect(line).not.toContain('hunter2-secret');
    expect(line).not.toContain('4242');
  });

  it('logs an internal error at ERROR with the original stack', async () => {
    const { plugin, logging } = setup();
    const original = new Error('relation "Zones" does not exist');
    const error = new GraphQLError('Unexpected error', {
      originalError: original,
    });
    await run(plugin, [error], { operationName: 'Boom' });

    expect(logging.logWarn).not.toHaveBeenCalled();
    expect(logging.logError).toHaveBeenCalledTimes(1);
    const [line, context, data, stack] = logging.logError.mock.calls[0];
    expect(line).toContain('[gql-error]');
    expect(line).toContain('code=INTERNAL_SERVER_ERROR');
    expect(context).toBe('GraphQL');
    expect(data).toBeUndefined();
    expect(stack).toContain('    at ');
    // message (which may carry values) is not repeated in the stack
    expect(stack).not.toContain('relation "Zones"');
  });

  it('never logs values echoed in a variable coercion error message', async () => {
    const { plugin, logging } = setup();
    const error = new GraphQLError(
      'Variable "$i" got invalid value { email: "a@b.c", password: "hunter2-secret" }; Field "identifier" of required type "String!" was not provided.',
      { extensions: { code: 'BAD_USER_INPUT' } }
    );
    await run(plugin, [error], {
      variables: { i: { password: 'hunter2-secret' } },
    });
    const line = logging.logWarn.mock.calls[0][0] as string;
    expect(line).not.toContain('hunter2-secret');
    expect(line).not.toContain('a@b.c');
    expect(line).toContain('vars=[i]');
  });

  it('classifies Nest HttpExceptions by status (403 -> FORBIDDEN at WARN)', async () => {
    const { plugin, logging } = setup();
    const error = new GraphQLError('No zone grants', {
      originalError: new ForbiddenException('No zone grants'),
    });
    await run(plugin, [error]);
    expect(logging.logError).not.toHaveBeenCalled();
    expect(logging.logWarn.mock.calls[0][0]).toContain('code=FORBIDDEN');
  });

  it('falls back to the bearer token for the user when no guard ran, and to anonymous otherwise', async () => {
    const { plugin, logging } = setup();
    const error = new GraphQLError('bad', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
    await run(plugin, [error], { headers: { authorization: 'Bearer abc' } });
    expect(logging.logWarn.mock.calls[0][0]).toContain('user=u-9/BUILDER');

    const bad = setup(() => {
      throw new Error('jwt expired');
    });
    await run(bad.plugin, [error], {
      headers: { authorization: 'Bearer abc' },
    });
    expect(bad.logging.logWarn.mock.calls[0][0]).toContain('user=anonymous');
  });

  it('cannot be used to forge extra log lines', async () => {
    const { plugin, logging } = setup();
    const error = new GraphQLError('x\n[gql-error] fake', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
    await run(plugin, [error]);
    expect(logging.logWarn.mock.calls[0][0]).not.toContain('\n');
  });
});
