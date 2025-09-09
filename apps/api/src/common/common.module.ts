import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { LoggingService } from './logging/logging.service';
import { TestController } from './test/test.controller';

@Global()
@Module({
  controllers: process.env.NODE_ENV === 'development' ? [TestController] : [],
  providers: [
    LoggingService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [LoggingService],
})
export class CommonModule {}
