import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  PayloadTooLargeException,
  Post,
  Req,
  UseGuards,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { Request } from 'express';
import { InMemoryTtlCounter, type TtlCounter } from './ttl-counter';
import { LoggingService } from './logging/logging.service';
import { redactValueEchoes } from './logging/redact';

export const CLIENT_ERROR_PREFIX = '[client-error]';
export const CLIENT_ERROR_MAX_BYTES = 16 * 1024;
export const CLIENT_ERROR_LIMIT = 30;
export const CLIENT_ERROR_WINDOW_SECONDS = 60;

export const CLIENT_ERROR_KINDS = [
  'window',
  'unhandledrejection',
  'react',
  'apollo',
] as const;
export type ClientErrorKind = (typeof CLIENT_ERROR_KINDS)[number];

export class ClientErrorDto {
  @IsString()
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  stack?: string;

  @IsString()
  @MaxLength(500)
  route!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  operationName?: string;

  @IsIn(CLIENT_ERROR_KINDS)
  kind!: ClientErrorKind;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  userAgent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  release?: string;
}

/**
 * Per-IP rate limit (30/min) and 16 KB body cap for the unauthenticated
 * client-error sink. Runs before validation so floods are cheap to reject.
 * Uses the in-process TTL counter; the API runs as a single process.
 */
@Injectable()
export class ClientErrorsGuard implements CanActivate {
  /** Replaceable in tests (e.g. with an injected clock). */
  counter: TtlCounter = new InMemoryTtlCounter();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';

    const count = await this.counter.incr(
      `client-errors:${ip}`,
      CLIENT_ERROR_WINDOW_SECONDS
    );
    if (count > CLIENT_ERROR_LIMIT) {
      throw new HttpException(
        'Too many client error reports',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    const declared = Number(req.headers['content-length']);
    const actual = Buffer.byteLength(JSON.stringify(req.body ?? {}));
    if (declared > CLIENT_ERROR_MAX_BYTES || actual > CLIENT_ERROR_MAX_BYTES) {
      throw new PayloadTooLargeException(
        `Client error report exceeds ${CLIENT_ERROR_MAX_BYTES} bytes`
      );
    }
    return true;
  }
}

/** Strip control characters/newlines so a client cannot forge log lines. */
function clean(value: string | undefined, max: number): string {
  // eslint-disable-next-line no-control-regex
  return (value ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').slice(0, max);
}

/**
 * Sink for browser-side errors (window.onerror, unhandled rejections, React
 * error boundary, Apollo links) so everything a user sees also lands in the
 * server log under the greppable `[client-error]` prefix.
 */
@Controller('client-errors')
export class ClientErrorsController {
  constructor(
    private readonly logging: LoggingService,
    private readonly jwt: JwtService
  ) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ClientErrorsGuard)
  async report(
    @Body() body: ClientErrorDto,
    @Req() req: Request
  ): Promise<void> {
    const parts = [
      CLIENT_ERROR_PREFIX,
      `kind=${body.kind}`,
      `route=${clean(body.route, 200)}`,
      `op=${clean(body.operationName, 80) || '-'}`,
      `user=${this.identify(req)}`,
      `release=${clean(body.release, 40) || '-'}`,
      `ua=${JSON.stringify(clean(body.userAgent, 160))}`,
      `msg=${JSON.stringify(clean(redactValueEchoes(body.message), 500))}`,
    ];
    if (body.stack) {
      parts.push(`stack=${JSON.stringify(clean(body.stack, 1500))}`);
    }
    await this.logging.logWarn(parts.join(' '), 'ClientErrors');
  }

  /** Optional auth: attach the user when a valid Bearer token is present. */
  private identify(req: Request): string {
    const auth = req.headers?.authorization;
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
