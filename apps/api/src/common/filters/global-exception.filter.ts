import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';

@Catch()
export class GlobalExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const contextType = host.getType();

    // Handle GraphQL context
    if ((contextType as string) === 'graphql') {
      return this.handleGraphQLError(exception, host);
    }

    // Handle HTTP context
    return this.handleHttpError(exception, host);
  }

  private handleHttpError(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getHttpStatus(exception);
    const message = this.getErrorMessage(exception);
    const stack = this.getErrorStack(exception);

    // Log the error with full context
    this.logError({
      type: 'HTTP',
      method: request.method,
      url: request.url,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      headers: this.sanitizeHeaders(request.headers),
      body: this.sanitizeBody(request.body),
      status,
      message,
      stack,
      timestamp: new Date().toISOString(),
    });

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack }),
    };

    response.status(status).json(errorResponse);
  }

  private handleGraphQLError(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo();
    const ctx = gqlHost.getContext();

    const message = this.getErrorMessage(exception);
    const stack = this.getErrorStack(exception);

    // Log GraphQL error with context
    this.logError({
      type: 'GraphQL',
      operation: info.operation.operation,
      operationName: info.operation.name?.value || 'Anonymous',
      fieldName: info.fieldName,
      path: info.path,
      variables: this.sanitizeVariables(gqlHost.getArgs()),
      headers: this.sanitizeHeaders(ctx.req?.headers || {}),
      userAgent: ctx.req?.get?.('User-Agent'),
      ip: ctx.req?.ip,
      message,
      stack,
      timestamp: new Date().toISOString(),
    });

    // Return the exception for GraphQL to handle
    return exception;
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === 'string'
        ? response
        : (response as any).message || exception.message;
    }
    if (exception instanceof Error) {
      return exception.message;
    }
    return 'Internal server error';
  }

  private getErrorStack(exception: unknown): string | undefined {
    if (exception instanceof Error) {
      return exception.stack;
    }
    return undefined;
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
    ];

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'key'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeVariables(variables: any): any {
    return this.sanitizeBody(variables);
  }

  private logError(errorContext: any) {
    const { type, message, stack, timestamp, ...context } = errorContext;

    // Create a structured log entry
    const logEntry = {
      level: 'error',
      timestamp,
      type,
      message,
      context,
      ...(process.env.NODE_ENV === 'development' && { stack }),
    };

    // Log as JSON for structured logging
    this.logger.error(JSON.stringify(logEntry, null, 2));

    // Also log a human-readable version for development
    if (process.env.NODE_ENV === 'development') {
      this.logger.error(`${type} Error: ${message}`, {
        context: JSON.stringify(context, null, 2),
        stack,
      });
    }
  }
}
