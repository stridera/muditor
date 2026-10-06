import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { GraphQLErrorLoggingPlugin } from './logging/graphql-error-logging.plugin';
import { LoggingService } from './logging/logging.service';
import { ClientErrorsController } from './client-errors.controller';
import { TestController } from './test/test.controller';

@Global()
@Module({
  controllers:
    process.env.NODE_ENV === 'development'
      ? [ClientErrorsController, TestController]
      : [ClientErrorsController],
  providers: [
    LoggingService,
    GraphQLErrorLoggingPlugin,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [LoggingService],
})
export class CommonModule {}
