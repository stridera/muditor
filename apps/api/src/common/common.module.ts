import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { GraphQLErrorLoggingPlugin } from './logging/graphql-error-logging.plugin';
import { LoggingService } from './logging/logging.service';
import { ClientErrorsController } from './client-errors.controller';
import { TestController } from './test/test.controller';

// The test controller exposes unauthenticated error/log probes: mount it only
// when explicitly enabled, never merely because NODE_ENV=development (the dev
// API is publicly reachable).
const testEndpointsEnabled = process.env.ENABLE_TEST_ENDPOINTS === 'true';

@Global()
@Module({
  controllers: testEndpointsEnabled
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
